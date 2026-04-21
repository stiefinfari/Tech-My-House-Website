# Radio Page Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernizzare la pagina Radio e Theatre Mode, rendere click episodio sempre interno, aggiornare footer social senza pulsanti, e mostrare nel player il brano corrente della tracklist.

**Architecture:** Aggiungo un generatore deterministico di `episodeCode` usato dal feed server-side, poi aggiorno UI (PodcastPage, SocialLinks, RadioTheatre/AudioPlayer) per nuova resa visiva e UX. Mantengo invariata la logica core di playback del player.

**Tech Stack:** React + TypeScript + Vite, TailwindCSS, react-router, framer-motion, Vitest.

---

## Mappa file (touch list)

**Nuovi file**
- `src/lib/episodeCode.ts` — genera un `episodeCode` stabile quando manca nel feed
- `src/lib/episodeCode.test.ts` — unit test per determinismo e formattazione

**Modifiche**
- `api/radio-feed.ts` — garantisce `episodeCode` sempre presente
- `src/pages/PodcastPage.tsx` — hero “logo grande a sinistra”, card meno squadrate, link episodio sempre interno
- `src/components/SocialLinks.tsx` — link social “icona + testo”, niente pill/button; 1001 solo icona
- `src/components/radio/RadioTheatre.tsx` — estetica più club/cinematic (laser+smoke), layout meno squadrato
- `src/hooks/useRealTracklist.ts` — ordina tracce per `startSec` e maggiore robustezza
- `src/components/AudioPlayer.tsx` — UI: enfatizza brano corrente e migliora sezione tracklist in theatre (senza cambiare logica core playback)

---

### Task 1: Generare sempre `episodeCode` nel feed

**Files:**
- Create: `src/lib/episodeCode.ts`
- Test: `src/lib/episodeCode.test.ts`
- Modify: `api/radio-feed.ts`

- [ ] **Step 1: Aggiungere helper `generateEpisodeCode`**

```ts
// src/lib/episodeCode.ts
type EpisodeCodeInput = {
  title?: string | null;
  audioUrl?: string | null;
  soundcloudUrl?: string | null;
  publishedAt?: string | null;
};

const djb2 = (value: string) => {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = (hash * 33) ^ value.charCodeAt(i);
  return hash >>> 0;
};

export function generateEpisodeCode(input: EpisodeCodeInput): string {
  const key = [
    input.audioUrl ?? '',
    input.soundcloudUrl ?? '',
    input.publishedAt ?? '',
    (input.title ?? '').trim(),
  ].join('|');

  const h = djb2(key).toString(36);
  return `ep${h}`;
}
```

- [ ] **Step 2: Scrivere test Vitest**

```ts
// src/lib/episodeCode.test.ts
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
```

- [ ] **Step 3: Eseguire i test**

Run: `npm test`
Expected: PASS (inclusi i test esistenti).

- [ ] **Step 4: Usare il fallback nel feed server-side**

In `api/radio-feed.ts` sostituire:

```ts
episodeCode: extractEpisodeCode(title) ?? (summary ? extractEpisodeCode(summary) : null),
```

con:

```ts
import { generateEpisodeCode } from '../src/lib/episodeCode';

const extracted =
  extractEpisodeCode(title) ?? (summary ? extractEpisodeCode(summary) : null);

episodeCode: extracted ?? generateEpisodeCode({ title, audioUrl: enclosureUrl, soundcloudUrl, publishedAt }),
```

- [ ] **Step 5: Eseguire typecheck**

Run: `npm run check`
Expected: PASS.

---

### Task 2: Footer “Community” senza pulsanti (icona + testo)

**Files:**
- Modify: `src/components/SocialLinks.tsx`
- (Optional) Modify: `src/index.css` (solo se serve nuova classe)

- [ ] **Step 1: Aggiornare `SocialLinks` a link “textlink” con icone**

Target output:
- Facebook/Instagram/SoundCloud/Spotify: icona + testo.
- 1001Tracklists: solo icona con `aria-label`.

- [ ] **Step 2: Verifica visiva**

Run: `npm run dev`
Expected: Nel footer, “Community” mostra link puliti (non pill).

---

### Task 3: Hero Radio “logo grande a sinistra” + title più stretto

**Files:**
- Modify: `src/pages/PodcastPage.tsx`

- [ ] **Step 1: Rifare layout hero**

Obiettivo:
- Logo più grande e più a sinistra.
- `h1` con max width controllata (non invade).

- [ ] **Step 2: Check responsive**

Expected:
- Desktop: logo sinistra + titolo destra.
- Mobile: il logo resta ben leggibile e non viene “schiacciato”.

---

### Task 4: Archive episodi più moderno (meno squadrato) + link sempre interno

**Files:**
- Modify: `src/pages/PodcastPage.tsx`

- [ ] **Step 1: Rendere `episodeCode` non-null lato UI**

Aggiornare `RadioEpisodeUi` e mapping dal feed affinché `episodeCode` sia sempre `string`.

- [ ] **Step 2: Card styling**

Aggiornare classi Tailwind per:
- `rounded-*` (es. 2xl),
- bordi più soft,
- overlay gradient più raffinato,
- mantenere accessibilità/focus.

- [ ] **Step 3: Link episodio sempre a `/radio/:episodeCode`**

Sostituire il ramo “link esterno” con sempre `<Link to={`/radio/${ep.episodeCode}`}>…</Link>`.

---

### Task 5: Tracklist “più affidabile” per brano corrente

**Files:**
- Modify: `src/hooks/useRealTracklist.ts`
- Modify: `src/components/AudioPlayer.tsx`

- [ ] **Step 1: Ordinare sempre `tracks` per `startSec`**

Dopo la costruzione di `tracks`:

```ts
tracks = [...tracks].sort((a, b) => a.startSec - b.startSec);
```

- [ ] **Step 2: Verifica “Now playing” nel player bottom**

Expected:
- Se la tracklist è disponibile, il titolo principale mostra `Artist — Title`.

---

### Task 6: Theatre Mode “Laser + smoke” + tracklist cliccabile/leggibile

**Files:**
- Modify: `src/components/radio/RadioTheatre.tsx`
- Modify: `src/components/AudioPlayer.tsx`

- [ ] **Step 1: Aggiornare il look del contenitore (meno squadrato)**

Obiettivo:
- cover panel più “premium” (rounded, shadow, leggera rotazione opzionale),
- overlay grain/vignette,
- mantenere `prefers-reduced-motion`.

- [ ] **Step 2: Tracklist panel**

Obiettivo:
- pannello tracklist con header sticky leggibile,
- row hover/focus + “Now” evidente,
- click row → seek (già presente) + scroll-into-view del brano corrente.

---

### Task 7: Validazione finale

**Files:**
- Modify: (solo se emergono errori)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 2: Test**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS.

