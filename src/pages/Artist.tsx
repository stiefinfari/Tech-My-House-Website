import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import { artists, releases } from '../data';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';

export default function Artist() {
  const { id } = useParams<{ id: string }>();
  const artist = artists.find(a => a.id === id);
  const artistReleases = useMemo(() => {
    if (!artist) return [];
    return releases.filter(r => r.artist === artist.name);
  }, [artist]);

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
          image: new URL(artist.imageUrl, SITE.url).toString(),
          url: pageUrl,
        },
        ...artistReleases.map((r) => ({
          '@type': 'MusicRecording',
          name: r.title,
          byArtist: { '@type': 'Person', name: r.artist },
          datePublished: r.date,
          url: r.link,
          image: new URL(r.coverUrl, SITE.url).toString(),
          publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
        })),
      ],
    };
  }, [artist, artistReleases]);

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

  return (
    <div className="container-shell relative z-20 w-full pb-24 pt-28 sm:pt-32">
      <Link to="/#artists" className="mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neon transition-colors hover:text-white sm:mb-12">
        <ArrowLeft size={20} /> Back to Artists
      </Link>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
        >
          <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover grayscale" />
          <div className="pointer-events-none absolute inset-0 border border-neon/40 mix-blend-screen" />
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
            className="mb-8 text-sm uppercase tracking-[0.24em] text-neon sm:text-base"
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

          {artistReleases.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="mb-6 border-b border-white/20 pb-3 font-display text-3xl font-extrabold uppercase tracking-[-0.04em]">Releases on TMH</h2>
              <div className="flex flex-col gap-5">
                {artistReleases.map(release => (
                  <div key={release.id} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:gap-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-900 sm:h-24 sm:w-24">
                      <img src={release.coverUrl} alt={release.title} loading="lazy" className="h-full w-full object-cover grayscale transition-[transform,filter] duration-300 group-hover:scale-105 group-hover:grayscale-0" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="text-neon" size={24} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-extrabold uppercase tracking-[-0.04em] transition-colors group-hover:text-neon">{release.title}</h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">{release.id} • {release.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
