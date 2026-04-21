import React from 'react';

const links = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/techmyhouse.it',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/techmyhouse.it',
  },
  {
    label: 'SoundCloud',
    href: 'https://soundcloud.com/techmyhouse',
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/artist/0BmNhIapWYKfeHwPm563bA',
  },
  {
    label: '1001Tracklists',
    href: 'https://www.1001tracklists.com/dj/techmyhouse/index.html',
  },
];

export default function SocialLinks() {
  return (
    <ul className="flex flex-wrap items-center gap-3">
      {links.map(({ label, href }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
