export type Episode = {
  title: string;
  link: string;
  pubDate: string;
  audioUrl: string;
  coverUrl?: string;
  durationSec?: number;
};

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  enclosure?: {
    link?: string;
    thumbnail?: string;
    duration?: number;
  };
  itunes?: {
    duration?: string;
  };
};

type RssResponse = {
  status?: string;
  items?: RssItem[];
};

export type RadioShowResult = {
  latest: Episode;
  previous: Episode[];
  isFallback: boolean;
};

const RSS_URL = 'https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss';
const RSS2JSON = 'https://api.rss2json.com/v1/api.json';
const CACHE_KEY = 'tmh_radio_show_v1';
const TTL_MS = 10 * 60 * 1000;

function normalizeSoundCloudCover(url: string, size: number) {
  const safe = url.trim();
  if (!safe) return safe;
  const s = Math.max(100, Math.min(3000, Math.floor(size)));
  return safe.replace(/-t\\d+x\\d+(?=\\.)/i, `-t${s}x${s}`);
}

function parseDurationToSeconds(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const raw = value.trim();
  if (!raw) return undefined;
  if (/^\\d+$/.test(raw)) {
    const sec = Number(raw);
    return Number.isFinite(sec) ? sec : undefined;
  }
  const parts = raw.split(':').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return undefined;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n))) return undefined;
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  return nums[0] * 3600 + nums[1] * 60 + nums[2];
}

function getFallback(): RadioShowResult {
  const now = new Date().toISOString();
  return {
    isFallback: true,
    latest: {
      title: 'Tech My House Radio Show — EP 132',
      link: 'https://soundcloud.com/techmyhouse',
      pubDate: now,
      audioUrl: '',
      coverUrl: undefined,
      durationSec: undefined,
    },
    previous: [],
  };
}

export async function fetchRadioShow(): Promise<RadioShowResult> {
  try {
    const cachedStr = window.sessionStorage.getItem(CACHE_KEY);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr) as { timestamp: number; data: RadioShowResult };
      if (Date.now() - cached.timestamp < TTL_MS) return cached.data;
    }
  } catch {
    window.sessionStorage.removeItem(CACHE_KEY);
  }

  try {
    const response = await fetch(`${RSS2JSON}?rss_url=${encodeURIComponent(RSS_URL)}`);
    const data = (await response.json()) as RssResponse;
    if (data.status !== 'ok' || !Array.isArray(data.items) || data.items.length === 0) {
      return getFallback();
    }

    const mapped = data.items
      .slice(0, 20)
      .map((item) => {
        const audioUrl = item.enclosure?.link ?? '';
        if (!audioUrl) return null;

        const coverUrlRaw = item.thumbnail ?? item.enclosure?.thumbnail ?? '';
        const durationSec =
          item.enclosure?.duration ??
          parseDurationToSeconds(item.itunes?.duration);

        const ep: Episode = {
          title: item.title ?? 'Unknown Episode',
          link: item.link ?? 'https://soundcloud.com/techmyhouse',
          pubDate: item.pubDate ?? '',
          audioUrl,
          coverUrl: coverUrlRaw ? normalizeSoundCloudCover(coverUrlRaw, 1200) : undefined,
          durationSec,
        };
        return ep;
      })
      .filter((x): x is Episode => Boolean(x));

    mapped.sort((a, b) => {
      const ad = new Date(a.pubDate).getTime();
      const bd = new Date(b.pubDate).getTime();
      if (Number.isNaN(ad) && Number.isNaN(bd)) return 0;
      if (Number.isNaN(ad)) return 1;
      if (Number.isNaN(bd)) return -1;
      return bd - ad;
    });

    const latest = mapped[0];
    if (!latest) return getFallback();
    const previous = mapped.slice(1, 4);

    const result: RadioShowResult = { latest, previous, isFallback: false };

    try {
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: result }));
    } catch {
      window.sessionStorage.removeItem(CACHE_KEY);
    }

    return result;
  } catch {
    return getFallback();
  }
}
