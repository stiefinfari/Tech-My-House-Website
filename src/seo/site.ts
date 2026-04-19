export const SITE = {
  name: 'Tech My House',
  defaultTitle: 'Tech My House',
  defaultDescription:
    'Underground House, Tech House & Techno radio show. Unreleased records and unique DJ sets.',
  defaultKeywords:
    'tech my house, house music, tech house, techno, underground, dj set, radio show, podcast, events, electronic music, TMH records',
  url: (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://techmyhouse.it',
  ogImagePath: '/assets/tmh-logo-white.png',
};
