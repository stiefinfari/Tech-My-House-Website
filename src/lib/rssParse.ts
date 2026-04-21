export type RadioEpisode = {
  episodeCode: string | null;
  title: string;
  publishedAt: string | null;
  durationSec: number | null;
  soundcloudUrl: string | null;
  audioUrl: string | null;
  coverUrl: string | null;
  summary: string | null;
  tracklistUrl: string | null;
};

export function extractEpisodeCode(input: string): string | null {
  const m = input.match(/\bEP\s?(\d{1,4})\b/i);
  if (!m) return null;
  return `ep${String(Number(m[1]))}`;
}

export function extractTracklistUrl(text: string): string | null {
  if (!text) return null;
  const m =
    text.match(/https?:\/\/(?:www\.)?1001\.tl\/[^\s"'<>]+/i) ??
    text.match(/https?:\/\/(?:www\.)?1001tracklists\.com\/[^\s"'<>]+/i);
  return m ? m[0] : null;
}

export function parseDurationToSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;
  if (/^\d+$/.test(raw)) {
    const sec = Number(raw);
    return Number.isFinite(sec) ? sec : null;
  }
  const parts = raw.split(':').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n))) return null;
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  return nums[0] * 3600 + nums[1] * 60 + nums[2];
}
