import { toSafeCoverUrl } from './imagePolicy';

export const DEFAULT_COVER =
  'https://i1.sndcdn.com/avatars-siKAkzoJZjIx8IDn-zpkRzw-original.jpg';

export type FeedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  description?: string;
  enclosure?: {
    link?: string;
    thumbnail?: string;
  };
};

export type EpisodeFeedItem = {
  title: string;
  link: string;
  pubDate: string;
  audioUrl: string;
  coverUrl: string;
  description: string;
};

export function normalizeSoundCloudCover(url: string, size: number) {
  const safe = url.trim();
  if (!safe) return safe;
  const s = Math.max(100, Math.min(3000, Math.floor(size)));
  return safe.replace(/-t\d+x\d+(?=\.)/i, `-t${s}x${s}`);
}

const toDate = (value?: string) => {
  if (!value) return Number.NaN;
  return new Date(value).getTime();
};

export function mapFeedItems(items: FeedItem[]): EpisodeFeedItem[] {
  return items
    .map((item): EpisodeFeedItem => {
      const coverRaw = item.thumbnail ?? item.enclosure?.thumbnail ?? DEFAULT_COVER;
      const normalizedCover = normalizeSoundCloudCover(coverRaw, 800);
      return {
        title: item.title ?? 'Unknown Episode',
        link: item.link ?? '#',
        pubDate: item.pubDate ?? '',
        audioUrl: item.enclosure?.link ?? '',
        coverUrl: toSafeCoverUrl(normalizedCover, DEFAULT_COVER),
        description: item.description ?? '',
      };
    })
    .sort((a, b) => {
      const ad = toDate(a.pubDate);
      const bd = toDate(b.pubDate);
      if (Number.isNaN(ad) && Number.isNaN(bd)) return 0;
      if (Number.isNaN(ad)) return 1;
      if (Number.isNaN(bd)) return -1;
      return bd - ad;
    });
}
