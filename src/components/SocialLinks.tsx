import React from 'react';
import TextLink from './TextLink';

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
    label: 'Apple Podcasts',
    href: 'https://podcasts.apple.com/us/podcast/tech-my-house-radio-show/id1555228660',
  },
  {
    label: '1001Tracklists',
    href: 'https://www.1001tracklists.com/source/spu8cv/tech-my-house/index.html',
  },
];

export default function SocialLinks() {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 font-display text-[11px] font-extrabold uppercase tracking-[0.28em] text-white/70">
      {links.map(({ label, href }) => (
        <li key={label}>
          <TextLink href={href} target="_blank" className="textlink-subtle">
            {label}
          </TextLink>
        </li>
      ))}
    </ul>
  );
}
