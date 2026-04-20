import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Marquee from '../components/Marquee';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';
import { mapFeedItems, DEFAULT_COVER, type FeedItem, type EpisodeFeedItem } from '../utils/episodeFeed';
import { useEpisodeBookmarks } from '../hooks/useEpisodeBookmarks';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import { getTracklistForEpisode } from '../data/tracklists';

type RssResponse = {
  status?: string;
  items?: FeedItem[];
};

type EpisodeFilter = 'ALL' | 'HOUSE' | 'TECH HOUSE' | 'TECHNO' | 'HARD TECHNO';

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<EpisodeFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EpisodeFilter>('ALL');
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const shouldReduceMotion = useReducedMotionPreference();
  const bookmarks = useEpisodeBookmarks();
  const filterOptions: EpisodeFilter[] = ['ALL', 'HOUSE', 'TECH HOUSE', 'TECHNO', 'HARD TECHNO'];

  const [openTracklists, setOpenTracklists] = useState<Record<string, boolean>>({});

  const toggleTracklist = (link: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenTracklists(prev => ({ ...prev, [link]: !prev[link] }));
  };

  const jsonLd = useMemo(() => {
    const safeIso = (d: string) => {
      const dt = new Date(d);
      return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
    };

    return {
      '@context': 'https://schema.org',
      '@type': 'PodcastSeries',
      name: 'Tech My House Radio Show',
      url: new URL('/podcast', SITE.url).toString(),
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
    title: 'Podcast',
    path: '/podcast',
    description:
      'Dive into the underground sound. Listen to the latest sets, curated mixes, and exclusive tracks from the Tech My House radio show.',
    jsonLd,
  });

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss')}`);
        const data = (await response.json()) as RssResponse;
        if (data.status === 'ok') {
          const items = Array.isArray(data.items) ? data.items : [];
          setEpisodes(mapFeedItems(items.slice(0, 24)));
        }
      } catch (error) {
        console.error("Error fetching podcast:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPodcast();
  }, []);

  const filteredEpisodes = useMemo(() => {
    if (filter === 'ALL') return episodes;
    const lookup = filter.toLowerCase();
    return episodes.filter((ep) => ep.title.toLowerCase().includes(lookup));
  }, [episodes, filter]);

  const buildPlaylist = (source: EpisodeFeedItem[]) => {
    return source
      .filter((entry) => Boolean(entry.audioUrl))
      .map((entry) => ({
        title: entry.title,
        url: entry.audioUrl,
        artist: 'Tech My House',
        coverUrl: entry.coverUrl,
      }));
  };

  const playEpisode = (episode: EpisodeFeedItem) => {
    if (episode.audioUrl) {
      playTrack(
        {
          title: episode.title,
          url: episode.audioUrl,
          artist: 'Tech My House',
          coverUrl: episode.coverUrl,
        },
        buildPlaylist(filteredEpisodes)
      );
      return;
    }

    window.open(episode.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen pb-24 pt-28 sm:pt-32">
      <div className="container-shell mb-14 max-w-6xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-acid">THE ARCHIVE</div>
        <h1 className="display-title mt-4 text-[clamp(3rem,10vw,8rem)] leading-[0.9] text-white">RADIO SHOW</h1>
        <p className="accent-script mt-4 -rotate-[1.5deg] text-[clamp(1.6rem,3.5vw,2.8rem)] text-acid">every episode, underground sound</p>
        <div className="mt-5 font-mono text-[10px] uppercase tracking-widest text-smoke">
          {episodes.length} EPISODES · UPDATED WEEKLY
        </div>
      </div>

      <Marquee text="RADIO SHOW · TECH MY HOUSE · RADIO SHOW · TECH MY HOUSE" className="bg-acid text-ink" size="sm" density="tight" />

      <div className="container-shell">
        <div className="mb-5 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] transition-colors ${
                filter === option ? 'border-acid bg-acid text-ink' : 'border-white/15 bg-ink text-white/80 hover:border-acid/60 hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden border border-white/10 bg-ink">
                <div className="aspect-square animate-pulse bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-2 w-20 animate-pulse bg-white/15" />
                  <div className="h-5 w-11/12 animate-pulse bg-white/15" />
                  <div className="h-5 w-8/12 animate-pulse bg-white/15" />
                  <div className="h-2 w-24 animate-pulse bg-white/15" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {filteredEpisodes.map((ep, i) => {
              const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
              const isFeatured = i === 0;
              const formattedDate = new Date(ep.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
              const bookmarked = bookmarks.isBookmarked(ep.link);
              const tlData = getTracklistForEpisode({ title: ep.title, link: ep.link, audioUrl: ep.audioUrl });
              const isTlOpen = openTracklists[ep.link] || false;

              return (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { delay: i * 0.05 }}
                  className={`group relative flex w-full flex-col overflow-hidden border border-white/10 bg-ink text-left transition-colors duration-300 hover:border-acid/60 ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
                >
                  <button
                    type="button"
                    aria-label={`Play ${ep.title}`}
                    onClick={() => playEpisode(ep)}
                    className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                  >
                    <div className={`relative w-full overflow-hidden bg-black ${isFeatured ? 'aspect-[4/5] md:h-[440px] md:aspect-auto' : 'aspect-square'}`}>
                      <img
                        src={ep.coverUrl}
                        alt={ep.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = DEFAULT_COVER;
                        }}
                        className={`h-full w-full object-cover transition-transform duration-500 ${isCurrentlyPlaying ? 'scale-[1.04]' : 'group-hover:scale-[1.03]'}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent opacity-70" />
                      <div className="absolute bottom-3 right-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-acid text-ink transition-transform duration-300 group-hover:scale-110">
                          {isCurrentlyPlaying ? (
                            <div className="flex gap-[4px] items-end h-5">
                              <span className="h-full w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
                              <span className="h-2/3 w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '200ms' }} />
                              <span className="h-4/5 w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '400ms' }} />
                            </div>
                          ) : (
                            <Play size={24} fill="currentColor" className="ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-acid">EP.{Math.max(1, filteredEpisodes.length - i)}</div>
                      <h3 className="mt-2 font-display text-lg font-extrabold uppercase leading-tight text-white line-clamp-2">
                        {ep.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between pt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
                        <span>{formattedDate}</span>
                        {isCurrentlyPlaying && (
                          <span className="text-acid">▶ PLAYING</span>
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center justify-between px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => bookmarks.toggle(ep.link)}
                      aria-label={bookmarked ? `Remove bookmark ${ep.title}` : `Bookmark ${ep.title}`}
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/80 transition-colors hover:text-acid"
                    >
                      {bookmarked ? <BookmarkCheck size={14} className="text-acid" /> : <Bookmark size={14} />}
                      {bookmarked ? 'BOOKMARKED' : 'BOOKMARK'}
                    </button>
                    
                    {tlData && tlData.tracks.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => toggleTracklist(ep.link, e)}
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke transition-colors hover:text-acid"
                      >
                        TRACKLIST {isTlOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>

                  {isTlOpen && tlData && (
                    <div className="border-t border-white/10 bg-black/20 p-4">
                      {tlData.sourceUrl && (
                        <a href={tlData.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-right mb-3 font-mono text-[9px] text-acid uppercase tracking-widest hover:underline">
                          View on 1001Tracklists ↗
                        </a>
                      )}
                      <div className="space-y-3">
                        {tlData.tracks.map((t, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="font-mono text-[9px] text-smoke shrink-0 w-8">
                              {Math.floor(t.startSec / 60)}:{(t.startSec % 60).toString().padStart(2, '0')}
                            </div>
                            <div className="min-w-0">
                              <div className="font-display text-[11px] font-bold text-white uppercase truncate">{t.title}</div>
                              <div className="font-mono text-[9px] text-smoke uppercase truncate">{t.artist}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
