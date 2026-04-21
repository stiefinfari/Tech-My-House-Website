import { describe, expect, it } from 'vitest';
import { matchEpisode } from './radioEpisodeMatch';
import type { RadioEpisode } from './rssParse';

describe('matchEpisode', () => {
  it('matches by audioUrl', () => {
    const episodes: RadioEpisode[] = [
      {
        episodeCode: 'ep1',
        title: 'EP1',
        publishedAt: null,
        durationSec: null,
        soundcloudUrl: null,
        audioUrl: 'a.mp3',
        coverUrl: null,
        summary: null,
        tracklistUrl: null,
      },
      {
        episodeCode: 'ep2',
        title: 'EP2',
        publishedAt: null,
        durationSec: null,
        soundcloudUrl: null,
        audioUrl: 'b.mp3',
        coverUrl: null,
        summary: null,
        tracklistUrl: null,
      },
    ];
    expect(matchEpisode(episodes, 'b.mp3', undefined)?.title).toBe('EP2');
  });

  it('matches by title case-insensitively when audioUrl is missing', () => {
    const episodes: RadioEpisode[] = [
      {
        episodeCode: 'ep10',
        title: 'Radio Show EP 10',
        publishedAt: null,
        durationSec: null,
        soundcloudUrl: null,
        audioUrl: 'x.mp3',
        coverUrl: null,
        summary: null,
        tracklistUrl: null,
      },
    ];
    expect(matchEpisode(episodes, undefined, 'radio show ep 10')?.audioUrl).toBe('x.mp3');
  });

  it('returns null when no match', () => {
    const episodes: RadioEpisode[] = [
      {
        episodeCode: 'ep1',
        title: 'EP1',
        publishedAt: null,
        durationSec: null,
        soundcloudUrl: null,
        audioUrl: 'a.mp3',
        coverUrl: null,
        summary: null,
        tracklistUrl: null,
      },
    ];
    expect(matchEpisode(episodes, 'c.mp3', 'nope')).toBeNull();
  });
});
