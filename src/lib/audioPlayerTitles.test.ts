import { describe, expect, it } from 'vitest';
import { getDockTitles } from './audioPlayerTitles';

describe('getDockTitles', () => {
  it('uses current track as primary when nowPlayingTrack exists', () => {
    const titles = getDockTitles({
      episodeTitle: 'EP 42',
      nowPlayingTrack: { artist: 'Daft Punk', title: 'Aerodynamic' },
    });
    expect(titles.primary).toBe('Daft Punk — Aerodynamic');
    expect(titles.secondary).toBe('EP 42');
  });

  it('uses episode title + Tech My House when no tracklist/current track', () => {
    const titles = getDockTitles({
      episodeTitle: 'EP 42',
      nowPlayingTrack: null,
    });
    expect(titles.primary).toBe('EP 42');
    expect(titles.secondary).toBe('Tech My House');
  });
});
