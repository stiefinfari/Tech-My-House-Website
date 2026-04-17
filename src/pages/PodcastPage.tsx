import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';
import { TMH_LOGO_OBJECT_POSITION, TMH_LOGO_SRC } from '../branding/logo';

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
      'Dive into the underground sound. Listen to the latest sets, guest mixes, and exclusive tracks from the Tech My House radio show.',
    jsonLd,
  });

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss')}`);
        const data = (await response.json()) as RssResponse;
        if (data.status === 'ok') {
          const items = Array.isArray(data.items) ? data.items : [];
          const parsedEpisodes = items.slice(0, 20).map((item) => ({
            title: item.title ?? 'Unknown Episode',
            link: item.link ?? '#',
            pubDate: item.pubDate ?? '',
            audioUrl: item.enclosure?.link ?? '',
            coverUrl:
              item.thumbnail ??
              item.enclosure?.thumbnail ??
              'https://i1.sndcdn.com/avatars-siKAkzoJZjIx8IDn-zpkRzw-original.jpg',
            description: item.description ?? '',
          }));
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
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-neon/25 bg-neon/10 shadow-[0_0_24px_rgba(204,255,0,0.18)]">
            <img
              src={TMH_LOGO_SRC}
              alt="Tech My House"
              className="h-10 w-10 object-cover"
              style={{ objectPosition: TMH_LOGO_OBJECT_POSITION }}
            />
          </div>
          <h1 className="font-display text-[clamp(2.1rem,8vw,5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.07em]">ALL EPISODES</h1>
          <p className="mt-5 text-balance text-base leading-relaxed text-white/72 sm:text-lg">
            Dive into the underground sound with the latest sets, guest mixes, and exclusive tracks from the Tech My House radio show.
          </p>
        </motion.div>
      </div>

      <div className="container-shell">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {episodes.map((ep, i) => {
              const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
              
              return (
                <motion.button
                  key={i}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group surface-panel relative flex w-full cursor-pointer flex-col overflow-hidden text-left transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-neon/40"
                  onClick={() => {
                    if (ep.audioUrl) {
                      playTrack({
                        title: ep.title,
                        url: ep.audioUrl,
                        artist: "Tech My House",
                        coverUrl: ep.coverUrl
                      }, episodes.map(e => ({
                        title: e.title,
                        url: e.audioUrl,
                        artist: "Tech My House",
                        coverUrl: e.coverUrl
                      })));
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
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent opacity-80" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${isCurrentlyPlaying ? 'border-neon bg-neon text-dark shadow-[0_0_22px_rgba(204,255,0,0.44)]' : 'border-white/25 bg-white/10 text-white group-hover:border-neon group-hover:bg-neon group-hover:text-dark'}`}>
                        {isCurrentlyPlaying ? (
                          <div className="flex gap-[4px] items-end h-5">
                            <span className="w-1.5 h-full bg-dark animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-2/3 bg-dark animate-[bounce_1s_infinite]" style={{ animationDelay: '200ms' }} />
                            <span className="w-1.5 h-4/5 bg-dark animate-[bounce_1s_infinite]" style={{ animationDelay: '400ms' }} />
                          </div>
                        ) : (
                          <Play size={24} fill="currentColor" className="ml-1" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-2 text-white/60 transition-colors group-hover:text-neon/80">
                      <Calendar size={14} />
                      <span className="text-[10px] uppercase tracking-[0.2em] sm:text-xs">
                        {new Date(ep.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <h3 className="mb-4 text-2xl font-display font-extrabold uppercase leading-[0.92] tracking-[-0.05em] text-white transition-colors group-hover:text-neon">
                      {ep.title}
                    </h3>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-xs uppercase tracking-[0.2em] text-white/55 transition-colors group-hover:text-white">
                        {isCurrentlyPlaying ? 'Playing Now' : 'Play Episode'}
                      </span>
                      {isCurrentlyPlaying && (
                        <div className="w-2 h-2 rounded-full bg-neon shadow-[0_0_8px_#CCFF00] animate-pulse" />
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
