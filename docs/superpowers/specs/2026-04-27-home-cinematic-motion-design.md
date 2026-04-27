# Home Cinematic Motion (Design)

## Obiettivo
Rendere la Home immersiva e cinematografica per un radio show underground (House/Tech House/Techno), mantenendo un’estetica dark/industriale con accento acid `#CCFF00` su `#0A0A0A`. Le animazioni devono essere fluide, performanti e non kitsch.

## Stack e vincoli
- Stack: React + TypeScript + Vite + Tailwind + Framer Motion.
- Non toccare: SEO, feed polling, router, Preloader.
- Non rimuovere classi `tmh-reveal-*` esistenti: le animazioni Framer si sommano a quelle CSS.
- Evitare re-render per parallax “rig”: aggiornare `transform` direttamente sul DOM node.
- Preferire `useScroll()` di Framer Motion per i parallax “cinematografici” (layer/decors), non `addEventListener('scroll')`.
- `whileInView`: usare sempre `viewport={{ once: true, margin: '-10% 0px' }}`.
- `prefers-reduced-motion`: rispettare tramite `useReducedMotionPreference()` oppure durate a 0 e disattivazione transform.
- `clipPath`: usare solo stringhe in `initial` e `whileInView` (non array).

## Approccio (B) — Hybrid Motion System
- Parallax continuo “fisico” (rig ad alta performance, no re-render): `ParallaxProvider` + `useParallaxItem`.
- Parallax “cinematografico” (layer, decor, floating shapes): Framer Motion `useScroll` + `useTransform`.
- Entrance/hover: Framer Motion `whileInView` / `whileHover` con viewport once.

## Touchpoints (file)
- Parallax rig:
  - `src/components/parallax/ParallaxProvider.tsx`
  - `src/components/parallax/parallaxContext.ts`
  - `src/hooks/useParallaxItem.ts`
  - Montaggio provider: `src/components/Layout.tsx`
- Home sections:
  - `src/pages/Home.tsx` (wrapping marquee)
  - `src/sections/home/HeroSection.tsx`
  - `src/sections/home/RadioShowSection.tsx`
  - `src/sections/home/RecordsSection.tsx`
  - `src/sections/home/ArtistsSection.tsx`

## 1) FIX critico — ParallaxProvider (rAF polling puro)
### Obiettivo
Garantire che `useParallaxItem` funzioni sempre quando il Provider è montato, con aggiornamento `transform: translate3d()` direttamente sul DOM e nessun re-render.

### Requisiti implementativi
- Il provider deve usare un loop `requestAnimationFrame` che:
  - legge `scrollY` e viewport size ogni frame;
  - calcola offset per gli item registrati;
  - scrive `el.style.transform` e (se necessario) `el.style.willChange = 'transform'`.
- Niente `window.addEventListener('scroll')` (né diretto né indiretto nel provider).
- Early-exit:
  - confrontare `Math.round(scrollY)` (e dimensioni viewport) per evitare micro-update sub-pixel.
  - se non cambia, non riscrivere i transform.
- `prefers-reduced-motion`:
  - `enabled=false` e stop del loop.
  - opzionale: reset a `transform: translate3d(0px, 0px, 0px)`.
- Lifecycle:
  - avviare il loop solo se `enabled=true` e c’è almeno 1 item registrato;
  - fermarlo quando non ci sono item o quando `enabled=false`.

## 2) HeroSection — profondità multi-layer + intro typography
### Parallax layers (Framer Motion)
Creare 3 layer con `useScroll` + `useTransform`:
- Layer 1 (video background): speedY `0.35`
- Layer 2 (gradient overlay): speedY `-0.15`
- Layer 3 (testo hero: h1 + tagline): speedY `-0.20`

### Scoping useScroll
- Hero è fullscreen: `useScroll()` può restare default (window) salvo necessità specifica.
- Se si introduce `target`, farlo solo quando serve per correggere range/offset; evitare di “containerizzare” per errore.

