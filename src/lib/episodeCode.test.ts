import { describe, expect, it } from 'vitest';
import { generateEpisodeCode } from './episodeCode';

describe('generateEpisodeCode', () => {
  it('is deterministic for the same input', () => {
    const a = generateEpisodeCode({
      title: 'Tech My House Radio Show EP. 999',
      audioUrl: 'https://example.com/audio.mp3',
      soundcloudUrl: 'https://soundcloud.com/techmyhouse/foo',
      publishedAt: '2026-01-01T00:00:00.000Z',
    });
    const b = generateEpisodeCode({
      title: 'Tech My House Radio Show EP. 999',
      audioUrl: 'https://example.com/audio.mp3',
      soundcloudUrl: 'https://soundcloud.com/techmyhouse/foo',
      publishedAt: '2026-01-01T00:00:00.000Z',
    });
    expect(a).toBe(b);
  });

  it('returns a url-safe code with ep prefix', () => {
    const code = generateEpisodeCode({
      title: 'X',
      audioUrl: 'https://example.com/a.mp3',
      soundcloudUrl: null,
      publishedAt: null,
    });
    expect(code).toMatch(/^ep[a-z0-9]+$/);
  });

  it('changes if audioUrl changes', () => {
    const a = generateEpisodeCode({ title: 'X', audioUrl: 'https://a', soundcloudUrl: null, publishedAt: null });
    const b = generateEpisodeCode({ title: 'X', audioUrl: 'https://b', soundcloudUrl: null, publishedAt: null });
    expect(a).not.toBe(b);
  });
});

