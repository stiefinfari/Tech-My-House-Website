import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import useReducedMotionPreference from '../../hooks/useReducedMotionPreference';
import TMHWallpaper from '../../components/TMHWallpaper';
import PillButton from '../../components/ui/PillButton';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotionPreference();
  const [episodeNumber, setEpisodeNumber] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('tmh_latest_episodes_v2');
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: Array<{ title?: string }> };
      const title = parsed.items?.[0]?.title ?? '';
      const match = title.match(/episode\s*(\d+)/i) ?? title.match(/\bep\s*(\d+)/i);
      if (!match?.[1]) return;
      const n = Number(match[1]);
      if (Number.isFinite(n)) setEpisodeNumber(n);
    } catch {
      return;
    }
  }, []);

  return (
    <section id="hero" className="relative isolate flex h-[100svh] min-h-[720px] w-full items-start overflow-hidden bg-ink">
      {!shouldReduceMotion ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/hero-poster.jpg"
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-50 brightness-[0.85] contrast-[1.08]"
        >
          <source src="/assets/hero-video.webm" type="video/webm" />
          <source src="/assets/hero-video.mp4" type="video/mp4" />
        </video>
      ) : (
        <img
          src="/assets/hero-poster.jpg"
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-50 brightness-[0.85] contrast-[1.08]"
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_30%_50%,transparent_0%,rgba(10,10,10,0.55)_60%,rgba(10,10,10,0.95)_100%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-b from-transparent via-transparent to-ink" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-30 text-acid" aria-hidden="true">
        <TMHWallpaper mode="mixed" opacity={0.05} />
      </div>

      <div className="relative z-40 w-full">
        <div className="max-w-5xl pl-8 pr-8 pt-36 lg:pl-16 lg:pr-16">
          <div className="inline-flex -rotate-[2deg] items-center bg-acid px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink">
            EST. 2021 — FRIULI · IT
          </div>

          <h1
            className="display-title mt-8 text-[clamp(3.5rem,11vw,9rem)] text-white"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
          >
            TECH
            <br />
            MY
            <br />
            HOUSE
          </h1>

          <p className="accent-script mt-6 -rotate-[1.5deg] text-[clamp(1.8rem,4vw,3rem)] text-acid">
            Discover your underground mood.
          </p>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-smoke">
            HOUSE · TECH HOUSE · TECHNO · HARD TECHNO
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <PillButton to="/#podcast" variant="primary" icon={<Play size={18} />} ariaLabel="Latest episode">
              LATEST EPISODE
            </PillButton>
            <PillButton href="mailto:info@techmyhouse.it" variant="ghost" ariaLabel="Booking">
              BOOKING ↗
            </PillButton>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-8 lg:px-16">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-widest text-smoke motion-reduce:animate-none animate-bounce">
              ↓ SCROLL
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-smoke">
              <span className="h-1.5 w-1.5 rounded-full bg-acid animate-pulse" aria-hidden="true" />
              ON AIR · EP {episodeNumber ?? 132}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
