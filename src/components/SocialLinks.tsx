import React from 'react';

const links = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/techmyhouse.it',
    icon: 'facebook' as const,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/techmyhouse.it',
    icon: 'instagram' as const,
  },
  {
    label: 'SoundCloud',
    href: 'https://soundcloud.com/techmyhouse',
    icon: 'soundcloud' as const,
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/artist/0BmNhIapWYKfeHwPm563bA',
    icon: 'spotify' as const,
  },
];

function Icon({ name }: { name: (typeof links)[number]['icon'] }) {
  switch (name) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.2-1.5 1.6-1.5H16.8V5c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V11H7.2v3h2.6v8h3.7z"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm10.6 1.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
          />
        </svg>
      );
    case 'soundcloud':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M12.7 7.3c-.3 0-.5 0-.8.1v10.6h6.2a3.1 3.1 0 0 0 0-6.2h-.4A4.8 4.8 0 0 0 12.7 7.3Zm-3.1 3.2a.7.7 0 0 0-.7.7v6.8c0 .4.3.7.7.7s.7-.3.7-.7v-6.8c0-.4-.3-.7-.7-.7Zm-2.5.5a.7.7 0 0 0-.7.7v5.6c0 .4.3.7.7.7s.7-.3.7-.7v-5.6c0-.4-.3-.7-.7-.7Zm-2.3 1.1a.7.7 0 0 0-.7.7v3.4c0 .4.3.7.7.7s.7-.3.7-.7v-3.4c0-.4-.3-.7-.7-.7Z"
          />
        </svg>
      );
    case 'spotify':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M12 2a10 10 0 1 0 .001 20A10 10 0 0 0 12 2Zm4.6 14.5a.8.8 0 0 1-1.1.3c-2.6-1.6-5.9-2-9.7-1.1a.8.8 0 1 1-.4-1.5c4.2-1 7.9-.6 10.8 1.3.4.2.5.7.4 1Zm.9-3a.9.9 0 0 1-1.2.3c-3-1.8-7.5-2.4-11-1.3a.9.9 0 0 1-.5-1.7c4-1.2 9-0.6 12.4 1.5.4.2.5.8.3 1.2Zm.1-3.2c-3.5-2.1-9.2-2.3-12.5-1.3a1 1 0 0 1-.6-1.8c3.8-1.2 10.1-1 14.2 1.5a1 1 0 0 1-1.1 1.6Z"
          />
        </svg>
      );
  }
}

export default function SocialLinks() {
  return (
    <ul className="flex flex-wrap items-center gap-3">
      {links.map(({ label, href, icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="btn-icon h-11 w-11"
          >
            <Icon name={icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
