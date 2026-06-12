import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center relative z-20 w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-[rgba(255,255,255,0.1)] mb-4">
          <Sparkles className="w-4 h-4 text-[var(--accent-light)]" />
          <span className="text-xs uppercase font-bold text-white tracking-widest">Our Story</span>
        </div>
        <h1 className="heading-lg text-white mb-6">About TourNest</h1>
      </div>
      
      <GlassCard strong className="p-8 md:p-12 text-left mb-10 w-full">
        <h2 className="text-2xl font-bold text-white mb-4">What is TourNest?</h2>
        <p className="text-text-secondary leading-relaxed mb-8">
          TourNest is a premium, AI-powered tourism platform designed to help modern explorers discover and easily book stunning, curated destinations across India. We believe that traveling should be seamless, deeply personal, and wrapped in luxury.
        </p>

        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        <ul className="flex flex-col gap-4 text-text-secondary">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[rgba(108,99,255,0.2)] flex items-center justify-center shrink-0 mt-0.5 text-white text-xs font-bold">1</span>
            <div>
              <strong className="text-white block">AI-Powered Recommendations</strong>
              <p>Our intelligent system uses advanced AI (Gemini & Groq) to suggest destinations tailored strictly to your unique tastes and intents.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[rgba(108,99,255,0.2)] flex items-center justify-center shrink-0 mt-0.5 text-white text-xs font-bold">2</span>
            <div>
              <strong className="text-white block">Fast & Secure Booking System</strong>
              <p>Experience one-click integrated bookings powered by Razorpay and Firebase, ensuring absolute transaction safety.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[rgba(108,99,255,0.2)] flex items-center justify-center shrink-0 mt-0.5 text-white text-xs font-bold">3</span>
            <div>
              <strong className="text-white block">Region-Based Browsing</strong>
              <p>Filter beautiful locations dynamically based on specific geographic regions like coastal beaches, temples, or mountain stations.</p>
            </div>
          </li>
        </ul>
      </GlassCard>

      <GlassButton href="/destinations" variant="primary" size="lg">
        Start Exploring <ArrowRight className="w-5 h-5 ml-2" />
      </GlassButton>
    </div>
  );
}
