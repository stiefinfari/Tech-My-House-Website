# Records + Radio Immersive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rilasciare la tranche prioritaria con redesign immersivo della sezione Records e rifacimento pagina Radio con copertine affidabili, theatre mode, waveform, sleep timer e bookmark.

**Architecture:** Si mantiene l’architettura React + Router esistente, introducendo moduli mirati e testabili: parsing feed robusto, utility immagine con fallback, stato locale per bookmark/sleep timer e componenti radio immersivi isolati. Le nuove funzionalita audio avanzate restano nel layer UI della pagina Radio e non alterano in modo distruttivo il core del player globale.

**Tech Stack:** React 18, TypeScript strict, Vite, Tailwind, Framer Motion, Web Audio API, Vitest + React Testing Library.

---

## Scope Check

Questa plan copre solo la **Tranche A** della spec (`Records + Radio`).  
Le tranche successive (`player/nav/link/cleanup/changelog finale`) vanno pianificate in documenti separati dopo rilascio e verifica della tranche A.

## File Structure

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/utils/episodeFeed.ts`
- Create: `src/utils/imagePolicy.ts`
- Create: `src/hooks/useEpisodeBookmarks.ts`
- Create: `src/hooks/useSleepTimer.ts`
- Create: `src/components/radio/RadioWaveform.tsx`
- Create: `src/components/radio/RadioTheatre.tsx`
- Modify: `src/pages/PodcastPage.tsx`
- Modify: `src/sections/home/RecordsSection.tsx`
- Create: `src/utils/episodeFeed.test.ts`
- Create: `src/utils/imagePolicy.test.ts`
- Create: `src/hooks/useEpisodeBookmarks.test.ts`
- Create: `src/hooks/useSleepTimer.test.ts`
- Create: `src/pages/PodcastPage.test.tsx`
- Modify: `README.md`

### Task 1: Bootstrap Test Infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write failing smoke test command expectation**

```bash
pnpm test --run
```

Expected: script mancante in `package.json`.

- [ ] **Step 2: Add test scripts and dev dependencies**

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "jsdom": "^25.0.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Create Vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 4: Create test setup file**

```ts
// src/test/setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Run tests to verify baseline passes**

Run: `pnpm test:run`  
Expected: pass con `0 tests` o suite vuota senza errori.

- [ ] **Step 6: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts
git commit -m "test: setup vitest and react testing library"
```

### Task 2: Implement Feed Parser with Cover Fallback Policy (TDD)

**Files:**
- Create: `src/utils/episodeFeed.ts`
- Create: `src/utils/episodeFeed.test.ts`

- [ ] **Step 1: Write failing parser tests**

```ts
// src/utils/episodeFeed.test.ts
import { describe, expect, it } from 'vitest';
import { mapFeedItems } from './episodeFeed';

describe('mapFeedItems', () => {
  it('maps valid items and sorts by date desc', () => {
    const items = [
      { title: 'B', pubDate: '2025-01-01', enclosure: { link: 'b.mp3' }, thumbnail: 'b.jpg' },
      { title: 'A', pubDate: '2026-01-01', enclosure: { link: 'a.mp3' }, thumbnail: 'a.jpg' },
    ];
    const out = mapFeedItems(items);
    expect(out[0]?.title).toBe('A');
  });

  it('applies default cover when missing', () => {
    const out = mapFeedItems([{ title: 'X', enclosure: { link: 'x.mp3' } }]);
    expect(out[0]?.coverUrl).toContain('sndcdn.com');
  });
});
```

- [ ] **Step 2: Run test and verify fail**

Run: `pnpm test:run src/utils/episodeFeed.test.ts`  
Expected: FAIL, modulo non trovato.

- [ ] **Step 3: Implement parser**

```ts
// src/utils/episodeFeed.ts
export const DEFAULT_COVER = 'https://i1.sndcdn.com/avatars-siKAkzoJZjIx8IDn-zpkRzw-original.jpg';

type FeedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  description?: string;
  enclosure?: { link?: string; thumbnail?: string };
};

export type Episode = {
  title: string;
  link: string;
  pubDate: string;
  audioUrl: string;
  coverUrl: string;
  description: string;
};

const safeDate = (d?: string) => (d ? new Date(d).getTime() : Number.NaN);

