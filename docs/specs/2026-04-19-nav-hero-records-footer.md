# Nav/Hero/Records/Footer refinement
Date: 2026-04-19
Spec ID: nav-hero-records-footer
Depends on: none

## 1. Goal (1–3 lines)
Rendere la navigazione desktop/mobile coerente e affidabile, eliminare overlap nel blocco hero, trasformare la sezione Records in contenuto dinamico data-driven e chiudere il layout con footer professionale che esponga chiaramente il partner logo.  
La soluzione deve rispettare estetica club/industrial dark, leggibilità AA e riduzione motion.

## 2. Brand alignment
- Reference 1: docs/brand/references/README.md — prendiamo “gerarchia tipografica forte” e “nav compatta con stato attivo evidente” per chiarire orientamento pagina senza rumore.
- Reference 2: docs/brand/references/README.md — prendiamo “spacing arioso + CTA ad alto contrasto” ed evitiamo “blocchi densi/testo addossato” per prevenire overlap hero e footer affollato.

## 3. Layout (wire description, no code)
- **Shell globale:** header fisso `72px` + safe area; `main` con offset top totale `100px` confermato; griglia base `container-shell` invariata (`max-w-7xl`, `px-4/6/10`).
- **Nav desktop (`lg+`):** logo a sinistra, link centrali, CTA a destra; distanza logo→menu `48px`, gap link `28px`; stato attivo con underline persistente e testo `text-white`; rimuovere link non risolti o mappare solo ID esistenti (`records`, `artists`, `footer`, route `podcast`).
- **Nav mobile (`<lg`):** header compatto con wordmark e trigger menu; drawer full-height con close in alto dx, lista link verticale, CTA unica in fondo; area click minima `44x44`.
- **Hero:** blocco contenuti confinato in colonna max `max-w-5xl`; distanza top contenuto dal bordo viewport: `clamp(112px, 14vh, 152px)` per evitare collisione con nav; stack: badge → H1 3 righe → script line → metadata → CTA; blocco “scroll” ancorato a fondo con margine sicurezza `32px`.
- **Records (dinamica):** sezione divisa 2 colonne (`lg: 1.1fr / 1fr`): colonna sx editoriale, colonna dx lista release dinamica (max 4 item visibili) + fallback “coming soon”; form notify rimane sotto lista.
- **Footer professionale:** griglia 3 colonne su desktop, 1 colonna su mobile; introduzione brand, navigazione rapida, social/compliance; sotto-griglia “Partners” con logo card (attuale: Gaia Circle Lab) e slot estendibili.
- **Motion/fallback:** transizioni solo su opacità/colore/underline (180–240ms); con `prefers-reduced-motion` nessun translate/scale, stato mostrato istantaneo.

## 4. Typography
| Element | Font | Size (clamp) | Weight | Tracking | Case |
|---|---|---|---|---|---|
| Nav link desktop | Syne (`font-display`) | `11px` | 700 | `0.20em` | UPPERCASE |
| Nav link mobile drawer | Syne (`font-display`) | `clamp(2rem,8vw,3rem)` | 800 | `-0.01em` | UPPERCASE |
| Hero H1 | Syne (`display-title`) | `clamp(3rem,10vw,8.5rem)` | 800 | `-0.045em` | UPPERCASE |
| Hero line espressiva | MadeSoulmaze (`accent-script`) | `clamp(1.5rem,3.8vw,2.8rem)` | 400 | `0` | Title |
| Records title | Syne + MadeSoulmaze | `clamp(4rem,14vw,12rem)` | 800/400 | `-0.04em / 0` | UPPERCASE + Title |
| Record item meta | Space Mono (`font-mono`) | `10–11px` | 400 | `0.18–0.24em` | UPPERCASE |
| Footer headings | Syne (`font-display`) | `11px` | 700 | `0.18em` | UPPERCASE |
| Footer body | Space Grotesk (`font-sans`) | `14–16px` | 400 | `0–0.01em` | Sentence |

## 5. Color tokens used
- Base: `ink`, `ink-raise`, `concrete`, `cement`.
- Testo: `white`, `smoke`, `plaster`.
- Azioni/stati: `acid`, `acid-deep`, `acid-wash`.
- Bordi/overlay: `white/10`, `white/14`, `acid/25`, `acid/50`.
- Partner logo treatment: default `white/85` con opacità ridotta, hover su accento `acid`.
- Nuovi token: **none richiesti** (riuso completo di palette già in `tailwind.config.js`).

