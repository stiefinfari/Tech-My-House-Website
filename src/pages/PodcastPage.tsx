import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import Marquee from '../components/Marquee';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';

interface Episode {
  title: string;
  link: string;
  pubDate: string;
  audioUrl: string;
  coverUrl?: string;
  description?: string;
}

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

type EpisodeFilter = 'ALL' | 'HOUSE' | 'TECH HOUSE' | 'TECHNO' | 'HARD TECHNO';

function normalizeSoundCloudCover(url: string, size: number) {
  const safe = url.trim();
  if (!safe) return safe;
  const s = Math.max(100, Math.min(3000, Math.floor(size)));
  return safe.replace(/-t\d+x\d+(?=\.)/i, `-t${s}x${s}`);
}

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EpisodeFilter>('ALL');
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const filterOptions: EpisodeFilter[] = ['ALL', 'HOUSE', 'TECH HOUSE', 'TECHNO', 'HARD TECHNO'];

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
          const parsedEpisodes = items.slice(0, 20).map((item) => {
            const coverRaw =
              item.thumbnail ??
              item.enclosure?.thumbnail ??
              'https://i1.sndcdn.com/avatars-siKAkzoJZjIx8IDn-zpkRzw-original.jpg';

            return {
              title: item.title ?? 'Unknown Episode',
              link: item.link ?? '#',
              pubDate: item.pubDate ?? '',
              audioUrl: item.enclosure?.link ?? '',
              coverUrl: normalizeSoundCloudCover(coverRaw, 800),
              description: item.description ?? '',
            };
          });

          parsedEpisodes.sort((a, b) => {
            const ad = new Date(a.pubDate).getTime();
            const bd = new Date(b.pubDate).getTime();
            if (Number.isNaN(ad) && Number.isNaN(bd)) return 0;
            if (Number.isNaN(ad)) return 1;
            if (Number.isNaN(bd)) return -1;
            return bd - ad;
          });
          setEpisodes(parsedEpisodes);
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

              return (
                <motion.button
                  key={i}
                  type="button"
                  aria-label={`Play ${ep.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group relative flex w-full cursor-pointer flex-col overflow-hidden border border-white/10 bg-ink text-left transition-colors duration-300 hover:border-acid/60 ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
                  onClick={() => {
                    if (ep.audioUrl) {
                      const playlist = filteredEpisodes
                        .filter((e) => Boolean(e.audioUrl))
                        .map((e) => ({
                          title: e.title,
                          url: e.audioUrl,
                          artist: 'Tech My House',
                          coverUrl: e.coverUrl,
                        }));
                      playTrack({
                        title: ep.title,
                        url: ep.audioUrl,
                        artist: "Tech My House",
                        coverUrl: ep.coverUrl
                      }, playlist);
                    } else {
                      window.open(ep.link, '_blank');
                    }
                  }}
                >
                  <div className={`relative w-full overflow-hidden bg-black ${isFeatured ? 'aspect-[4/5] md:h-[440px] md:aspect-auto' : 'aspect-square'}`}>
                    <img
                      src={ep.coverUrl}
                      alt={ep.title}
                      loading="lazy"
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
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
