export type TracklistItem = {
  index: number;
  artist: string;
  title: string;
  label: string | null;
  timeText: string | null;
  timeSec: number | null;
};

export type TracklistResponse = {
  tracklist?: {
    sourceUrl: string;
    items: TracklistItem[];
  };
};

export function parseTracklistFromSummary(summary: string): TracklistItem[] {
  const text = summary.replace(/\s+/g, ' ').trim();
  if (!text) return [];

  const items: TracklistItem[] = [];
  const re = /\b(\d{1,3})\.\s+([\s\S]*?)(?=\s+\d{1,3}\.\s+|$)/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const index = Number(m[1]);
    const raw = (m[2] ?? '').trim();
    if (!Number.isFinite(index) || !raw) continue;

    const labelMatch = raw.match(/\[([^\]]+)\]\s*$/);
    const label = labelMatch ? labelMatch[1].trim() : null;
    const rawNoLabel = labelMatch && typeof labelMatch.index === 'number' ? raw.slice(0, labelMatch.index).trim() : raw;

    const sep = rawNoLabel.indexOf(' - ');
    if (sep <= 0) continue;
    const artist = rawNoLabel.slice(0, sep).trim();
    const title = rawNoLabel.slice(sep + 3).trim();
    if (!artist || !title) continue;

    items.push({
      index,
      artist,
      title,
      label,
      timeText: null,
      timeSec: null,
    });
  }

  return items.sort((a, b) => a.index - b.index);
}
