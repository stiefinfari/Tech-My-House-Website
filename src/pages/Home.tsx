import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';
import HeroSection from '../sections/home/HeroSection';
import RecordsSection from '../sections/home/RecordsSection';
import RadioShowSection from '../sections/home/RadioShowSection';
import ArtistsSection from '../sections/home/ArtistsSection';
import Marquee from '../components/Marquee';
import AmbientBackdrop from '../components/home/AmbientBackdrop';
import { getScrollTopWithOffset } from '../lib/scrollOffset';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';

export default function Home() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotionPreference();

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
      <div className="relative pb-36 sm:pb-44">
        <AmbientBackdrop />
        <div className="relative z-10 space-y-24 sm:space-y-32">
          <RadioShowSection />
          <div className="space-y-2">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scaleX: 0.95 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Marquee
                size="sm"
                density="tight"
                className="bg-acid text-ink w-[calc(100%+24px)] -mx-3 -rotate-[1deg]"
                durationSeconds={40}
                text={'TECH MY HOUSE • '.repeat(5)}
              />
            </motion.div>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scaleX: 0.95 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Marquee
                reverse
                size="sm"
                density="tight"
                className="bg-ink text-white border-y border-white/10 grain-light w-[calc(100%+24px)] -mx-3 rotate-[1deg]"
                durationSeconds={40}
                text={'DISCOVER YOUR UNDERGROUND MOOD • '.repeat(5)}
              />
            </motion.div>
          </div>
          <RecordsSection />
          <ArtistsSection />
        </div>
      </div>
    </div>
  );
}
