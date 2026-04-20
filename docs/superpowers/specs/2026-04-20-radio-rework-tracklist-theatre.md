# Design Spec - Radio: Copertine, Theatre nel Player, Tracklist

## Contesto

La pagina Radio (`/podcast`) mostra l’archivio episodi e consente playback tramite il player globale.

Problema attuale: le copertine episodio (URL SoundCloud `i1.sndcdn.com/artworks-*`) sulla pagina Radio risultano spesso invisibili perché alcune varianti di URL/size vengono bloccate dal browser con `ERR_BLOCKED_BY_ORB`. In Home, alcune copertine risultano visibili perché vengono richieste con una size diversa, ma il comportamento non è affidabile e non garantito.

Inoltre, la modalità “Theatre” è attualmente implementata come overlay legato alla pagina Radio; vogliamo spostarla direttamente nel player globale.

Obiettivo aggiuntivo: ogni episodio deve avere tracklist completa (proveniente dal profilo Tech My House su 1001Tracklists) e il player deve evidenziare la traccia in riproduzione.

## Obiettivi

- Ripristinare la visibilità affidabile delle copertine episodio nella pagina Radio.
- Rimuovere il pannello “IMMERSIVE LISTENING” dalla pagina Radio.
- Implementare Theatre Mode direttamente nel player globale (overlay full-screen).
- Aggiungere tracklist per episodio:
  - Pagina Radio: tracklist completa per episodio con UI a accordion.
  - Player Theatre: evidenziare la traccia corrente in base al tempo di riproduzione.

## Non-obiettivi

- Non modificare la logica audio e la gestione playlist del `PlayerContext` (solo UI/UX sopra lo stato esistente).
- Non fare scraping live dal client di 1001Tracklists.
- Non integrare embed/SDK/API di 1001Tracklists.

## Decisioni di design

### 1) Copertine via proxy nostro

Implementare un endpoint server-side (Vercel Function) per servire le immagini tramite dominio TMH:

- Endpoint: `GET /api/image?url=<encoded>`
- Validazioni:
  - `url` obbligatoria
  - allowlist host (inizialmente `i1.sndcdn.com`, `i2.sndcdn.com`, `i3.sndcdn.com`)
  - accettare solo `http/https`
- Sicurezza e affidabilità:
  - timeout download
  - limite dimensione massima immagine scaricata
  - risposta con `Content-Type` coerente, `Cache-Control` (CDN) e gestione errori (fallback lato client)
- Frontend:
  - trasformare le `coverUrl` episodio in `coverProxyUrl` puntando all’endpoint (`/api/image?...`)
  - usare sempre `coverProxyUrl` negli `<img>` della pagina Radio e nel Theatre (quando mostra artwork episodio)

Razionale: elimina ORB/CORS/CORP lato browser perché la risorsa viene servita “first-party” con header corretti e caching controllabile.

### 2) Rimozione blocco “IMMERSIVE LISTENING”

Rimuovere il blocco UI con shuffle/sleep/theatre dalla pagina Radio.

Eventuali controlli (es. theatre) vengono spostati nel player globale; shuffle/sleep vengono considerati fuori scope se non richiesti altrove.

### 3) Theatre Mode nel player globale

Trasformare Theatre Mode in una vista del player:

- Trigger: bottone “THEATRE” nel player (o in una vista expanded del player).
- UI Theatre:
  - overlay full-screen
  - cover grande (se disponibile) + titolo episodio + stato play/pause
  - waveform/visualizer (riuso componente esistente)
  - sezione tracklist con highlight della traccia corrente
- Accessibilità:
  - focus trap e chiusura con ESC
  - `aria-modal` e label coerenti

Nota: la parte overlay può riusare parte dell’attuale `RadioTheatre`, ma deve essere disaccoppiata dalla pagina e vivere vicino al player (componenti del player).

### 4) Tracklist per episodio (importata, non live)

Tracklist gestite come dati locali nel repo (source-of-truth interno):

- Mappatura episodio → tracklist:
  - chiave primaria consigliata: `audioUrl` (quando presente) oppure `link` come fallback
- Struttura track:
  - `startSec` (number, obbligatorio)
  - `artist` (string, obbligatorio)
  - `title` (string, obbligatorio)
  - `label` (string, opzionale)
  - `mixNote` (string, opzionale)
  - `sourceUrl` (string, opzionale) con link alla pagina 1001Tracklists
- Pagina Radio:
  - UI accordion per episodio
  - CTA “View on 1001Tracklists” quando `sourceUrl` presente
- Player Theatre:
  - calcolo della traccia corrente: la tracklist è ordinata per `startSec` e si seleziona l’ultima traccia con `startSec <= currentTime`
  - highlight riga corrente
  - azione opzionale: click su traccia → seek a `startSec`

Razionale: affidabilità, performance e riduzione rischio di blocchi/rotture (HTML changes / anti-bot).

## Flussi UX principali

1) Utente apre Radio:
   - lista episodi con copertine sempre visibili (via proxy)
   - tracklist disponibili tramite accordion

2) Utente avvia un episodio:
   - playback tramite player globale
   - può aprire Theatre dal player e vedere tracklist con traccia corrente evidenziata

## Error handling

- Immagini:
  - se proxy fallisce: `<img onError>` torna a `DEFAULT_COVER`
  - proxy risponde con error code chiari (400 invalid url, 403 host non permesso, 502 fetch fallito)
- Tracklist:
  - se non presente: UI mostra “Tracklist not available” + link al profilo 1001Tracklists (se desiderato come fallback)

## Test e verifica

- Unit test:
  - utility selezione traccia corrente (dato `currentTime` e lista `startSec`)
  - validazione URL/allowlist del proxy
- Manuale:
  - pagina Radio: nessun `ERR_BLOCKED_BY_ORB` su immagini
  - theatre: focus trap, ESC, close button
  - highlight traccia si aggiorna durante playback

## Rischi / note

- Proxy immagini aumenta traffico server-side: serve caching aggressivo e limiti.
- Tracklist “importata” richiede manutenzione manuale (aggiunta episodi nuovi).

