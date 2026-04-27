export const SEEK_EVENT = 'tmh:seek';

export type SeekDetail = {
  timeSec: number;
};

function getDefaultTarget(): EventTarget | null {
  if (typeof window === 'undefined') return null;
  return window;
}

export function dispatchSeek(timeSec: number, target?: EventTarget): void {
  const t = target ?? getDefaultTarget();
  if (!t) return;
  t.dispatchEvent(new CustomEvent<SeekDetail>(SEEK_EVENT, { detail: { timeSec } }));
}

export function addSeekListener(handler: (timeSec: number) => void, target?: EventTarget): () => void {
  const t = target ?? getDefaultTarget();
  if (!t) return () => undefined;

  const listener = (e: Event) => {
    const ce = e as CustomEvent<unknown>;
    const detail = (ce.detail ?? {}) as Partial<SeekDetail>;
    const timeSec = detail.timeSec;
    if (typeof timeSec !== 'number' || !Number.isFinite(timeSec)) return;
    handler(timeSec);
  };

  t.addEventListener(SEEK_EVENT, listener);
  return () => t.removeEventListener(SEEK_EVENT, listener);
}