## 6. Textures & decorative layers
- Hero mantiene video/poster con overlay radiale + gradiente bottom per garantire contrasto testo (vincolo brief: niente testo critico senza overlay).
- Records mantiene `cement-texture` + bordo sottile `white/10`; decorazioni limitate a tape-strip e grain già esistenti.
- Footer usa superfici pulite `bg-ink/70` con bordo tecnico, senza glow diffuso per evitare rumore visivo.
- Partner logos in card neutra (sfondo `ink-raise`, bordo `white/10`) per coerenza industrial.
- Motion/fallback: eventuale shimmer/logo-hover solo su opacità (200ms); in reduced motion nessuna animazione, solo cambio colore statico al focus/hover.

## 7. Interactions & motion
- **Nav desktop:** underline da `scale-x-0` a `scale-x-100` in `200ms ease`; active persistente in base a route/hash valida.
- **Nav mobile drawer:** apertura/chiusura `220–280ms` con fade+slide verticale; riduzione motion: fade semplice `<=120ms` o cambio istantaneo.
- **Hero CTA:** hover con micro-lift già previsto dal design system button; riduzione motion: disattivare transform mantenendo contrasto colore.
- **Records dinamica:** item hover evidenzia bordo + titolo; sorting cronologico discendente per data release; stato fallback se dataset vuoto.
- **Footer partner:** logo link con focus ring acid e label accessibile; hover lieve incremento opacità, senza zoom aggressivo.
- **Motion budget:** nessuna animazione infinita su contenuto critico; mantenere bounce “scroll” solo se non reduced-motion.

## 8. Responsive (mobile / tablet / desktop)
- **Mobile 390px:** header sempre a singola riga; hero H1 max 3 righe senza clipping; CTA in colonna se spazio insufficiente; records lista singola colonna; footer stack verticale con partner logo full-width.
- **Tablet 768px:** nav ancora drawer; hero aumenta respiro laterale (`px-6`); records passa a layout 2 blocchi verticali con lista prima del form; footer 2 colonne + partner row sotto.
- **Desktop 1440px:** nav inline completa; hero allineato a sinistra con ampio negative space; records 2 colonne con lista a dx; footer 3 colonne + barra partner separata.
- **Breakpoints operativi:** usare breakpoints progetto (`mobile max 768`, `tablet 769–1024`, `desktop 1025+`).
- **Motion/fallback responsive:** stessa semantica su tutti i breakpoint; su touch ridurre hover-only affordance e mantenere focus-visible evidente.

## 9. Accessibility notes
- Contrasto testo su hero garantito da overlay (target AA per testo normale e UI controls).
- Tutti i trigger iconici (menu/close/social-only) con `aria-label` esplicita.
- Drawer: focus trap, chiusura con `Esc`, restore focus sul trigger alla chiusura.
- Active nav annunciabile via `aria-current="page"` o equivalente stato per hash section.
- Partner logos: `alt` significativo e link con nome partner testuale disponibile a screen reader.
- Reduced motion obbligatorio: nessun movimento non essenziale se `prefers-reduced-motion`.

## 10. Implementation notes for Frontend Surgeon
- Consolidare una singola sorgente dati nav (`NAV_LINKS`) con campi: `label`, `type` (`route|hash`), `target`, `enabled`; filtrare target non presenti nel DOM.
- Aggiornare logica active link: route-based per `/podcast`, intersection/hash-based per sezioni home; evitare mismatch hash vuoto.
- Hero: ridurre dimensioni H1 su viewport bassi (`max-height < 760`) e aumentare top padding dinamico; preservare overlay esistente.
- Records: introdurre dataset tipizzato in `src/data.ts` (es. `records[]` con artista, titolo, catalog, data, stato); render list ordinata + fallback.
- Footer: estrarre blocco partner in componente dedicato (`PartnerStrip`) riusando asset esistente `/assets/gcl-logo-text.png`; predisporre array partner per scalabilità.
- QA layout obbligatoria su 390/768/1440 con screenshot comparativi in `test-results/`; verificare assenza overlap hero e target touch minimi.

## 11. Out of scope
- Integrazione backend reale per submit form Records (resta placeholder UX o mock endpoint).
- Restyling completo delle altre sezioni (Artists/Radio) non citate.
- Nuova brand identity o introduzione di nuovi font/token cromatici.
- Localizzazione multilingua contenuti.
