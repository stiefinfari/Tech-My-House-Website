# Home Cinematic Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementare un sistema di motion “cinematografico” sulla Home con parallax ibrido (rig DOM + Framer Motion) e reveal/hover performanti e rispettosi di prefers-reduced-motion.

**Architecture:** Parallax continuo via `ParallaxProvider` (rAF polling puro, DOM writes, no re-render). Parallax compositivo e reveal via Framer Motion (`useScroll`/`useTransform`/`whileInView`), senza rimuovere le classi `tmh-reveal-*` esistenti.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Framer Motion

---

## File map (responsabilità)
- Modify: `src/components/parallax/ParallaxProvider.tsx` — rAF loop puro + early-exit arrotondato + reduced-motion stop/reset + no event listeners
- Modify: `src/sections/home/HeroSection.tsx` — 3 layer parallax con Framer Motion + intro stagger TECH/MY/HOUSE
- Modify: `src/sections/home/RadioShowSection.tsx` — whileInView reveal + logo scale + decor “RADIO·” scroll-opposto
- Modify: `src/sections/home/RecordsSection.tsx` — clip reveal (string clipPath) + cerchio acid parallax + stagger cards
- Modify: `src/sections/home/ArtistsSection.tsx` — clip reveal + entry cards (rotate/y) + hover spring
- Modify: `src/pages/Home.tsx` — wrapper motion per i due marquee con delay sul secondo

## Testing & verification
- Unit tests: nessun requisito funzionale puro; cambiamenti UI/motion. Non aggiungere test nuovi salvo regressioni evidenti.
- Lint/typecheck: `npm run lint`, `npm run typecheck` (o script equivalenti presenti).
- Build: `npm run build`.
- Visual: avviare dev server e verificare Home scroll (desktop e mobile), e `prefers-reduced-motion`.

---

### Task 1: ParallaxProvider rAF polling puro (no listeners)

**Files:**
- Modify: `src/components/parallax/ParallaxProvider.tsx`

- [ ] **Step 1: Rimuovere `addEventListener('scroll'/'resize')` e sostituire con loop rAF continuo**

Obiettivo: niente listener; un loop rAF che gira solo quando `enabled=true` e ci sono item registrati.

- [ ] **Step 2: Implementare early-exit con `Math.round(scrollY)`**

Requisito: confrontare `roundedScrollY` + `viewportHeight` (eventualmente `viewportWidth` se serve) per evitare micro-update.

- [ ] **Step 3: Riduzione motion**

Quando `enabled=false`:
- cancellare rAF;
- resettare `style.transform` degli item registrati (stringa vuota o `translate3d(0px,0px,0px)` coerente col CSS).

- [ ] **Step 4: Verificare che `register()` continui a funzionare come prima**

Non cambiare la firma e non introdurre re-render.

- [ ] **Step 5: Validazione locale**

Aprire Home e verificare che l’elemento `tmh-parallax-layer` dell’Hero si muova (quando motion non ridotta).

---

### Task 2: HeroSection — 3 layer Framer + intro stagger

**Files:**
- Modify: `src/sections/home/HeroSection.tsx`

- [ ] **Step 1: Introdurre `motion`, `useScroll`, `useTransform` e una `sectionRef`**

Regola scoping:
- Hero fullscreen: usare window scroll di default; aggiungere `{ target: sectionRef }` solo se necessario (non obbligatorio).

- [ ] **Step 2: Implementare 3 layer con speed diverse**

Layer:
- Video: speedY 0.35
- Gradient overlay: speedY -0.15
- Testo (h1 + tagline): speedY -0.20

Le trasformazioni devono essere applicate con `style={{ y: motionValue }}` (o transform equivalente) e con `will-change` solo dove già previsto dal CSS/classi.

- [ ] **Step 3: Intro “TECH / MY / HOUSE” con `motion.span`**

Sostituire i wrapper attuali con:
- `initial={{ opacity: 0, y: 40 }}`
- `animate={{ opacity: 1, y: 0 }}`
- stagger 120ms tra le parole

Mantenere classi esistenti dove servono allo stile; non dipendere dalle `--tmh-delay` per l’animazione.

- [ ] **Step 4: Reduced motion**

Se `shouldReduceMotion`:
- disattivare (o azzerare) i `useTransform` di parallax;
- durate a 0 per intro e reveal.

---

### Task 3: RadioShowSection — reveal + logo scale + decor “RADIO·”

**Files:**
- Modify: `src/sections/home/RadioShowSection.tsx`

