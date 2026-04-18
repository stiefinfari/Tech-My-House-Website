import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getDominantColor } from '../utils/dominantColor';
import { generateWaveformPeaks } from '../utils/waveform';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, setIsPlaying, playNext, playPrevious } = usePlayer();
  const track = currentTrack;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const [accent, setAccent] = useState('204 255 0');
  const waveformWrapRef = useRef<HTMLDivElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!track?.url) return;
    setProgress(0);
    setDuration(0);
    setIsSeeking(false);
    setSeekPreview(null);
    audioRef.current?.load();
  }, [track?.url]);

  useEffect(() => {
    if (!track?.url || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => null);
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, track?.url]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    let cancelled = false;
    const url = track?.coverUrl;
    if (!url) {
      setAccent('204 255 0');
      return;
    }
    getDominantColor(url).then((rgb) => {
      if (cancelled) return;
      setAccent(rgb ?? '204 255 0');
    });
    return () => {
      cancelled = true;
    };
  }, [track?.coverUrl]);

  const title = track?.title ?? '';
  const artist = track?.artist ?? '';
  const coverUrl = track?.coverUrl;

  const handleTimeUpdate = () => {
    if (!audioRef.current || isSeeking) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const commitSeek = (time: number) => {
    if (duration <= 0) {
      setProgress(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    const safe = Math.max(0, Math.min(duration, time));
    setProgress(safe);
    if (audioRef.current) audioRef.current.currentTime = safe;
  };

  const shownTime = isSeeking && seekPreview != null ? seekPreview : progress;
  const seekPercent = Math.max(0, Math.min(100, duration > 0 ? (shownTime / duration) * 100 : 0));

  const waveformPeaks = useMemo(() => {
    const key = track?.url ?? 'idle';
    return generateWaveformPeaks(key, 192);
  }, [track?.url]);

  useEffect(() => {
    const wrap = waveformWrapRef.current;
    const canvas = waveformCanvasRef.current;
    if (!wrap || !canvas) return;

    const clampDpr = (v: number) => Math.max(1, Math.min(2, v));

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = clampDpr(window.devicePixelRatio ?? 1);
      const width = Math.max(1, wrap.clientWidth);
      const height = Math.max(1, wrap.clientHeight);
      const nextW = Math.floor(width * dpr);
      const nextH = Math.floor(height * dpr);

      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const barCount = waveformPeaks.length;
      const gap = 1;
      const barW = Math.max(1, Math.floor((width - (barCount - 1) * gap) / barCount));
      const usableW = barCount * barW + (barCount - 1) * gap;
      const startX = Math.floor((width - usableW) / 2);
      const centerY = height / 2;
      const maxH = height * 0.86;

      const progressRatio = duration > 0 ? Math.max(0, Math.min(1, progress / duration)) : 0;
      const progressX = startX + usableW * progressRatio;
      const idle = duration <= 0;
      const baseAlpha = idle ? 0.18 : 0.22;
      const activeAlpha = idle ? 0.45 : 0.92;

      ctx.fillStyle = `rgb(255 255 255 / ${baseAlpha})`;
      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barW + gap);
        const v = waveformPeaks[i] ?? 0.2;
        const h = Math.max(3, v * maxH);
        const y = centerY - h / 2;
        ctx.fillRect(x, y, barW, h);
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(startX, 0, Math.max(0, progressX - startX), height);
      ctx.clip();

      const grad = ctx.createLinearGradient(startX, 0, startX + usableW, 0);
      grad.addColorStop(0, `rgb(${accent} / ${activeAlpha})`);
      grad.addColorStop(0.6, `rgb(${accent} / ${Math.min(1, activeAlpha * 0.86)})`);
      grad.addColorStop(1, `rgb(${accent} / ${Math.min(1, activeAlpha * 0.62)})`);
      ctx.fillStyle = grad;
      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barW + gap);
        const v = waveformPeaks[i] ?? 0.2;
        const h = Math.max(3, v * maxH);
        const y = centerY - h / 2;
        ctx.fillRect(x, y, barW, h);
      }

      ctx.restore();

      if (!idle) {
        ctx.fillStyle = `rgb(${accent} / 0.20)`;
        ctx.fillRect(progressX - 1, 0, 2, height);
      }

    };

    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    draw();
    return () => {
      ro.disconnect();
    };
  }, [accent, duration, progress, waveformPeaks]);

  if (!track) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[120]" role="region" aria-label="Audio player">
        <div
          className="backdrop-blur-xl bg-dark/90"
          style={{
            boxShadow: `0 -1px 0 rgb(${accent} / 0.16), 0 -16px 40px rgba(0,0,0,0.62)`,
          }}
        >
          <div className="mx-auto w-full max-w-7xl px-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-3 sm:px-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[320px_1fr_240px] md:items-center">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black">
                  {coverUrl ? (
                    <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-5 w-5 text-neon" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-sm font-extrabold uppercase tracking-[-0.04em] text-white/95">
                    {title}
                  </div>
                  <div className="truncate font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                    {artist}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={playPrevious}
                      className="inline-flex h-9 w-9 items-center justify-center border border-white/12 bg-white/[0.02] text-white/65 transition-colors hover:text-white"
                      aria-label="Previous"
                    >
                      <SkipBack size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="inline-flex h-9 w-11 items-center justify-center border border-white/12 bg-white/[0.02] text-white/70 transition-colors hover:text-white"
                      style={{
                        boxShadow: `0 0 0 1px rgb(${accent} / 0.10), 0 0 18px rgb(${accent} / 0.10)`,
                      }}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={playNext}
                      className="inline-flex h-9 w-9 items-center justify-center border border-white/12 bg-white/[0.02] text-white/65 transition-colors hover:text-white"
                      aria-label="Next"
                    >
                      <SkipForward size={17} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                  <span className="font-sans">{formatTime(shownTime)}</span>
                  <span className="font-sans">{formatTime(duration)}</span>
                </div>
                <div
                  ref={waveformWrapRef}
                  className="relative mt-2 h-12 w-full overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0) 70%)',
                  }}
                >
                  <canvas ref={waveformCanvasRef} className="absolute inset-0" />
                  {isSeeking && seekPreview != null && (
                    <div
                      className="pointer-events-none absolute -top-9 -translate-x-1/2 border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/90 backdrop-blur"
                      style={{
                        left: `${seekPercent}%`,
                        backgroundColor: `rgb(${accent} / 0.18)`,
                        boxShadow: `0 0 0 1px rgb(${accent} / 0.10), 0 10px 20px rgba(0,0,0,0.35)`,
                      }}
                    >
                      {formatTime(seekPreview)}
                    </div>
                  )}
                  <input
                    type="range"
                    min={0}
                    max={duration || 1}
                    value={shownTime}
                    disabled={duration <= 0}
                    onPointerDown={() => {
                      setIsSeeking(true);
                      setSeekPreview(shownTime);
                    }}
                    onPointerUp={() => {
                      if (seekPreview != null) commitSeek(seekPreview);
                      setIsSeeking(false);
                      setSeekPreview(null);
                    }}
                    onPointerCancel={() => {
                      setIsSeeking(false);
                      setSeekPreview(null);
                    }}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (isSeeking) setSeekPreview(next);
                      else commitSeek(next);
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Seek"
                  />
                </div>
              </div>

              <div className="hidden items-center justify-end gap-3 md:flex">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="inline-flex h-9 w-9 items-center justify-center border border-white/12 bg-white/[0.02] text-white/65 transition-colors hover:text-white"
                  aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>
                <div className="relative h-2 w-32 overflow-hidden bg-white/10">
                  <div className="h-full" style={{ width: `${isMuted ? 0 : volume * 100}%`, backgroundColor: `rgb(${accent} / 0.85)` }} />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setIsMuted(false);
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={track.url}
        preload="metadata"
        onEnded={playNext}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </>
  );
}
