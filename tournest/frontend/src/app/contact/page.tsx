'use client';

import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center relative z-20 w-full max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="heading-lg text-white mb-2">Get in Touch</h1>
        <p className="text-text-secondary">We'd love to hear from you. Find us here or drop a message!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
        {/* Contact Info & Map */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-8 h-full flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              <ul className="flex flex-col gap-6">
                <li className="flex items-center gap-4 text-text-secondary">
                  <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[var(--accent-light)]" />
                  </div>
                  <div>
                    <strong className="block text-white text-sm">Email Address</strong>
                    <span>support@tournest.com</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 text-text-secondary">
                  <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[var(--accent-light)]" />
                  </div>
                  <div>
                    <strong className="block text-white text-sm">Phone Number</strong>
                    <span>+91 98765 43210</span>
                  </div>
                </li>
                <li className="flex items-center gap-4 text-text-secondary">
                  <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-[var(--accent-light)]" />
                  </div>
                  <div>
                    <strong className="block text-white text-sm">Main Office</strong>
                    <span>42 Innovation Hub, Cyber City<br/>Bangalore, India 560001</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="mt-auto pt-6 border-t border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden glass h-48 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15552.713317769507!2d77.58914619999999!3d12.9604193!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15d7e7c91979%3A0x6e8eabc31bd28531!2sUB%20City!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-80"
              />
            </div>
          </GlassCard>
        </div>

        {/* Contact Form */}
        <div>
          <GlassCard strong className="p-8 md:p-10">
            <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
            {sent ? (
              <div className="bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.3)] text-[var(--success)] p-6 rounded-2xl text-center">
                <Send className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-bold">Message successfully sent!</h3>
                <p className="text-sm mt-2 opacity-80">Our team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase font-bold text-text-muted tracking-wide">Full Name</label>
                  <input required type="text" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent-light)] transition-all" placeholder="John Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase font-bold text-text-muted tracking-wide">Email Address</label>
                  <input required type="email" className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent-light)] transition-all" placeholder="john@example.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase font-bold text-text-muted tracking-wide">Message</label>
                  <textarea required rows={5} className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[var(--accent-light)] transition-all resize-none" placeholder="How can we help you today?"></textarea>
                </div>
                <GlassButton variant="primary" type="submit" className="w-full justify-center mt-2">
                  Submit Inquiry <Send className="w-4 h-4 ml-2" />
                </GlassButton>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
