import type { RadioEpisode } from './rssParse';

const normalize = (value: string) => value.trim().toLowerCase();

export function matchEpisode(episodes: RadioEpisode[], audioUrl?: string, title?: string): RadioEpisode | null {
  const audio = audioUrl?.trim();
  const t = title ? normalize(title) : null;
  return episodes.find((ep) => (audio && ep.audioUrl === audio) || (t && normalize(ep.title) === t)) ?? null;
}

