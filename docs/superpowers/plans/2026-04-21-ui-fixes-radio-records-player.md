# UI Fixes (Records/Radio/Episodes/Theatre/Player/Social) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Risolvere overlap layout, click episodi, spacing header Radio, migliorare theatre mode e garantire metadata player corretti, convertendo i social in link testuali accessibili.

**Architecture:** Fix principalmente UI/Tailwind + piccoli helper/hook. Non modificare in modo distruttivo la logica core del player in `PlayerContext` (si agisce su `AudioPlayer` e sull’hook `useRealTracklist`).

**Tech Stack:** React 18, React Router, TailwindCSS, Framer Motion, Vite, TypeScript, Vitest.

---

## File Map (tocchi previsti)

**Modify**
- `src/pages/Home.tsx` (scroll-to-hash: offset nav / padding finale per player)
- `src/sections/home/RecordsSection.tsx` (eventuale `scroll-mt-*` e piccoli aggiustamenti layout se necessario)
- `src/pages/PodcastPage.tsx` (header H1+logo spacing/dimensioni; card episodi: overlay link + z-index + key stabile)
- `src/hooks/useRealTracklist.ts` (ritornare anche meta episodio + stati loading/error)
- `src/components/AudioPlayer.tsx` (display metadata derivati; theatre tracklist: stati, keyboard nav, auto-scroll, transizioni)
- `src/components/SocialLinks.tsx` (icone → testo)
- `src/index.css` (rimuovere/aggiornare stile `.btn-icon`, introdurre stile testo social)

**Create**
- `src/lib/radioEpisodeMatch.ts` (funzioni pure per match episodio + normalizzazione; testabile)
- `src/lib/radioEpisodeMatch.test.ts` (unit test Vitest)

---

### Task 1: Hardening scroll/overlap (nav fixed + player fixed)

**Files:**
- Modify: `src/pages/Home.tsx`
- (Possibile) Modify: `src/index.css` oppure applicare `scroll-mt-*` direttamente alle section target

- [x] **Step 1: Aggiungere offset per anchor scroll (hash)**

In `Home.tsx`, sostituire lo `scrollIntoView()` con un calcolo offset che tenga conto della nav fixed.

```ts
// src/pages/Home.tsx
useEffect(() => {
  const NAV_OFFSET = 112; // px: top-4 + altezza nav + aria

  if (location.hash) {
    const id = location.hash.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [location]);
```

- [x] **Step 2: Evitare “copertura” del player fisso sui contenuti in fondo**

In `Home.tsx`, aumentare il padding-bottom del wrapper che contiene le sezioni (il player è fixed `bottom-4` e può coprire l’ultima sezione/CTA).

```tsx
// src/pages/Home.tsx (wrapper)
<div className="relative z-10 space-y-24 pb-36 sm:space-y-32 sm:pb-44">
```

- [x] **Step 3: Verifica rapida manuale**

Run: `npm run dev`
- Apri `/#records` e verifica che l’header di sezione non finisca sotto la TopNav.
- Scroll fino in fondo: l’ultima sezione non deve essere coperta dal player.

- [x] **Step 4: Check qualità**

Run: `npm run lint`  
Expected: exit 0

Run: `npm run check`  
Expected: exit 0

---

### Task 2: Records section overlap (interna alla sezione)

**Files:**
- Modify: `src/sections/home/RecordsSection.tsx`

- [x] **Step 1: Aggiungere scroll margin top sul target (sempre)**

```tsx
// src/sections/home/RecordsSection.tsx
<motion.section
  id="records"
  className="cement-texture relative isolate overflow-hidden py-20 sm:py-24 lg:py-28 scroll-mt-28"
>
```

- [x] **Step 2: Verifica responsive**

Manuale in devtools: 390 / 768 / 1440
- Griglia `lg:grid-cols-[1.15fr_1fr]` non deve collassare in overlap su 768.
- Il form non deve sovrapporsi a heading/tape-strip.

