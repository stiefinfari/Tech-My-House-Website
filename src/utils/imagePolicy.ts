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
  if (!isUsableImageUrl(value)) return fallback;
  
  try {
    const parsed = new URL(value);
    // If it's a soundcloud artwork, route it through our proxy
    if (parsed.hostname.endsWith('sndcdn.com')) {
      return `/api/image?url=${encodeURIComponent(value)}`;
    }
    return value;
  } catch {
    return fallback;
  }
}
