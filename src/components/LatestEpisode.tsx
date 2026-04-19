import React, { useEffect, useMemo, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

type Episode = {
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
  description?: string;
  enclosure?: {
    link?: string;
    thumbnail?: string;
    duration?: number;
  };
};

type RssResponse = {
  status?: string;
  items?: RssItem[];
};

const RSS_URL = 'https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss';
const RSS2JSON = 'https://api.rss2json.com/v1/api.json';
const FALLBACK_COVER = 'https://i1.sndcdn.com/avatars-siKAkzoJZjIx8IDn-zpkRzw-original.jpg';

function normalizeSoundCloudCover(url: string, size: number) {
  const safe = url.trim();
  if (!safe) return safe;
  const s = Math.max(100, Math.min(3000, Math.floor(size)));
  return safe.replace(/-t\d+x\d+(?=\.)/i, `-t${s}x${s}`);
}

export default function LatestEpisode() {
  const { playTrack } = usePlayer();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }
    const timer = window.setTimeout(() => setShowSkeleton(true), 3000);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setHasError(false);
        const CACHE_KEY = 'tmh_latest_episodes_v2';
        const TTL = 10 * 60 * 1000; // 10 minutes
        const cachedStr = sessionStorage.getItem(CACHE_KEY);
        
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (Date.now() - cached.timestamp < TTL) {
            setEpisodes(cached.data);
            setLoading(false);
            return;
          }
        }

        const response = await fetch(`${RSS2JSON}?rss_url=${encodeURIComponent(RSS_URL)}`);
        const data = (await response.json()) as RssResponse;
        if (data.status !== 'ok') {
          setHasError(true);
          return;
        }
        const items = Array.isArray(data.items) ? data.items.slice(0, 20) : [];
        if (items.length === 0) {
          setHasError(true);
          return;
        }
        const mapped = items
          .map((item) => {
            const audioUrl = item.enclosure?.link ?? '';
            if (!audioUrl) return null;
            const ep: Episode = {
              title: item.title ?? 'Unknown Episode',
              link: item.link ?? '#',
              pubDate: item.pubDate ?? '',
              audioUrl,
              coverUrl: item.thumbnail ?? item.enclosure?.thumbnail ?? FALLBACK_COVER,
              durationSec: item.enclosure?.duration,
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
        
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: mapped
        }));
        
        setEpisodes(mapped);
      } catch (e) {
        console.error(e);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  const latest = episodes[0] ?? null;

  const handlePlay = () => {
    if (!latest) return;
    if (latest.audioUrl) {
      playTrack(
        { title: latest.title, url: latest.audioUrl, artist: 'Tech My House', coverUrl: latest.coverUrl },
        episodes.map((ep) => ({ title: ep.title, url: ep.audioUrl, artist: 'Tech My House', coverUrl: ep.coverUrl }))
      );
      return;
    }
    window.open(latest.link, '_blank');
  };

  const coverSrc = useMemo(() => {
    const raw = latest?.coverUrl ?? FALLBACK_COVER;
    return normalizeSoundCloudCover(raw, 1000);
  }, [latest?.coverUrl]);

  return (
    <div className="w-full">
      {loading ? (
        showSkeleton ? (
          <div className="aspect-[16/9] w-full border border-white/10 bg-black shimmer-block" />
        ) : (
          <div className="aspect-[16/9] w-full border border-white/10 bg-black" />
        )
      ) : (
        <button
          type="button"
          onClick={hasError || !latest ? () => window.open('https://soundcloud.com/techmyhouse', '_blank') : handlePlay}
          aria-label={
            hasError || !latest
              ? 'Apri Tech My House su SoundCloud'
              : `Riproduci ultimo show: ${latest.title}`
          }
          className="group relative aspect-[16/9] w-full overflow-hidden border border-white/10 bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
        >
          <img
            src={coverSrc}
            alt={latest?.title ?? 'Tech My House'}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </button>
      )}
    </div>
  );
}
