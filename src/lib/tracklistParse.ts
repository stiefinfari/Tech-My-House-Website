export type TracklistItem = {
  index: number;
  artist: string;
  title: string;
  label: string | null;
  timeText: string | null;
  timeSec: number | null;
};

export type ParsedTracklist = {
  sourceUrl: string;
  items: TracklistItem[];
};

function parseTimeToSec(t: string): number | null {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function parse1001TracklistHtml(html: string, sourceUrl: string): ParsedTracklist {
  const items: TracklistItem[] = [];

  const rowRegex = /<(\w+)[^>]*class="[^"]*\b(?:tlToogle|tlToggle)\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;

  let m: RegExpExecArray | null;
  while ((m = rowRegex.exec(html))) {
    const block = m[2] ?? '';
    const indexMatch = block.match(/itemprop="position"[^>]*content="(\d+)"/i);
    const index = indexMatch ? Number(indexMatch[1]) : Number.NaN;

    const valueMatch = block.match(
      /<span[^>]*class="[^"]*\btrackValue\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    const value = valueMatch ? stripTags(valueMatch[1]).trim() : '';

    const labelMatch = block.match(
      /<span[^>]*class="[^"]*\btracklabel\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    const label = labelMatch ? stripTags(labelMatch[1]).trim() : null;

    const timeMatch = block.match(
      /<span[^>]*class="[^"]*\btracktime\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i
    );
    const timeText = timeMatch ? stripTags(timeMatch[1]).trim() : null;

    const split = value.split(' - ');
    const artist = (split[0] ?? '').trim();
    const title = (split.slice(1).join(' - ') ?? '').trim();

    if (!artist || !title || !Number.isFinite(index)) continue;

    items.push({
      index,
      artist,
      title,
      label: label || null,
      timeText: timeText || null,
      timeSec: timeText ? parseTimeToSec(timeText) : null,
    });
  }

  return { sourceUrl, items };
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}
