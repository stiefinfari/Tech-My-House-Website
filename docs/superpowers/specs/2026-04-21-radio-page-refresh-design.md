# Radio Page Refresh (Footer + Radio + Theatre)

## Obiettivo
Rendere la sezione Radio più moderna e “club/cinematic”, migliorando:
- Footer “Community”: link puliti con logo, senza stile da pulsante.
- Hero della pagina Radio: logo più grande e più a sinistra, titolo con larghezza controllata.
- Archive episodi: card meno squadrate, più “editoriali”.
- Navigazione: click su episodio apre sempre una pagina dedicata interna.
- Theatre Mode: estetica più da club, tracklist selezionabile e navigabile al minutaggio.
- Player bottom: mostrare il brano corrente della tracklist mentre suona.

## Contesto attuale (punti chiave)
- Archive: `/radio` → `PodcastPage`.
- Dettaglio episodio: `/radio/:episodeCode` → `RadioEpisodePage`.
- Theatre Mode: overlay gestito dentro `AudioPlayer` via `RadioTheatre`.
- Tracklist: `useRealTracklist(...)` + fallback da summary; calcolo brano corrente con `getCurrentTrackIndex(...)`.

## Vincoli
- Non cambiare la logica core del player in `PlayerContext` (play/pause/next/prev e gestione playlist): interventi solo UI/UX e wiring intorno.
- 1001Tracklists: solo link (nessun embed), e nel footer resta solo icona (senza label).
- Supporto motion-reduce: gli effetti devono degradare puliti con preferenza di riduzione movimento.

## Requisiti funzionali
### Footer: sezione “Community”
- Rimuovere lo stile “social-link” se appare come pill/button.
- Mostrare elenco social come link testuali puliti:
  - Facebook / Instagram / SoundCloud / Spotify: icona + testo.
  - 1001Tracklists: solo icona, con tooltip/aria-label.
- Mantenere `target="_blank"` + `rel="noopener noreferrer"`.

### Pagina Radio: hero (titolo + logo)
- Ridurre la larghezza massima del titolo (`h1`) per lasciare spazio al logo.
- Spostare il logo più a sinistra e aumentare la dimensione:
  - Desktop: logo a sinistra, titolo a destra (layout due colonne o inline con max-width).
  - Mobile: layout che non “schiacci” il logo; preferenza logo più presente.

### Pagina Radio: archive episodi (card)
- Aggiornare lo stile delle card per risultare meno “squadrate”:
  - Angoli arrotondati (non eccessivi), bordi più soft, overlay gradient più raffinato.
  - Featured episode più “cinematic/editoriale” mantenendo gerarchia.
- Mantenere accessibilità e focus states.

### Click episodio → pagina dedicata interna (sempre)
- Ogni episodio deve avere una route interna dedicata.
- Strategia: garantire sempre `episodeCode` stabile:
  - Se mancante dal feed: generarlo lato `/api/radio-feed` da una chiave stabile (es. GUID/link/audioUrl) in formato URL-safe.
- Archive: ogni card linka sempre a `/radio/:episodeCode`.
- Dettaglio episodio: risolve l’episodio tramite `episodeCode` e mostra:
  - titolo, cover, player entrypoint, tracklist (se disponibile) + fallback.

## Theatre Mode “club”
### Look & feel (Laser + smoke)
- Fondo: cover blur + vignette + grana/nebbiolina discreta.
- Accenti: glow acido controllato (no eccesso), tipografia forte.
- Layout:
  - Area visual (cover / waveform) + pannello tracklist ben leggibile.
  - Tracklist con righe cliccabili, hover/focus, evidenziazione “Now”.

### Tracklist selezionabile → minutaggio
- Click su riga track: seek a `startSec`.
- Evidenzia brano corrente in base a `progress`.
- Scorrimento automatico sul brano corrente quando cambia (se theatre aperto).
- Navigazione tastiera:
  - ↑/↓ per selezione, Invio/Spazio per seek, ESC per chiudere.

## Player bottom: brano corrente della tracklist
- Se tracklist è disponibile e si può determinare il brano corrente:
  - Titolo principale: `Artist — Title` (brano corrente).
  - Titolo secondario: titolo episodio.
- Fallback pulito:
  - Titolo principale: titolo episodio.
  - Titolo secondario: artista generico (Tech My House) o vuoto.

## Non-obiettivi
- Nessun cambiamento a scraping/embedding esterni oltre al necessario per generare `episodeCode`.
- Nessuna modifica alla logica di playback del player (solo presentazione e wiring).

## Criteri di accettazione
- Footer “Community” non mostra pulsanti: solo link puliti con icona+testo (1001 solo icona).
- In Radio hero, logo è più grande e più a sinistra; titolo non occupa tutta la riga.
- Le card episodi hanno look moderno e meno squadrato.
- Click su qualsiasi episodio porta a una pagina interna dedicata.
- Theatre Mode appare più “club/cinematic” e mostra tracklist cliccabile con seek al minutaggio.
- Nel player bottom è visibile il brano corrente della tracklist mentre suona (quando disponibile).

