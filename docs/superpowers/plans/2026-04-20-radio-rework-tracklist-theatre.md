# Radio & Player Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the Radio page to fix ORB-blocked SoundCloud covers via a Vercel function proxy, move the Theatre mode into the global audio player, and add tracklist support (with accordion UI on the page and current track highlight in Theatre mode).

**Architecture:** 
1. A Vercel serverless function (`api/image.js`) acts as an image proxy to circumvent client-side ORB restrictions for SoundCloud covers.
2. The `RadioTheatre` component is refactored out of the Radio page and integrated directly into the global `AudioPlayer` component.
3. Static tracklist data is maintained in a new file (`src/data/tracklists.ts`), rendering as an accordion per episode on the Radio page, and providing "current track" highlighting in the new global Theatre mode.

**Tech Stack:** React, Tailwind CSS, Vercel Serverless Functions, Framer Motion, HTML5 Audio

---

### Task 1: Create Image Proxy Vercel Function

**Files:**
- Create: `api/image.js`
- Modify: `src/utils/episodeFeed.ts`
- Modify: `src/utils/imagePolicy.ts`

- [ ] **Step 1: Create Vercel Function for Image Proxy**

```javascript
// api/image.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const parsedUrl = new URL(url);
    
    // Allowlist check
    const allowedHosts = ['i1.sndcdn.com', 'i2.sndcdn.com', 'i3.sndcdn.com', 'i4.sndcdn.com'];
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'Host not allowed' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TechMyHouse-Bot/1.0',
      },
      // Timeout and size limits would ideally be handled via a custom agent or stream abortion
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch image' });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Stream the image back
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600');
    
    const buffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('Image proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

- [ ] **Step 2: Update image utility to use proxy**

```typescript
// src/utils/imagePolicy.ts
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
```

- [ ] **Step 3: Update feed mapping to utilize the safe cover URL**

```typescript
// src/utils/episodeFeed.ts (around line 40)
// Update the import at the top
import { toSafeCoverUrl } from './imagePolicy';

// ... later in mapFeedItems function ...
      const coverRaw = item.thumbnail ?? item.enclosure?.thumbnail ?? DEFAULT_COVER;
      const normalizedCover = normalizeSoundCloudCover(coverRaw, 800);
      return {
        title: item.title ?? 'Unknown Episode',
        link: item.link ?? '#',
        pubDate: item.pubDate ?? '',
        audioUrl: item.enclosure?.link ?? '',
        coverUrl: toSafeCoverUrl(normalizedCover, DEFAULT_COVER),
        description: item.description ?? '',
      };
```

- [ ] **Step 4: Commit**

```bash
git add api/image.js src/utils/imagePolicy.ts src/utils/episodeFeed.ts
git commit -m "feat(api): add image proxy to bypass ORB for soundcloud covers"
```

### Task 2: Remove "Immersive Listening" Section from Radio Page

**Files:**
- Modify: `src/pages/PodcastPage.tsx`

- [ ] **Step 1: Remove Immersive Listening section and states**

Remove `isTheatreOpen`, `playMode`, and `sleepTimer` state/hooks from `src/pages/PodcastPage.tsx`.

Remove the entire `<section className="mb-7 space-y-4 border... IMMERSIVE LISTENING ... </section>` block.
Remove the `<RadioTheatre>` rendering at the bottom of the file.

```typescript
// In src/pages/PodcastPage.tsx, REMOVE:
// const [isTheatreOpen, setIsTheatreOpen] = useState(false);
// const [playMode, setPlayMode] = useState<PlayMode>('normal');
// const sleepTimer = useSleepTimer(() => setIsPlaying(false));
// ... AND the entire section block:
// <section className="mb-7 space-y-4 border border-white/10 bg-black/25 p-4 sm:p-5"> ... </section>
// AND the RadioTheatre rendering at the end
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/PodcastPage.tsx
git commit -m "refactor(radio): remove immersive listening section and local theatre state"
```

### Task 3: Move Theatre Mode into Global AudioPlayer

**Files:**
- Modify: `src/components/AudioPlayer.tsx`
- Modify: `src/components/radio/RadioTheatre.tsx`

- [ ] **Step 1: Refactor RadioTheatre to accept standard props for global usage**

Ensure `RadioTheatre.tsx` doesn't strictly depend on page-level state. (It already takes `open`, `title`, `coverUrl`, `onClose`, `children` which is good). We will just move where it is used.