---

### Task 3: Pagina Radio (`/radio`) – spacing logo e H1

**Files:**
- Modify: `src/pages/PodcastPage.tsx`

- [x] **Step 1: Ridurre gap e aumentare logo**

```tsx
// src/pages/PodcastPage.tsx
<div className="mt-4 flex items-center gap-2 sm:gap-3">
  <h1 className="display-title text-[clamp(3rem,10vw,8rem)] leading-[0.9] text-white">RADIO SHOW</h1>
  <img
    src={TMHLogoWhite}
    alt=""
    aria-hidden="true"
    className="h-16 w-16 shrink-0 origin-center motion-safe:animate-[spin_10s_linear_infinite] motion-reduce:animate-none sm:h-20 sm:w-20"
  />
</div>
```

- [x] **Step 2: Verifica visiva**

Manuale: su mobile il logo non deve andare a capo o spingere l’H1 fuori viewport; su desktop deve migliorare gerarchia.

---

### Task 4: Episodi non si aprono al click (overlay Link sotto il contenuto)

**Files:**
- Modify: `src/pages/PodcastPage.tsx`

- [x] **Step 1: Portare l’overlay Link sopra ai layer non-interattivi**

Obiettivo: card cliccabile ovunque (tranne controlli), con `Play`/`Bookmark` ancora cliccabili.

1) Mettere overlay a `z-10`.  
2) Rendere il contenuto “decorativo” `pointer-events-none` così i click vanno al Link.  
3) Rendere i controlli `pointer-events-auto` e `z-20`.

