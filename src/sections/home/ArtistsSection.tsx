import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import { artists } from '../../data';
import { usePlayer } from '../../context/PlayerContext';

const DESKTOP_ASPECTS = ['desktop:aspect-[4/5]', 'desktop:aspect-[3/4]', 'desktop:aspect-[4/5]', 'desktop:aspect-[3/4]', 'desktop:aspect-[4/5]', 'desktop:aspect-[3/4]'];
const DESKTOP_OFFSETS = new Set([1, 4]);

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function ArtistsSection() {
  const reducedMotion = useReducedMotionPreference();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  return (
    <section id="artists" className="py-20 sm:py-24 lg:py-28 relative border-t border-white/5">
      <div className="container-shell relative z-10">
        <div className="mb-12 flex flex-col gap-4">
          <div className="section-tag">Roster</div>
          <h2 className="section-title">Artists</h2>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-dark to-transparent mobile:block hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-dark to-transparent mobile:block hidden" />
          <div className="mobile:[mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 tablet:mx-0 tablet:grid tablet:grid-cols-3 tablet:gap-6 tablet:px-0 tablet:pb-0 desktop:grid-cols-4 desktop:gap-6">
            {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reducedMotion ? 0 : 0.5 }}
              className={`group relative flex min-w-[260px] snap-center snap-always flex-col tablet:min-w-0 ${DESKTOP_OFFSETS.has(index) ? 'desktop:translate-y-8' : ''}`}
            >
              <Link
                to={`/artist/${artist.id}`}
                className={`block relative aspect-[3/4] ${DESKTOP_ASPECTS[index % DESKTOP_ASPECTS.length]} overflow-hidden bg-dark mb-4 border border-white/5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-4 focus-visible:ring-offset-dark transition-[transform,box-shadow,border-color] duration-300 group-hover:border-acid/40 group-hover:shadow-[0_24px_60px_rgba(204,255,0,0.10)]`}
              >
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-all duration-500 grayscale opacity-70 group-hover:scale-[1.03] group-hover:grayscale-0 group-hover:opacity-100"
                  />
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center border border-acid/50 bg-ink-raise">
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 warning-stripes" />
                    <span className="font-display text-[clamp(3rem,9vw,6rem)] font-extrabold leading-none tracking-[-0.08em] stencil transition-opacity duration-300 group-hover:opacity-0">
                      {getInitials(artist.name)}
                    </span>
                    <span className="absolute font-display text-[clamp(3rem,9vw,6rem)] font-extrabold leading-none tracking-[-0.08em] text-acid opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {getInitials(artist.name)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-white transition-colors group-hover:text-acid">
                    {artist.name}
                  </h3>
                  <p className="mt-1 font-sans text-sm uppercase tracking-[0.2em] text-smoke">
                    {artist.role}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (artist.latestMix) {
                    playTrack(
                      {
                        title: `${artist.name} Latest Mix`,
                        artist: 'Tech My House',
                        url: artist.latestMix,
                        coverUrl: artist.imageUrl,
                      },
                      [
                        {
                          title: `${artist.name} Latest Mix`,
                          artist: 'Tech My House',
                          url: artist.latestMix,
                          coverUrl: artist.imageUrl,
                        },
                      ]
                    );
                    return;
                  }
                  navigate(`/artist/${artist.id}`);
                }}
                aria-label={artist.latestMix ? `Play latest mix by ${artist.name}` : `Open artist page for ${artist.name}`}
                className="absolute right-3 top-3 z-10 border border-acid bg-acid px-2.5 py-1 font-display text-[10px] font-extrabold uppercase tracking-wider text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
              >
                PLAY ↗
              </button>
            </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="font-accent text-[clamp(1.2rem,3vw,2.2rem)] leading-tight text-acid">
            six selectors, one warehouse, zero compromise.
          </p>
        </div>
      </div>
    </section>
  );
}
