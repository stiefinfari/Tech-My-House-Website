# Tech My House Website

Official website for **Tech My House** — underground House, Tech House & Techno radio show and lifestyle.

## Stack
- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## Development
```bash
npm install
npm run dev
```

## UX Improvements
- Modern responsive navbar with animated mobile menu and smooth section scrolling.
- New preloader (2–3s max) featuring the TMH logo + progress bar.
- Hero title on a single line with fluid responsive sizing.
- “Permanent Marker” typography applied only to “Where music unites” and “Records”.
- Social buttons (Facebook, Instagram, SoundCloud) + external links (Apple Podcasts, 1001Tracklists).
- System cursor restored, with yellow glow effect on interactive elements.
- Touch-friendly targets (>= 44px) for mobile usability.

## SEO
- Full meta tags (title/description/keywords, Open Graph, Twitter Cards).
- JSON-LD schema (Organization + PodcastSeries + MusicRecording).
- Sitemap generation on build and robots.txt.

### Sitemap
`npm run build` runs a prebuild step that writes `public/sitemap.xml`.

### Base URL
Set `VITE_SITE_URL` for correct canonical/OG URLs and sitemap output:
```bash
VITE_SITE_URL=https://techmyhouse.it
```

## Build
```bash
npm run build
npm run preview
```
