import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Facebook, Globe, Instagram, Youtube } from 'lucide-react';
import { artists, type ArtistSocialKey } from '../data';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';

export default function Artist() {
  const { id } = useParams<{ id: string }>();
  const artist = artists.find(a => a.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const jsonLd = useMemo(() => {
    if (!artist) {
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Artist not found • ${SITE.name}`,
        url: new URL('/artist', SITE.url).toString(),
      };
    }

    const pageUrl = new URL(`/artist/${artist.id}`, SITE.url).toString();
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfilePage',
          url: pageUrl,
          name: `${artist.name} • ${SITE.name}`,
          about: { '@type': 'Person', name: artist.name },
        },
        {
          '@type': 'Person',
          name: artist.name,
          description: artist.bio,
          ...(artist.imageUrl ? { image: new URL(artist.imageUrl, SITE.url).toString() } : {}),
          url: pageUrl,
        },
      ],
    };
  }, [artist]);

  useSeo({
    title: artist?.name ?? 'Artist',
    path: artist ? `/artist/${artist.id}` : '/artist',
    description: artist?.bio ?? 'Artist not found.',
    jsonLd,
  });

  if (!artist) {
    return (
      <div className="relative z-20 flex min-h-screen items-center justify-center font-display text-4xl uppercase">
        Artist not found
      </div>
    );
  }

  const iconByKey: Record<ArtistSocialKey, React.ComponentType<{ size?: string | number; className?: string }>> = {
    instagram: Instagram,
    soundcloud: Globe,
    youtube: Youtube,
    tiktok: Globe,
    facebook: Facebook,
    website: Globe,
  };

  const labelByKey: Record<ArtistSocialKey, string> = {
    instagram: 'Instagram',
    soundcloud: 'SoundCloud',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    facebook: 'Facebook',
    website: 'Website',
  };

  const socials = (Object.keys(artist.socials) as ArtistSocialKey[])
    .map((key) => ({ key, href: artist.socials[key] }))
    .filter((item): item is { key: ArtistSocialKey; href: string } => Boolean(item.href));

  const initials = artist.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="container-shell relative z-20 w-full pb-24 pt-28 sm:pt-32">
      <Link to="/" className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-acid transition-colors hover:text-white sm:mb-12">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
        >
          {artist.imageUrl ? (
            <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_40%_30%,rgba(204,255,0,0.10),transparent_55%)]">
              <div className="relative inline-flex h-40 w-40 items-center justify-center rounded-[2.5rem] border border-white/10 bg-white/[0.02]">
                <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] border border-acid/35 mix-blend-screen" />
                <span className="font-display text-6xl font-extrabold uppercase tracking-[-0.06em] text-white/90">
                  {initials || 'TM'}
                </span>
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 border border-acid/25 mix-blend-screen" />
        </motion.div>

        <div className="flex flex-col">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3 font-display text-[clamp(2.3rem,8vw,5.8rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.07em]"
          >
            {artist.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 text-sm uppercase tracking-[0.24em] text-acid sm:text-base"
          >
            {artist.role}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12 text-base leading-relaxed text-white/78 sm:text-lg"
          >
            {artist.bio}
          </motion.div>

          {socials.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <h2 className="mb-6 border-b border-white/20 pb-3 font-display text-3xl font-extrabold uppercase tracking-[-0.04em]">
                Connect
              </h2>
              <div className="flex flex-wrap gap-3">
                {socials.map(({ key, href }) => {
                  const Icon = iconByKey[key];
                  return (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center gap-3 rounded-full border border-white/15 bg-white/[0.02] px-5 text-xs font-bold uppercase tracking-[0.22em] text-white/75 transition-all duration-300 hover:border-acid/40 hover:bg-white/[0.06] hover:text-white"
                    >
                      <Icon size={18} />
                      {labelByKey[key]}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
