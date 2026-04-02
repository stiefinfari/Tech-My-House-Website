import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Play, Pause, Music, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function AudioPlayer() {
  const { currentTrack, isPlaying, togglePlay, setIsPlaying, playNext, playPrevious } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Generate deterministic waveform heights based on track title
  const waveformHeights = useMemo(() => {
    if (!currentTrack) return [];
    const seed = currentTrack.title;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    const heights = [];
    for (let i = 0; i < 60; i++) {
      heights.push(20 + random(hash + i) * 80); // 20% to 100% height
    }
    return heights;
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.error("Playback failed", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setProgress(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-safe transition-all duration-500 translate-y-0">
      
      {/* Waveform Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-8 -translate-y-1/2 group cursor-pointer flex items-end justify-between px-2 gap-[1px]">
        {waveformHeights.map((height, i) => {
          const barPercent = (i / waveformHeights.length) * 100;
          const isPlayed = barPercent <= progressPercent;
          return (
            <div 
              key={i}
              className={`flex-1 rounded-full transition-all duration-150 ${isPlayed ? 'bg-neon shadow-[0_0_8px_#CCFF00]' : 'bg-white/20'}`}
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
          );
        })}
        <input 
          type="range" 
          min={0} 
          max={duration || 100} 
          value={progress} 
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4 md:gap-8 mt-2">
        
        {/* Track Info */}
        <div className="flex items-center gap-4 w-1/3 min-w-0">
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/10">
            {currentTrack.coverUrl ? (
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title} 
                className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`} 
              />
            ) : (
              <div className={`w-full h-full bg-zinc-900 flex items-center justify-center ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
                <Music className="text-neon w-6 h-6" />
              </div>
            )}
            <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-dark rounded-full border border-white/20" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <h4 className="font-display font-extrabold text-white truncate text-sm md:text-base leading-tight">
              {currentTrack.title}
            </h4>
            <p className="font-sans text-[10px] md:text-xs text-neon truncate uppercase tracking-widest mt-1 font-bold">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={playPrevious}
              className="text-white/50 hover:text-white transition-colors"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-white text-dark flex items-center justify-center hover:scale-105 hover:bg-neon hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all"
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </button>
            
            <button 
              onClick={playNext}
              className="text-white/50 hover:text-white transition-colors"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2 font-sans text-[10px] text-white/50 tracking-widest font-bold w-full justify-center">
            <span>{formatTime(progress)}</span>
            <span className="text-white/20">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
          <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div className="relative w-24 h-1 bg-white/10 rounded-full group cursor-pointer flex items-center">
            <div className="h-full bg-white/80 rounded-full group-hover:bg-neon transition-colors" style={{ width: `${isMuted ? 0 : (volume * 100)}%` }} />
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
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onEnded={playNext}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      </div>
    </div>
  );
}