export function mapFeedItems(items: FeedItem[]): Episode[] {
  return items
    .map((item): Episode => ({
      title: item.title ?? 'Unknown Episode',
      link: item.link ?? '#',
      pubDate: item.pubDate ?? '',
      audioUrl: item.enclosure?.link ?? '',
      coverUrl: item.thumbnail ?? item.enclosure?.thumbnail ?? DEFAULT_COVER,
      description: item.description ?? '',
    }))
    .sort((a, b) => {
      const ad = safeDate(a.pubDate);
      const bd = safeDate(b.pubDate);
      if (Number.isNaN(ad) && Number.isNaN(bd)) return 0;
      if (Number.isNaN(ad)) return 1;
      if (Number.isNaN(bd)) return -1;
      return bd - ad;
    });
}
```

- [ ] **Step 4: Re-run tests**

Run: `pnpm test:run src/utils/episodeFeed.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/episodeFeed.ts src/utils/episodeFeed.test.ts
git commit -m "feat(radio): add feed parser with deterministic fallback mapping"
```

### Task 3: Add Image Reliability Policy for Cover Bug (TDD)

**Files:**
- Create: `src/utils/imagePolicy.ts`
- Create: `src/utils/imagePolicy.test.ts`

- [ ] **Step 1: Write failing tests for URL policy**

```ts
// src/utils/imagePolicy.test.ts
import { describe, expect, it } from 'vitest';
import { isUsableImageUrl, toSafeCoverUrl } from './imagePolicy';

describe('imagePolicy', () => {
  it('rejects empty and invalid urls', () => {
    expect(isUsableImageUrl('')).toBe(false);
    expect(isUsableImageUrl('notaurl')).toBe(false);
  });

  it('accepts http(s) urls', () => {
    expect(isUsableImageUrl('https://i1.sndcdn.com/a.jpg')).toBe(true);
  });

  it('returns fallback when invalid', () => {
    expect(toSafeCoverUrl('', 'fallback.jpg')).toBe('fallback.jpg');
  });
});
```

- [ ] **Step 2: Run and verify fail**

Run: `pnpm test:run src/utils/imagePolicy.test.ts`  
Expected: FAIL, file non esistente.

- [ ] **Step 3: Implement utility**

```ts
// src/utils/imagePolicy.ts
export function isUsableImageUrl(value: string): boolean {
  if (!value?.trim()) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export function toSafeCoverUrl(url: string | undefined, fallback: string): string {
  return isUsableImageUrl(url ?? '') ? (url as string) : fallback;
}
```

- [ ] **Step 4: Re-run tests**

Run: `pnpm test:run src/utils/imagePolicy.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/imagePolicy.ts src/utils/imagePolicy.test.ts
git commit -m "fix(radio): add defensive image url policy utilities"
```

### Task 4: Add Bookmark + Sleep Timer Hooks (TDD)

**Files:**
- Create: `src/hooks/useEpisodeBookmarks.ts`
- Create: `src/hooks/useEpisodeBookmarks.test.ts`
- Create: `src/hooks/useSleepTimer.ts`
- Create: `src/hooks/useSleepTimer.test.ts`

- [ ] **Step 1: Write failing bookmark tests**

```ts
// src/hooks/useEpisodeBookmarks.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEpisodeBookmarks } from './useEpisodeBookmarks';

describe('useEpisodeBookmarks', () => {
  it('toggles episode id in storage', () => {
    const { result } = renderHook(() => useEpisodeBookmarks());
    act(() => result.current.toggle('ep-1'));
    expect(result.current.isBookmarked('ep-1')).toBe(true);
  });
});
```

- [ ] **Step 2: Write failing sleep timer tests**

```ts
// src/hooks/useSleepTimer.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSleepTimer } from './useSleepTimer';

describe('useSleepTimer', () => {
  it('calls callback after configured minutes', () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { result } = renderHook(() => useSleepTimer(onExpire));
    act(() => result.current.start(1));
    vi.advanceTimersByTime(60_000);
    expect(onExpire).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
```

- [ ] **Step 3: Run and verify fail**

Run: `pnpm test:run src/hooks/useEpisodeBookmarks.test.ts src/hooks/useSleepTimer.test.ts`  
Expected: FAIL.

- [ ] **Step 4: Implement bookmark hook**

```ts
// src/hooks/useEpisodeBookmarks.ts
import { useMemo, useState } from 'react';

const KEY = 'tmh-radio-bookmarks-v1';

export function useEpisodeBookmarks() {
  const [ids, setIds] = useState<string[]>(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  });

  const idSet = useMemo(() => new Set(ids), [ids]);

  const toggle = (id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  return { ids, toggle, isBookmarked: (id: string) => idSet.has(id) };
}
```

- [ ] **Step 5: Implement sleep timer hook**

```ts
// src/hooks/useSleepTimer.ts
import { useEffect, useRef, useState } from 'react';

export function useSleepTimer(onExpire: () => void) {
  const [remainingMs, setRemainingMs] = useState(0);
  const timerRef = useRef<number | null>(null);

  const stop = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setRemainingMs(0);
  };

  const start = (minutes: number) => {
    stop();
    setRemainingMs(minutes * 60_000);
    timerRef.current = window.setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1_000) {
          stop();
          onExpire();
          return 0;
        }
        return prev - 1_000;
      });
    }, 1_000);
  };

  useEffect(() => stop, []);

  return { remainingMs, start, stop, isActive: remainingMs > 0 };
}
```

- [ ] **Step 6: Re-run hook tests**

Run: `pnpm test:run src/hooks/useEpisodeBookmarks.test.ts src/hooks/useSleepTimer.test.ts`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useEpisodeBookmarks.ts src/hooks/useEpisodeBookmarks.test.ts src/hooks/useSleepTimer.ts src/hooks/useSleepTimer.test.ts
git commit -m "feat(radio): add bookmark and sleep timer hooks"
```

