import { expect, it } from 'vitest';
import { parse1001TracklistHtml } from './tracklistParse';

it('estrae righe tracklist da HTML', () => {
  const html = `
  <div class="tlToogle">
    <meta itemprop="position" content="1"/>
    <span class="trackValue">MAKINN - Normal Life</span>
    <span class="tracklabel">KOOKOO Records</span>
    <span class="tracktime">00:12</span>
  </div>`

  const out = parse1001TracklistHtml(html, 'https://www.1001tracklists.com/tracklist/x');
  expect(out.items).toHaveLength(1);
  expect(out.items[0]).toMatchObject({
    index: 1,
    artist: 'MAKINN',
    title: 'Normal Life',
    label: 'KOOKOO Records',
    timeText: '00:12',
    timeSec: 12,
  });
});
