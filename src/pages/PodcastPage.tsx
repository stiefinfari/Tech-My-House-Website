import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
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

function normalizeSoundCloudCover(url: string, size: number) {
  const safe = url.trim();
  if (!safe) return safe;
  const s = Math.max(100, Math.min(3000, Math.floor(size)));
  return safe.replace(/-t\d+x\d+(?=\.)/i, `-t${s}x${s}`);
}

export default function PodcastPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();

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

  return (
    <div className="min-h-screen pb-24 pt-28 sm:pt-32">
      <div className="container-shell mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <h1 className="display-title text-[clamp(2.4rem,9vw,6rem)] text-white">
            TECH MY HOUSE
          </h1>
          <div className="mt-6">
            <span className="tape-strip text-[11px] tracking-[0.18em]">RADIO SHOW</span>
          </div>
        </motion.div>
      </div>

      <div className="container-shell">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-acid border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {episodes.map((ep, i) => {
              const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
              
              return (
                <motion.button
                  key={i}
                  type="button"
                  aria-label={`Play ${ep.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex w-full cursor-pointer flex-col overflow-hidden border border-white/10 bg-black/20 text-left transition-transform duration-300 hover:-translate-y-1"
                  onClick={() => {
                    if (ep.audioUrl) {
                      const playlist = episodes
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
                  <div className="relative aspect-square w-full overflow-hidden bg-black">
                    <img
                      src={ep.coverUrl}
                      alt={ep.title}
                      loading="lazy"
                      className={`h-full w-full object-cover transition-[transform,filter] duration-500 ${isCurrentlyPlaying ? 'scale-[1.06]' : 'grayscale group-hover:scale-[1.04] group-hover:grayscale-0'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-85" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`flex h-[52px] w-[52px] items-center justify-center rounded-none border transition-colors duration-300 ${
                          isCurrentlyPlaying ? 'border-acid bg-acid text-ink' : 'border-white/25 bg-ink/60 text-white'
                        }`}
                      >
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

                  <div className="relative flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-2 text-white/60 transition-colors group-hover:text-white/80">
                      <Calendar size={14} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.26em] sm:text-xs">
                        {new Date(ep.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <h3 className="display-title mb-4 text-2xl text-white">
                      {ep.title}
                    </h3>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="font-display text-[11px] uppercase tracking-[0.18em] text-smoke transition-colors group-hover:text-white">
                        {isCurrentlyPlaying ? 'Playing Now' : 'Play Episode'}
                      </span>
                      {isCurrentlyPlaying && (
                        <div className="h-2 w-2 bg-acid" />
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
