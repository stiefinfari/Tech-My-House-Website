import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import Marquee from '../components/Marquee';
import RadioArchiveControls, { type RadioArchiveSort, type RadioArchiveView } from '../components/radio/RadioArchiveControls';
import RadioEpisodeRow from '../components/radio/RadioEpisodeRow';
import RadioEpisodeRowSkeleton from '../components/radio/RadioEpisodeRowSkeleton';
import RadioNewEpisodeBanner from '../components/radio/RadioNewEpisodeBanner';
import { useRadioFeedPolling } from '../hooks/useRadioFeedPolling';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';
import { DEFAULT_COVER, type EpisodeFeedItem } from '../utils/episodeFeed';
import { useEpisodeBookmarks } from '../hooks/useEpisodeBookmarks';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import useParallaxItem from '../hooks/useParallaxItem';
import type { RadioEpisode } from '../lib/rssParse';
import { generateEpisodeCode } from '../lib/episodeCode';
import TMHLogoWhite from '../assets/TMH_LOGO_WHITE.png';
import { buildEpisodeIndex, computeTermCounts, matchesQuery, type EpisodeIndexCache } from '../lib/radioSearch';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<RadioArchiveView>('list');
  const [sort, setSort] = useState<RadioArchiveSort>('latest');
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const shouldReduceMotion = useReducedMotionPreference();
  const logoRef = useParallaxItem<HTMLDivElement>({ speedY: 0.06, maxPx: 140 });
  const bookmarks = useEpisodeBookmarks();
  const indexCache = useMemo<EpisodeIndexCache>(() => new Map(), []);

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
    let active = true;

    const fetchPodcast = async () => {
      try {
        setErrorMessage(null);
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
        if (!active) return;
        setEpisodes(mapped);
      } catch {
        if (!active) return;
        setErrorMessage("Couldn't load episodes.");
      }
      if (!active) return;
      setLoading(false);
    };

    fetchPodcast();
    return () => {
      active = false;
    };
  }, []);

  const latestFingerprint = useMemo(
    () =>
      episodes.length
        ? { episodeCode: episodes[0].episodeCode ?? null, audioUrl: episodes[0].audioUrl ?? null }
        : null,
    [episodes]
  );

  const { hasUpdate, dismiss: dismissUpdate, clear: clearUpdate } = useRadioFeedPolling({
    enabled: !loading && episodes.length > 0,
    intervalMs: 120_000,
    initialLatest: latestFingerprint,
  });

  const refreshEpisodes = async () => {
    try {
      setErrorMessage(null);
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
      clearUpdate();
    } catch {
      setErrorMessage("Couldn't load episodes.");
    }
  };

  const sortedEpisodes = useMemo(() => {
    if (sort === 'latest') return episodes;
    return [...episodes].reverse();
  }, [episodes, sort]);

  const filteredEpisodes = useMemo(() => {
    const q = query.trim();
    if (!q) return sortedEpisodes;
    return sortedEpisodes.filter((ep) => {
      const idx = buildEpisodeIndex(
        { episodeCode: ep.episodeCode, title: ep.title, summary: ep.description ? ep.description : null },
        indexCache
      );
      return matchesQuery(idx, q);
    });
  }, [indexCache, query, sortedEpisodes]);

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
        <div className="mt-3 flex items-center gap-2 sm:gap-3">
          <div ref={logoRef} className="relative shrink-0 tmh-parallax-layer">
            <div
              className="absolute inset-0 -z-10 scale-110 rounded-full blur-3xl bg-acid/20"
              aria-hidden="true"
            />
            <img
              src={TMHLogoWhite}
              alt=""
              aria-hidden="true"
              className="h-32 w-32 sm:h-44 sm:w-44 origin-[55.44%_42.84%] drop-shadow-[0_0_24px_rgba(204,255,0,0.25)] motion-safe:animate-[spin_14s_linear_infinite] motion-reduce:animate-none"
            />
          </div>
          <h1 className="display-title text-[clamp(3rem,10vw,8rem)] leading-[0.9] text-white">
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
        <div className="sticky top-20 z-40">
          <RadioArchiveControls query={query} onQueryChange={setQuery} view={view} onViewChange={setView} sort={sort} onSortChange={setSort} />
          <RadioNewEpisodeBanner visible={hasUpdate} onRefresh={refreshEpisodes} onDismiss={dismissUpdate} />
        </div>

        <div className="mt-6">
          {errorMessage && !loading ? (
            <div className="surface-panel p-6">
              <div className="font-display text-xl uppercase tracking-[-0.03em] text-white">Couldn’t load episodes</div>
              <div className="mt-2 text-sm text-white/60">{errorMessage}</div>
              <button
                type="button"
                onClick={refreshEpisodes}
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-acid/35 bg-acid/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-acid hover:bg-acid/20"
              >
                Retry
              </button>
            </div>
          ) : loading ? (
            <RadioEpisodeRowSkeleton count={7} />
          ) : view === 'list' ? (
            filteredEpisodes.length ? (
              <div className="space-y-3">
                {filteredEpisodes.map((ep) => {
                  const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
                  const bookmarked = bookmarks.isBookmarked(ep.link);
                  const matchTerms = query.trim()
                    ? computeTermCounts(
                        buildEpisodeIndex(
                          { episodeCode: ep.episodeCode, title: ep.title, summary: ep.description ? ep.description : null },
                          indexCache
                        ),
                        query
                      )
                        .filter((x) => x.count > 0)
                        .slice(0, 2)
                    : [];

                  return (
                    <RadioEpisodeRow
                      key={ep.audioUrl ?? ep.link}
                      episode={{
                        episodeCode: ep.episodeCode,
                        title: ep.title,
                        link: ep.link,
                        pubDate: ep.pubDate,
                        audioUrl: ep.audioUrl,
                        coverUrl: ep.coverUrl,
                        durationSec: ep.durationSec,
                      }}
                      isCurrentlyPlaying={isCurrentlyPlaying}
                      bookmarked={bookmarked}
                      onPlay={() => playEpisode(ep)}
                      onToggleBookmark={() => bookmarks.toggle(ep.link)}
                      matchTerms={matchTerms}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="surface-panel p-6">
                <div className="font-display text-xl uppercase tracking-[-0.03em] text-white">No episodes match your search</div>
                <div className="mt-2 text-sm text-white/60">Try a different query.</div>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-4 inline-flex items-center justify-center rounded-xl border border-acid/35 bg-acid/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-acid hover:bg-acid/20"
                >
                  Clear search
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEpisodes.map((ep, i) => {
                const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
                const dateValue = new Date(ep.pubDate);
                const formattedDate = Number.isNaN(dateValue.getTime())
                  ? ''
                  : dateValue.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                const bookmarked = bookmarks.isBookmarked(ep.link);
                const numericCode = ep.episodeCode.match(/^ep(\d{1,4})$/i)?.[1] ?? null;
                const episodeLabel = numericCode ? `EP${numericCode}` : `EP.${Math.max(1, filteredEpisodes.length - i)}`;

                return (
                  <motion.article
                    key={ep.audioUrl ?? ep.link}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? { duration: 0 } : { delay: i * 0.02, duration: 0.3, ease: 'easeOut' }}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_0_0_1px_rgba(204,255,0,0.06),0_18px_45px_rgba(0,0,0,0.55)] transition-colors hover:border-acid/60"
                  >
                    <Link
                      to={`/radio/${ep.episodeCode}`}
                      className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                      aria-label={`View ${ep.title}`}
                    />

                    <div className="relative z-20 pointer-events-none">
                      <div className="relative w-full overflow-hidden bg-black aspect-[4/5]">
                        <img
                          src={ep.coverUrl}
                          alt={ep.title}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = DEFAULT_COVER;
                          }}
                          className={`h-full w-full object-cover transition-transform duration-700 ${
                            isCurrentlyPlaying ? 'scale-[1.04]' : 'group-hover:scale-[1.03]'
                          }`}
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
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
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
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
