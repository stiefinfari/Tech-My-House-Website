import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import { artists } from '../../data';

export default function ArtistsSection() {
  const reducedMotion = useReducedMotionPreference();
  const featuredArtists = artists.filter(a => a.imageUrl);

  return (
    <section id="artists" className="py-20 sm:py-24 lg:py-28 relative border-t border-white/5">
      <div className="container-shell relative z-10">
        <div className="mb-12 flex flex-col gap-4">
          <div className="section-tag">Roster</div>
          <h2 className="section-title">Artists</h2>
        </div>

        {/* Mobile: horizontal scroll snap, Desktop: grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 pb-8 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {featuredArtists.map((artist) => (
            <motion.div
              key={artist.id}
              initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reducedMotion ? 0 : 0.5 }}
              className="group relative min-w-[280px] sm:min-w-0 snap-center snap-always flex flex-col"
            >
              <Link to={`/artist/${artist.id}`} className="block relative aspect-[3/4] overflow-hidden bg-dark mb-4 border border-white/5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-4 focus-visible:ring-offset-dark">
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full bg-ink-raise flex items-center justify-center">
                    <span className="font-display text-4xl font-bold text-white/10">{artist.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <div className="flex flex-col">
                <Link to={`/artist/${artist.id}`} className="inline-block outline-none">
                  <h3 className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-white mb-1 group-hover:text-acid transition-colors">
                    {artist.name}
                  </h3>
                </Link>
                <p className="font-sans text-smoke text-sm uppercase tracking-[0.2em]">
                  {artist.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}