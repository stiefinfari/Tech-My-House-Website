import { expect, it } from 'vitest';
import { getLatestId, hasNewEpisode } from './radioFeedUpdate';

it('prefers episodeCode as latest id', () => {
  expect(getLatestId({ episodeCode: 'ep133', audioUrl: 'u1' })).toBe('ep133');
});

it('falls back to audioUrl when episodeCode missing', () => {
  expect(getLatestId({ episodeCode: null, audioUrl: 'u1' })).toBe('u1');
});

it('detects new episode when latest id changes', () => {
  expect(
    hasNewEpisode({
      local: { episodeCode: 'ep1', audioUrl: 'u1' },
      remote: { episodeCode: 'ep2', audioUrl: 'u2' },
      dismissedLatestId: null,
    })
  ).toBe(true);
});

it('does not trigger when dismissed id matches remote latest', () => {
  expect(
    hasNewEpisode({
      local: { episodeCode: 'ep1', audioUrl: 'u1' },
      remote: { episodeCode: 'ep2', audioUrl: 'u2' },
      dismissedLatestId: 'ep2',
    })
  ).toBe(false);
});