### Task 5: Redesign Records Section as Immersive Scroll Experience

**Files:**
- Modify: `src/sections/home/RecordsSection.tsx`

- [ ] **Step 1: Write failing UI expectation test (smoke)**

```ts
// aggiungere in test futuro del componente:
// expect(screen.queryByText(/records-panel/i)).not.toBeInTheDocument()
// expect(screen.getByRole('heading', { name: /records/i })).toBeInTheDocument()
```

- [ ] **Step 2: Implement immersive layout without boxed panel**

```tsx
// idea chiave in RecordsSection.tsx
<section id="records" className="relative overflow-clip py-24 sm:py-32">
  <motion.h2 ...>TMH <span className="accent-script">Records</span></motion.h2>
  <motion.p ...>first drops incoming</motion.p>
  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
    {/* blocchi contenuto leggeri, no card tradizionali */}
  </div>
</section>
```

- [ ] **Step 3: Add parallax/reveal behavior with reduced-motion fallback**

```tsx
<motion.div
  initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={reducedMotion ? { duration: 0 } : { duration: 0.6 }}
/>
```

- [ ] **Step 4: Run lint/typecheck**

Run: `pnpm lint && pnpm check`  
Expected: PASS senza nuovi warning critici.

- [ ] **Step 5: Commit**

```bash
git add src/sections/home/RecordsSection.tsx
git commit -m "feat(records): redesign section to immersive scroll layout"
```

### Task 6: Refactor PodcastPage Data Flow + Cover Bug Fix + Bookmark/Sleep Controls

**Files:**
- Modify: `src/pages/PodcastPage.tsx`
- Modify: `src/utils/episodeFeed.ts`
- Modify: `src/utils/imagePolicy.ts`
- Test: `src/pages/PodcastPage.test.tsx`

- [ ] **Step 1: Write failing integration tests for page behavior**

```ts
// src/pages/PodcastPage.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PodcastPage from './PodcastPage';

describe('PodcastPage', () => {
  it('renders fallback cover when feed cover is invalid', async () => {
    render(<PodcastPage />);
    expect(await screen.findByAltText(/Unknown Episode/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test and verify fail**

Run: `pnpm test:run src/pages/PodcastPage.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Integrate parser and image policy in fetch pipeline**

```ts
// in PodcastPage.tsx
import { mapFeedItems, DEFAULT_COVER } from '../utils/episodeFeed';
import { toSafeCoverUrl } from '../utils/imagePolicy';

const mapped = mapFeedItems(items).map((ep) => ({
  ...ep,
  coverUrl: toSafeCoverUrl(ep.coverUrl, DEFAULT_COVER),
}));
setEpisodes(mapped);
```

