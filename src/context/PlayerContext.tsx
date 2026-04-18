import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Track {
  title: string;
  url: string;
  artist: string;
  coverUrl?: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  currentIndex: number;
  playTrack: (track: Track, newPlaylist?: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const isPlayableTrack = (track: Track | null | undefined) => Boolean(track?.url?.trim());

  const normalizePlaylist = (tracks: Track[]) => tracks.filter(isPlayableTrack);

  const findNextPlayableIndex = (startIndex: number, step: 1 | -1) => {
    const len = playlist.length;
    if (len === 0) return -1;

    const safeStart = startIndex >= -1 && startIndex < len ? startIndex : -1;
    for (let i = 1; i <= len; i++) {
      const idx = (safeStart + step * i + len) % len;
      if (isPlayableTrack(playlist[idx])) return idx;
    }
    return -1;
  };

  const playTrack = (track: Track, newPlaylist?: Track[]) => {
    const playableRequestedTrack = isPlayableTrack(track);

    // If it's the same track, just play it
    if (playableRequestedTrack && currentTrack?.url === track.url) {
      setIsPlaying(true);
      return;
    }
    
    if (newPlaylist) {
      const normalizedPlaylist = normalizePlaylist(newPlaylist);
      setPlaylist(normalizedPlaylist);

      if (normalizedPlaylist.length === 0) {
        setCurrentTrack(null);
        setCurrentIndex(-1);
        setIsPlaying(false);
        return;
      }

      const index = playableRequestedTrack
        ? normalizedPlaylist.findIndex((t) => t.url === track.url)
        : -1;
      const nextIndex = index !== -1 ? index : 0;
      setCurrentIndex(nextIndex);
      setCurrentTrack(index !== -1 ? track : normalizedPlaylist[nextIndex]);
      setIsPlaying(true);
      return;
    } else if (playlist.length > 0) {
      if (!playableRequestedTrack) return;
      const index = playlist.findIndex(t => t.url === track.url);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = findNextPlayableIndex(currentIndex, 1);
    if (nextIndex === -1) {
      setIsPlaying(false);
      return;
    }
    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    const prevIndex = findNextPlayableIndex(currentIndex, -1);
    if (prevIndex === -1) {
      setIsPlaying(false);
      return;
    }
    setCurrentIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <PlayerContext.Provider value={{ 
      currentTrack, 
      isPlaying, 
      playlist,
      currentIndex,
      playTrack, 
      togglePlay, 
      setIsPlaying,
      playNext,
      playPrevious
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
