# Design Spec - Revisione Sistematica Sito TMH

Data: 2026-04-19
Stato: Proposta approvata (pronta per pianificazione implementativa)

## 1) Obiettivo

Eseguire una revisione completa del sito Tech My House mantenendo coerenza col design system esistente e riducendo rischio regressioni tramite rollout a tranche.

## 2) Decisioni confermate

- Interpretazione distruttiva evitata: rimozione mirata degli elementi target, non eliminazione globale di tutti i `button`/`div`.
- Integrazione 1001Tracklists semplificata: nessun embed/API; aggiunta della sola icona/link nel blocco social del footer.
- Priorita di rilascio: prima redesign `Records` + pagina `Radio`, poi cleanup/routing/nav/player, poi hardening test/perf/changelog.

## 3) Scope funzionale per punti richiesti

### 3.1 Rimozioni e cleanup

- Rimozione completa del `video` nel footer da DOM e codice (`Layout`), inclusi riferimenti CSS inline (mask su video) e source media non piu usate.
- Rimozione mirata del `button` selezionato in `LatestEpisode` con sostituzione semantica equivalente (controllo accessibile non regressivo).
- Refactor mirato di `span`/`div` solo dove migliora UX/UI e semantica (senza distruggere il layout globale React).

### 3.2 Navigazione e link

- Conversione delle CTA `a` target in navigazione verso `radio` e `contact` con routing React Router.
- Introduzione transizioni pagina leggere (Framer Motion) con fallback `prefers-reduced-motion`.
- Menu bar: micro-interazioni hover, comportamento scroll-aware, miglioramento drawer mobile, stato attivo chiaro, contrasto WCAG 2.1 AA.

### 3.3 Records redesign

- Eliminazione del pattern a riquadro classico in favore di composizione immersiva.
- Parallax/scroll-triggered animation per layer tipografici/media.
- Conservazione font attuali (display/script/mono) variando peso, tracking e ritmo verticale.
- Griglia fluida responsiva (1/2/3 colonne per contenuti secondari in base al viewport).
- Reveal progressivo all’ingresso in viewport.

### 3.4 Radio redesign

- Fix copertine non visibili: validazione URL immagini, fallback robusti, gestione lazy loading e casi CORS.
- Nuova esperienza di ascolto:
  - waveform o spettro durante riproduzione (canvas + Web Audio API),
  - modalita theatre/fullscreen dedicata,
  - sleep timer e continuous play,
  - bookmark episodi preferiti (persistenza locale),
  - transizioni fluide fra episodi.

### 3.5 Player avanzato

- Overlay fisso sempre visibile durante lo scroll.
- Controlli avanzati: play/pause, next/prev, timeline seek, volume, repeat/shuffle.
- Tema dinamico da copertina in tempo reale:
  - uso primario della pipeline colore esistente (`useCoverTone`),
  - fallback opzionale algoritmo color-thief client-side con cache in memoria per cover URL.
- Vincolo: non alterare in modo distruttivo la logica core del contesto player.

## 4) Architettura e data flow

- UI Shell:
  - `TopNav`, `Layout`, `AudioPlayer` come shell persistente.
  - Route-level transitions su `Home`, `PodcastPage`, `Contact`.
- Data layer Radio:
  - fetch RSS esterno -> normalizzazione -> stato pagina -> fallback UI.
  - guardie runtime su campi opzionali (cover/audio/date/title).
- Stato locale:
  - bookmark: `localStorage` versionato.
  - sleep timer: stato runtime con cleanup in `useEffect`.
  - repeat/shuffle: stato player UI con mapping su playlist corrente.
- Rendering realtime:
  - waveform/spectrum su `canvas`, aggiornamento via `requestAnimationFrame`.
  - throttling/debouncing su resize e redraw.

## 5) Accessibilita e compatibilita

- WCAG 2.1 AA:
  - focus ring visibile,
  - etichette ARIA complete su controlli iconici,
  - keyboard-first su player/radio/menu.
- Motion safety:
  - disabilitazione animazioni non essenziali con `prefers-reduced-motion`.
- Cross-browser:
  - validazione su Safari/Chrome/Firefox desktop + Safari/Chrome mobile.

## 6) Strategia test e verifica

- Unit test:
  - parser/fallback feed radio,
  - util waveform/spectrum,
  - timer sleep,
  - bookmark storage.
- Integration test:
  - flussi playback (play/seek/next/prev/repeat/shuffle),
  - routing CTA a `radio`/`contact`,
  - comportamento menu scroll-aware/mobile drawer.
- Verifiche obbligatorie:
  - `lint` -> `typecheck` -> `build`,
  - smoke visuale su viewport 390 / 768 / 1440,
  - controllo Core Web Vitals post-change.

## 7) Piano a tranche (raccomandato)

- Tranche A (prioritaria): redesign `Records` + redesign `Radio` + fix copertine.
- Tranche B: player overlay avanzato + transizioni route + nav migliorata.
- Tranche C: rimozioni mirate (`video`, `button` target), link social 1001Tracklists, cleanup semantico `span/div`.
- Tranche D: hardening test/perf/a11y + aggiornamento changelog finale.

## 8) Rischi principali e mitigazioni

- Rischio regressione prestazioni su waveform/theatre:
  - mitigazione: canvas ottimizzato, aggiornamenti limitati, fallback statico.
- Rischio regressione accessibilita su controlli custom:
  - mitigazione: keyboard map, aria audit, test assistivi manuali.
- Rischio incoerenza stilistica su redesign immersivo:
  - mitigazione: riuso token esistenti e validazione visuale multi-breakpoint.

## 9) Criteri di accettazione

- Nessun `video` footer residuo nel DOM/codice.
- Footer social contiene icona/link 1001Tracklists coerente al set icone.
- `Records` non usa piu riquadri tradizionali e mostra reveal progressivo.
- `Radio` mostra copertine in modo affidabile e supporta theatre, sleep timer, bookmark, visualizzazione audio.
- Player fixed con controlli avanzati e tema dinamico cover-based.
- CTA target navigano a `radio` e `contact` con transizioni fluide.
- Verifiche `lint`, `typecheck`, `build`, test e changelog completate.
