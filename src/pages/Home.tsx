import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { artists } from '../data';
import Podcast from '../components/Podcast';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  useSeo({
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      url: new URL('/', SITE.url).toString(),
    },
  });

  return (
    <div className="w-full">
      <section id="hero" className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden border-b border-white/10">
        <video
          autoPlay
          loop
          muted
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-dark/55 via-dark/65 to-dark/90" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(204,255,0,0.10),transparent_45%)]" />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="container-shell relative z-10 flex flex-col items-center text-center"
        >
          <h1 className="font-display whitespace-nowrap text-[clamp(2.8rem,12vw,10rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.08em] text-white">
            Tech My House
          </h1>
          <p className="accent-script mt-6 animate-glow-pulse text-[clamp(1.15rem,3.8vw,2.2rem)] uppercase tracking-[0.18em] text-neon text-glow">
            Where music unites
          </p>
          <p className="mt-8 max-w-2xl text-pretty text-sm uppercase tracking-[0.26em] text-white/75 sm:text-base">
            Underground house culture crafted for dark rooms and bright moments.
          </p>
        </motion.div>
      </section>

      <section id="artists" className="border-b border-white/10 py-20 sm:py-24 lg:py-28">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 sm:mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-neon">Roster</p>
            <h2 className="font-display text-[clamp(2rem,8vw,4.8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.07em]">
              Our Artists
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
              >
                <Link
                  to={`/artist/${artist.id}`}
                  className="group surface-panel block overflow-hidden transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-neon/40"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale transition-[transform,filter] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="space-y-2 p-5">
                    <h3 className="font-display text-3xl font-extrabold uppercase leading-none tracking-[-0.05em] transition-colors duration-200 group-hover:text-neon">
                      {artist.name}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.24em] text-white/70">{artist.role}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="records" className="border-b border-white/10 py-20 sm:py-24 lg:py-28">
        <div className="container-shell">
          <div className="mb-10 flex flex-col gap-4 sm:mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-neon">Label</p>
            <h2 className="font-display text-[clamp(2rem,8vw,4.8rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.07em]">
              Tech My House <span className="accent-script normal-case text-neon">Records</span>
            </h2>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] px-6 py-14 backdrop-blur-sm sm:px-10 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(204,255,0,0.16),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,0,60,0.08),transparent_45%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-neon/10 blur-[90px]" />
            <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-neon/5 blur-[110px]" />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/75">
                <span className="h-2 w-2 rounded-full bg-neon shadow-[0_0_14px_rgba(204,255,0,0.65)]" />
                Under Construction
              </div>

              <h3 className="mt-8 font-display text-[clamp(2.2rem,7vw,5.2rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.07em]">
                Coming Soon
              </h3>

              <p className="accent-script mt-4 animate-glow-pulse text-[clamp(1.05rem,3.4vw,2.05rem)] uppercase tracking-[0.16em] text-neon text-glow">
                New drops for dark rooms
              </p>

              <p className="mt-6 text-balance text-sm uppercase tracking-[0.22em] text-white/72 sm:text-base">
                Releases, curated cuts, and nights built for the dancefloor.
              </p>

              <div className="mt-10 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                {['Releases', 'Curated Cuts', 'Dancefloor Nights'].map((label) => (
                  <div
                    key={label}
                    className="surface-panel flex items-center justify-center gap-3 px-4 py-4 text-xs uppercase tracking-[0.22em] text-white/80 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-neon/30 hover:shadow-[0_0_28px_rgba(204,255,0,0.12)]"
                  >
                    <span className="h-2 w-2 rounded-full bg-neon/90 shadow-[0_0_12px_rgba(204,255,0,0.55)]" />
                    <span className="whitespace-nowrap">{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 h-px w-full max-w-xl bg-gradient-to-r from-transparent via-neon/35 to-transparent" />
              <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-neon/25 bg-neon/10 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-neon sm:text-xs">
                <span className="h-2 w-2 rounded-full bg-neon shadow-[0_0_12px_rgba(204,255,0,0.65)]" />
                Stay Tuned
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="podcast" className="py-20 sm:py-24 lg:py-28">
        <div className="container-shell">
          <Podcast />
        </div>
      </section>
    </div>
  );
}
