import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import { generateWaveformPeaks } from '../utils/waveform';
import TMHWallpaper from './TMHWallpaper';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, setIsPlaying, playNext, playPrevious } = usePlayer();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotionPreference();
  const track = currentTrack;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [isDismissed, setIsDismissed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);
  const waveformWrapRef = useRef<HTMLDivElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const desktopWaveformWrapRef = useRef<HTMLDivElement | null>(null);
  const desktopWaveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const acidRgb = '204 255 0';

  useEffect(() => {
    const onResize = () => {
      const nextMobile = window.innerWidth < 768;
      setIsMobile(nextMobile);
      if (nextMobile) setIsExpanded(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!track?.url) return;
    setProgress(0);
    setDuration(0);
    setIsSeeking(false);
    setSeekPreview(null);
    setIsDismissed(false);
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
    if (isPlaying) setIsDismissed(false);
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

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

  const formatAriaValueText = (time: number) => {
    const total = Number.isFinite(duration) ? duration : 0;
    const cur = Number.isFinite(time) ? time : 0;
    const curMin = Math.floor(cur / 60);
    const curSec = Math.floor(cur % 60);
    const totalMin = Math.floor(total / 60);
    const totalSec = Math.floor(total % 60);
    return `${curMin} minute ${curSec} seconds of ${totalMin} minutes ${totalSec} seconds`;
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
  const compactMode = isMobile && !isExpanded;

  const waveformPeaks = useMemo(() => {
    const key = track?.url ?? 'idle';
    return generateWaveformPeaks(key, compactMode ? 144 : 220);
  }, [compactMode, track?.url]);

  const drawWaveform = useCallback((
    wrap: HTMLDivElement | null,
    canvas: HTMLCanvasElement | null,
    barHeightMultiplier: number
  ) => {
    if (!wrap || !canvas) return () => undefined;

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
      const gap = 2;
      const barW = 2;
      const usableW = barCount * barW + (barCount - 1) * gap;
      const startX = Math.floor((width - usableW) / 2);
      const centerY = height / 2;
      const maxH = height * barHeightMultiplier;

      const progressRatio = duration > 0 ? Math.max(0, Math.min(1, progress / duration)) : 0;
      const progressX = startX + usableW * progressRatio;
      const idle = duration <= 0;
      const baseAlpha = idle ? 0.18 : 0.2;
      const activeAlpha = idle ? 0.65 : 1;

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

      ctx.fillStyle = `rgb(${acidRgb} / ${activeAlpha})`;
      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barW + gap);
        const v = waveformPeaks[i] ?? 0.2;
        const h = Math.max(3, v * maxH);
        const y = centerY - h / 2;
        ctx.fillRect(x, y, barW, h);
      }
      ctx.restore();
    };

    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    draw();
    return () => ro.disconnect();
  }, [acidRgb, duration, progress, waveformPeaks]);

  useEffect(
    () => drawWaveform(waveformWrapRef.current, waveformCanvasRef.current, compactMode ? 0.82 : 0.88),
    [compactMode, drawWaveform]
  );

  useEffect(
    () => drawWaveform(desktopWaveformWrapRef.current, desktopWaveformCanvasRef.current, 0.9),
    [drawWaveform]
  );

  if (!track) return null;

  const baseButtonClass =
    'inline-flex items-center justify-center rounded-full p-2 text-smoke transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid';

  const renderScrubber = (
    heightClass: string,
    wrapRef: React.RefObject<HTMLDivElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => (
    <div ref={wrapRef} className={`relative w-full overflow-hidden ${heightClass}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      {isSeeking && seekPreview != null && (
        <div
          className="pointer-events-none absolute -top-9 -translate-x-1/2 border border-acid bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-[0.26em] text-acid"
          style={{ left: `${seekPercent}%` }}
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
        aria-label="Seek timeline"
        aria-valuetext={formatAriaValueText(shownTime)}
      />
    </div>
  );

  return (
    <>
      {!isDismissed && (
        <div className="fixed inset-x-0 bottom-0 z-[120]" role="region" aria-label="Audio player">
          <div className="border-t border-acid/30 bg-ink/90 backdrop-blur-xl">
            <div className="mx-auto hidden h-20 w-full max-w-7xl items-center px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
              <button
                type="button"
                onClick={() => navigate('/podcast')}
                aria-label="Open podcast page"
                className="flex min-w-0 items-center gap-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black">
                  {coverUrl ? (
                    <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-5 w-5 text-acid" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(204,255,0,0.2)_0,rgba(204,255,0,0.2)_6px,rgba(0,0,0,0)_6px,rgba(0,0,0,0)_12px)]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-[14px] font-extrabold uppercase tracking-[-0.01em] text-white">
                    {title}
                  </div>
                  <div className="truncate font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">{artist}</div>
                </div>
              </button>

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={playPrevious} aria-label="Previous track" className={baseButtonClass}>
                    <SkipBack size={18} />
                  </button>
                  <motion.button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : isPlaying
                          ? { scale: [1, 1.04, 1] }
                          : { scale: 1 }
                    }
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: isPlaying ? 1.2 : 0.18, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-acid text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid ${
                      isPlaying ? 'ring-2 ring-acid/50 ring-offset-2 ring-offset-ink' : ''
                    }`}
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                  </motion.button>
                  <button type="button" onClick={playNext} aria-label="Next track" className={baseButtonClass}>
                    <SkipForward size={18} />
                  </button>
                </div>
                <div className="w-[360px] max-w-[44vw]">
                  {renderScrubber('h-8', desktopWaveformWrapRef, desktopWaveformCanvasRef)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={baseButtonClass}
                  aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="relative h-2 w-28 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full bg-acid" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
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
                    aria-label="Volume"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  aria-label="Expand player"
                  className={baseButtonClass}
                >
                  <ChevronUp size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setIsDismissed(true);
                    setIsPlaying(false);
                  }}
                  aria-label="Close player"
                  className={baseButtonClass}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-3 pb-[env(safe-area-inset-bottom)] md:hidden">
              <button
                type="button"
                onClick={() => navigate('/podcast')}
                aria-label="Open podcast page"
                className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              >
                {coverUrl ? (
                  <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music className="h-4 w-4 text-acid" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(204,255,0,0.2)_0,rgba(204,255,0,0.2)_6px,rgba(0,0,0,0)_6px,rgba(0,0,0,0)_12px)]" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/podcast')}
                aria-label="Open podcast page"
                className="min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              >
                <div className="truncate font-display text-[12px] font-extrabold uppercase tracking-[-0.01em] text-white">
                  {title}
                </div>
                <div className="truncate font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">{artist}</div>
              </button>

              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : isPlaying
                        ? { scale: [1, 1.04, 1] }
                        : { scale: 1 }
                  }
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: isPlaying ? 1.2 : 0.18, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-acid text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid ${
                    isPlaying ? 'ring-2 ring-acid/50 ring-offset-2 ring-offset-ink' : ''
                  }`}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                </motion.button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  aria-label="Expand player"
                  className={baseButtonClass}
                >
                  <ChevronUp size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && !isDismissed && (
          <motion.div
            className="fixed inset-0 z-[130] bg-ink"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            role="dialog"
            aria-label="Expanded player"
          >
            <div className="absolute inset-0 opacity-[0.04]">
              <TMHWallpaper text={['TECH MY HOUSE', 'RADIO SHOW']} opacity={1} />
            </div>

            <div className="relative z-10 flex h-full flex-col px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))]">
              <div className="flex items-center justify-between">
                <div className="font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-acid">
                  Now Playing
                </div>
                <button type="button" onClick={() => setIsExpanded(false)} aria-label="Close expanded player" className={baseButtonClass}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="relative h-[280px] w-[280px] overflow-hidden rounded-sm border border-white/10 bg-black">
                  {coverUrl ? (
                    <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-10 w-10 text-acid" />
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(204,255,0,0.2)_0,rgba(204,255,0,0.2)_7px,rgba(0,0,0,0)_7px,rgba(0,0,0,0)_14px)]" />
                </div>

                <div className="mt-8 w-full max-w-3xl text-center">
                  <div className="px-4 font-display text-[clamp(1.4rem,4vw,2.4rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.04em] text-white">
                    {title}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">{artist}</div>
                </div>

                <div className="mt-10 w-full max-w-3xl">
                  {renderScrubber('h-12', waveformWrapRef, waveformCanvasRef)}
                  <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">
                    <span>{formatTime(shownTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <button type="button" onClick={playPrevious} aria-label="Previous track" className={baseButtonClass}>
                    <SkipBack size={22} />
                  </button>
                  <motion.button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : isPlaying
                          ? { scale: [1, 1.04, 1] }
                          : { scale: 1 }
                    }
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: isPlaying ? 1.2 : 0.18, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-full bg-acid text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid ${
                      isPlaying ? 'ring-2 ring-acid/50 ring-offset-2 ring-offset-ink' : ''
                    }`}
                  >
                    {isPlaying ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
                  </motion.button>
                  <button type="button" onClick={playNext} aria-label="Next track" className={baseButtonClass}>
                    <SkipForward size={22} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/podcast')}
                  aria-label="Open podcast page"
                  className="rounded-full border border-acid/40 bg-black/20 px-4 py-2 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-acid transition-colors hover:bg-acid hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                >
                  PODCAST ↗
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={baseButtonClass}
                    aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <div className="relative h-2 w-40 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full bg-acid" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
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
                      aria-label="Volume"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
