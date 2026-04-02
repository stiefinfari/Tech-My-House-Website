import React, { useEffect, useState } from 'react';
import { Radio, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { Link } from 'react-router-dom';

interface Episode {
  title: string;
  link: string;
  pubDate: string;
  audioUrl: string;
  coverUrl?: string;
}

type RssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  enclosure?: {
    link?: string;
    thumbnail?: string;
  };
};

type RssResponse = {
  status?: string;
  items?: RssItem[];
};

export default function Podcast() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss')}`);
        const data = (await response.json()) as RssResponse;
        if (data.status === 'ok') {
          const items = Array.isArray(data.items) ? data.items : [];
          const parsedEpisodes = items.slice(0, 5).map((item) => ({
            title: item.title ?? 'Unknown Episode',
            link: item.link ?? '#',
            pubDate: item.pubDate ?? '',
            audioUrl: item.enclosure?.link ?? '',
            coverUrl:
              item.thumbnail ??
              item.enclosure?.thumbnail ??
              'https://i1.sndcdn.com/avatars-siKAkzoJZjIx8IDn-zpkRzw-original.jpg',
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
    <div>
      <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <Radio size={48} className="text-neon animate-pulse" />
          <h2 className="font-display text-4xl md:text-6xl font-extrabold uppercase leading-none">
            Tech My House<br/><span className="text-neon">Radio Show</span>
          </h2>
        </div>
        <Link 
          to="/podcast" 
          className="group flex items-center gap-2 font-sans text-xs md:text-sm uppercase tracking-widest text-white/70 hover:text-neon transition-colors"
        >
          View All Episodes
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto snap-x flex gap-6 pb-8 hide-scrollbar">
          {episodes.map((ep, i) => {
            const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
            
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                className="group relative flex flex-col snap-center min-w-[320px] max-w-[380px] shrink-0 p-5 md:p-8 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.05] transition-all border border-white/5 hover:border-neon/30 cursor-pointer rounded-2xl overflow-hidden"
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
                {/* Background Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Cover Art */}
                <div className="relative w-full aspect-square shrink-0 rounded-xl overflow-hidden bg-dark shadow-2xl mb-6 border border-white/10 group-hover:border-neon/50 transition-colors duration-500">
                  <img 
                    src={ep.coverUrl} 
                    alt={ep.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${isCurrentlyPlaying ? 'scale-110' : 'grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110'}`}
                  />
                  <div className="absolute inset-0 bg-dark/40 group-hover:bg-dark/20 transition-colors duration-500 flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-500 ${isCurrentlyPlaying ? 'bg-neon text-dark border-neon shadow-[0_0_30px_rgba(204,255,0,0.5)] scale-110' : 'bg-white/5 text-white border-white/20 group-hover:bg-neon group-hover:text-dark group-hover:border-neon group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(204,255,0,0.4)]'}`}>
                      {isCurrentlyPlaying ? (
                        <div className="flex gap-[4px] items-end h-6">
                          <span className="w-1.5 h-full bg-dark animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-2/3 bg-dark animate-[bounce_1s_infinite]" style={{ animationDelay: '200ms' }} />
                          <span className="w-1.5 h-4/5 bg-dark animate-[bounce_1s_infinite]" style={{ animationDelay: '400ms' }} />
                        </div>
                      ) : (
                        <Play size={28} fill="currentColor" className="ml-1" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Episode Info */}
                <div className="flex-1 min-w-0 flex flex-col relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-widest text-neon bg-neon/10 px-4 py-1.5 rounded-full border border-neon/20 shadow-[0_0_10px_rgba(204,255,0,0.1)]">
                      {new Date(ep.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tighter text-white group-hover:text-neon transition-colors duration-300 line-clamp-2 leading-none mb-6">
                    {ep.title}
                  </h3>
                  
                  <div className="mt-auto pt-5 border-t border-white/10 group-hover:border-neon/30 transition-colors duration-500 flex justify-between items-center">
                    <span className="font-sans text-xs uppercase tracking-[0.2em] text-white/50 group-hover:text-neon font-bold transition-colors">
                      {isCurrentlyPlaying ? 'Playing Now' : 'Play Episode'}
                    </span>
                    <ArrowRight size={16} className="text-white/30 group-hover:text-neon transform group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
