export type LatestEpisodeFingerprint = {
  episodeCode: string | null;
  audioUrl: string | null;
};

export function getLatestId(latest: LatestEpisodeFingerprint | null): string | null {
  if (!latest) return null;
  const code = latest.episodeCode?.trim();
  if (code) return code;
  const audio = latest.audioUrl?.trim();
  return audio ? audio : null;
}

export function hasNewEpisode(input: {
  local: LatestEpisodeFingerprint | null;
  remote: LatestEpisodeFingerprint | null;
  dismissedLatestId: string | null;
}): boolean {
  const remoteId = getLatestId(input.remote);
  if (!remoteId) return false;
  if (input.dismissedLatestId && input.dismissedLatestId === remoteId) return false;
  const localId = getLatestId(input.local);
  if (!localId) return false;
  return remoteId !== localId;
}

