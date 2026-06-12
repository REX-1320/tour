'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, User as UserIcon, Globe, LogOut, ChevronDown, MapPin, LayoutDashboard, ShieldCheck } from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import { useAuth } from '@/context/AuthContext';
import { useRegion, REGIONS } from '@/context/RegionContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

const REGION_FLAGS: Record<string, string> = {
  India: '🇮🇳',
  Europe: '🇪🇺',
  Asia: '🌏',
  America: '🇺🇸',
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { selectedRegion, setSelectedRegion } = useRegion();
  const isAdmin = user?.email === ADMIN_EMAIL;
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      window.location.reload();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close region dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setIsRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Destinations', href: '/destinations' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Support', href: '/support' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-4 glass border-b border-t-0 border-l-0 border-r-0' : 'py-6 bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="container-main flex items-center justify-between">
          {/* Logo */}
          <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 text-primary font-bold text-xl group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#8b83ff] flex items-center justify-center shadow-[0_0_20px_rgba(108,99,255,0.4)] group-hover:shadow-[0_0_30px_rgba(108,99,255,0.6)] transition-all">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="tracking-tight heading-sm mb-0">TourNest</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-text-secondary hover:text-white transition-colors text-sm font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-4 border-l border-[rgba(255,255,255,0.1)] pl-8">
              {/* Region Selector */}
              <div className="relative" ref={regionRef}>
                <button
                  onClick={() => setIsRegionOpen(!isRegionOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.25)] transition-all text-sm font-medium text-white cursor-pointer"
                >
                  <span className="text-base">{REGION_FLAGS[selectedRegion]}</span>
                  <span>{selectedRegion}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${isRegionOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isRegionOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full right-0 mt-2 w-48 rounded-2xl glass-strong border border-[rgba(255,255,255,0.1)] overflow-hidden shadow-[0_16px_64px_rgba(0,0,0,0.5)] z-[9999]"
                    >
                      <div className="p-1.5">
                        {REGIONS.map((region) => (
                          <button
                            key={region}
                            onClick={() => {
                              setSelectedRegion(region);
                              setIsRegionOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                              selectedRegion === region
                                ? 'bg-[rgba(108,99,255,0.2)] text-white border border-[rgba(108,99,255,0.3)]'
                                : 'text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
                            }`}
                          >
                            <span className="text-lg">{REGION_FLAGS[region]}</span>
                            <span>{region}</span>
                            {selectedRegion === region && (
                              <MapPin className="w-3.5 h-3.5 text-[var(--accent-light)] ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="text-text-secondary hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4" /> EN
              </button>
              
              {user ? (
                <div className="hidden lg:flex items-center gap-4 ml-4">
                  <GlassButton href="/dashboard" size="sm" className="pointer-events-auto z-20">
                    <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                  </GlassButton>
                  {isAdmin && (
                    <GlassButton href="/admin" size="sm" variant="primary" className="pointer-events-auto z-20">
                      <ShieldCheck className="w-4 h-4 mr-1" /> Admin
                    </GlassButton>
                  )}
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt="Avatar" width={32} height={32} className="rounded-full border border-[rgba(255,255,255,0.2)]" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-white max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                  </div>
                  <GlassButton size="sm" onClick={signOut} className="hover:!text-danger">
                    <LogOut className="w-4 h-4" />
                  </GlassButton>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <GlassButton href="/login" size="sm" className="pointer-events-auto z-20">
                    <UserIcon className="w-4 h-4 mr-1" /> Login
                  </GlassButton>
                  <GlassButton href="/register" variant="primary" size="sm" className="pointer-events-auto z-20">
                    Register
                  </GlassButton>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-text-primary p-2 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[rgba(10,10,26,0.95)] backdrop-blur-xl pt-24 pb-8 px-6 flex flex-col md:hidden"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          >
            {/* Mobile Region Selector */}
            <div className="mb-6">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-3 block px-2">Select Region</span>
              <div className="grid grid-cols-2 gap-2">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedRegion === region
                        ? 'bg-[rgba(108,99,255,0.2)] text-white border border-[rgba(108,99,255,0.3)]'
                        : 'glass text-text-secondary'
                    }`}
                  >
                    <span className="text-lg">{REGION_FLAGS[region]}</span>
                    <span>{region}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 text-center mt-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-semibold text-text-primary"
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="mt-auto flex flex-col gap-4">
              {user ? (
                <div className="flex flex-col gap-3 items-center w-full mb-4">
                  <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] w-full justify-center py-3 rounded-2xl">
                    {user.photoURL ? (
                      <Image src={user.photoURL} alt="Avatar" width={40} height={40} className="rounded-full border border-[rgba(255,255,255,0.2)]" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-white font-medium text-sm">{user.displayName || 'Traveler'}</span>
                      <span className="text-text-muted text-xs truncate max-w-[150px]">{user.email}</span>
                    </div>
                  </div>
                  <GlassButton href="/dashboard" className="w-full justify-center pointer-events-auto z-20">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </GlassButton>
                  {isAdmin && (
                    <GlassButton href="/admin" variant="primary" className="w-full justify-center pointer-events-auto z-20">
                      <ShieldCheck className="w-4 h-4 mr-2" /> Admin Panel
                    </GlassButton>
                  )}
                  <GlassButton 
                    onClick={() => { signOut(); setIsMobileMenuOpen(false); }} 
                    className="w-full justify-center !text-danger border-[rgba(248,113,113,0.3)] hover:bg-[rgba(248,113,113,0.1)]"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </GlassButton>
                </div>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  <GlassButton href="/login" className="w-full justify-center pointer-events-auto z-20">
                    Login
                  </GlassButton>
                  <GlassButton href="/register" variant="primary" className="w-full justify-center pointer-events-auto z-20">
                    Register
                  </GlassButton>
                </div>
              )}
              
              <GlassButton className="w-full justify-center">
                <Globe className="w-4 h-4 mr-2" /> English
              </GlassButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
