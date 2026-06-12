'use client';

import { Compass, Globe, MessageCircle, Mail } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function Footer() {
  return (
    <footer className="relative mt-32 pt-20 pb-10 border-t border-[rgba(255,255,255,0.05)] overflow-hidden">
      {/* Background glow for footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-[rgba(108,99,255,0.05)] to-transparent blur-[100px] rounded-full pointer-events-none" />

      <div className="container-main relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-6">
            <a href="#" className="flex items-center gap-2 text-primary font-bold text-xl group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6c63ff] to-[#8b83ff] flex items-center justify-center shadow-[0_0_20px_rgba(108,99,255,0.4)]">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="tracking-tight heading-sm mb-0">TourNest</span>
            </a>
            <p className="text-body text-sm max-w-xs">
              Curated premium travel experiences for the modern explorer. Discover the world with unparalleled elegance and comfort.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-semibold mb-6">Destinations</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">Europe Tours</a></li>
              <li><a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">Asia Explorations</a></li>
              <li><a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">African Safaris</a></li>
              <li><a href="#" className="text-text-secondary hover:text-white transition-colors text-sm">Island Retreats</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company & Support</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="/about" className="text-text-secondary hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="/support" className="text-text-secondary hover:text-white transition-colors text-sm">Customer Care</a></li>
              <li><a href="/terms" className="text-text-secondary hover:text-white transition-colors text-sm">Terms & Conditions</a></li>
              <li><a href="/contact" className="text-text-secondary hover:text-white transition-colors text-sm">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-6">Stay Inspired</h4>
            <p className="text-body text-sm mb-4">Subscribe to our newsletter for exclusive offers and travel inspiration.</p>
            <GlassCard hoverEffect={false} className="!p-1 flex p-1 rounded-full relative overflow-hidden">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border-none outline-none text-white px-4 flex-1 text-sm w-full"
              />
              <button className="bg-gradient-to-r from-[#6c63ff] to-[#8b83ff] text-white p-3 rounded-full hover:shadow-[0_0_15px_rgba(108,99,255,0.5)] transition-all">
                <Mail className="w-4 h-4" />
              </button>
            </GlassCard>
          </div>

        </div>

        <div className="divider !my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-text-muted text-sm">
          <p>© 2026 TourNest. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
