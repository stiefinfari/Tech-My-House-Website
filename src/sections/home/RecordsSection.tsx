import React from 'react';
import { motion } from 'framer-motion';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import { releases } from '../../data';

export default function RecordsSection() {
  const reducedMotion = useReducedMotionPreference();

  return (
    <section id="records" className="py-20 sm:py-24 lg:py-28 relative">
      <div className="container-shell relative z-10">
        <div className="mb-12 flex flex-col gap-4">
          <div className="section-tag">New releases</div>
          <h2 className="section-title">TMH Records</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {releases.map((release) => (
            <motion.article 
              key={release.id}
              initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: reducedMotion ? 0 : 0.5 }}
              className="group flex flex-col bg-ink-raise border border-white/5 hover:border-acid/30 transition-colors p-4 rounded-xl relative overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-dark mb-5">
                <img 
                  src={release.coverUrl} 
                  alt={`${release.artist} - ${release.title}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0 group-hover:scale-105 mix-blend-luminosity group-hover:mix-blend-normal opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-acid/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
              </div>
              
              <div className="flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans font-bold text-acid text-xs tracking-widest">{release.catNum}</span>
                  <span className="font-sans text-smoke text-xs tracking-widest">{release.date}</span>
                </div>
                <h3 className="font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-white mb-1">{release.title}</h3>
                <p className="font-sans text-smoke text-sm uppercase tracking-widest mb-6">{release.artist}</p>
                
                <div className="mt-auto pt-4 border-t border-white/5">
                  {release.link ? (
                    <a 
                      href={release.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${release.status} ${release.title} by ${release.artist}`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-none border border-acid bg-transparent px-4 py-3 text-xs font-bold uppercase tracking-widest text-acid transition-all hover:bg-acid hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                    >
                      {release.status}
                    </a>
                  ) : (
                    <span 
                      aria-label={`${release.status} ${release.title} by ${release.artist}`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-none border border-white/10 bg-transparent px-4 py-3 text-xs font-bold uppercase tracking-widest text-smoke cursor-not-allowed"
                    >
                      {release.status}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
