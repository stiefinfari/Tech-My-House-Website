import React from 'react';
import { motion } from 'framer-motion';
import useInViewOnce from '../../hooks/useInViewOnce';
import { artists } from '../../data';
import TopoBlob from '../../components/TopoBlob';
import PillButton from '../../components/ui/PillButton';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export default function ArtistsSection() {
  const { ref, inView } = useInViewOnce<HTMLElement>({ threshold: 0.2, rootMargin: '0px 0px -15% 0px' });
  const shouldReduceMotion = useReducedMotionPreference();

  return (
    <section
      ref={ref}
      id="artists"
      data-inview={inView ? 'true' : 'false'}
      className="py-20 sm:py-24 lg:py-28 relative border-t border-white/5 tmh-reveal-scope"
    >
      <div className="container-shell relative z-10">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between tmh-reveal-item" style={{ '--tmh-delay': '0ms' } as React.CSSProperties}>
          <div>
            <div className="section-tag">Roster</div>
            <motion.h2
              className="display-title mt-3 text-[clamp(3rem,8vw,6.5rem)] text-white"
              initial={shouldReduceMotion ? false : { clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            >
              ARTISTS
            </motion.h2>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-smoke">
            CURATED SELECTORS · UNDERGROUND ENERGY
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {artists.map((artist, idx) => (
            <motion.div
              key={artist.id}
              className="group border border-white/10 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-acid/45 tmh-reveal-item"
              style={{ '--tmh-delay': `${120 + idx * 70}ms` } as React.CSSProperties}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 50, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { delay: idx * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }
              }
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { scale: 1.03, rotate: -0.5, transition: { type: 'spring', stiffness: 240, damping: 22 } }
              }
            >
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10 bg-ink">
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="cement-texture relative flex h-full w-full items-center justify-center">
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
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <div className="pointer-events-none absolute bottom-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="rounded-full bg-acid px-3 py-1 font-display text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink">
                    VIEW →
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="display-title text-[clamp(2.2rem,4vw,3.2rem)] text-white">{artist.name}</h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.26em] text-smoke">{artist.role}</p>
                <p className="mt-3 text-sm text-white/70">{artist.bio}</p>
              </div>

              <div className="mt-5">
                <PillButton to={`/artist/${artist.id}`} variant="ghost" ariaLabel={`View profile ${artist.name}`}>
                  VIEW PROFILE
                </PillButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
