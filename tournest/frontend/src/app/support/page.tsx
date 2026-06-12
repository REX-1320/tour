'use client';

import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { HelpCircle, MessagesSquare, Mail } from 'lucide-react';
import { useState } from 'react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "My booking failed but money was deducted, what should I do?",
      a: "Don't worry! Razorpay typically auto-refunds failed transactions within 3-5 business days. If you still don't receive it, contact our email support with your email ID."
    },
    {
      q: "Can I cancel or modify a confirmed trip?",
      a: "Yes, you can cancel your trip up to 72 hours before the travel date for a full refund. For modifications, please contact our support team immediately so we can accommodate your requested dates."
    },
    {
      q: "How does the AI concierge work?",
      a: "Our AI assistant is built using advanced Groq and Gemini models perfectly synchronized directly with our premium destinations database to find exactly what you're looking for in seconds."
    },
    {
      q: "Are the ratings authentic?",
      a: "All our destinations possess carefully curated rating scores dynamically aggregated to ensure you only travel to extremely luxurious and highly sought places securely."
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center relative z-20 w-full max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="heading-lg text-white mb-2">Customer Care</h1>
        <p className="text-text-secondary">We are here to assist you. Find answers quickly or reach out to our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16">
        <GlassCard className="p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[rgba(52,211,153,0.1)] text-[var(--success)] flex items-center justify-center mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Knowledge Base</h3>
          <p className="text-text-secondary text-sm mb-6">Explore our extensive FAQs for common solutions.</p>
          <GlassButton className="mt-auto w-full text-center justify-center" onClick={() => document.getElementById('faqs')?.scrollIntoView()}>View FAQs</GlassButton>
        </GlassCard>

        <GlassCard className="p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[rgba(108,99,255,0.1)] text-[var(--accent-light)] flex items-center justify-center mb-4">
            <MessagesSquare className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Live AI Chat</h3>
          <p className="text-text-secondary text-sm mb-6">Our AI assistant is ready 24/7 to solve your travel queries instantly.</p>
          <GlassButton variant="primary" className="mt-auto w-full text-center justify-center" onClick={() => document.getElementById('ai-trigger-fake')?.click()}>Chat with us</GlassButton>
          <button id="ai-trigger-fake" className="hidden" onClick={() => {
            // A bit of a hack to open the chatbot if it's rendered in layout.
            const btn = document.getElementById('global-chatbot-toggle');
            if (btn) btn.click();
          }}></button>
        </GlassCard>

        <GlassCard className="p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-[rgba(248,113,113,0.1)] text-[var(--danger)] flex items-center justify-center mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-white font-bold mb-2">Email Support</h3>
          <p className="text-text-secondary text-sm mb-6">Complex queries? Reach directly into our inbox.</p>
          <GlassButton href="/contact" className="mt-auto w-full text-center justify-center">Email Us</GlassButton>
        </GlassCard>
      </div>

      <div id="faqs" className="w-full">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <GlassCard key={i} className="!p-0 overflow-hidden cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="p-6 flex justify-between items-center group">
                <h4 className={`font-semibold transition-colors ${openFaq === i ? 'text-[var(--accent-light)]' : 'text-white group-hover:text-gray-300'}`}>
                  {faq.q}
                </h4>
                <div className={`text-text-muted transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </div>
              <div className={`px-6 pb-6 text-text-secondary text-sm transition-all duration-300 ${openFaq === i ? 'block' : 'hidden'}`}>
                {faq.a}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
