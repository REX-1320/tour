'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps pages that require authentication.
 * - While auth is resolving → shows a full-screen spinner
 * - If user is not logged in → redirects to /login
 * - If user is logged in → renders children
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-[var(--accent)]" />
        </motion.div>
        <p className="text-text-muted text-sm">Verifying session…</p>
      </div>
    );
  }

  // Prevent flash of protected content while redirecting
  if (!user) return null;

  return <>{children}</>;
}
