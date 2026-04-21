import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';
import HeroSection from '../sections/home/HeroSection';
import RecordsSection from '../sections/home/RecordsSection';
import RadioShowSection from '../sections/home/RadioShowSection';
import ArtistsSection from '../sections/home/ArtistsSection';
import Marquee from '../components/Marquee';
import { getScrollTopWithOffset } from '../lib/scrollOffset';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    const navOffset = 112;
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const nextTop = getScrollTopWithOffset({
          elementTopInViewport: element.getBoundingClientRect().top,
          scrollY: window.scrollY,
          offset: navOffset,
        });
        window.scrollTo({ top: nextTop, behavior: 'smooth' });
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
      <HeroSection />
      <div className="relative z-10 space-y-24 pb-36 sm:space-y-32 sm:pb-44">
        <RadioShowSection />
        <Marquee />
        <Marquee
          reverse
          size="sm"
          density="tight"
          className="bg-ink text-white border-y border-white/10 grain-light"
          text="TECH MY HOUSE • RADIO SHOW • UNDERGROUND • FRIULI • IT • "
        />
        <RecordsSection />
        <ArtistsSection />
      </div>
    </div>
  );
}
