import { expect, it } from 'vitest';
import { buildEpisodeIndex, computeTermCounts, matchesQuery, type EpisodeIndexCache } from './radioSearch';

it('matches empty query', () => {
  const cache: EpisodeIndexCache = new Map();
  const idx = buildEpisodeIndex({ episodeCode: 'ep133', title: 'EP133 :: PHARI', summary: null }, cache);
  expect(matchesQuery(idx, '')).toBe(true);
});

it('matches multi-term AND', () => {
  const cache: EpisodeIndexCache = new Map();
  const idx = buildEpisodeIndex(
    { episodeCode: 'ep133', title: 'TMH RADIO SHOW | EP133 :: PHARI', summary: 'Tracklist: Drumcode, Claptone' },
    cache
  );
  expect(matchesQuery(idx, 'phari drumcode')).toBe(true);
  expect(matchesQuery(idx, 'phari notpresent')).toBe(false);
});

it('computes approximate counts', () => {
  const cache: EpisodeIndexCache = new Map();
  const idx = buildEpisodeIndex({ episodeCode: 'ep133', title: 'PHARI', summary: 'drumcode drumcode claptone' }, cache);
  const counts = computeTermCounts(idx, 'drumcode claptone');
  expect(counts.find((c) => c.term === 'drumcode')?.count).toBeGreaterThanOrEqual(2);
  expect(counts.find((c) => c.term === 'claptone')?.count).toBeGreaterThanOrEqual(1);
});

it('memoizes by cache key', () => {
  const cache: EpisodeIndexCache = new Map();
  const ep = { episodeCode: 'ep133', title: 'PHARI', summary: 'drumcode' };
  const a = buildEpisodeIndex(ep, cache);
  const b = buildEpisodeIndex(ep, cache);
  expect(a).toBe(b);
});
