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
  },
];

export default function SocialLinks() {
  return (
    <ul className="flex flex-col gap-3">
      {links.map(({ label, href, icon: Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link-text"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
