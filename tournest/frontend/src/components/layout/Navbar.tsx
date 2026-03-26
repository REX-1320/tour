'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, User as UserIcon, Globe, LogOut } from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Destinations', href: '#destinations' },
    { name: 'Experiences', href: '#experiences' },
    { name: 'About', href: '#about' },
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
          <a href="#" className="flex items-center gap-2 text-primary font-bold text-xl group">
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
              <button className="text-text-secondary hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                <Globe className="w-4 h-4" /> EN
              </button>
              
              {user ? (
                <div className="hidden lg:flex items-center gap-4 ml-4">
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
            <div className="flex flex-col gap-6 text-center mt-10">
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
