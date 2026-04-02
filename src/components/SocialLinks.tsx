import React from 'react';
import { Facebook, Instagram, ListMusic, Radio } from 'lucide-react';

type Variant = 'default' | 'compact';

const SoundCloudIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M7.4 11.1c-.4 0-.8.3-.8.8v7.2c0 .5.4.8.8.8.5 0 .8-.3.8-.8v-7.2c0-.5-.3-.8-.8-.8Zm-2.6.8c-.4 0-.8.3-.8.8v5.6c0 .5.4.8.8.8.5 0 .8-.3.8-.8v-5.6c0-.5-.3-.8-.8-.8Zm-2.6 1c-.4 0-.8.3-.8.8v3.6c0 .5.4.8.8.8.5 0 .8-.3.8-.8v-3.6c0-.5-.3-.8-.8-.8Zm10.4-3.7c-1 0-2 .3-2.8.9-.2.1-.3.4-.3.6v8.4c0 .5.4.9.9.9h6.7c2 0 3.6-1.6 3.6-3.6s-1.6-3.6-3.6-3.6c-.2 0-.4 0-.7.1-.4-2-2.1-3.7-4.8-3.7Z" />
  </svg>
);

const links = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/techmyhouse.it',
    Icon: Facebook,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/techmyhouse.it',
    Icon: Instagram,
  },
  {
    label: 'SoundCloud',
    href: 'https://soundcloud.com/techmyhouse',
    Icon: SoundCloudIcon,
  },
  {
    label: 'Apple Podcasts',
    href: 'https://podcasts.apple.com/us/podcast/tech-my-house-radio-show/id1555228660',
    Icon: Radio,
  },
  {
    label: '1001Tracklists',
    href: 'https://www.1001tracklists.com/source/spu8cv/tech-my-house/index.html',
    Icon: ListMusic,
  },
];

export default function SocialLinks({ variant }: { variant: Variant }) {
  const isCompact = variant === 'compact';

  return (
    <div className={`flex flex-wrap ${isCompact ? 'gap-2' : 'gap-3'} items-center`}>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-glow
          aria-label={label}
          className={`inline-flex items-center ${isCompact ? 'h-11 px-3' : 'h-11 px-4'} rounded-full border border-white/15 bg-white/[0.02] hover:bg-white/[0.06] hover:border-neon/40 transition-all duration-300`}
        >
          <span className="inline-flex items-center justify-center w-6">
            <Icon size={18} />
          </span>
          <span className={`${isCompact ? 'text-[11px]' : 'text-xs'} font-sans font-bold uppercase tracking-[0.22em] text-white/70 hover:text-white transition-colors`}>
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}

