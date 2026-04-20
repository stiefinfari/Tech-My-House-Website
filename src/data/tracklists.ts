export interface TrackEntry {
  startSec: number;
  artist: string;
  title: string;
  label?: string;
}

export interface TracklistData {
  episodeCode: string;
  sourceUrl?: string;
  tracks: TrackEntry[];
}

export const tracklists: TracklistData[] = [
  {
    episodeCode: 'EP133',
    sourceUrl: 'https://www.1001tracklists.com/tracklist/placeholder/index.html',
    tracks: [
      { startSec: 0, artist: 'Tech My House', title: 'Intro' },
      { startSec: 120, artist: 'Artist 1', title: 'Track 1' },
      { startSec: 360, artist: 'Artist 2', title: 'Track 2' }
    ]
  }
];

export type EpisodeTracklistRef = {
  title?: string;
  link?: string;
  audioUrl?: string;
};

const extractEpisodeCode = (value?: string): string | null => {
  if (!value) return null;
  const match = value.match(/\bEP\s*\.?\s*(\d{1,4})\b/i);
  if (!match?.[1]) return null;
  return `EP${match[1]}`;
};

export function getTracklistForEpisode(ref?: EpisodeTracklistRef): TracklistData | undefined {
  const code = extractEpisodeCode(ref?.title) ?? extractEpisodeCode(ref?.link) ?? extractEpisodeCode(ref?.audioUrl);
  if (code) {
    const direct = tracklists.find((t) => t.episodeCode.toUpperCase() === code.toUpperCase());
    if (direct) return direct;
  }

  const fallback = (ref?.audioUrl ?? '').toLowerCase();
  if (!fallback) return undefined;
  return tracklists.find((t) => fallback.includes(t.episodeCode.toLowerCase()));
}

export function getCurrentTrackIndex(tracks: TrackEntry[], currentSec: number): number {
  if (!tracks || tracks.length === 0) return -1;
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
