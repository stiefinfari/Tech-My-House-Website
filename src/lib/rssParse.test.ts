import { describe, expect, it } from 'vitest';
import { extractEpisodeCode, extractTracklistUrl } from './rssParse';

describe('extractEpisodeCode', () => {
  it('normalizza EP133', () => {
    expect(extractEpisodeCode('TMH RADIO SHOW | EP133 :: PHARI')).toBe('ep133');
  });

  it('supporta EP 12', () => {
    expect(extractEpisodeCode('EP 12')).toBe('ep12');
  });

  it('ritorna null se non presente', () => {
    expect(extractEpisodeCode('no code')).toBeNull();
  });
});

describe('extractTracklistUrl', () => {
  it('estrae 1001.tl', () => {
    expect(extractTracklistUrl('Tracklist: https://1001.tl/spu8cv')).toBe('https://1001.tl/spu8cv');
  });

  it('estrae 1001tracklists.com', () => {
    expect(extractTracklistUrl('x https://www.1001tracklists.com/tracklist/abc y')).toBe(
      'https://www.1001tracklists.com/tracklist/abc'
    );
  });
});