- [ ] **Step 2: Integrate Theatre into AudioPlayer**

```tsx
// src/components/AudioPlayer.tsx
// Add imports
import RadioTheatre from './radio/RadioTheatre';
import RadioWaveform from './radio/RadioWaveform';
import { Maximize2 } from 'lucide-react'; // Import a suitable icon for Theatre

// Inside AudioPlayer component
const [isTheatreOpen, setIsTheatreOpen] = useState(false);

// Update baseButtonClass usage
// ...

// Add Theatre button next to the Close (X) button in the player dock
// Find this section:
/*
<div className="ml-1 border-l border-white/10 pl-2 sm:ml-2 sm:pl-3">
  <button
*/

// Change it to:
/*
<div className="ml-1 flex items-center border-l border-white/10 pl-2 sm:ml-2 sm:pl-3">
  <button
    type="button"
    onClick={() => setIsTheatreOpen(true)}
    aria-label="Open theatre mode"
    className={baseButtonClass}
  >
    <Maximize2 size={16} />
  </button>
  <button
    type="button"
    onClick={() => {
      setIsDismissed(true);
      setIsPlaying(false);
    }}
    aria-label="Close player"
    className={baseButtonClass}
  >
    <X size={18} />
  </button>
</div>
*/

// Add RadioTheatre render before the final </audio> tag
/*
<RadioTheatre
  open={isTheatreOpen}
  title={title || 'Tech My House'}
  coverUrl={coverUrl}
  onClose={() => setIsTheatreOpen(false)}
>
  <div className="space-y-6">
    <h3 className="font-display text-[clamp(1.5rem,4vw,2.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white">
      {title || 'Select an episode'}
    </h3>
    <div className="font-mono text-[11px] uppercase tracking-[0.26em] text-smoke">
      {isPlaying ? 'LIVE PLAYBACK' : 'PAUSED'}
    </div>
    <RadioWaveform isActive={isPlaying} accentRgb={accentRgb} />
    <button
      type="button"
      onClick={() => setIsTheatreOpen(false)}
      className="rounded-full border border-acid/75 px-5 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-acid transition-colors hover:bg-acid hover:text-ink"
    >
      CLOSE THEATRE
    </button>
  </div>
</RadioTheatre>
*/
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AudioPlayer.tsx src/components/radio/RadioTheatre.tsx
git commit -m "feat(player): integrate global theatre mode into audio player"
```

### Task 4: Add Static Tracklist Data and Logic

**Files:**
- Create: `src/data/tracklists.ts`
- Modify: `src/components/AudioPlayer.tsx`
- Modify: `src/pages/PodcastPage.tsx`

- [ ] **Step 1: Create tracklists data structure**

```typescript
// src/data/tracklists.ts
export interface TrackEntry {
  startSec: number;
  artist: string;
  title: string;
  label?: string;
}

export interface TracklistData {
  audioUrlMatch: string; // Used to match with the episode audioUrl
  sourceUrl?: string; // 1001Tracklists URL
  tracks: TrackEntry[];
}

export const tracklists: TracklistData[] = [
  {
    audioUrlMatch: 'ep133', // Placeholder, will match via string inclusion
    sourceUrl: 'https://www.1001tracklists.com/tracklist/placeholder/index.html',
    tracks: [
      { startSec: 0, artist: 'Tech My House', title: 'Intro' },
      { startSec: 120, artist: 'Artist 1', title: 'Track 1' },
      { startSec: 360, artist: 'Artist 2', title: 'Track 2' }
    ]
  }
];

export function getTracklistForEpisode(audioUrl?: string): TracklistData | undefined {
  if (!audioUrl) return undefined;
  return tracklists.find(t => audioUrl.toLowerCase().includes(t.audioUrlMatch.toLowerCase()));
}

export function getCurrentTrackIndex(tracks: TrackEntry[], currentSec: number): number {
  if (!tracks || tracks.length === 0) return -1;
  // Find the last track whose startSec is <= currentSec
  let currentIdx = -1;
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].startSec <= currentSec) {
      currentIdx = i;
    } else {
      break;
    }
  }
  return currentIdx;
}
```

- [ ] **Step 2: Add Tracklist UI to RadioTheatre inside AudioPlayer**

