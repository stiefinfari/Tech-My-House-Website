type EpisodeCodeInput = {
  title?: string | null;
  audioUrl?: string | null;
  soundcloudUrl?: string | null;
  publishedAt?: string | null;
};

const djb2 = (value: string) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = (hash * 33) ^ value.charCodeAt(i);
  return hash >>> 0;
};

export function generateEpisodeCode(input: EpisodeCodeInput): string {
  const key = [
    (input.audioUrl ?? '').trim(),
    (input.soundcloudUrl ?? '').trim(),
    (input.publishedAt ?? '').trim(),
    (input.title ?? '').trim(),
  ].join('|');

  const h = djb2(key).toString(36);
  return `ep${h}`;
}

