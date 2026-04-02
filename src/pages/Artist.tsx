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
      <div className="min-h-screen flex items-center justify-center font-display text-4xl uppercase relative z-20">
        Artist not found
      </div>
    );
  }

  return (
    <div className="w-full pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
      <Link to="/#artists" className="inline-flex items-center gap-2 font-sans text-neon uppercase tracking-widest mb-12 hover:text-white transition-colors font-bold">
        <ArrowLeft size={20} /> Back to Artists
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[4/5] w-full"
        >
          <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 border-2 border-neon mix-blend-overlay pointer-events-none"></div>
        </motion.div>

        <div className="flex flex-col">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-6xl md:text-8xl font-extrabold uppercase leading-none mb-4"
          >
            {artist.name}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-sans text-xl text-neon font-bold uppercase tracking-widest mb-8"
          >
            {artist.role}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-sans text-lg leading-relaxed text-white/80 mb-16"
          >
            {artist.bio}
          </motion.div>

          {artistReleases.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="font-display text-3xl font-extrabold uppercase mb-8 border-b border-white/20 pb-4">Releases on TMH</h2>
              <div className="flex flex-col gap-6">
                {artistReleases.map(release => (
                  <div key={release.id} className="flex items-center gap-6 group cursor-pointer">
                    <div className="w-24 h-24 bg-zinc-900 relative overflow-hidden flex-shrink-0">
                      <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="text-neon" size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-extrabold uppercase group-hover:text-neon transition-colors">{release.title}</h3>
                      <p className="font-sans text-sm text-white/50 uppercase tracking-widest font-bold">{release.id} • {release.date}</p>
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
