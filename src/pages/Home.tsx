import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';
import HeroSection from '../sections/home/HeroSection';
import RecordsSection from '../sections/home/RecordsSection';
import PodcastSection from '../sections/home/PodcastSection';
import ArtistsSection from '../sections/home/ArtistsSection';
import Marquee from '../components/Marquee';

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
      <HeroSection />
      <div className="relative z-10 space-y-24 pb-24 sm:space-y-32 sm:pb-32">
        <PodcastSection />
        <Marquee />
        <RecordsSection />
        <ArtistsSection />
      </div>
    </div>
  );
}
