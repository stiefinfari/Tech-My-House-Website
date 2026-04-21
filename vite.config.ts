import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { XMLParser } from 'fast-xml-parser';
import he from 'he';

const devImageProxy = (): Plugin => ({
  name: 'dev-image-proxy',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/api/image', async (req, res, next) => {
      try {
        const requestUrl = new URL(req.originalUrl ?? req.url ?? '', 'http://localhost');
        const target = requestUrl.searchParams.get('url');
        if (!target) {
          res.statusCode = 400;
          res.end('Missing url');
          return;
        }

        const parsed = new URL(target);
        const allowedHosts = new Set(['i1.sndcdn.com', 'i2.sndcdn.com', 'i3.sndcdn.com', 'i4.sndcdn.com']);
        if (!allowedHosts.has(parsed.hostname)) {
          res.statusCode = 403;
          res.end('Host not allowed');
          return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const upstream = await fetch(target, { signal: controller.signal });
        clearTimeout(timeout);

        if (!upstream.ok) {
          res.statusCode = upstream.status;
          res.end('Failed to fetch image');
          return;
        }

        const contentType = upstream.headers.get('content-type') ?? '';
        if (!contentType.startsWith('image/')) {
          res.statusCode = 400;
          res.end('Invalid content type');
          return;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'no-store');
        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.statusCode = 200;
        res.end(buffer);
      } catch {
        next();
      }
    });
  },
});