```tsx
// src/pages/PodcastPage.tsx (dentro motion.article)
{ep.episodeCode ? (
  <Link
    to={`/radio/${ep.episodeCode}`}
    className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
    aria-label={`View ${ep.title}`}
  />
) : (
  <a
    href={ep.link}
    target="_blank"
    rel="noopener noreferrer"
    className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
    aria-label={`View ${ep.title} on SoundCloud`}
  />
)}

<div className="relative z-0">
  <div className="pointer-events-none">
    <div className={`relative w-full overflow-hidden bg-black ${isFeatured ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
      <img
        src={ep.coverUrl}
        alt={ep.title}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = DEFAULT_COVER;
        }}
        className={`h-full w-full object-cover transition-transform duration-700 ${isCurrentlyPlaying ? 'scale-[1.04]' : 'group-hover:scale-[1.03]'}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent opacity-90" />
      <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
    </div>

    <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
      <span className="text-acid">{episodeLabel}</span>
      {formattedDate ? <span className="hidden sm:inline">{formattedDate}</span> : null}
    </div>

    <div className="absolute bottom-4 left-4 right-4 z-10">
      <div className="font-display text-[clamp(1.35rem,2.5vw,2.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-white drop-shadow">
        {ep.title}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
        <span className="truncate">{isCurrentlyPlaying ? '▶ PLAYING' : 'VIEW TRACKLIST'}</span>
        {isFeatured ? <span className="text-white/50">FEATURED</span> : null}
      </div>
    </div>
  </div>

  <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        playEpisode(ep);
      }}
      aria-label={`Play ${ep.title}`}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-acid text-ink transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      {isCurrentlyPlaying ? (
        <div className="flex h-5 items-end gap-[4px]">
          <span className="h-full w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
          <span className="h-2/3 w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '200ms' }} />
          <span className="h-4/5 w-1.5 bg-ink animate-[bounce_1s_infinite]" style={{ animationDelay: '400ms' }} />
        </div>
      ) : (
        <Play size={22} fill="currentColor" className="ml-0.5" />
      )}
    </button>

    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        bookmarks.toggle(ep.link);
      }}
      aria-label={bookmarked ? `Remove bookmark ${ep.title}` : `Bookmark ${ep.title}`}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-white/80 backdrop-blur-md transition-colors hover:border-acid/60 hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
    >
      {bookmarked ? <BookmarkCheck size={16} className="text-acid" /> : <Bookmark size={16} />}
    </button>
  </div>
</div>
```

- [x] **Step 2: Rendere la key stabile**

Sostituire `key={i}` con una key stabile (priorità: `audioUrl`, fallback `link`).

```tsx
key={ep.audioUrl ?? ep.link}
```

- [x] **Step 3: Verifica manuale + console**

Manuale:
- click su cover/titolo: apre sempre dettaglio episodio (se `episodeCode`) o SoundCloud (se no).
- click su play/bookmark: non naviga, avvia player/toggle bookmark.
- nessun errore console.

---

### Task 5: Player “traccia in corso” (metadata display coerenti)

**Files:**
- Create: `src/lib/radioEpisodeMatch.ts`
- Create: `src/lib/radioEpisodeMatch.test.ts`
- Modify: `src/hooks/useRealTracklist.ts`
- Modify: `src/components/AudioPlayer.tsx`

- [x] **Step 1: Estrarre funzioni pure per match episodio**

```ts
// src/lib/radioEpisodeMatch.ts
import type { RadioEpisode } from '../lib/rssParse';

const normalize = (s: string) => s.trim().toLowerCase();

export function matchEpisode(episodes: RadioEpisode[], audioUrl?: string, title?: string): RadioEpisode | null {
  const audio = audioUrl?.trim();
  const t = title ? normalize(title) : null;
  return (
    episodes.find((ep) => (audio && ep.audioUrl === audio) || (t && normalize(ep.title) === t)) ?? null
  );
}
```

- [x] **Step 2: Aggiungere unit test Vitest**

```ts
// src/lib/radioEpisodeMatch.test.ts
import { describe, expect, it } from 'vitest';
import { matchEpisode } from './radioEpisodeMatch';

describe('matchEpisode', () => {
  it('matches by audioUrl', () => {
    const episodes = [
      { title: 'EP1', audioUrl: 'a.mp3' } as any,
      { title: 'EP2', audioUrl: 'b.mp3' } as any,
    ];
    expect(matchEpisode(episodes, 'b.mp3', undefined)?.title).toBe('EP2');
  });

  it('matches by title case-insensitively when audioUrl is missing', () => {
    const episodes = [{ title: 'Radio Show EP 10', audioUrl: 'x.mp3' } as any];
    expect(matchEpisode(episodes, undefined, 'radio show ep 10')?.audioUrl).toBe('x.mp3');
  });

  it('returns null when no match', () => {
    const episodes = [{ title: 'EP1', audioUrl: 'a.mp3' } as any];
    expect(matchEpisode(episodes, 'c.mp3', 'nope')).toBeNull();
  });
});
```

- [x] **Step 3: Estendere `useRealTracklist` per ritornare anche meta episodio + stato**

Cambiare il tipo di ritorno per includere:
- `tracks`, `sourceUrl`, `episodeCode` (già)
- `episodeTitle`, `episodeCoverUrl` (nuovi)
- `status: 'idle' | 'loading' | 'ready' | 'error'` (per UI theatre)

```ts
// src/hooks/useRealTracklist.ts (tipo ritorno)
export type RealTracklistResult = (TracklistData & {
  episodeTitle?: string;
  episodeCoverUrl?: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
}) | null;
```

Implementazione completa (sostituisce il file).

```ts
// src/hooks/useRealTracklist.ts
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
      } catch (err) {
        if (controller.signal.aborted) return;
        setTracklistData({ episodeCode: 'UNKNOWN', tracks: [], status: 'error' });
      }
    };

    fetchTracklist();

    return () => {
      controller.abort();
    };
  }, [audioUrl, title]);

  return tracklistData;
}
```

- [x] **Step 4: Usare display metadata in `AudioPlayer`**

Applicare queste modifiche puntuali (senza cambiare la logica `PlayerContext`):

```ts
// src/components/AudioPlayer.tsx
import type { RealTracklistResult } from '../hooks/useRealTracklist';
```

```ts
// src/components/AudioPlayer.tsx (sostituire variabili title/coverUrl/artist)
const tracklistData: RealTracklistResult = useRealTracklist(track?.url, track?.title);

const displayTitle = tracklistData?.episodeTitle ?? track?.title ?? '';
const displayArtist = track?.artist ?? '';
const displayCoverUrl = (tracklistData?.episodeCoverUrl ?? track?.coverUrl) || undefined;
```

Sostituzioni UI (esempi esatti):

```tsx
// cover button
{displayCoverUrl ? (
  <img src={displayCoverUrl} alt={displayTitle} className="h-full w-full object-cover" />
) : (
  <div className="flex h-full w-full items-center justify-center">
    <Music className="h-5 w-5 text-acid" />
  </div>
)}
```

```tsx
// titolo nel dock
<div className="truncate font-display text-[12px] font-extrabold uppercase tracking-[-0.01em] text-white md:text-[14px]">
  {displayTitle}
</div>
```

```tsx
// theatre title
<h3 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold uppercase leading-[0.9] tracking-tight text-white drop-shadow-lg">
  {displayTitle || 'Select an episode'}
</h3>
```

E passare `displayCoverUrl` al theatre:

```tsx
<RadioTheatre
  open={isTheatreOpen}
  title={displayTitle || 'Tech My House'}
  coverUrl={displayCoverUrl}
  onClose={() => setIsTheatreOpen(false)}
>
```

- [x] **Step 5: Test + build checks**

Run: `npm run test`  
Expected: PASS

Run: `npm run lint`  
Expected: PASS

Run: `npm run check`  
Expected: PASS

---

### Task 6: Theatre mode – tracklist completa, current indicator, navigazione tastiera, transizioni

**Files:**
- Modify: `src/components/AudioPlayer.tsx`
- (Possibile) Modify: `src/components/radio/RadioTheatre.tsx` se serve esporre `onKeyDown`, altrimenti gestire tutto in `AudioPlayer` con listener condizionale quando `isTheatreOpen`

- [x] **Step 1: Stati tracklist (loading/empty/error)**

Sostituire il blocco condizionale che oggi renderizza la tracklist solo se `tracks.length > 0` con uno switch esplicito su `tracklistData?.status`.

```tsx
// src/components/AudioPlayer.tsx (dentro <RadioTheatre>)
const hasTracks = Boolean(tracklistData && tracklistData.tracks.length > 0);
```

```tsx
{tracklistData?.status === 'loading' ? (
  <div className="mt-8 flex-1 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-widest text-smoke">
    Loading tracklist…
  </div>
) : tracklistData?.status === 'error' ? (
  <div className="mt-8 flex-1 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-widest text-smoke">
    Tracklist unavailable.
  </div>
) : tracklistData?.status === 'ready' && !hasTracks ? (
  <div className="mt-8 flex-1 border-t border-white/10 pt-6">
    <div className="font-mono text-[10px] uppercase tracking-widest text-smoke">Tracklist unavailable.</div>
    {tracklistData.sourceUrl ? (
      <a
        href={tracklistData.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex font-mono text-[10px] uppercase tracking-widest text-acid transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
      >
        Open 1001Tracklists ↗
      </a>
    ) : null}
  </div>
) : tracklistData?.status === 'ready' && hasTracks ? (
  <div className="mt-8 flex-1 overflow-y-auto pr-4 max-h-[45vh] border-t border-white/10 pt-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
    <div className="mb-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-smoke">
      <span>Tracklist ({tracklistData.tracks.length})</span>
      {tracklistData.sourceUrl ? (
        <a
          href={tracklistData.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-acid transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
        >
          1001Tracklists ↗
        </a>
      ) : null}
    </div>
    <div className="space-y-1">
      {tracklistData.tracks.map((t, idx) => {
        const isCurrent = idx === currentTrackIndex;
        const isSelected = idx === selectedTrackIndex;
        return (
          <motion.button
            key={`${t.startSec}-${t.artist}-${t.title}`}
            ref={isCurrent ? currentTrackRowRef : undefined}
            layout={!shouldReduceMotion}
            type="button"
            onClick={() => commitSeek(t.startSec)}
            className={`group relative flex w-full items-start gap-4 rounded border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid ${
              isSelected ? 'border-white/15' : 'border-transparent'
            } ${isCurrent ? 'text-acid' : 'text-white'}`}
          >
            {!shouldReduceMotion && isCurrent ? (
              <motion.div
                layoutId="tmh-current-track"
                className="absolute inset-0 rounded bg-white/10"
                transition={{ duration: 0.22, ease: 'easeOut' }}
              />
            ) : isCurrent ? (
              <div className="absolute inset-0 rounded bg-white/10" />
            ) : null}

            <div className="relative mt-0.5 w-10 shrink-0 font-mono text-[10px] uppercase tracking-widest text-smoke group-hover:text-white/80">
              {formatTime(t.startSec)}
            </div>
            <div className="relative min-w-0 flex-1">
              <div className="truncate font-display text-[14px] font-extrabold uppercase text-white group-hover:text-acid/80">
                {t.title}
              </div>
              <div className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.2em] text-smoke group-hover:text-white/60">
                {t.artist} {t.label ? `[${t.label}]` : ''}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  </div>
) : null}
```

- [x] **Step 2: Auto-scroll riga corrente**

In `AudioPlayer.tsx`, aggiungere un ref per la riga corrente e auto-scroll quando cambia `currentTrackIndex` (solo a theatre aperto).

```ts
// src/components/AudioPlayer.tsx (state/ref)
const currentTrackRowRef = useRef<HTMLButtonElement | null>(null);
```

```ts
useEffect(() => {
  if (!isTheatreOpen) return;
  if (currentTrackIndex < 0) return;
  if (!currentTrackRowRef.current) return;
  currentTrackRowRef.current.scrollIntoView({ block: 'nearest', behavior: shouldReduceMotion ? 'auto' : 'smooth' });
}, [currentTrackIndex, isTheatreOpen, shouldReduceMotion]);
```

- [x] **Step 3: Navigazione tastiera**

Gestire un `selectedTrackIndex` locale (se non set, default alla traccia corrente) e intercettare ArrowUp/ArrowDown/Enter/Home/End quando theatre è open.

```ts
// src/components/AudioPlayer.tsx
const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(-1);
```

```ts
useEffect(() => {
  if (!isTheatreOpen) return;
  if (!tracklistData || tracklistData.status !== 'ready' || tracklistData.tracks.length === 0) {
    setSelectedTrackIndex(-1);
    return;
  }
  setSelectedTrackIndex((prev) => (prev >= 0 ? prev : Math.max(0, currentTrackIndex)));
}, [currentTrackIndex, isTheatreOpen, tracklistData]);
```

```ts
useEffect(() => {
  if (!isTheatreOpen) return;
  if (!tracklistData || tracklistData.status !== 'ready' || tracklistData.tracks.length === 0) return;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab' || event.key === 'Escape') return;

    const len = tracklistData.tracks.length;
    if (len === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedTrackIndex((idx) => Math.min(len - 1, Math.max(0, idx) + 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedTrackIndex((idx) => Math.max(0, Math.max(0, idx) - 1));
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setSelectedTrackIndex(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      setSelectedTrackIndex(len - 1);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const idx = selectedTrackIndex >= 0 ? selectedTrackIndex : currentTrackIndex;
      const t = tracklistData.tracks[idx];
      if (t) commitSeek(t.startSec);
      return;
    }
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}, [commitSeek, currentTrackIndex, isTheatreOpen, selectedTrackIndex, tracklistData]);
```

- [x] **Step 4: Transizioni smooth cambio traccia**

Rendere le righe tracklist come `motion.button` con `layout` e una pill di background che anima quando cambia `currentTrackIndex`.

```tsx
// src/components/AudioPlayer.tsx (dentro block tracklist, sostituire il map)
<div className="space-y-1">
  {tracklistData.tracks.map((t, idx) => {
    const isCurrent = idx === currentTrackIndex;
    const isSelected = idx === selectedTrackIndex;
    return (
      <motion.button
        key={`${t.startSec}-${t.artist}-${t.title}`}
        ref={isCurrent ? currentTrackRowRef : undefined}
        layout={!shouldReduceMotion}
        type="button"
        onClick={() => commitSeek(t.startSec)}
        className={`group relative flex w-full items-start gap-4 rounded border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid ${
          isSelected ? 'border-white/15' : 'border-transparent'
        } ${isCurrent ? 'text-acid' : 'text-white'}`}
      >
        {!shouldReduceMotion && isCurrent ? (
          <motion.div
            layoutId="tmh-current-track"
            className="absolute inset-0 rounded bg-white/10"
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        ) : isCurrent ? (
          <div className="absolute inset-0 rounded bg-white/10" />
        ) : null}

        <div className="relative mt-0.5 w-10 shrink-0 font-mono text-[10px] uppercase tracking-widest text-smoke group-hover:text-white/80">
          {formatTime(t.startSec)}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="truncate font-display text-[14px] font-extrabold uppercase text-white group-hover:text-acid/80">
            {t.title}
          </div>
          <div className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.2em] text-smoke group-hover:text-white/60">
            {t.artist} {t.label ? `[${t.label}]` : ''}
          </div>
        </div>
      </motion.button>
    );
  })}
</div>
```

- [x] **Step 5: Verifica manuale a11y**

Manuale:
- tab/shift+tab resta dentro theatre (focus trap già presente)
- frecce e invio funzionano
- focus ring visibile sui bottoni/righe

---

### Task 7: Social links – icone → testo (testo semplice)

**Files:**
- Modify: `src/components/SocialLinks.tsx`
- Modify: `src/index.css`

- [x] **Step 1: Rendere i link testuali**

Sostituire `<Icon/>` con testo visibile e rimuovere `aria-label` (il testo diventa il label).

```tsx
// src/components/SocialLinks.tsx
<a
  href={href}
  target="_blank"
  rel="noopener noreferrer"
  className="social-link"
>
  {label}
</a>
```

- [x] **Step 2: Aggiornare CSS**

In `src/index.css`:
- rimuovere (o lasciare ma non usare) `.btn-icon`
- introdurre `.social-link` con:
  - font mono / uppercase tracking
  - hover/focus-visible con contrasto AA

Esempio:

```css
.social-link {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(10,10,10,0.35);
  color: rgba(255,255,255,0.82);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
  transition: border-color 180ms ease, color 180ms ease, background-color 180ms ease;
}
.social-link:hover,
.social-link:focus-visible {
  border-color: rgba(204,255,0,0.6);
  color: rgba(204,255,0,1);
  outline: none;
}
```

- [x] **Step 3: Verifica footer**

Manuale:
- layout non va a capo in modo disordinato su mobile (wrap ok)
- focus ring visibile

---

### Task 8: Verifica finale (cross-browser + performance basics)

**Files:**
- N/A (solo verifica)

- [x] **Step 1: Build**

Run: `npm run build`  
Expected: build ok

- [x] **Step 2: Smoke UI**

Manuale:
- Home: Records non overlappa, anchor ok
- Radio: header spacing ok; card click ok
- Player: titolo/cover coerenti; theatre: tracklist navigabile
- Footer: social testuali leggibili