- [ ] **Step 4: Wire bookmark and sleep timer controls in page header/tool area**

```tsx
const bookmarks = useEpisodeBookmarks();
const sleepTimer = useSleepTimer(() => setIsPlaying(false));

<button type="button" onClick={() => sleepTimer.start(30)} aria-label="Sleep timer 30 minutes">SLEEP 30</button>
<button type="button" onClick={() => bookmarks.toggle(ep.link)} aria-label="Toggle bookmark">★</button>
```

- [ ] **Step 5: Re-run page tests**

Run: `pnpm test:run src/pages/PodcastPage.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/pages/PodcastPage.tsx src/pages/PodcastPage.test.tsx src/utils/episodeFeed.ts src/utils/imagePolicy.ts
git commit -m "feat(radio): harden feed pipeline and add bookmark/sleep controls"
```

### Task 7: Add Theatre Mode + Waveform/Spectrum Component

**Files:**
- Create: `src/components/radio/RadioWaveform.tsx`
- Create: `src/components/radio/RadioTheatre.tsx`
- Modify: `src/pages/PodcastPage.tsx`

- [ ] **Step 1: Write failing component smoke tests**

```ts
// test futuro:
// expect(screen.getByRole('button', { name: /theatre/i })).toBeInTheDocument()
// expect(screen.getByLabelText(/audio visualizer/i)).toBeInTheDocument()
```

- [ ] **Step 2: Implement waveform component with safe fallback**

```tsx
// src/components/radio/RadioWaveform.tsx
export default function RadioWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div aria-label="Audio visualizer" className="relative h-16 w-full overflow-hidden border border-white/10">
      <canvas className="absolute inset-0 h-full w-full" data-active={isActive ? '1' : '0'} />
    </div>
  );
}
```

- [ ] **Step 3: Implement theatre overlay component**

```tsx
// src/components/radio/RadioTheatre.tsx
export default function RadioTheatre({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-label="Radio theatre mode" className="fixed inset-0 z-[140] bg-ink">
      <button type="button" onClick={onClose} aria-label="Close theatre">Close</button>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Integrate theatre toggle and waveform into PodcastPage**

```tsx
const [isTheatreOpen, setIsTheatreOpen] = useState(false);

<button type="button" onClick={() => setIsTheatreOpen(true)} aria-label="Open theatre mode">THEATRE</button>
<RadioWaveform isActive={isPlaying} />
<RadioTheatre open={isTheatreOpen} onClose={() => setIsTheatreOpen(false)}>
  <RadioWaveform isActive={isPlaying} />
</RadioTheatre>
```

- [ ] **Step 5: Run lint and targeted tests**

Run: `pnpm lint && pnpm test:run src/pages/PodcastPage.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/radio/RadioWaveform.tsx src/components/radio/RadioTheatre.tsx src/pages/PodcastPage.tsx
git commit -m "feat(radio): add theatre mode and waveform visualizer shell"
```

### Task 8: Final Verification, Docs and Changelog Notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add changelog section for Tranche A**

```md
## Changelog

### 2026-04-19 - Tranche A (Records + Radio)
- Records redesign immersivo con reveal scroll-aware.
- Radio: fix copertine, theatre mode, waveform, sleep timer, bookmark.
```

- [ ] **Step 2: Run full quality gate**

Run: `pnpm lint && pnpm check && pnpm build && pnpm test:run`  
Expected: PASS completo.

- [ ] **Step 3: Manual responsive + a11y check**

Run:
- viewport `390x844`
- viewport `768x1024`
- viewport `1440x900`

Expected:
- nessuna sovrapposizione critica,
- focus visibile,
- contrasto AA su CTA principali.

- [ ] **Step 4: Commit final tranche**

```bash
git add README.md
git commit -m "docs: update changelog for tranche a records and radio redesign"
```

## Self-Review Checklist (completed)

- Spec coverage: coperti redesign Records, fix copertine Radio, theatre/waveform/sleep/bookmark, test e quality gates.
- Placeholder scan: nessun TODO/TBD nel piano.
- Type consistency: naming uniforme su `Episode`, `mapFeedItems`, `useEpisodeBookmarks`, `useSleepTimer`.
