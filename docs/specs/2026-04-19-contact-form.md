# Contact Form (Tech My House)

## Frontend
- Componente: `src/components/ContactForm.tsx`
- Endpoint: `POST /api/contact`
- Campi: `name`, `email`, `subject` (opzionale), `message`
- Anti-spam: honeypot `company` (hidden)
- Dev locale: se `/api/contact` ritorna 404 su `localhost/127.0.0.1`, fallback su `mailto:info@techmyhouse.it`.

## Backend (Vercel Function)
- Endpoint: `api/contact.js`
- Rate limit: 3 richieste / 60s per IP via Redis

## Environment variables (Vercel)
- `SMTP_USER` (utente SMTP)
- `SMTP_PASS` (password/app password SMTP)
- `KV_URL` oppure `REDIS_URL` (Redis per rate limit)
- `CONTACT_TO` (opzionale, default `info@techmyhouse.it`)

## Notes
- Nessun secret va committato nel repo.
- Per il deploy su Vercel e necessario configurare le env vars nel progetto.