const devRadioApi = (): Plugin => ({
  name: 'dev-radio-api',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/api/radio-feed', async (req, res, next) => {
      try {
        if ((req.method ?? 'GET') !== 'GET') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        const requestUrl = new URL(req.originalUrl ?? req.url ?? '', 'http://localhost');
        const limitRaw = requestUrl.searchParams.get('limit');
        const parsedLimit = limitRaw ? Number(limitRaw) : Number.NaN;
        const limit = Math.max(1, Math.min(50, Number.isFinite(parsedLimit) ? parsedLimit : 30));

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const upstream = await fetch('https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss', {
          signal: controller.signal,
          headers: { accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1' },
        });
        clearTimeout(timeout);

        if (!upstream.ok) {
          res.statusCode = 502;
          res.end('Upstream error');
          return;
        }

        const xml = await upstream.text();
        if (xml.length > 2_500_000) {
          res.statusCode = 502;
          res.end('Upstream response too large');
          return;
        }

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
        };

        const rawItems = parsed.rss?.channel?.item ?? [];
        const items = Array.isArray(rawItems) ? rawItems : [rawItems];

        const stripToText = (html: string): string => {
          const decoded = he.decode(html);
          return decoded
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<\/?[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };

        const extractEpisodeCode = (input: string): string | null => {
          const m = input.match(/\bEP\s?(\d{1,4})\b/i);
          if (!m) return null;
          return `ep${String(Number(m[1]))}`;
        };

        const extractTracklistUrl = (text: string): string | null => {
          const m =
            text.match(/https?:\/\/(?:www\.)?1001\.tl\/[^\s"'<>]+/i) ??
            text.match(/https?:\/\/(?:www\.)?1001tracklists\.com\/[^\s"'<>]+/i);
          return m ? m[0] : null;
        };

        const parseDurationToSeconds = (value: string | null | undefined): number | null => {
          if (!value) return null;
          const raw = value.trim();
          if (!raw) return null;
          if (/^\d+$/.test(raw)) {
            const sec = Number(raw);
            return Number.isFinite(sec) ? sec : null;
          }
          const parts = raw.split(':').map((p) => p.trim()).filter(Boolean);
          if (parts.length < 2 || parts.length > 3) return null;
          const nums = parts.map((p) => Number(p));
          if (nums.some((n) => !Number.isFinite(n))) return null;
          if (nums.length === 2) return nums[0] * 60 + nums[1];
          return nums[0] * 3600 + nums[1] * 60 + nums[2];
        };

        const episodes = items
          .map((it) => it as Record<string, unknown>)
          .map((item) => {
            const title = typeof item.title === 'string' ? he.decode(item.title).trim() : 'Untitled';
            const pubDate = typeof item.pubDate === 'string' ? new Date(item.pubDate).toISOString() : null;
            const soundcloudUrl = typeof item.link === 'string' ? item.link.trim() : null;

            const enclosure = item.enclosure as Record<string, unknown> | undefined;
            const audioUrl = typeof enclosure?.['@_url'] === 'string' ? String(enclosure['@_url']).trim() : null;
            if (!audioUrl) return null;

            const itunesDuration = item['itunes:duration'];
            const durationSec = typeof itunesDuration === 'string' ? parseDurationToSeconds(itunesDuration) : null;

            const itunesImg = item['itunes:image'] as Record<string, unknown> | undefined;
            const coverUrlRaw = typeof itunesImg?.['@_href'] === 'string' ? String(itunesImg['@_href']).trim() : null;
            const coverUrl = coverUrlRaw && coverUrlRaw.includes('sndcdn.com')
              ? `/api/image?url=${encodeURIComponent(coverUrlRaw)}`
              : coverUrlRaw;

            const description =
              (typeof item['content:encoded'] === 'string' && item['content:encoded'].trim()) ||
              (typeof item.description === 'string' && item.description.trim()) ||
              (typeof item['itunes:summary'] === 'string' && String(item['itunes:summary']).trim()) ||
              '';
            const summary = description ? stripToText(description) : null;

            return {
              episodeCode: extractEpisodeCode(title) ?? (summary ? extractEpisodeCode(summary) : null),
              title,
              publishedAt: pubDate,
              durationSec,
              soundcloudUrl,
              audioUrl,
              coverUrl: coverUrl || null,
              summary,
              tracklistUrl: summary ? extractTracklistUrl(summary) : null,
            };
          })
          .filter(Boolean)
          .slice(0, limit);

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.statusCode = 200;
        res.end(JSON.stringify({ episodes }));
      } catch {
        next();
      }
    });

    server.middlewares.use('/api/tracklist', async (req, res, next) => {
      try {
        if ((req.method ?? 'GET') !== 'GET') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        const requestUrl = new URL(req.originalUrl ?? req.url ?? '', 'http://localhost');
        const target = requestUrl.searchParams.get('url');
        if (!target) {
          res.statusCode = 400;
          res.end('Missing url');
          return;
        }

        const u = new URL(target);
        const allowedHosts = new Set(['1001.tl', 'www.1001.tl', '1001tracklists.com', 'www.1001tracklists.com']);
        if (!allowedHosts.has(u.hostname)) {
          res.statusCode = 403;
          res.end('Host not allowed');
          return;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        const upstream = await fetch(target, {
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            accept: 'text/html, application/xhtml+xml;q=0.9, */*;q=0.1',
            'user-agent': 'TechMyHouseBot/1.0 (+https://techmyhouse.it)',
          },
        });
        clearTimeout(timeout);

        if (!upstream.ok) {
          res.statusCode = 502;
          res.end('Upstream error');
          return;
        }

        const ct = (upstream.headers.get('content-type') ?? '').toLowerCase();
        if (!(ct.includes('text/html') || ct.includes('application/xhtml+xml'))) {
          res.statusCode = 502;
          res.end('Upstream content-type not supported');
          return;
        }

        const html = await upstream.text();
        if (html.length > 2_500_000) {
          res.statusCode = 502;
          res.end('Upstream response too large');
          return;
        }

        const items: Array<{
          index: number;
          artist: string;
          title: string;
          label: string | null;
          timeText: string | null;
          timeSec: number | null;
        }> = [];

        const parseTimeToSec = (t: string): number | null => {
          const m = t.match(/^(\d{1,2}):(\d{2})$/);
          if (!m) return null;
          return Number(m[1]) * 60 + Number(m[2]);
        };

        const stripTags = (s: string): string => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

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

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.statusCode = 200;
        res.end(JSON.stringify({ tracklist: { sourceUrl: target, items } }));
      } catch {
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
          'react-router-dom': ['react-router-dom'],
          'vendor': ['react', 'react-dom', 'zustand']
        }
      }
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    devImageProxy(),
    devRadioApi(),
  ],
})
