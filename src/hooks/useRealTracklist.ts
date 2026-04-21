import { useEffect, useState } from 'react';
import type { RadioEpisode } from '../lib/rssParse';
import { type TracklistResponse, parseTracklistFromSummary } from '../lib/tracklistHelper';
import type { TracklistData, TrackEntry } from '../data/tracklists';
import { matchEpisode } from '../lib/radioEpisodeMatch';

type RadioFeedResponse = {
  episodes?: RadioEpisode[];
};

export type RealTracklistResult = (TracklistData & {
  episodeTitle?: string;
  episodeCoverUrl?: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
}) | null;

export function useRealTracklist(audioUrl?: string, title?: string): RealTracklistResult {
  const [tracklistData, setTracklistData] = useState<RealTracklistResult>(null);

  useEffect(() => {
    if (!audioUrl && !title) {
      setTracklistData(null);
      return;
    }

    const controller = new AbortController();
    setTracklistData((prev) => {
      if (!prev) return { episodeCode: 'UNKNOWN', tracks: [], status: 'loading' };
      return { ...prev, status: 'loading' };
    });

    const fetchTracklist = async () => {
      try {
        const feedRes = await fetch('/api/radio-feed', { signal: controller.signal });
        const feedData = (await feedRes.json()) as RadioFeedResponse;
        const episodes = feedData.episodes || [];
        
        const episode = matchEpisode(episodes, audioUrl, title);

        if (!episode) {
          setTracklistData(null);
          return;
        }

        const episodeCode = episode.episodeCode || 'UNKNOWN';
        const episodeTitle = episode.title;
        const episodeCoverUrl = episode.coverUrl ?? null;
        let tracks: TrackEntry[] = [];
        let sourceUrl: string | undefined;

        if (episode.tracklistUrl) {
          try {
            const tlRes = await fetch(`/api/tracklist?url=${encodeURIComponent(episode.tracklistUrl)}`, {
              signal: controller.signal,
            });
            const tlData = (await tlRes.json()) as TracklistResponse;
            if (tlData.tracklist?.items) {
              sourceUrl = tlData.tracklist.sourceUrl;
              tracks = tlData.tracklist.items
                .filter((t) => typeof t.timeSec === 'number' && Number.isFinite(t.timeSec))
                .map((t) => ({
                  startSec: t.timeSec as number,
                  artist: t.artist,
                  title: t.title,
                  label: t.label || undefined,
                }));
            }
          } catch {
            tracks = [];
          }
        }

        if (tracks.length === 0 && episode.summary) {
          const fallbackItems = parseTracklistFromSummary(episode.summary);
          tracks = fallbackItems
            .filter((t) => typeof t.timeSec === 'number' && Number.isFinite(t.timeSec))
            .map((t) => ({
              startSec: t.timeSec as number,
              artist: t.artist,
              title: t.title,
              label: t.label || undefined,
            }));
        }

        setTracklistData({
          episodeCode,
          sourceUrl,
          tracks,
          episodeTitle,
          episodeCoverUrl,
          status: 'ready',
        });
      } catch {
        if (controller.signal.aborted) return;
        setTracklistData({ episodeCode: 'UNKNOWN', tracks: [], status: 'error' });
      }
    };

    fetchTracklist();
    return () => controller.abort();
  }, [audioUrl, title]);

  return tracklistData;
}
