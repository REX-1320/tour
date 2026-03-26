'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Plane, Shield, Star, MapPin, Calendar, Users, Search } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import Image from 'next/image';
import VirtualPassport from '@/components/ui/VirtualPassport';
import LiquidItinerary from '@/components/ui/LiquidItinerary';
import PanoramicGlassView from '@/components/ui/PanoramicGlassView';
import AmbientAudioPlayer from '@/components/ui/AmbientAudioPlayer';

const destinations = [
  {
    id: 1,
    title: 'Santorini Sunset Retreat',
    location: 'Greece',
    price: '$2,499',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=800',
    tags: ['Beach', 'Luxury']
  },
  {
    id: 2,
    title: 'Swiss Alps Adventure',
    location: 'Switzerland',
    price: '$3,199',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=800',
    tags: ['Mountain', 'Adventure']
  },
  {
    id: 3,
    title: 'Kyoto Cultural Immersion',
    location: 'Japan',
    price: '$2,899',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
    tags: ['Culture', 'Historical']
  }
];

export default function Home() {
  return (
    <div className="flex flex-col gap-0 w-full overflow-hidden min-h-screen">
      
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 px-4 md:px-0 z-10 w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] bg-[rgba(108,99,255,0.15)] blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container-main flex flex-col items-center text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[rgba(255,255,255,0.1)] mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-white tracking-wide">New destinations available for Summer 2026</span>
          </motion.div>

          <motion.h1
            className="heading-xl max-w-5xl mb-6 text-white"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Discover The World With <br className="hidden md:block" />
            <span className="text-gradient">Unparalleled Elegance</span>
          </motion.h1>

          <motion.p
            className="text-body text-lg md:text-xl max-w-2xl text-text-secondary mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Curated premium travel experiences for the modern explorer. Experience destinations curated for luxury, comfort, and authenticity.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-20 w-full justify-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassButton variant="primary" size="lg" className="w-full sm:w-auto relative z-20 pointer-events-auto" href="/destinations">
              Explore Destinations <ArrowRight className="w-5 h-5 ml-2" />
            </GlassButton>
            <GlassButton size="lg" className="w-full sm:w-auto relative z-20 pointer-events-auto" onClick={() => alert('High-quality destination video loading...')}>
              Watch Video
            </GlassButton>
          </motion.div>

          {/* Search Bar Glass Component */}
          <motion.div
            className="w-full max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassCard strong className="p-2 sm:p-2 md:p-3 flex flex-col md:flex-row gap-2 relative z-20">
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <MapPin className="text-[var(--accent)] w-5 h-5" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Location</span>
                  <input type="text" placeholder="Where do you want to go?" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-secondary" />
                </div>
              </div>
              <div className="hidden md:block w-px bg-[rgba(255,255,255,0.1)] my-2" />
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <Calendar className="text-[var(--accent)] w-5 h-5" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Date</span>
                  <input type="text" placeholder="When are you traveling?" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-secondary" />
                </div>
              </div>
              <div className="hidden md:block w-px bg-[rgba(255,255,255,0.1)] my-2" />
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <Users className="text-[var(--accent)] w-5 h-5" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Travelers</span>
                  <input type="text" placeholder="Add guests" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-secondary" />
                </div>
              </div>
              <GlassButton variant="primary" className="!p-4 ml-auto rounded-xl flex-shrink-0 h-full hidden md:flex pointer-events-auto" onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}>
                <Search className="w-5 h-5" />
              </GlassButton>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section className="section bg-[rgba(255,255,255,0.01)] border-y border-[rgba(255,255,255,0.05)] w-full">
        <div className="container-main grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <MapPin className="w-8 h-8 text-[var(--accent)]" />, title: 'Handpicked Locations', desc: 'Every destination is carefully vetted for premium quality.' },
            { icon: <Shield className="w-8 h-8 text-[var(--accent)]" />, title: 'Secure Booking', desc: 'Enterprise-grade security for peace of mind.' },
            { icon: <Plane className="w-8 h-8 text-[var(--accent)]" />, title: 'End-to-End Service', desc: 'From flights to accommodations, we handle it all.' },
          ].map((feature, i) => (
            <GlassCard key={i} className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl glass mb-6 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">
                {feature.icon}
              </div>
              <h3 className="text-white text-lg font-bold mb-3">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ─── Featured Destinations ───────────────────────────────── */}
      <section className="section w-full" id="destinations">
        <div className="container-main">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="heading-lg mb-4 text-white">Trending Destinations</h2>
              <p className="text-body text-text-secondary">Discover the most sought-after locations for the upcoming season, crafted for those who demand the remarkable.</p>
            </div>
            <GlassButton>View All Places <ArrowRight className="w-4 h-4 ml-2" /></GlassButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-pointer relative"
              >
                <div className="glass rounded-[2rem] p-3 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]">
                  <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4">
                    <Image
                      src={dest.image}
                      alt={dest.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                    
                    {/* Floating Info inside Image */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {dest.tags.map(tag => (
                        <div key={tag} className="glass px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide border border-[rgba(255,255,255,0.2)]">
                          {tag}
                        </div>
                      ))}
                    </div>
                    
                    <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[var(--warning)] text-[var(--warning)]" />
                      <span className="text-white text-xs font-bold">{dest.rating}</span>
                    </div>
                  </div>

                  <div className="px-3 pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-bold text-xl group-hover:text-[var(--accent-light)] transition-colors">{dest.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted text-sm mb-4">
                      <MapPin className="w-4 h-4" /> {dest.location}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Starting From</span>
                        <span className="text-white font-bold text-lg">{dest.price} <span className="text-sm font-normal text-text-muted">/ person</span></span>
                      </div>
                      <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="w-5 h-5 text-text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Creative Features Showcase ──────────────────────────── */}
      <section className="section w-full relative overflow-hidden" id="features">
        <div className="container-main">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-[rgba(255,255,255,0.1)] mb-4">
                <span className="text-[10px] uppercase font-bold text-[var(--accent-light)] tracking-widest">Next-Gen Interface</span>
              </div>
              <h2 className="heading-lg mb-4 text-white">The Future Of Booking</h2>
              <p className="text-body text-text-secondary">Experience our liquid glass aesthetic with interactive itinerary building, 360° panoramic previews, and gamified travel passports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
            <div className="flex flex-col gap-8">
              {/* 360 View + Audio */}
              <div className="relative">
                <PanoramicGlassView imageUrl="https://images.unsplash.com/photo-1518182170546-07661607caab?q=80&w=2000" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                  <AmbientAudioPlayer src="https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3" title="Ocean Waves" />
                </div>
              </div>
              {/* Liquid Itinerary */}
              <LiquidItinerary />
            </div>

            <div className="flex flex-col gap-8 lg:mt-24">
               {/* Virtual Passport */}
               <VirtualPassport />
            </div>
          </div>
        </div>
      </section>
      
      {/* ─── Call To Action ──────────────────────────────────────── */}
      <section className="section w-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(108,99,255,0.05)] to-transparent pointer-events-none -z-10" />
        <div className="container-main max-w-5xl">
          <GlassCard strong className="flex flex-col md:flex-row items-center justify-between p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden text-center md:text-left">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--accent)] rounded-full blur-[100px] opacity-20 pointer-events-none" />
            
            <div className="max-w-xl mb-8 md:mb-0 relative z-10">
              <h2 className="heading-lg text-white mb-4">Ready for your next great adventure?</h2>
              <p className="text-text-secondary text-lg">Join thousands of premium travelers and start planning the journey of a lifetime.</p>
            </div>
            
            <div className="relative z-10">
              <GlassButton variant="primary" size="lg">
                Start Planning <Plane className="w-5 h-5 ml-2" />
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </section>
      
    </div>
  );
}
