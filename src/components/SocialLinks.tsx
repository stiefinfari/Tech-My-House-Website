import React from 'react';
import { Cloud, Facebook, Instagram, ListMusic, Music2 } from 'lucide-react';

const links = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/techmyhouse.it',
    icon: Facebook,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/techmyhouse.it',
    icon: Instagram,
  },
  {
    label: 'SoundCloud',
    href: 'https://soundcloud.com/techmyhouse',
    icon: Cloud,
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/artist/0BmNhIapWYKfeHwPm563bA',
    icon: Music2,
  },
  {
    label: '1001Tracklists',
    href: 'https://www.1001tracklists.com/dj/techmyhouse/index.html',
    icon: ListMusic,
    iconOnly: true,
  },
];

export default function SocialLinks() {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-3">
      {links.map(({ label, href, icon: Icon, iconOnly }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="textlink font-mono text-[10px] uppercase tracking-[0.24em]"
            aria-label={iconOnly ? label : undefined}
            title={iconOnly ? label : undefined}
          >
            <Icon className="h-4 w-4 text-white/60" aria-hidden="true" />
            {iconOnly ? (
              <span className="sr-only">{label}</span>
            ) : (
              <span className="text-white/70">{label}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
