import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Music, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import useCoverTone from '../hooks/useCoverTone';
import RadioTheatre from './radio/RadioTheatre';
import RadioWaveform from './radio/RadioWaveform';
import { getTracklistForEpisode, getCurrentTrackIndex } from '../data/tracklists';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, setIsPlaying, playNext, playPrevious } = usePlayer();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotionPreference();
  const track = currentTrack;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isDismissed, setIsDismissed] = useState(false);
  const [isTheatreOpen, setIsTheatreOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  const tone = useCoverTone(track?.coverUrl);
  const accentRgb = tone?.rgb ?? '204 255 0';
  const onAccentColor = tone?.onTone === 'light' ? '#fff' : '#0A0A0A';

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

  const handleAudioEnded = () => {
    playNext();
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

  const tracklistData = getTracklistForEpisode({ title: track?.title, audioUrl: track?.url });
  const currentTrackIndex = tracklistData ? getCurrentTrackIndex(tracklistData.tracks, progress) : -1;

  if (!track) return null;

  const baseButtonClass =
    'inline-flex items-center justify-center rounded-full p-2 text-smoke transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid';

  return (
    <>
      {!isDismissed && (
        <div
          className="fixed bottom-4 left-1/2 z-[120] w-[96vw] max-w-[900px] -translate-x-1/2 transition-all duration-700 ease-out md:bottom-8"
          role="region"
          aria-label="Audio player"
        >
          <div
            className="relative flex items-center gap-3 rounded-full border bg-ink/80 p-2 pr-4 shadow-2xl backdrop-blur-2xl transition-shadow duration-500 ease-out sm:gap-4 md:p-3 md:pr-6"
            style={{
              borderColor: `rgb(${accentRgb} / 0.18)`,
              boxShadow: isPlaying
                ? `0 12px 44px -10px rgb(${accentRgb} / 0.22), inset 0 0 26px -12px rgb(${accentRgb} / 0.12)`
                : `0 10px 30px -10px rgba(0,0,0,0.8), inset 0 0 12px -6px rgb(${accentRgb} / 0.06)`,
            }}
          >
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-2xl"
              initial={false}
              animate={
                !shouldReduceMotion && isPlaying
                  ? { opacity: [0.32, 0.52, 0.32], scale: [1, 1.02, 1] }
                  : { opacity: isPlaying ? 0.28 : 0.18, scale: 1 }
              }
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 3.2, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
              style={{
                background: `radial-gradient(70% 160% at 18% 50%, rgb(${accentRgb} / 0.7) 0%, transparent 70%)`,
              }}
            />

            <button
              type="button"
              onClick={() => navigate('/podcast')}
              aria-label="Open podcast page"
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid md:h-14 md:w-14"
            >
              {coverUrl ? (
                <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Music className="h-5 w-5 text-acid" />
                </div>
              )}
            </button>

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <div className="mb-1 flex items-end justify-between md:mb-2">
                <button
                  type="button"
                  onClick={() => navigate('/podcast')}
                  aria-label="Open podcast page"
                  className="min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                >
                  <div className="truncate font-display text-[12px] font-extrabold uppercase tracking-[-0.01em] text-white md:text-[14px]">
                    {title}
                  </div>
                  <div className="truncate font-mono text-[9px] uppercase tracking-[0.26em] text-smoke md:text-[10px]">
                    {artist}
                  </div>
                </button>
                <div className="hidden shrink-0 pl-4 font-mono text-[10px] uppercase tracking-[0.2em] text-smoke sm:block">
                  {formatTime(shownTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="group relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 md:h-2">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-colors"
                  style={{
                    width: `${seekPercent}%`,
                    backgroundColor: `rgb(${accentRgb})`,
                  }}
                />
                {isSeeking && seekPreview != null && (
                  <div
                    className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded border bg-ink px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]"
                    style={{
                      borderColor: `rgb(${accentRgb} / 0.5)`,
                      color: `rgb(${accentRgb})`,
                      left: `${seekPercent}%`,
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
                  aria-label="Seek timeline"
                  aria-valuetext={formatAriaValueText(shownTime)}
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button type="button" onClick={playPrevious} aria-label="Previous track" className={`${baseButtonClass} hidden sm:inline-flex`}>
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
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: isPlaying ? 1.2 : 0.18, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }
                }
                className="inline-flex h-10 w-10 items-center justify-center rounded-full shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid md:h-12 md:w-12"
                style={{
                  backgroundColor: `rgb(${accentRgb})`,
                  color: onAccentColor,
                  boxShadow: isPlaying ? `0 0 0 2px rgb(${accentRgb} / 0.4)` : 'none',
                }}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </motion.button>

              <button type="button" onClick={playNext} aria-label="Next track" className={baseButtonClass}>
                <SkipForward size={18} />
              </button>

              <div className="hidden items-center sm:flex">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={baseButtonClass}
                  aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <div className="group relative h-1.5 w-16 overflow-hidden rounded-full bg-white/10 md:w-20">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-colors group-hover:brightness-110"
                    style={{
                      width: `${isMuted ? 0 : volume * 100}%`,
                      backgroundColor: `rgb(${accentRgb})`,
                    }}
                  />
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

              <div className="ml-1 flex items-center border-l border-white/10 pl-2 sm:ml-2 sm:pl-3">
                <button
                  type="button"
                  onClick={() => setIsTheatreOpen(true)}
                  aria-label="Open theatre mode"
                  className={baseButtonClass}
                >
                  <Maximize2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
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
          </div>
        </div>
      )}

      <RadioTheatre
        open={isTheatreOpen}
        title={title || 'Tech My House'}
        coverUrl={coverUrl}
        onClose={() => setIsTheatreOpen(false)}
      >
        <div className="space-y-6 flex flex-col h-full">
          <div>
            <h3 className="font-display text-[clamp(1.5rem,4vw,2.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white">
              {title || 'Select an episode'}
            </h3>
            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.26em] text-smoke">
              {isPlaying ? 'LIVE PLAYBACK' : 'PAUSED'}
            </div>
          </div>
          <RadioWaveform isActive={isPlaying} accentRgb={accentRgb} />
          
          {tracklistData && tracklistData.tracks.length > 0 && (
            <div className="mt-8 flex-1 overflow-y-auto pr-2 max-h-[40vh] border-t border-white/10 pt-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-smoke mb-4 flex justify-between">
                <span>Tracklist</span>
                {tracklistData.sourceUrl && (
                  <a href={tracklistData.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-acid hover:underline">
                    1001Tracklists ↗
                  </a>
                )}
              </div>
              <div className="space-y-2">
                {tracklistData.tracks.map((t, idx) => {
                  const isCurrent = idx === currentTrackIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => commitSeek(t.startSec)}
                      className={`w-full text-left flex items-start gap-3 p-2 rounded transition-colors ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className={`font-mono text-[10px] mt-0.5 ${isCurrent ? 'text-acid' : 'text-smoke'}`}>
                        {formatTime(t.startSec)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`truncate font-display text-[13px] font-extrabold uppercase ${isCurrent ? 'text-acid' : 'text-white'}`}>
                          {t.title}
                        </div>
                        <div className={`truncate font-mono text-[9px] uppercase tracking-widest ${isCurrent ? 'text-white/80' : 'text-smoke'}`}>
                          {t.artist} {t.label ? `[${t.label}]` : ''}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-6 mt-auto">
            <button
              type="button"
              onClick={() => setIsTheatreOpen(false)}
              className="rounded-full border border-acid/75 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-acid transition-colors hover:bg-acid hover:text-ink"
            >
              CLOSE THEATRE
            </button>
          </div>
        </div>
      </RadioTheatre>

      <audio
        ref={audioRef}
        src={track.url}
        preload="metadata"
        onEnded={handleAudioEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </>
  );
}
