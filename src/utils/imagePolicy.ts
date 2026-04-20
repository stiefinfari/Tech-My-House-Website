export function isUsableImageUrl(value: string): boolean {
  if (!value.trim()) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function toSafeCoverUrl(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (trimmed.startsWith('/api/image?url=')) return trimmed;
  if (!isUsableImageUrl(trimmed)) return fallback;
  
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.endsWith('sndcdn.com')) {
      return `/api/image?url=${encodeURIComponent(trimmed)}`;
    }
    return trimmed;
  } catch {
    return fallback;
  }
}
