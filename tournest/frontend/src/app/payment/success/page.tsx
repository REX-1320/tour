'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <GlassCard strong className="max-w-2xl w-full p-8 md:p-10 text-center border-white/10">
          <div className="w-16 h-16 rounded-full bg-[rgba(52,211,153,0.2)] flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-[var(--success)]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful</h1>
          <p className="text-text-secondary mb-6">
            Your booking is confirmed and ready. We&apos;ve saved the details in your dashboard.
          </p>
          {bookingId && (
            <div className="glass rounded-2xl px-4 py-3 text-sm text-text-muted mb-6 border border-white/10">
              Booking ID: <span className="text-white font-semibold">{bookingId}</span>
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <GlassButton href="/dashboard" variant="primary">
              View Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>
            <GlassButton href="/destinations">Explore More</GlassButton>
          </div>
        </GlassCard>
      </div>
    </ProtectedRoute>
  );
}
