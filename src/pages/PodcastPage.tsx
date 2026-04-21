import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import Marquee from '../components/Marquee';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';
import { DEFAULT_COVER, type EpisodeFeedItem } from '../utils/episodeFeed';
import { useEpisodeBookmarks } from '../hooks/useEpisodeBookmarks';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import type { RadioEpisode } from '../lib/rssParse';
import { generateEpisodeCode } from '../lib/episodeCode';
import TMHLogoWhite from '../assets/TMH_LOGO_WHITE.png';

type RadioFeedResponse = {
  episodes?: RadioEpisode[];
};

type RadioEpisodeUi = EpisodeFeedItem & {
  episodeCode: string;
  durationSec: number | null;
  tracklistUrl: string | null;
};

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<RadioEpisodeUi[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const shouldReduceMotion = useReducedMotionPreference();
  const bookmarks = useEpisodeBookmarks();

  const jsonLd = useMemo(() => {
    const safeIso = (d: string) => {
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
    };

    return {
      '@context': 'https://schema.org',
      '@type': 'PodcastSeries',
      name: 'Tech My House Radio Show',
      url: new URL('/radio', SITE.url).toString(),
      publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
      inLanguage: 'en',
      sameAs: [
        'https://podcasts.apple.com/us/podcast/tech-my-house-radio-show/id1555228660',
        'https://soundcloud.com/techmyhouse',
      ],
      episode: episodes.slice(0, 10).map((ep) => ({
        '@type': 'PodcastEpisode',
        name: ep.title,
        url: ep.link,
        datePublished: safeIso(ep.pubDate),
        associatedMedia: ep.audioUrl
          ? { '@type': 'MediaObject', contentUrl: ep.audioUrl }
          : undefined,
        image: ep.coverUrl ? ep.coverUrl : undefined,
      })),
    };
  }, [episodes]);

  useSeo({
    title: 'Radio',
    path: '/radio',
    description:
      'Dive into the underground sound. Listen to the latest sets, curated mixes, and exclusive tracks from the Tech My House radio show.',
    jsonLd,
  });

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const response = await fetch('/api/radio-feed');
        const data = (await response.json()) as RadioFeedResponse;
        const raw = Array.isArray(data.episodes) ? data.episodes : [];
        const mapped: RadioEpisodeUi[] = raw.map((ep) => ({
          episodeCode:
            ep.episodeCode ??
            generateEpisodeCode({
              title: ep.title,
              audioUrl: ep.audioUrl,
              soundcloudUrl: ep.soundcloudUrl,
              publishedAt: ep.publishedAt,
            }),
          durationSec: ep.durationSec ?? null,
          tracklistUrl: ep.tracklistUrl ?? null,
          title: ep.title,
          link: ep.soundcloudUrl ?? '#',
          pubDate: ep.publishedAt ?? '',
          audioUrl: ep.audioUrl ?? '',
          coverUrl: ep.coverUrl ?? DEFAULT_COVER,
          description: ep.summary ?? '',
        }));
        setEpisodes(mapped);
      } catch (error) {
        console.error("Error fetching podcast:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPodcast();
  }, []);

  const buildPlaylist = (source: RadioEpisodeUi[]) => {
    return source
      .filter((entry) => Boolean(entry.audioUrl))
      .map((entry) => ({
        title: entry.title,
        url: entry.audioUrl,
        artist: 'Tech My House',
        coverUrl: entry.coverUrl,
      }));
  };

  const playEpisode = (episode: RadioEpisodeUi) => {
    if (episode.audioUrl) {
      playTrack(
        {
          title: episode.title,
          url: episode.audioUrl,
          artist: 'Tech My House',
          coverUrl: episode.coverUrl,
        },
        buildPlaylist(episodes)
      );
      return;
    }

    window.open(episode.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen pb-24 pt-28 sm:pt-32">
      <div className="container-shell mb-14 max-w-6xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-acid">THE ARCHIVE</div>
        <div className="mt-5 grid grid-cols-[auto_1fr] items-end gap-4 sm:gap-6">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full blur-2xl bg-acid/15" aria-hidden="true" />
            <img
              src={TMHLogoWhite}
              alt=""
              aria-hidden="true"
              className="h-24 w-24 shrink-0 origin-center motion-safe:animate-[spin_14s_linear_infinite] motion-reduce:animate-none sm:h-32 sm:w-32"
            />
          </div>
          <h1 className="display-title max-w-[10ch] text-[clamp(3rem,10vw,8rem)] leading-[0.9] text-white">
            RADIO SHOW
          </h1>
        </div>
        <p className="accent-script mt-4 -rotate-[1.5deg] text-[clamp(1.6rem,3.5vw,2.8rem)] text-acid">every episode, underground sound</p>
        <div className="mt-5 font-mono text-[10px] uppercase tracking-widest text-smoke">
          {episodes.length} EPISODES · UPDATED WEEKLY
        </div>
      </div>

      <Marquee text="RADIO SHOW · TECH MY HOUSE · RADIO SHOW · TECH MY HOUSE" className="relative z-30 bg-acid text-ink" size="sm" density="tight" />

      <div className="container-shell pt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''}`}
              >
                <div className={`${index === 0 ? 'aspect-[4/5]' : 'aspect-[4/5]'} animate-pulse bg-white/10`} />
                <div className="space-y-3 p-4">
                  <div className="h-2 w-24 animate-pulse bg-white/15" />
                  <div className="h-6 w-11/12 animate-pulse bg-white/15" />
                  <div className="h-2 w-40 animate-pulse bg-white/15" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((ep, i) => {
              const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
              const isFeatured = i === 0;
              const dateValue = new Date(ep.pubDate);
              const formattedDate = Number.isNaN(dateValue.getTime())
                ? ''
                : dateValue.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
              const bookmarked = bookmarks.isBookmarked(ep.link);
              const numericCode = ep.episodeCode.match(/^ep(\d{1,4})$/i)?.[1] ?? null;
              const episodeLabel = numericCode ? `EP${numericCode}` : `EP.${Math.max(1, episodes.length - i)}`;

              return (
                <motion.article
                  key={ep.audioUrl ?? ep.link}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: i * 0.04, duration: 0.35, ease: 'easeOut' }}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_0_0_1px_rgba(204,255,0,0.06),0_18px_45px_rgba(0,0,0,0.55)] transition-colors hover:border-acid/60 ${isFeatured ? 'sm:col-span-2 sm:row-span-2' : ''}`}
                >
                  <Link
                    to={`/radio/${ep.episodeCode}`}
                    className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                    aria-label={`View ${ep.title}`}
                  />

                  <div className="relative z-20">
                    <div className="pointer-events-none">
                    <div className={`relative w-full overflow-hidden bg-black ${isFeatured ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
                      <img
                        src={ep.coverUrl}
                        alt={ep.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = DEFAULT_COVER;
                        }}
                        className={`h-full w-full object-cover transition-transform duration-700 ${isCurrentlyPlaying ? 'scale-[1.04]' : 'group-hover:scale-[1.03]'}`}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent opacity-95" />
                      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]" />
                    </div>

                    <div className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
                      <span className="text-acid">{episodeLabel}</span>
                      {formattedDate ? <span className="hidden sm:inline">{formattedDate}</span> : null}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                      <div className="font-display text-[clamp(1.35rem,2.5vw,2.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white drop-shadow">
                        {ep.title}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
                        <span className="truncate">{isCurrentlyPlaying ? '▶ PLAYING' : 'VIEW TRACKLIST'}</span>
                        {isFeatured ? <span className="text-white/50">FEATURED</span> : null}
                      </div>
                    </div>
                    </div>

                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          playEpisode(ep);
                        }}
                        aria-label={`Play ${ep.title}`}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-acid text-ink transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                      >
                        {isCurrentlyPlaying ? (
                          <div className="flex h-5 items-end gap-[4px]">
                            <span className="h-full w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
                            <span className="h-2/3 w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '200ms' }} />
                            <span className="h-4/5 w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '400ms' }} />
                          </div>
                        ) : (
                          <Play size={22} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          bookmarks.toggle(ep.link);
                        }}
                        aria-label={bookmarked ? `Remove bookmark ${ep.title}` : `Bookmark ${ep.title}`}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-white/80 backdrop-blur-md transition-colors hover:border-acid/60 hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                      >
                        {bookmarked ? <BookmarkCheck size={16} className="text-acid" /> : <Bookmark size={16} />}
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
