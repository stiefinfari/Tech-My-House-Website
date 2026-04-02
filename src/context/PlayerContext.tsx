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

  const playTrack = (track: Track, newPlaylist?: Track[]) => {
    // If it's the same track, just play it
    if (currentTrack?.url === track.url) {
      setIsPlaying(true);
      return;
    }
    
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      const index = newPlaylist.findIndex(t => t.url === track.url);
      setCurrentIndex(index !== -1 ? index : 0);
    } else if (playlist.length > 0) {
      const index = playlist.findIndex(t => t.url === track.url);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (playlist.length === 0 || currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const playPrevious = () => {
    if (playlist.length === 0 || currentIndex === -1) return;
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
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
