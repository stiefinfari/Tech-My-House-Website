# Design Spec - Pagina Radio (ex Podcast) + Episode Detail + Tracklist 1001

Data: 2026-04-20  
Stato: Proposta (in attesa di conferma)

## 1) Obiettivo

Rivisitare la pagina “Radio” rendendola la destinazione principale al posto di `/podcast`, alimentata dal feed RSS SoundCloud ufficiale e con una pagina dettaglio episodio “carina e figa” che mostra la tracklist completa recuperata da 1001Tracklists in modo dinamico e auto-aggiornante quando il feed pubblica nuovi episodi.

## 2) Decisioni confermate

- Il path pubblico diventa `/radio` (e non `/podcast`).
- Il feed di origine è `https://feeds.soundcloud.com/users/soundcloud:users:1042711684/sounds.rss`.
- Tracklist “full” integrata nel sito in modo dinamico da 1001Tracklists, con strategia che si aggiorna automaticamente al pubblicarsi di nuovi episodi.
- Rimozione del blocco filtri attuale (il `div` con i bottoni ALL/HOUSE/TECH HOUSE/TECHNO/HARD TECHNO).
- A destra dell’`h1` “RADIO SHOW” viene mostrato il logo `TMH_LOGO_WHITE.png` che ruota in senso orario, con rotazione centrata sul centro geometrico del cerchio del logo.

## 3) Scope

### 3.1 In scope

- Rinomina routing e link interni da `/podcast` a `/radio` (nav, footer, CTA, sitemap, dati).
- Redirect compatibilità: `/podcast` continua a funzionare e porta a `/radio`.
- Nuova pagina dettaglio episodio: `/radio/:episodeCode`.
- Nuova data pipeline serverless per:
  - fetch + parse RSS SoundCloud (server-side) → JSON normalizzato
  - fetch + parse pagina 1001Tracklists (server-side) → tracklist normalizzata
- UI nuova per archive “Radio” e per episode detail, mantenendo coerenza con look TMH (ink/acid/mono/display).
- Logo rotante a fianco dell’H1 in hero.

### 3.2 Out of scope (per questa tranche)

- Modifiche alla logica core audio (`PlayerContext` / `playTrack` / `playNext`): si lavora su routing, UI e data layer.
- Feature extra (waveform, sleep timer, bookmark): non incluse salvo richieste esplicite.

## 4) Routing e URL

### 4.1 Route

- `/radio` → pagina archive (lista episodi dal feed).
- `/radio/:episodeCode` → pagina dettaglio (episodio singolo + tracklist).
- `/podcast` → redirect a `/radio` (compatibilità).

### 4.2 Convenzione `episodeCode`

- Formato canonico: `ep###` minuscolo (es. `ep133`).
- Matching:
  - estrazione da titolo RSS (pattern `EP133`, `EP 133`, `ep133`) normalizzato a `ep133`.
  - se mancante, fallback su `guid`/link SoundCloud per identificazione stabile.

## 5) Data layer

### 5.1 Endpoint feed (SoundCloud RSS)

Nuovo endpoint:

- `GET /api/radio-feed`
  - Input: opzionali `before`/`limit` se vogliamo paginazione; default “prima pagina” del feed.
  - Output: JSON normalizzato con campi stabili per UI:
    - `episodeCode`, `title`, `publishedAt`, `durationSec`, `soundcloudUrl`, `audioUrl`, `coverUrl`
    - `summary` (estratto da description/itunes:summary)
    - `tracklistUrl` (se presente in description, tipicamente `1001.tl/...` o `1001tracklists.com/...`)
  - Caching: `Cache-Control: public, s-maxage=600, stale-while-revalidate=3600` per auto-update senza martellare il feed.

Motivazione: non dipendere da servizi terzi `rss2json` e avere controllo su caching e normalizzazione.

### 5.2 Endpoint tracklist (1001Tracklists)

Nuovo endpoint:

- `GET /api/tracklist?url=<encoded>`
  - Input: `url` deve essere allowlistato su host 1001 (`1001.tl`, `www.1001tracklists.com`, `1001tracklists.com`).
  - Output JSON:
    - `sourceUrl` (final URL dopo redirect)
    - `items`: array ordinato con:
      - `index`
      - `artist`
      - `title`
      - `label` (se disponibile)
      - `timeSec` (se disponibile) + `timeText`
  - Caching: `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800` (tracklist cambia raramente; resilienza a blocchi).
  - Fallback:
    - se parsing fallisce o la pagina è protetta/obfuscata: rispondere con `items: []` e lasciare alla UI un “Open on 1001”.

