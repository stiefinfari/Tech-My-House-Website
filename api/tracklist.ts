export type TracklistItem = {
  index: number;
  artist: string;
  title: string;
  label: string | null;
  timeText: string | null;
  timeSec: number | null;
};

export type ParsedTracklist = {
  sourceUrl: string;
  items: TracklistItem[];
};

const ALLOW = new Set(['1001.tl', 'www.1001.tl', '1001tracklists.com', 'www.1001tracklists.com']);
const UPSTREAM_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 2_500_000;

type RequestLike = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (body: unknown) => unknown;
  setHeader: (name: string, value: string) => void;
};

function parseTimeToSec(t: string): number | null {
  const raw = t.trim();
  if (!raw) return null;
  const parts = raw.split(':').map((p) => p.trim());
  if (parts.length < 2 || parts.length > 3) return null;
  if (!parts.every((p) => /^\d+$/.test(p))) return null;

  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n))) return null;

  const [a, b, c] = nums;
  if (parts.length === 2) {
    return a * 60 + b;
  }
  return a * 3600 + b * 60 + (c ?? 0);
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

function parse1001TracklistHtml(html: string, sourceUrl: string): ParsedTracklist {
  const items: TracklistItem[] = [];
  const rowRegex = /<(\w+)[^>]*class="[^"]*\b(?:tlToogle|tlToggle)\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;

  let m: RegExpExecArray | null;
  while ((m = rowRegex.exec(html))) {
    const block = m[2] ?? '';
    const indexMatch = block.match(/itemprop="position"[^>]*content="(\d+)"/i);
    const index = indexMatch ? Number(indexMatch[1]) : Number.NaN;

    const valueMatch = block.match(
      /<span[^>]*class="[^"]*\btrackValue\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    const value = valueMatch ? stripTags(valueMatch[1]).trim() : '';

    const labelMatch = block.match(
      /<span[^>]*class="[^"]*\btracklabel\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    const label = labelMatch ? stripTags(labelMatch[1]).trim() : null;

    const timeMatch = block.match(
      /<span[^>]*class="[^"]*\btracktime\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    const timeText = timeMatch ? stripTags(timeMatch[1]).trim() : null;

    const split = value.split(' - ');
    const artist = (split[0] ?? '').trim();
    const title = (split.slice(1).join(' - ') ?? '').trim();

    if (!artist || !title || !Number.isFinite(index)) continue;

    items.push({
      index,
      artist,
      title,
      label: label || null,
      timeText: timeText || null,
      timeSec: timeText ? parseTimeToSec(timeText) : null,
    });
  }

  return { sourceUrl, items };
}

function parseUrlParam(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2000) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (u.protocol === 'http:') u.protocol = 'https:';
    return u;
  } catch {
    return null;
  }
}

function isAllowed(u: URL): boolean {
  return ALLOW.has(u.hostname);
}

async function fetchHtmlAllowed(url: URL, signal: AbortSignal): Promise<{ html: string; finalUrl: string }> {
  if (!isAllowed(url)) throw new Error('not_allowed');

  const r = await fetch(url.toString(), {
    redirect: 'follow',
    signal,
    headers: {
      accept: 'text/html, application/xhtml+xml;q=0.9, */*;q=0.1',
      'user-agent': 'TechMyHouseBot/1.0 (+https://techmyhouse.it)',
    },
  });

  const resolvedUrl = (() => {
    try {
      return r.url ? new URL(r.url) : url;
    } catch {
      return url;
    }
  })();

  if (!isAllowed(resolvedUrl)) throw new Error('not_allowed');

  if (!r.ok) throw new Error('upstream');

  const ct = (r.headers.get('content-type') ?? '').toLowerCase();
  if (!(ct.includes('text/html') || ct.includes('application/xhtml+xml'))) throw new Error('bad_content_type');

  const html = await r.text();
  if (html.length > MAX_HTML_BYTES) throw new Error('too_large');
  return { html, finalUrl: resolvedUrl.toString() };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const raw = req.query?.url;
  const url = typeof raw === 'string' ? parseUrlParam(raw) : null;
  if (!url) return res.status(400).json({ error: 'Invalid url' });
  if (!isAllowed(url)) return res.status(403).json({ error: 'Host not allowed' });

  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const { html, finalUrl } = await fetchHtmlAllowed(url, ac.signal);
    const tracklist = parse1001TracklistHtml(html, finalUrl);

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({ tracklist });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'not_allowed') return res.status(403).json({ error: 'Host not allowed' });
    if (msg === 'bad_content_type') return res.status(502).json({ error: 'Upstream content-type not supported' });
    if (msg === 'too_large') return res.status(502).json({ error: 'Upstream response too large' });
    if (msg === 'too_many_redirects') return res.status(502).json({ error: 'Too many redirects' });
    return res.status(500).json({ error: 'Failed to fetch tracklist' });
  } finally {
    clearTimeout(timeout);
  }
}
