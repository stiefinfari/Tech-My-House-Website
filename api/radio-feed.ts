import { XMLParser } from 'fast-xml-parser';
import he from 'he';
import { extractEpisodeCode, extractTracklistUrl, parseDurationToSeconds, type RadioEpisode } from '../src/lib/rssParse';
import { generateEpisodeCode } from '../src/lib/episodeCode';
import { normalizeSoundCloudCover } from '../src/utils/episodeFeed';
import { toSafeCoverUrlNullable } from '../src/utils/imagePolicy';

const FEED_URL = 'https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss';
const ALLOW = new Set(['feeds.soundcloud.com']);
const UPSTREAM_TIMEOUT_MS = 10_000;

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  'content:encoded'?: string;
  enclosure?: { '@_url'?: string } | Array<{ '@_url'?: string }>;
  'itunes:duration'?: string;
  'itunes:summary'?: string;
  'itunes:image'?: { '@_href'?: string } | Array<{ '@_href'?: string }>;
  'media:thumbnail'?: { '@_url'?: string } | Array<{ '@_url'?: string }>;
  'media:content'?: { '@_url'?: string } | Array<{ '@_url'?: string }>;
};

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function firstAttr(items: Array<Record<string, unknown>>, key: string): string | null {
  for (const it of items) {
    const v = it[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function stripToText(html: string): string {
  const decoded = he.decode(html);
  return decoded
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toIsoOrNull(value: string | undefined): string | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString();
}

type RequestLike = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => unknown;
  setHeader: (name: string, value: string) => void;
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const limitRaw = req.query?.limit;
  const parsedLimit = typeof limitRaw === 'string' ? Number(limitRaw) : Number.NaN;
  const limit = Math.max(1, Math.min(50, Number.isFinite(parsedLimit) ? parsedLimit : 30));

  const upstreamUrl = new URL(FEED_URL);
  if (!ALLOW.has(upstreamUrl.hostname)) return res.status(500).json({ error: 'Server misconfigured' });

  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const r = await fetch(upstreamUrl.toString(), {
      signal: ac.signal,
      headers: { accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1' },
    });
    if (!r.ok) return res.status(502).json({ error: 'Upstream error' });

    const xml = await r.text();
    if (xml.length > 2_500_000) return res.status(502).json({ error: 'Upstream response too large' });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: false,
      trimValues: true,
      parseTagValue: false,
    });

    const parsedUnknown = parser.parse(xml) as unknown;
    const parsed = parsedUnknown as {
      rss?: { channel?: { item?: unknown } };
      feed?: { entry?: unknown };
    };
    const itemsRaw = parsed.rss?.channel?.item ?? parsed.feed?.entry ?? [];
    const items = asArray<RssItem>(itemsRaw);

    const episodes: RadioEpisode[] = items
      .map((item): RadioEpisode | null => {
        const title = typeof item.title === 'string' ? he.decode(item.title).trim() : 'Untitled';
        const publishedAt = toIsoOrNull(typeof item.pubDate === 'string' ? item.pubDate : undefined);
        const soundcloudUrl = typeof item.link === 'string' ? item.link.trim() : null;

        const enclosureUrl = firstAttr(asArray(item.enclosure) as unknown as Array<Record<string, unknown>>, '@_url');
        if (!enclosureUrl) return null;

        const coverRaw =
          firstAttr(asArray(item['itunes:image']) as unknown as Array<Record<string, unknown>>, '@_href') ??
          firstAttr(asArray(item['media:thumbnail']) as unknown as Array<Record<string, unknown>>, '@_url') ??
          firstAttr(asArray(item['media:content']) as unknown as Array<Record<string, unknown>>, '@_url');
        const coverNormalized = coverRaw ? normalizeSoundCloudCover(coverRaw, 1200) : null;
        const coverUrl = coverNormalized ? toSafeCoverUrlNullable(coverNormalized) : null;

        const summaryHtml =
          (typeof item['content:encoded'] === 'string' && item['content:encoded'].trim()) ||
          (typeof item.description === 'string' && item.description.trim()) ||
          (typeof item['itunes:summary'] === 'string' && item['itunes:summary'].trim()) ||
          '';
        const summary = summaryHtml ? stripToText(summaryHtml) : null;
        const tracklistUrl = extractTracklistUrl(summary ?? '');

        const durationSec = parseDurationToSeconds(
          typeof item['itunes:duration'] === 'string' ? item['itunes:duration'] : undefined
        );

        const extractedEpisodeCode = extractEpisodeCode(title) ?? (summary ? extractEpisodeCode(summary) : null);

        return {
          episodeCode: extractedEpisodeCode ?? generateEpisodeCode({ title, audioUrl: enclosureUrl, soundcloudUrl, publishedAt }),
          title,
          publishedAt,
          durationSec,
          soundcloudUrl,
          audioUrl: enclosureUrl,
          coverUrl,
          summary,
          tracklistUrl,
        };
      })
      .filter((x): x is RadioEpisode => Boolean(x))
      .sort((a, b) => {
        const ad = a.publishedAt ? new Date(a.publishedAt).getTime() : Number.NaN;
        const bd = b.publishedAt ? new Date(b.publishedAt).getTime() : Number.NaN;
        if (Number.isNaN(ad) && Number.isNaN(bd)) return 0;
        if (Number.isNaN(ad)) return 1;
        if (Number.isNaN(bd)) return -1;
        return bd - ad;
      })
      .slice(0, limit);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json({ episodes });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch feed' });
  } finally {
    clearTimeout(timeout);
  }
}
