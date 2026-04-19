import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { getDominantColor } from '../utils/dominantColor';
import TextLink from './TextLink';

type Episode = {
  title: string;
  link: string;
  pubDate: string;
  audioUrl: string;
  coverUrl?: string;
};

type GlowStyle = CSSProperties & { ['--ep-glow']?: string };
type RailStyle = CSSProperties & { ['--btn-accent']?: string };

type RssItem = {
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

type RssResponse = {
  status?: string;
  items?: RssItem[];
};

const RSS_URL = 'https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss';
const RSS2JSON = 'https://api.rss2json.com/v1/api.json';
const FALLBACK_COVER = 'https://i1.sndcdn.com/avatars-siKAkzoJZjIx8IDn-zpkRzw-original.jpg';

export default function LatestEpisode() {
  const { playTrack } = usePlayer();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [glow, setGlow] = useState<string>('204 255 0');
  const uiAccent = '204 255 0';

  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }
    const timer = window.setTimeout(() => setShowSkeleton(true), 3500);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setHasError(false);
        const CACHE_KEY = 'tmh_latest_episode_v1';
        const TTL = 10 * 60 * 1000; // 10 minutes
        const cachedStr = sessionStorage.getItem(CACHE_KEY);
        
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (Date.now() - cached.timestamp < TTL) {
            setEpisode(cached.data);
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
        const item = Array.isArray(data.items) ? data.items[0] : undefined;
        if (!item) {
          setHasError(true);
          return;
        }
        const ep: Episode = {
          title: item.title ?? 'Unknown Episode',
          link: item.link ?? '#',
          pubDate: item.pubDate ?? '',
          audioUrl: item.enclosure?.link ?? '',
          coverUrl: item.thumbnail ?? item.enclosure?.thumbnail ?? FALLBACK_COVER,
        };
        
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: ep
        }));
        
        setEpisode(ep);
      } catch (e) {
        console.error(e);
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const url = episode?.coverUrl;
    if (!url) return;
    getDominantColor(url).then((rgb) => {
      if (cancelled) return;
      setGlow(rgb ?? '204 255 0');
    });
    return () => {
      cancelled = true;
    };
  }, [episode?.coverUrl]);

  const dateLabel = useMemo(() => {
    if (!episode?.pubDate) return '';
    const d = new Date(episode.pubDate);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, [episode?.pubDate]);

  const handlePlay = () => {
    if (!episode) return;
    if (episode.audioUrl) {
      playTrack(
        { title: episode.title, url: episode.audioUrl, artist: 'Tech My House', coverUrl: episode.coverUrl },
        [{ title: episode.title, url: episode.audioUrl, artist: 'Tech My House', coverUrl: episode.coverUrl }]
      );
      return;
    }
    window.open(episode.link, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="section-tag">latest broadcast</div>
          <h2 className="section-title">TMH Radio Show</h2>
        </div>
        <TextLink to="/podcast" accent={uiAccent} className="font-display text-xs font-extrabold uppercase tracking-[0.24em]">
          All Episodes
        </TextLink>
      </div>

      {loading ? (
        showSkeleton ? (
          <div className="surface-panel grid grid-cols-[112px_1fr] gap-5 p-5 sm:grid-cols-[148px_1fr] sm:p-6">
            <div className="aspect-square shimmer-block" />
            <div className="flex flex-col justify-center gap-3">
              <div className="h-4 w-3/4 shimmer-block" />
              <div className="h-3 w-1/2 shimmer-block" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon border-t-transparent" />
          </div>
        )
      ) : hasError || !episode ? (
        <div className="surface-panel px-6 py-8 sm:px-8 sm:py-10">
          <div className="mb-4 font-display text-2xl font-extrabold uppercase tracking-tight text-white">Feed unavailable</div>
          <p className="mb-6 max-w-[56ch] font-sans text-sm text-smoke">
            Latest episode feed is temporarily unavailable. You can still listen to the full archive directly on SoundCloud.
          </p>
          <a
            href="https://soundcloud.com/techmyhouse,"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center border border-acid bg-acid px-5 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-acid-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            Listen on SoundCloud ↗
          </a>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="episode-glow surface-panel overflow-hidden"
          style={{ '--ep-glow': uiAccent } as GlowStyle}
        >
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-[320px_1fr] sm:items-stretch sm:gap-8 sm:p-8">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
              <img
                src={episode.coverUrl}
                alt={episode.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent" />
              <div className="absolute inset-0" style={{ backgroundColor: `rgb(${glow} / 0.10)` }} />
            </div>

            <div className="flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.26em] text-smoke text-shadow-sm">
                  <span>{dateLabel}</span>
                  <span>Latest episode</span>
                </div>
                <h3 className="font-display text-pretty text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.06em] text-white">
                  {episode.title}
                </h3>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePlay}
                  className="btn-primary h-12 px-7 font-display text-xs font-extrabold uppercase tracking-[0.18em]"
                  style={{ '--btn-accent': uiAccent } as RailStyle}
                >
                  Play
                </button>
                <TextLink
                  to="/podcast"
                  accent={uiAccent}
                  className="h-12 px-1 font-display text-xs font-extrabold uppercase tracking-[0.22em]"
                >
                  View all
                </TextLink>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
