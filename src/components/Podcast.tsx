import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Radio, Play, ArrowRight } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Link } from 'react-router-dom';
import { getDominantColor } from '../utils/dominantColor';

interface Episode {
  title: string;
  link: string;
  pubDate: string;
  audioUrl: string;
  coverUrl?: string;
}

type GlowStyle = CSSProperties & { ['--ep-glow']?: string };

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
  const glowRef = useRef<Record<string, string>>({});
  const [glowByUrl, setGlowByUrl] = useState<Record<string, string>>({});
  const fallbackGlow = '204 255 0';

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

  useEffect(() => {
    let cancelled = false;
    const urls = Array.from(new Set(episodes.map((e) => e.coverUrl).filter(Boolean) as string[]));

    urls.forEach((url) => {
      if (glowRef.current[url]) return;
      getDominantColor(url).then((rgb) => {
        if (cancelled) return;
        const value = rgb ?? fallbackGlow;
        setGlowByUrl((prev) => {
          if (prev[url]) return prev;
          const next = { ...prev, [url]: value };
          glowRef.current = next;
          return next;
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [episodes]);

  const queue = episodes.map((e) => ({
    title: e.title,
    url: e.audioUrl,
    artist: 'Tech My House',
    coverUrl: e.coverUrl,
  }));

  const handlePlay = (ep: Episode) => {
    if (ep.audioUrl) {
      playTrack(
        {
          title: ep.title,
          url: ep.audioUrl,
          artist: 'Tech My House',
          coverUrl: ep.coverUrl,
        },
        queue
      );
      return;
    }
    window.open(ep.link, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <Radio size={34} className="text-neon" />
          <h2 className="font-display text-[clamp(2rem,6vw,4.2rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.06em]">
            Tech My House Radio
          </h2>
        </div>
        <Link
          to="/podcast"
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/70 transition-colors hover:text-neon"
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
        <div className="space-y-6">
          {episodes.length === 0 ? (
            <div className="surface-panel px-6 py-10 text-center text-sm uppercase tracking-[0.22em] text-white/70">
              No episodes found
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {(() => {
                const featured = episodes[0];
                const featuredGlow = featured.coverUrl ? (glowByUrl[featured.coverUrl] ?? fallbackGlow) : fallbackGlow;
                const isCurrentlyPlaying = currentTrack?.url === featured.audioUrl && isPlaying;

                return (
                  <button
                    type="button"
                    className="episode-glow group surface-panel relative flex w-full flex-col overflow-hidden text-left lg:col-span-7"
                    style={{ '--ep-glow': featuredGlow } as GlowStyle}
                    onClick={() => handlePlay(featured)}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                      <img
                        src={featured.coverUrl}
                        alt={featured.title}
                        loading="lazy"
                        className={`h-full w-full object-cover transition-[transform,filter] duration-700 ${
                          isCurrentlyPlaying ? 'scale-[1.06]' : 'grayscale group-hover:scale-[1.04] group-hover:grayscale-0'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent opacity-85" />
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ backgroundColor: `rgb(${featuredGlow} / 0.14)` }}
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`inline-flex h-16 w-16 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${
                            isCurrentlyPlaying
                              ? 'border-neon bg-neon text-black shadow-[0_0_26px_rgba(204,255,0,0.44)]'
                              : 'border-white/25 bg-white/10 text-white group-hover:border-neon group-hover:bg-neon group-hover:text-black'
                          }`}
                        >
                          <Play size={24} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex w-fit rounded-full border border-neon/25 bg-neon/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-neon sm:text-xs">
                          Latest Episode
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.24em] text-white/55 sm:text-xs">
                          {new Date(featured.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="font-display text-[clamp(1.7rem,3.2vw,2.7rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.05em] text-white">
                        {featured.title}
                      </h3>

                      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-xs uppercase tracking-[0.2em] text-white/60">
                        <span className="transition-colors duration-200 group-hover:text-white">
                          {isCurrentlyPlaying ? 'Playing Now' : 'Play Episode'}
                        </span>
                        <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
                      </div>
                    </div>
                  </button>
                );
              })()}

              <div className="flex flex-col gap-3 lg:col-span-5">
                {episodes.slice(1, 5).map((ep, i) => {
                  const isCurrentlyPlaying = currentTrack?.url === ep.audioUrl && isPlaying;
                  const glow = ep.coverUrl ? (glowByUrl[ep.coverUrl] ?? fallbackGlow) : fallbackGlow;

                  return (
                    <button
                      key={i}
                      type="button"
                      className="episode-glow group surface-panel flex w-full items-center gap-4 overflow-hidden px-4 py-4 text-left transition-transform duration-300 hover:-translate-y-0.5"
                      style={{ '--ep-glow': glow } as GlowStyle}
                      onClick={() => handlePlay(ep)}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
                        <img
                          src={ep.coverUrl}
                          alt={ep.title}
                          loading="lazy"
                          className={`h-full w-full object-cover transition-[transform,filter] duration-500 ${
                            isCurrentlyPlaying ? 'scale-[1.06]' : 'grayscale group-hover:scale-[1.03] group-hover:grayscale-0'
                          }`}
                        />
                        <div
                          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{ backgroundColor: `rgb(${glow} / 0.12)` }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-xs uppercase tracking-[0.2em] text-white/85 group-hover:text-white">
                            {ep.title}
                          </span>
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.24em] text-white/45">
                            {new Date(ep.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] uppercase tracking-[0.24em] text-white/55">
                          <span className="transition-colors duration-200 group-hover:text-white">
                            {isCurrentlyPlaying ? 'Playing Now' : 'Play Episode'}
                          </span>
                          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