### Intro “TECH / MY / HOUSE”
- Animare le tre parole con `motion.span`:
  - `initial={{ opacity: 0, y: 40 }}`
  - `animate={{ opacity: 1, y: 0 }}`
  - stagger 120ms tra le parole.
- Non usare i vecchi wrapper `tmh-hero-word` per l’animazione (possono restare come classi, ma l’animazione deve stare su `motion.span`).

## 3) RadioShowSection — reveal drammatico + decor “RADIO·”
### Reveal titolo e logo
- Titolo “LATEST EPISODE” e blocco logo:
  - `initial={{ opacity: 0, y: 60 }}`
  - `whileInView={{ opacity: 1, y: 0 }}`
  - `transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}`
  - `viewport={{ once: true, margin: '-10% 0px' }}`
- Logo rotante:
  - `initial={{ scale: 0.85 }}`
  - `whileInView={{ scale: 1 }}`

### Decor background “RADIO·” (parallax opposto)
- Layer assoluto (opacità 0.04) con testo ripetuto “RADIO·”.
- Movimento: `useScroll` (window) + `useTransform` con speedY `-0.2`.
- Motivazione: il decor deve continuare a muoversi anche fuori dal viewport della sezione; evitare `target` su container che “ferma” il parallax.

## 4) RecordsSection — clip reveal + cerchio acid + stagger cards
### Clip reveal titoli
- “TMH”:
  - `initial={{ clipPath: 'inset(100% 0 0 0)' }}`
  - `whileInView={{ clipPath: 'inset(0% 0 0 0)' }}`
  - `transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}`
- “Records”: stessa animazione con delay 200ms.
- Nota: non usare array come valore di `clipPath`.

### Cerchio acid decor
- Cerchio sfumato `#CCFF00` con opacity 3–5%, assoluto, `pointer-events: none`, `z-index: 0`.
- Movimento lento con `useScroll` (window) + `useTransform` in range `[-200, 200]`.

### Grid info (FORMAT / STATUS)
- Ogni card entra con stagger:
  - `initial={{ opacity: 0, x: -24 }}`
  - `whileInView={{ opacity: 1, x: 0 }}`
  - `transition` con `delay: index * ...` e ease coerente con il resto.

## 5) ArtistsSection — clip reveal + entry cards + hover spring
### Titolo
- “ARTISTS”: clip reveal come Records.

### Cards (entrata)
- `initial={{ opacity: 0, y: 50, rotate: -1 }}`
- `whileInView={{ opacity: 1, y: 0, rotate: 0 }}`
- `transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}`
- `viewport={{ once: true, margin: '-10% 0px' }}`

### Cards (hover)
- Aggiungere `whileHover={{ scale: 1.03, rotate: -0.5 }}` con physics spring (senza rimuovere hover Tailwind esistenti).

## 6) Marquee (Home) — entrance wrapper
- Wrappare ogni marquee in `motion.div`:
  - `initial={{ opacity: 0, scaleX: 0.95 }}`
  - `whileInView={{ opacity: 1, scaleX: 1 }}`
  - `transition={{ duration: 0.6 }}`
  - `viewport={{ once: true, margin: '-10% 0px' }}`
- Secondo marquee: delay 100ms.

## Reduced Motion policy
- Se `prefersReduced`:
  - Parallax rig disattivato (`enabled=false`).
  - Trasformazioni `useTransform` clamp a 0 o sostituite con valori statici.
  - Durate `transition` a 0 (o evitare `initial`/`animate` quando opportuno).

## Success criteria
- Hero: video con parallax + testo che si muove meno dello sfondo + intro stagger “TECH / MY / HOUSE”.
- Marquee: snap d’entrata (opacity + scaleX).
- RadioShow: titolo e logo entrano dal basso con easing cinematic + decor “RADIO·” in movimento opposto.
- Records: clip reveal titoli + cerchio acid fluttuante + cards con stagger da sinistra.
- Artists: cards con rotazione, stagger e hover spring.

