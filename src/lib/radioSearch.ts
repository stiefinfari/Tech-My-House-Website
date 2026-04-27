import { parseTracklistFromSummary } from './tracklistHelper';

export type SearchableEpisode = {
  episodeCode: string;
  title: string;
  summary: string | null;
};

export type EpisodeSearchIndex = {
  searchableText: string;
};

export type EpisodeIndexCache = Map<string, EpisodeSearchIndex>;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const splitTerms = (query: string) => normalize(query).split(' ').filter(Boolean);

export function buildEpisodeIndex(ep: SearchableEpisode, cache: EpisodeIndexCache): EpisodeSearchIndex {
  const cacheKey = `${ep.episodeCode}|${ep.summary ?? ''}|${ep.title}`;
  const existing = cache.get(cacheKey);
  if (existing) return existing;

  const parts: string[] = [];
  parts.push(ep.title);
  parts.push(ep.episodeCode);
  if (ep.summary) parts.push(ep.summary);

  if (ep.summary) {
    const items = parseTracklistFromSummary(ep.summary);
    if (items.length) {
      const trackText = items
        .map((it) => [it.artist, it.title, it.label].filter(Boolean).join(' - '))
        .join(' | ');
      if (trackText) parts.push(trackText);
    }
  }

  const index: EpisodeSearchIndex = {
    searchableText: normalize(parts.join(' | ')),
  };
  cache.set(cacheKey, index);
  return index;
}

export function matchesQuery(index: EpisodeSearchIndex, query: string): boolean {
  const terms = splitTerms(query);
  if (!terms.length) return true;
  return terms.every((t) => index.searchableText.includes(t));
}

export function computeTermCounts(
  index: EpisodeSearchIndex,
  query: string
): Array<{ term: string; count: number }> {
  const terms = splitTerms(query);
  return terms.map((term) => {
    if (!term) return { term, count: 0 };
    let count = 0;
    let pos = 0;
    while (true) {
      const next = index.searchableText.indexOf(term, pos);
      if (next === -1) break;
      count++;
      pos = next + term.length;
    }
    return { term, count };
  });
}

