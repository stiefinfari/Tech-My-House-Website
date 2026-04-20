export interface TrackEntry {
  startSec: number;
  artist: string;
  title: string;
  label?: string;
}

export interface TracklistData {
  audioUrlMatch: string; // Used to match with the episode audioUrl
  sourceUrl?: string; // 1001Tracklists URL
  tracks: TrackEntry[];
}

export const tracklists: TracklistData[] = [
  {
    audioUrlMatch: 'ep133', // Placeholder, will match via string inclusion
    sourceUrl: 'https://www.1001tracklists.com/tracklist/placeholder/index.html',
    tracks: [
      { startSec: 0, artist: 'Tech My House', title: 'Intro' },
      { startSec: 120, artist: 'Artist 1', title: 'Track 1' },
      { startSec: 360, artist: 'Artist 2', title: 'Track 2' }
    ]
  }
];

export function getTracklistForEpisode(audioUrl?: string): TracklistData | undefined {
  if (!audioUrl) return undefined;
  return tracklists.find(t => audioUrl.toLowerCase().includes(t.audioUrlMatch.toLowerCase()));
}

export function getCurrentTrackIndex(tracks: TrackEntry[], currentSec: number): number {
  if (!tracks || tracks.length === 0) return -1;
  // Find the last track whose startSec is <= currentSec
  let currentIdx = -1;
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].startSec <= currentSec) {
      currentIdx = i;
    } else {
      break;
    }
  }
  return currentIdx;
}