Parsing strategy:

- Primo tentativo: estrazione da markup HTML server-rendered (senza eseguire JS).
- Secondo tentativo: estrazione da eventuale JSON inline (se presente) nel documento.
- Non eseguire rendering headless.

## 6) UX/UI

### 6.1 Pagina `/radio` (archive)

Hero:

- `h1` “RADIO SHOW” + logo a destra:
  - layout: testo a sinistra, logo in un box quadrato a destra, allineato verticalmente al centro della riga principale
  - animazione: rotazione continua clockwise, `transform-origin: 50% 50%` sul contenitore immagine
  - motion-safety: rispettare `prefers-reduced-motion` (fermare animazione o ridurla drasticamente)

Lista episodi:

- Card/lista con copertina (via policy `toSafeCoverUrl` → proxy `/api/image` per evitare blocchi), titolo, data, durata.
- CTA:
  - “Play” (usa player esistente)
  - “Open episode” (naviga a `/radio/ep###`)
- Micro-interazioni:
  - hover accent acid su border/testo
  - reveal leggero su scroll (solo CSS, no dipendenza aggiuntiva)

Rimozioni:

- Eliminare completamente il blocco filtri (il `div` selezionato).

### 6.2 Pagina `/radio/:episodeCode` (episode detail)

Header:

- Cover grande + meta (titolo, data, durata).
- Pulsante “Play episode”.
- Pulsante “Tracklist on 1001” sempre presente se `tracklistUrl` esiste.

Tracklist:

- Se `items` disponibili: lista numerata “editoriale” (molto leggibile, mono per indici e timecode).
- Se `items` vuoti:
  - stato “loading” (skeleton)
  - stato “unavailable” (messaggio breve + link a 1001).

SEO base:

- Title/description dinamici per episodio.

## 7) Aggiornamento automatico con nuovi episodi

- La lista episodi deriva direttamente dal feed RSS tramite `GET /api/radio-feed` con caching CDN breve.
- La UI ricarica quando l’utente apre la pagina (nessun rebuild necessario).
- La pagina episodio non richiede pre-generazione: risolve episodio lato client cercandolo nel feed e poi arricchisce con `/api/tracklist`.

## 8) Sicurezza e stabilità

- Allowlist host per `/api/tracklist` e `/api/radio-feed` per evitare SSRF.
- Timeout e size limits su fetch (pattern già usato in `/api/image`).
- Sanitizzazione output: nessun HTML raw renderizzato; solo testo.
- Rate limiting (opzionale) su `/api/tracklist` se emergono abusi.

## 9) Criteri di accettazione

- Navigazione e link interni puntano a `/radio`, non a `/podcast`.
- `/podcast` porta a `/radio` senza 404.
- `/radio` mostra episodi dal feed RSS SoundCloud indicato.
- Il blocco filtri (div con bottoni) non è presente.
- Il logo bianco a destra dell’H1 ruota in senso orario con origine centrata sul cerchio e rispetta `prefers-reduced-motion`.
- Ogni episodio ha una pagina dettaglio “curata” con sezione tracklist:
  - se esiste link 1001, tenta estrazione serverless e mostra i brani in lista;
  - se estrazione fallisce, mostra fallback con link esterno, senza rompere la pagina.

## 10) File coinvolti (indicativi)

- Routing: `src/App.tsx`
- Nav/Footer/CTA: `src/components/TopNav.tsx`, `src/components/Layout.tsx`, `src/components/MobileDrawer.tsx`, `src/components/AudioPlayer.tsx`
- Radio pages: `src/pages/PodcastPage.tsx` (rinominabile), nuova `src/pages/RadioEpisodePage.tsx`
- Data utils: `src/utils/episodeFeed.ts`, `src/utils/imagePolicy.ts`
- Serverless: `api/radio-feed.js`, `api/tracklist.js`
- Sitemap/prefetch: `scripts/generate-sitemap.mjs`, `src/components/TextLink.tsx`, `src/data.ts`