- [ ] **Step 1: Wrappare titolo e blocco logo con `motion` e `whileInView`**

Props richieste:
- `initial={{ opacity: 0, y: 60 }}`
- `whileInView={{ opacity: 1, y: 0 }}`
- `transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}`
- `viewport={{ once: true, margin: '-10% 0px' }}`

- [ ] **Step 2: Logo rotante con scale in entrata**

Aggiungere:
- `initial={{ scale: 0.85 }}`
- `whileInView={{ scale: 1 }}`
con la stessa viewport once.

- [ ] **Step 3: Decor background “RADIO·”**

Creare un layer assoluto:
- testo ripetuto “RADIO·”
- opacità 0.04
- parallax opposto: `useScroll()` su window + `useTransform` speedY -0.2

Nota scoping: questo decor deve usare window scroll (non target sulla sezione), per evitare stop quando la sezione esce dal viewport.

- [ ] **Step 4: Reduced motion**

Durate 0 e decor statico.

---

### Task 4: RecordsSection — clip reveal + cerchio acid + stagger cards

**Files:**
- Modify: `src/sections/home/RecordsSection.tsx`

- [ ] **Step 1: Clip reveal titoli (solo string clipPath)**

Applicare a “TMH”:
- `initial={{ clipPath: 'inset(100% 0 0 0)' }}`
- `whileInView={{ clipPath: 'inset(0% 0 0 0)' }}`
- `transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}`
- `viewport={{ once: true, margin: '-10% 0px' }}`

Applicare a “Records” con delay 200ms.

- [ ] **Step 2: Cerchio acid decor parallax**

Inserire un elemento assoluto `pointer-events-none z-0` con gradiente/blur acid e `useScroll` (window) + `useTransform` range [-200, 200].

- [ ] **Step 3: Stagger cards info**

Trasformare i blocchi FORMAT/STATUS in `motion.div` con:
- `initial={{ opacity: 0, x: -24 }}`
- `whileInView={{ opacity: 1, x: 0 }}`
- `transition` con `delay: idx * ...`, `duration: 0.7-0.8`, ease `[0.16, 1, 0.3, 1]`
- `viewport={{ once: true, margin: '-10% 0px' }}`

- [ ] **Step 4: Reduced motion**

Clip reveal e transform disattivati/durate 0; cerchio statico.

---

### Task 5: ArtistsSection — clip reveal + entry cards + hover spring

**Files:**
- Modify: `src/sections/home/ArtistsSection.tsx`

- [ ] **Step 1: Clip reveal titolo “ARTISTS”**

Stesso schema clipPath string come Records con viewport once.

- [ ] **Step 2: Cards: animazione in entrata**

Per ogni card:
- `initial={{ opacity: 0, y: 50, rotate: -1 }}`
- `whileInView={{ opacity: 1, y: 0, rotate: 0 }}`
- `transition={{ delay: idx * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}`
- `viewport={{ once: true, margin: '-10% 0px' }}`

Mantenere classi `tmh-reveal-item` e hover Tailwind esistenti (non rimuoverle).

- [ ] **Step 3: Cards: hover spring**

Aggiungere `whileHover={{ scale: 1.03, rotate: -0.5 }}` con transition spring.

- [ ] **Step 4: Reduced motion**

Disattivare rotate/transform e hover physics; mantenere UI static.

---

### Task 6: Home marquee wrappers (entrance)

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Wrappare ogni Marquee in `motion.div`**

Animazione:
- `initial={{ opacity: 0, scaleX: 0.95 }}`
- `whileInView={{ opacity: 1, scaleX: 1 }}`
- `transition={{ duration: 0.6 }}`
- `viewport={{ once: true, margin: '-10% 0px' }}`

- [ ] **Step 2: Delay sul secondo marquee**

Aggiungere `transition={{ duration: 0.6, delay: 0.1 }}` sul wrapper del marquee reverse.

- [ ] **Step 3: Reduced motion**

Durata 0 o wrapper statico.

---

### Task 7: Verifica finale (lint/typecheck/build + smoke visual)

**Files:**
- N/A

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: exit code 0

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck` (se presente) oppure `npm run build` come verifica TypeScript
Expected: exit code 0

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build ok

- [ ] **Step 4: Smoke test visivo**

Dev server + scroll Home:
- Hero: parallax layers + stagger title
- Marquee: entrance
- Radio: reveal + decor RADIO·
- Records: clip reveal + cerchio acid parallax + stagger info
- Artists: entry rotate + hover spring
- Reduced motion: niente animazioni invasive

