import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Radio, Calendar } from 'lucide-react';
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
    <div className="min-h-screen pt-32 pb-48">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          <div className="w-20 h-20 bg-neon/10 rounded-full flex items-center justify-center mb-6 border border-neon/20 shadow-[0_0_30px_rgba(204,255,0,0.15)]">
            <Radio size={40} className="text-neon" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold uppercase leading-none mb-6">
            All <span className="text-neon">Episodes</span>
          </h1>
          <p className="font-sans text-white/70 text-lg md:text-xl leading-relaxed">
            Dive into the underground sound. Listen to the latest sets, guest mixes, and exclusive tracks straight from the Tech My House radio show.
          </p>
        </motion.div>
      </div>

      {/* Episodes Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {episodes.map((ep, i) => {
              const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
              
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative flex flex-col bg-zinc-900/40 hover:bg-zinc-900/80 transition-all border border-white/5 hover:border-neon/30 cursor-pointer rounded-2xl overflow-hidden"
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
                  {/* Cover Art */}
                  <div className="relative w-full aspect-square overflow-hidden bg-dark">
                    <img 
                      src={ep.coverUrl} 
                      alt={ep.title}
                      className={`w-full h-full object-cover transition-all duration-700 ${isCurrentlyPlaying ? 'scale-110' : 'grayscale group-hover:grayscale-0 group-hover:scale-105'}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent opacity-80" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${isCurrentlyPlaying ? 'bg-neon text-dark border-neon shadow-[0_0_20px_rgba(204,255,0,0.4)]' : 'bg-white/10 text-white border-white/20 group-hover:bg-neon group-hover:text-dark group-hover:border-neon group-hover:scale-110'}`}>
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

                  {/* Episode Info */}
                  <div className="flex flex-col flex-1 p-6 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon/0 via-neon/50 to-neon/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-2 mb-3 text-white/50 group-hover:text-neon/80 transition-colors">
                      <Calendar size={14} />
                      <span className="font-sans text-xs font-bold uppercase tracking-widest">
                        {new Date(ep.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-xl font-extrabold uppercase text-white group-hover:text-neon transition-colors line-clamp-2 leading-tight mb-4">
                      {ep.title}
                    </h3>
                    
                    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="font-sans text-xs uppercase tracking-widest text-white/50 group-hover:text-white font-bold transition-colors">
                        {isCurrentlyPlaying ? 'Playing Now' : 'Play Episode'}
                      </span>
                      {isCurrentlyPlaying && (
                        <div className="w-2 h-2 rounded-full bg-neon shadow-[0_0_8px_#CCFF00] animate-pulse" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
