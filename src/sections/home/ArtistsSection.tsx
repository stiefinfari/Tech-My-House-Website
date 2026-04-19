import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import { artists } from '../../data';
import TMHWallpaper from '../../components/TMHWallpaper';
import TopoBlob from '../../components/TopoBlob';

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function ArtistsSection() {
  const reducedMotion = useReducedMotionPreference();

  return (
    <section id="artists" className="py-20 sm:py-24 lg:py-28 relative border-t border-white/5">
      <div className="container-shell relative z-10">
        <div className="mb-12 flex flex-col gap-4">
          <div className="section-tag">Roster</div>
          <h2 className="section-title">Artists</h2>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-1 sm:grid-cols-2">
          {artists.map((artist) => (
            <motion.div
              key={artist.id}
              initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reducedMotion ? 0 : 0.5 }}
              className="group"
            >
              <Link
                to={`/artist/${artist.id}`}
                className="relative block aspect-[3/4] overflow-hidden border border-white/10 bg-ink outline-none transition-colors duration-300 group-hover:border-acid/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              >
                {artist.imageUrl ? (
                  <div className="duotone-acid h-full w-full">
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="cement-texture relative flex h-full w-full items-center justify-center">
                    <div className="text-cement-light">
                      <TMHWallpaper opacity={0.12} mode="mixed" />
                    </div>
                    <TopoBlob
                      seed={Number(artist.id) || 132}
                      size={240}
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-acid/20"
                    />
                    <span className="display-title relative z-10 text-[clamp(3rem,9vw,6rem)] text-acid">
                      {getInitials(artist.name)}
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="display-title text-3xl text-white">
                    {artist.name}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">
                    {artist.role}
                  </p>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <div className="h-[3px] bg-acid" />
                  <div className="bg-ink/90 px-4 py-2 font-display text-[11px] uppercase tracking-[0.18em] text-acid">
                    VIEW PROFILE →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="font-accent text-[clamp(1.2rem,3vw,2.2rem)] leading-tight text-acid">
            two selectors, one warehouse, zero compromise.
          </p>
        </div>
      </div>
    </section>
  );
}
