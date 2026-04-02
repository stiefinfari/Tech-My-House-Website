import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { artists, releases } from '../data';
import Podcast from '../components/Podcast';
import { useSeo } from '../seo/useSeo';
import { SITE } from '../seo/site';

export default function Home() {
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  
  // Parallax effects for hero
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

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
      '@graph': [
        {
          '@type': 'WebSite',
          name: SITE.name,
          url: new URL('/', SITE.url).toString(),
        },
        ...releases.map((r) => ({
          '@type': 'MusicRecording',
          name: r.title,
          byArtist: { '@type': 'Person', name: r.artist },
          datePublished: r.date,
          url: r.link,
          image: new URL(r.coverUrl, SITE.url).toString(),
          publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
        })),
      ],
    },
  });

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0 flex items-center justify-center"
          style={{ scale: videoScale }}
        >
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src="/assets/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-dark/20 via-dark/40 to-dark mix-blend-multiply"></div>
        </motion.div>
        
        <motion.div 
          className="relative z-10 flex flex-col items-center pointer-events-none w-full px-4"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.4rem,10vw,9.5rem)] leading-[0.85] text-center font-black tracking-[-0.08em] text-white mix-blend-exclusion whitespace-nowrap"
          >
            TECH MY HOUSE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-8 font-marker font-normal text-xl md:text-3xl text-neon uppercase tracking-[0.3em] text-center"
          >
            Where music unites.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="mt-6 flex flex-wrap justify-center gap-6 text-xs md:text-sm text-white/50 uppercase tracking-[0.3em] font-sans font-bold"
          >
            <span className="hover:text-white transition-colors">House</span> 
            <span className="text-neon/50">•</span> 
            <span className="hover:text-white transition-colors">Tech House</span> 
            <span className="text-neon/50">•</span> 
            <span className="hover:text-white transition-colors">Techno</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-24 flex flex-col items-center gap-4 text-neon/80"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-neon to-transparent animate-pulse"></div>
            <ArrowDown className="animate-bounce" size={24} />
          </motion.div>
        </motion.div>
      </section>

      {/* Our Artists */}
      <section id="artists" className="py-32 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-12">
          <motion.h2 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter"
          >
            Our <br/><span className="text-neon">Artists</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-sans text-white/40 max-w-sm text-sm uppercase tracking-widest mt-8 md:mt-0 text-right"
          >
            The visionaries shaping the sound of tomorrow's dancefloors.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
          {artists.map((artist, i) => (
            <motion.div 
              key={artist.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              className={`group block relative ${i % 2 !== 0 ? 'md:mt-32' : ''}`}
            >
              <Link to={`/artist/${artist.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-dark mb-8 rounded-sm">
                  <div className="absolute inset-0 bg-neon mix-blend-overlay opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"></div>
                  <img 
                    src={artist.imageUrl} 
                    alt={artist.name} 
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 border border-white/0 group-hover:border-neon/50 transition-colors duration-500 z-20"></div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-black text-5xl uppercase tracking-tighter mb-2 group-hover:text-neon transition-colors duration-300">{artist.name}</h3>
                    <p className="text-white/50 uppercase tracking-[0.2em] text-xs font-bold">{artist.role}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-neon group-hover:border-neon group-hover:text-dark transition-all duration-500 transform group-hover:rotate-[-45deg]">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TMH Records */}
      <section id="records" className="py-40 px-6 md:px-12 bg-black relative z-20 overflow-hidden">
        {/* Decorative background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full overflow-hidden opacity-5 pointer-events-none whitespace-nowrap">
          <h2 className="font-display text-[20vw] font-black uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '2px white' }}>
            TMH RECORDS TMH RECORDS
          </h2>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 border-b border-white/10 pb-12 gap-8">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter"
            >
              TMH <br/><span className="text-cyber glitch-hover inline-block font-marker font-normal">Records</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-sans text-white/50 max-w-sm text-sm uppercase tracking-[0.2em] leading-relaxed"
            >
              Releasing the finest cuts of House, Tech House, and Underground Techno.
            </motion.p>
          </div>

          <div className="relative group">
            {/* Glowing orb behind the box */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyber/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            <div className="flex items-center justify-center py-40 border border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-3xl relative overflow-hidden transition-all duration-500 hover:border-cyber/30">
              <div className="absolute inset-0 bg-gradient-to-br from-cyber/0 via-cyber/5 to-neon/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center relative z-10"
              >
                <h3 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter text-white/20 mb-8 group-hover:text-white transition-colors duration-500 group-hover:text-outline-cyber">
                  Coming Soon
                </h3>
                <div className="inline-flex items-center gap-4 border border-neon/50 px-8 py-3 rounded-full bg-neon/5">
                  <div className="w-2 h-2 rounded-full bg-neon animate-ping"></div>
                  <p className="font-sans text-neon uppercase tracking-[0.3em] font-bold text-xs md:text-sm">
                    Stay Tuned
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section id="podcast" className="py-32 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <Podcast />
      </section>
    </div>
  );
}