```tsx
// src/components/AudioPlayer.tsx
// Add imports
import { getTracklistForEpisode, getCurrentTrackIndex } from '../data/tracklists';

// Inside AudioPlayer
const tracklistData = getTracklistForEpisode(track?.url);
const currentTrackIndex = tracklistData ? getCurrentTrackIndex(tracklistData.tracks, progress) : -1;

// Inside RadioTheatre render block, below RadioWaveform
/*
{tracklistData && tracklistData.tracks.length > 0 && (
  <div className="mt-8 flex-1 overflow-y-auto pr-2 max-h-[40vh] border-t border-white/10 pt-4">
    <div className="font-mono text-[10px] uppercase tracking-widest text-smoke mb-4 flex justify-between">
      <span>Tracklist</span>
      {tracklistData.sourceUrl && (
        <a href={tracklistData.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-acid hover:underline">
          1001Tracklists ↗
        </a>
      )}
    </div>
    <div className="space-y-2">
      {tracklistData.tracks.map((t, idx) => {
        const isCurrent = idx === currentTrackIndex;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => commitSeek(t.startSec)}
            className={`w-full text-left flex items-start gap-3 p-2 rounded transition-colors ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <div className={`font-mono text-[10px] mt-0.5 ${isCurrent ? 'text-acid' : 'text-smoke'}`}>
              {formatTime(t.startSec)}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`truncate font-display text-[13px] font-extrabold uppercase ${isCurrent ? 'text-acid' : 'text-white'}`}>
                {t.title}
              </div>
              <div className={`truncate font-mono text-[9px] uppercase tracking-widest ${isCurrent ? 'text-white/80' : 'text-smoke'}`}>
                {t.artist} {t.label ? `[${t.label}]` : ''}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
)}
*/
```

- [ ] **Step 3: Add Accordion Tracklist to PodcastPage Episodes**

```tsx
// src/pages/PodcastPage.tsx
// Add imports
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getTracklistForEpisode } from '../data/tracklists';

// Inside PodcastPage component, add state for open tracklists
const [openTracklists, setOpenTracklists] = useState<Record<string, boolean>>({});

const toggleTracklist = (link: string, e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setOpenTracklists(prev => ({ ...prev, [link]: !prev[link] }));
};

// Inside the filteredEpisodes.map loop
/*
const tlData = getTracklistForEpisode(ep.audioUrl);
const isTlOpen = openTracklists[ep.link] || false;

// Modify the return block to include the accordion
<motion.article ...>
  <button onClick={() => playEpisode(ep)} ...>
    ... cover ...
    ... info ...
  </button>
  
  <div className="flex items-center justify-between px-4 pb-4">
    <button onClick={() => bookmarks.toggle(ep.link)} ...>
       ... bookmark ...
    </button>
    
    {tlData && tlData.tracks.length > 0 && (
      <button
        type="button"
        onClick={(e) => toggleTracklist(ep.link, e)}
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke transition-colors hover:text-acid"
      >
        TRACKLIST {isTlOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    )}
  </div>

  {isTlOpen && tlData && (
    <div className="border-t border-white/10 bg-black/20 p-4">
      {tlData.sourceUrl && (
        <a href={tlData.sourceUrl} target="_blank" rel="noopener noreferrer" className="block text-right mb-3 font-mono text-[9px] text-acid uppercase tracking-widest hover:underline">
          View on 1001Tracklists ↗
        </a>
      )}
      <div className="space-y-3">
        {tlData.tracks.map((t, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="font-mono text-[9px] text-smoke shrink-0 w-8">
              {Math.floor(t.startSec / 60)}:{(t.startSec % 60).toString().padStart(2, '0')}
            </div>
            <div className="min-w-0">
              <div className="font-display text-[11px] font-bold text-white uppercase truncate">{t.title}</div>
              <div className="font-mono text-[9px] text-smoke uppercase truncate">{t.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</motion.article>
*/
```

- [ ] **Step 4: Commit**

```bash
git add src/data/tracklists.ts src/components/AudioPlayer.tsx src/pages/PodcastPage.tsx
git commit -m "feat(radio): add tracklist accordion and theatre track highlighting"
```

### Task 5: Final Review and Formatting

- [ ] **Step 1: Check UI alignments**
Verify the AudioPlayer Theatre mode scrolls properly and doesn't overlap the controls. Verify the PodcastPage accordion opens smoothly and respects the layout.

- [ ] **Step 2: Final commit**

```bash
git commit --allow-empty -m "chore(radio): complete radio rework implementation"
```
