import React, { useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import TMHWallpaper from './TMHWallpaper';
import TopoBlob from './TopoBlob';
import PillButton from './ui/PillButton';
import { type Episode, fetchRadioShow } from '../lib/rssCache';

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDuration(sec?: number) {
  if (!sec || !Number.isFinite(sec)) return '—';
  const s = Math.max(0, Math.floor(sec));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (hh > 0) return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

function extractEpisodeNumber(title: string) {
  const match = title.match(/episode\s*(\d+)/i) ?? title.match(/\bep\s*(\d+)/i);
  if (!match?.[1]) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function extractArtist(title: string) {
  const parts = title.split(' - ').map((p) => p.trim()).filter(Boolean);
  const raw = parts.length >= 2 ? parts[parts.length - 1] : title;
  const cleaned = raw.replace(/episode\s*\d+/i, '').replace(/\bep\s*\d+/i, '').trim();
  return (cleaned || 'TMH').toUpperCase();
}

function Skeleton({ shimmer }: { shimmer: boolean }) {
  const block = shimmer ? 'shimmer-block' : 'bg-white/[0.06]';
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[540px_1fr] lg:gap-10">
      <div className={`aspect-square w-full max-w-[540px] border border-white/10 ${block}`} />
      <div className="space-y-6">
        <div className={`h-3 w-40 ${block}`} />
        <div className={`h-16 w-full max-w-[520px] ${block}`} />
        <div className="flex gap-6">
          <div className={`h-3 w-32 ${block}`} />
          <div className={`h-3 w-24 ${block}`} />
          <div className={`h-3 w-20 ${block}`} />
        </div>
        <div className={`h-12 w-56 rounded-full ${block}`} />
        <div className="border-t border-acid/30 pt-6">
          <div className={`h-3 w-44 ${block}`} />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`h-14 w-14 ${block}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-full max-w-[420px] ${block}`} />
                  <div className={`h-3 w-28 ${block}`} />
                </div>
                <div className={`h-8 w-8 rounded-full ${block}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LatestEpisode() {
  const { playTrack } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [latest, setLatest] = useState<Episode | null>(null);
  const [previous, setPrevious] = useState<Episode[]>([]);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }
    const timer = window.setTimeout(() => setShowSkeleton(true), 2500);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await fetchRadioShow();
      if (!active) return;
      setLatest(result.latest);
      setPrevious(result.previous);
      setIsFallback(result.isFallback);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const episodeNumber = useMemo(() => (latest ? extractEpisodeNumber(latest.title) : null), [latest]);
  const artistName = useMemo(() => (latest ? extractArtist(latest.title) : 'TMH'), [latest]);
  const dateText = useMemo(() => (latest ? formatDate(latest.pubDate) : '—'), [latest]);
  const durationText = useMemo(() => (latest ? formatDuration(latest.durationSec) : '—'), [latest]);

  const queue = useMemo(() => {
    const all = [latest, ...previous].filter((x): x is Episode => Boolean(x));
    return all.map((ep) => ({ title: ep.title, url: ep.audioUrl, artist: 'Tech My House', coverUrl: ep.coverUrl }));
  }, [latest, previous]);

  const playEpisode = (ep: Episode) => {
    if (!ep.audioUrl) {
      window.open(ep.link || 'https://soundcloud.com/techmyhouse', '_blank', 'noopener,noreferrer');
      return;
    }
    playTrack({ title: ep.title, url: ep.audioUrl, artist: 'Tech My House', coverUrl: ep.coverUrl }, queue);
  };

  if (loading) return <Skeleton shimmer={showSkeleton} />;
  if (!latest) {
    return (
      <div className="w-full border border-white/10 bg-white/[0.02] p-8">
        <PillButton href="https://soundcloud.com/techmyhouse" target="_blank" variant="ghost" ariaLabel="Listen on SoundCloud">
          LISTEN ON SOUNDCLOUD ↗
        </PillButton>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[540px_1fr] lg:gap-10">
      <div className="w-full max-w-[540px]">
        <div className="photocopy-grain relative aspect-square w-full overflow-hidden border border-white/10 bg-black">
          {latest.coverUrl ? (
            <img
              src={latest.coverUrl}
              alt={latest.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="cement-texture absolute inset-0">
              <div className="absolute inset-0 text-acid/30">
                <TMHWallpaper mode="mixed" opacity={0.12} />
              </div>
              <TopoBlob seed={132} size={260} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-acid/35" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/55" />

          <div className="absolute left-4 top-4 right-4">
            <div className="display-title text-[clamp(1.8rem,4vw,3rem)] text-white">{artistName}</div>
          </div>

          <div className="absolute left-4 bottom-4">
            <div className="inline-flex -rotate-[1deg] items-center bg-acid px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">
              EPISODE {episodeNumber ?? 132}
            </div>
          </div>

          <button
            type="button"
            onClick={() => (isFallback ? window.open('https://soundcloud.com/techmyhouse', '_blank', 'noopener,noreferrer') : playEpisode(latest))}
            aria-label={isFallback ? 'Listen on SoundCloud' : `Play episode: ${latest.title}`}
            className="group absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-acid/60 bg-black/30 transition-transform hover:scale-[1.06] hover:border-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          >
            <Play size={40} className="text-acid" stroke="none" fill="currentColor" />
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className="font-mono text-[10px] uppercase tracking-widest text-acid">LATEST BROADCAST</div>
        <h2 className="display-title mt-4 text-[clamp(2rem,4vw,3.2rem)] text-white line-clamp-2">{latest.title}</h2>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-smoke">
          <span>{dateText}</span>
          <span>{durationText}</span>
          <span>EP {episodeNumber ?? 132}</span>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {isFallback ? (
            <PillButton href="https://soundcloud.com/techmyhouse" target="_blank" variant="ghost" ariaLabel="Listen on SoundCloud">
              LISTEN ON SOUNDCLOUD ↗
            </PillButton>
          ) : (
            <PillButton
              variant="primary"
              icon={<Play size={18} />}
              ariaLabel="Play episode"
              onClick={() => playEpisode(latest)}
            >
              PLAY EPISODE
            </PillButton>
          )}
        </div>

        <div className="mt-10 border-t border-acid/30 pt-8">
          <div className="font-mono text-[10px] uppercase tracking-widest text-smoke">PREVIOUSLY ON TMH</div>
          <div className="mt-4 space-y-2">
            {previous.slice(0, 3).map((ep) => (
              <button
                key={ep.audioUrl || ep.link || ep.title}
                type="button"
                onClick={() => playEpisode(ep)}
                className="group flex w-full items-center gap-4 rounded-none px-3 py-3 text-left transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                aria-label={`Play: ${ep.title}`}
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden bg-white/5">
                  {ep.coverUrl ? (
                    <img src={ep.coverUrl} alt="" aria-hidden="true" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-white/5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-sans text-sm font-semibold text-white/90">{ep.title}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-smoke">{formatDate(ep.pubDate)}</div>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-acid/40 text-acid/80 transition-colors group-hover:border-acid/80 group-hover:text-acid">
                  <Play size={14} stroke="none" fill="currentColor" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
