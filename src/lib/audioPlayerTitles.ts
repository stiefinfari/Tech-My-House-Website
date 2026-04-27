export type NowPlayingTrackTitle = {
  artist: string;
  title: string;
};

export function getDockTitles(input: {
  episodeTitle: string;
  nowPlayingTrack: NowPlayingTrackTitle | null;
}): { primary: string; secondary: string } {
  const episodeTitle = input.episodeTitle || '';
  const t = input.nowPlayingTrack;

  if (t) {
    return {
      primary: `${t.artist} — ${t.title}`,
      secondary: episodeTitle,
    };
  }

  return {
    primary: episodeTitle,
    secondary: 'Tech My House',
  };
}
