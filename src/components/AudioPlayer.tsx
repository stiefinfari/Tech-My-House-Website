import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import { generateWaveformPeaks } from '../utils/waveform';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, setIsPlaying, playNext, playPrevious } = usePlayer();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotionPreference();
  const track = currentTrack;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
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
  const compactMode = isMobile || !isExpanded;

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
      const gap = 1;
      const barW = 1;
      const usableW = barCount * barW + (barCount - 1) * gap;
      const startX = Math.floor((width - usableW) / 2);
      const centerY = height / 2;
      const maxH = height * barHeightMultiplier;

      const progressRatio = duration > 0 ? Math.max(0, Math.min(1, progress / duration)) : 0;
      const progressX = startX + usableW * progressRatio;
      const idle = duration <= 0;
      const baseAlpha = idle ? 0.12 : 0.15;
      const activeAlpha = idle ? 0.4 : 0.95;

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
      grad.addColorStop(0, `rgb(${acidRgb} / ${activeAlpha})`);
      grad.addColorStop(1, `rgb(${acidRgb} / ${Math.min(1, activeAlpha * 0.72)})`);
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
        ctx.fillStyle = `rgb(${acidRgb} / 0.7)`;
        ctx.fillRect(progressX - 1, 0, 2, height);
      }
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
    'inline-flex items-center justify-center p-[10px] text-smoke transition-colors hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid';

  const renderScrubber = (
    heightClass: string,
    wrapRef: React.RefObject<HTMLDivElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>
  ) => (
    <div ref={wrapRef} className={`relative w-full overflow-hidden ${heightClass}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      {isSeeking && seekPreview != null && (
        <div
          className="pointer-events-none absolute -top-9 -translate-x-1/2 border border-acid px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-acid backdrop-blur"
          style={{ left: `${seekPercent}%`, backgroundColor: 'rgb(204 255 0 / 0.10)' }}
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
      <div className="fixed inset-x-0 bottom-0 z-[120]" role="region" aria-label="Audio player">
        <motion.div
          layout
          drag={!isMobile ? 'y' : false}
          dragElastic={0.1}
          dragConstraints={{ top: -90, bottom: 90 }}
          onDragEnd={(_, info) => {
            if (isMobile) return;
            if (info.offset.y < -24) setIsExpanded(true);
            if (info.offset.y > 24) setIsExpanded(false);
          }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeInOut' }}
          animate={{ height: isMobile ? 56 : isExpanded ? 112 : 56 }}
          className="relative overflow-hidden bg-ink/92 backdrop-blur-[24px]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-acid/90 via-acid/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-[2px] h-[3px] opacity-40 warning-stripes" />
          <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 sm:px-4">
            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              aria-label="Open player controls"
              className={`relative shrink-0 overflow-hidden rounded-[2px] border border-white/10 bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid ${isExpanded && !isMobile ? 'h-14 w-14' : 'h-10 w-10'}`}
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={title}
                  className={`h-full w-full object-cover transition-all duration-300 ${!isMobile && isExpanded ? 'scale-[1.02]' : ''}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music className="h-4 w-4 text-acid" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/podcast')}
              aria-label="Open podcast page"
              className="min-w-0 flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            >
              <div className="truncate font-display text-[12px] font-semibold uppercase tracking-tight text-white/95">{title}</div>
              <div className="truncate font-sans text-[10px] uppercase tracking-[0.2em] text-smoke">{artist}</div>
              <div className="mt-1">{renderScrubber(isMobile ? 'h-3' : 'h-[18px]', waveformWrapRef, waveformCanvasRef)}</div>
            </button>

            {!isMobile && (
              <div className="w-14 shrink-0 text-right font-sans text-[10px] uppercase tracking-[0.2em] text-smoke">
                {formatTime(duration)}
              </div>
            )}

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-acid text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              style={{
                boxShadow: isPlaying
                  ? '0 0 0 1px rgb(204 255 0 / 0.3), 0 0 32px rgb(204 255 0 / 0.35)'
                  : '0 0 0 1px rgb(204 255 0 / 0.3), 0 0 22px rgb(204 255 0 / 0.25)',
                animation: isPlaying && !shouldReduceMotion ? 'playerPulse 2.4s ease-in-out infinite' : undefined,
              }}
            >
              <motion.span
                animate={{ rotate: isPlaying ? 0 : -90 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                className="inline-flex"
              >
                {isPlaying ? <Pause size={19} /> : <Play size={19} className="ml-0.5" />}
              </motion.span>
            </button>

            {!isMobile && (
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-label={isExpanded ? 'Collapse player' : 'Expand player'}
                className={`${baseButtonClass} ${isExpanded ? 'text-bone' : ''}`}
              >
                <ChevronUp size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {!isMobile && (
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="expanded-controls"
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                  className="mx-auto mt-1 grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 pb-2"
                >
                  <div className="flex items-center">
                    <button type="button" onClick={playPrevious} aria-label="Previous track" className={baseButtonClass}>
                      <SkipBack size={18} />
                    </button>
                    <button type="button" onClick={playNext} aria-label="Next track" className={baseButtonClass}>
                      <SkipForward size={18} />
                    </button>
                  </div>

                  <div className="min-w-0">
                    {renderScrubber('h-11', desktopWaveformWrapRef, desktopWaveformCanvasRef)}
                    <div className="mt-1 flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.2em] text-smoke">
                      <span>{formatTime(shownTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/podcast')}
                      aria-label="Open podcast page"
                      className="border border-acid px-2 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.2em] text-acid transition-colors hover:bg-acid hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                    >
                      PODCAST ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className={baseButtonClass}
                      aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <div className="relative h-2 w-28 overflow-hidden bg-white/15">
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
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isMobile && mobileSheetOpen && (
          <motion.div
            className="fixed inset-0 z-[130] bg-black/60"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            onClick={() => setMobileSheetOpen(false)}
          >
            <motion.div
              initial={shouldReduceMotion ? { y: 0 } : { y: 260 }}
              animate={{ y: 0 }}
              exit={shouldReduceMotion ? { y: 0 } : { y: 260 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute inset-x-0 bottom-0 border-t border-acid/40 bg-ink p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
              role="dialog"
              aria-label="Expanded player controls"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-acid">Now Playing</div>
                <button
                  type="button"
                  onClick={() => setMobileSheetOpen(false)}
                  aria-label="Close expanded controls"
                  className={baseButtonClass}
                >
                  <ChevronUp size={18} className="rotate-180" />
                </button>
              </div>
              <div className="mb-3 flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[2px] border border-white/10 bg-black">
                  {coverUrl ? (
                    <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Music className="h-5 w-5 text-acid" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-display text-[12px] font-semibold uppercase tracking-tight text-white/95">{title}</div>
                  <div className="truncate font-sans text-[10px] uppercase tracking-[0.2em] text-smoke">{artist}</div>
                </div>
              </div>
              <div className="mb-2">{renderScrubber('h-11', desktopWaveformWrapRef, desktopWaveformCanvasRef)}</div>
              <div className="mb-3 flex items-center justify-between font-sans text-[10px] uppercase tracking-[0.2em] text-smoke">
                <span>{formatTime(shownTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button type="button" onClick={playPrevious} aria-label="Previous track" className={baseButtonClass}>
                    <SkipBack size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-acid text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                  >
                    {isPlaying ? <Pause size={19} /> : <Play size={19} className="ml-0.5" />}
                  </button>
                  <button type="button" onClick={playNext} aria-label="Next track" className={baseButtonClass}>
                    <SkipForward size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileSheetOpen(false);
                    navigate('/podcast');
                  }}
                  className="border border-acid px-2 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.2em] text-acid transition-colors hover:bg-acid hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                  aria-label="Open podcast page"
                >
                  PODCAST ↗
                </button>
              </div>
            </motion.div>
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
