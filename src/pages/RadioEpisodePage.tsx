import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';
import { DEFAULT_COVER } from '../utils/episodeFeed';
import type { RadioEpisode } from '../lib/rssParse';
import { type TracklistResponse, parseTracklistFromSummary } from '../lib/tracklistHelper';

type RadioFeedResponse = {
  episodes?: RadioEpisode[];
};

type EpisodeUi = RadioEpisode & {
  coverUrlResolved: string;
};

function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return null;
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function RadioEpisodePage() {
  const { episodeCode } = useParams<{ episodeCode: string }>();
  const shouldReduceMotion = useReducedMotionPreference();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const [loading, setLoading] = useState(true);
  const [episodes, setEpisodes] = useState<RadioEpisode[]>([]);
  const [tracklistLoading, setTracklistLoading] = useState(false);
  const [tracklist, setTracklist] = useState<TracklistResponse['tracklist'] | null>(null);

  const normalizedCode = (episodeCode ?? '').trim().toLowerCase();
  const episode = useMemo((): EpisodeUi | null => {
    const found =
      episodes.find((ep) => (ep.episodeCode ?? '').toLowerCase() === normalizedCode) ??
      episodes.find((ep) => (ep.title ?? '').toLowerCase().includes(normalizedCode));
    if (!found) return null;
    return { ...found, coverUrlResolved: found.coverUrl ?? DEFAULT_COVER };
  }, [episodes, normalizedCode]);

  const isCurrentlyPlaying = Boolean(episode?.audioUrl && currentTrack?.url === episode.audioUrl && isPlaying);

  const jsonLd = useMemo(() => {
    if (!episode) {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Episode not found • ${SITE.name}`,
        url: new URL('/radio', SITE.url).toString(),
      };
    }

    const pageUrl = new URL(`/radio/${episode.episodeCode ?? ''}`, SITE.url).toString();
    return {
      '@context': 'https://schema.org',
      '@type': 'PodcastEpisode',
      name: episode.title,
      url: pageUrl,
      datePublished: episode.publishedAt ?? undefined,
      associatedMedia: episode.audioUrl ? { '@type': 'MediaObject', contentUrl: episode.audioUrl } : undefined,
      image: episode.coverUrlResolved,
    };
  }, [episode]);

  useSeo({
    title: episode?.title ?? 'Radio Episode',
    path: episode?.episodeCode ? `/radio/${episode.episodeCode}` : '/radio',
    description: episode?.summary ?? 'Tech My House Radio Show episode.',
    jsonLd,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/radio-feed');
        const data = (await r.json()) as RadioFeedResponse;
        setEpisodes(Array.isArray(data.episodes) ? data.episodes : []);
      } catch {
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!episode?.tracklistUrl) {
        setTracklist(null);
        return;
      }
      setTracklistLoading(true);
      try {
        const r = await fetch(`/api/tracklist?url=${encodeURIComponent(episode.tracklistUrl)}`);
        const data = (await r.json()) as TracklistResponse;
        setTracklist(data.tracklist ?? null);
      } catch {
        setTracklist(null);
      } finally {
        setTracklistLoading(false);
      }
    };
    run();
  }, [episode?.tracklistUrl]);

  const onPlay = () => {
    if (!episode?.audioUrl) return;
    const playlist = episodes
      .filter((ep) => Boolean(ep.audioUrl))
      .map((ep) => ({
        title: ep.title,
        url: ep.audioUrl as string,
        artist: 'Tech My House',
        coverUrl: ep.coverUrl ?? DEFAULT_COVER,
      }));
    playTrack(
      {
        title: episode.title,
        url: episode.audioUrl,
        artist: 'Tech My House',
        coverUrl: episode.coverUrlResolved,
      },
      playlist
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 pt-28 sm:pt-32">
        <div className="container-shell max-w-6xl">
          <div className="h-3 w-32 animate-pulse bg-white/10" />
          <div className="mt-6 h-10 w-10/12 animate-pulse bg-white/10" />
          <div className="mt-4 h-10 w-8/12 animate-pulse bg-white/10" />
          <div className="mt-10 grid gap-6 md:grid-cols-[420px_1fr]">
            <div className="aspect-square animate-pulse bg-white/10" />
            <div className="space-y-3">
              <div className="h-4 w-48 animate-pulse bg-white/10" />
              <div className="h-4 w-64 animate-pulse bg-white/10" />
              <div className="h-4 w-40 animate-pulse bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen pb-24 pt-28 sm:pt-32">
        <div className="container-shell max-w-6xl">
          <Link
            to="/radio"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke hover:text-acid"
          >
            <ArrowLeft size={16} />
            Back to archive
          </Link>
          <div className="mt-10 border border-white/10 bg-ink p-8">
            <div className="font-display text-4xl font-extrabold uppercase text-white">Episode not found</div>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
              Check the code and try again.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dateValue = episode.publishedAt ? new Date(episode.publishedAt) : null;
  const formattedDate =
    dateValue && !Number.isNaN(dateValue.getTime())
      ? dateValue.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : null;
  const duration = formatDuration(episode.durationSec);
  const fallbackItems = episode.summary ? parseTracklistFromSummary(episode.summary) : [];
  const tracklistItems =
    tracklist?.items?.length ? tracklist.items : fallbackItems.length ? fallbackItems : null;
  const tracklistCaption = 'Tracklist';

  return (
    <div className="min-h-screen pb-24">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
        className="relative flex min-h-[60vh] w-full flex-col justify-end pt-32 pb-12 sm:min-h-[70vh]"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={episode.coverUrlResolved}
            alt=""
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = DEFAULT_COVER;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/20" />
        </div>

        <div className="container-shell relative z-10 w-full max-w-6xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              to="/radio"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/60 transition-colors hover:text-acid"
            >
              <ArrowLeft size={16} />
              Back to archive
            </Link>
            {episode.soundcloudUrl && (
              <a
                href={episode.soundcloudUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/60 transition-colors hover:text-acid"
              >
                SoundCloud
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-acid">
              {episode.episodeCode ? episode.episodeCode.toUpperCase() : 'EPISODE'}
            </div>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase leading-[0.9] tracking-tight text-white drop-shadow-lg">
              {episode.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.24em] text-smoke">
              {formattedDate && <span>{formattedDate}</span>}
              {duration && <span>{duration}</span>}
              {isCurrentlyPlaying && <span className="text-acid">▶ LIVE PLAYBACK</span>}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onPlay}
                disabled={!episode.audioUrl}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-acid px-8 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-ink transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid disabled:opacity-60 disabled:hover:scale-100"
              >
                <Play size={18} fill="currentColor" />
                <span className="font-bold">{isCurrentlyPlaying ? 'PLAYING' : 'PLAY EPISODE'}</span>
                <div className="absolute inset-0 -z-10 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>

              {episode.tracklistUrl && (
                <a
                  href={episode.tracklistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink/50 px-8 py-4 font-mono text-[11px] uppercase tracking-[0.24em] text-white backdrop-blur-md transition-colors hover:border-acid/60 hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                >
                  1001 Tracklist
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="container-shell mt-16 max-w-6xl">
        <div className="grid gap-16">
          <div>
            <div className="mb-8 border-b border-white/10 pb-4 flex items-baseline justify-between">
              <h2 className="font-display text-3xl font-extrabold uppercase text-white">{tracklistCaption}</h2>
              {tracklistItems?.length ? (
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
                  {tracklistItems.length} tracks
                </div>
              ) : null}
            </div>

            {tracklistLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div key={idx} className="h-16 w-full animate-pulse border border-white/5 bg-white/5" />
                ))}
              </div>
            ) : tracklistItems?.length ? (
              <div className="space-y-2">
                {tracklistItems.map((t) => (
                  <div
                    key={t.index}
                    className="group flex items-center gap-4 border border-white/5 bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                  >
                    <div className="w-8 shrink-0 text-left font-mono text-[10px] uppercase tracking-[0.24em] text-smoke/50 transition-colors group-hover:text-acid">
                      {String(t.index).padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[14px] font-extrabold uppercase text-white">
                        {t.artist} <span className="text-white/40">—</span> {t.title}
                      </div>
                      {t.label && (
                        <div className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.26em] text-acid/80">
                          {t.label}
                        </div>
                      )}
                    </div>
                    {t.timeText && (
                      <div className="shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.24em] text-smoke/60">
                        {t.timeText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : episode.tracklistUrl ? (
              <div className="border border-white/10 bg-white/5 p-8 text-center">
                <div className="font-display text-xl font-extrabold uppercase text-white">Tracklist unavailable</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">
                  Please check the full tracklist directly on 1001Tracklists.
                </div>
              </div>
            ) : (
              <div className="border border-white/10 bg-white/5 p-8 text-center">
                <div className="font-display text-xl font-extrabold uppercase text-white">No tracklist available</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">
                  This episode doesn’t include tracklist information.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
