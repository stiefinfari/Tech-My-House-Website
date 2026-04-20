import { useMemo, useState } from 'react';

const STORAGE_KEY = 'tmh-radio-bookmarks-v1';

const readInitialBookmarks = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
};

export function useEpisodeBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(readInitialBookmarks);
  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  const toggle = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return {
    bookmarks,
    toggle,
    isBookmarked: (id: string) => bookmarkSet.has(id),
  };
}
