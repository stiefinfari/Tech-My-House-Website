import { useEffect, useRef, useState } from 'react';
import { getLatestId, hasNewEpisode, type LatestEpisodeFingerprint } from '../lib/radioFeedUpdate';

type Options = {
  intervalMs: number;
  enabled: boolean;
  initialLatest: LatestEpisodeFingerprint | null;
};

export function useRadioFeedPolling({ intervalMs, enabled, initialLatest }: Options) {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [remoteLatestId, setRemoteLatestId] = useState<string | null>(null);
  const dismissedRef = useRef<string | null>(null);
  const localRef = useRef<LatestEpisodeFingerprint | null>(initialLatest);

  useEffect(() => {
    localRef.current = initialLatest;
    dismissedRef.current = null;
    setHasUpdate(false);
    setRemoteLatestId(null);
  }, [initialLatest]);

  useEffect(() => {
    if (!enabled) return;
    let timer: number | null = null;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      if (document.visibilityState !== 'visible') {
        schedule();
        return;
      }

      try {
        const res = await fetch('/api/radio-feed?limit=1');
        const data = (await res.json()) as { episodes?: Array<Record<string, unknown>> };
        const ep = Array.isArray(data.episodes) ? data.episodes[0] : null;
        const remote: LatestEpisodeFingerprint | null = ep
          ? {
              episodeCode: typeof ep.episodeCode === 'string' ? ep.episodeCode : null,
              audioUrl: typeof ep.audioUrl === 'string' ? ep.audioUrl : null,
            }
          : null;

        const remoteId = getLatestId(remote);
        if (
          hasNewEpisode({
            local: localRef.current,
            remote,
            dismissedLatestId: dismissedRef.current,
          })
        ) {
          setRemoteLatestId(remoteId);
          setHasUpdate(true);
        }
      } catch (err) {
        void err;
      } finally {
        schedule();
      }
    };

    const schedule = () => {
      if (stopped) return;
      timer = window.setTimeout(tick, intervalMs);
    };

    schedule();
    return () => {
      stopped = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [enabled, intervalMs]);

  const dismiss = () => {
    dismissedRef.current = remoteLatestId;
    setHasUpdate(false);
  };

  const clear = () => {
    setHasUpdate(false);
    setRemoteLatestId(null);
  };

  return { hasUpdate, remoteLatestId, dismiss, clear };
}
