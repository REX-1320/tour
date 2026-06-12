'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { saveUser } from '@/lib/saveUser';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Phone, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';

// Lazy-load modal to avoid SSR issues with RecaptchaVerifier
const PhoneAuthModal = dynamic(() => import('@/components/auth/PhoneAuthModal'), { ssr: false });

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
    'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.567 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8055.54-1.8364.8591-3.0477.8591-2.3436 0-4.3282-1.5836-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1027-1.17.2827-1.71V4.9582H.9574C.3477 6.1731 0 7.5477 0 9c0 1.4523.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
    <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5813C13.4627.891 11.4255 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1632 6.6564 3.5795 9 3.5795z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  // Already logged in → go to dashboard
  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard');
  }, [user, authLoading, router]);

  /* ─── Email / Password ────────────────────────────────────────── */
  const handleEmailLogin = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in both fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUser(result.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  /* ─── Google ──────────────────────────────────────────────────── */
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await saveUser(result.user);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(friendlyError(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <PhoneAuthModal isOpen={phoneModalOpen} onClose={() => setPhoneModalOpen(false)} />

      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[600px] bg-[rgba(108,99,255,0.1)] blur-[120px] rounded-full pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong p-8 rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(255,255,255,0.05)] to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h1 className="heading-md text-white mb-1">Welcome Back</h1>
            <p className="text-text-secondary text-sm mb-7">
              Sign in to continue your journey.
            </p>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-[rgba(248,113,113,0.12)] border border-[rgba(248,113,113,0.3)] text-[var(--danger)] rounded-xl px-4 py-3 text-sm mb-5"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Google ─────────────────────────────────────────── */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm transition-all mb-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* ── Phone ──────────────────────────────────────────── */}
            <button
              onClick={() => setPhoneModalOpen(true)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl glass border border-[rgba(255,255,255,0.12)] hover:border-[rgba(108,99,255,0.4)] hover:bg-[rgba(108,99,255,0.08)] text-white font-medium text-sm transition-all mb-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Phone className="w-4 h-4 text-[var(--accent-light)]" />
              Continue with Phone
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
              <span className="text-xs text-text-muted">or sign in with email</span>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
            </div>

            {/* ── Email + Password ───────────────────────────────── */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--accent-light)] transition-colors text-sm placeholder:text-text-muted"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--accent-light)] transition-colors text-sm placeholder:text-text-muted"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin(e)}
                />
              </div>
            </div>

            <GlassButton
              variant="primary"
              className="w-full justify-center"
              onClick={handleEmailLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </GlassButton>

            <p className="text-center text-text-secondary text-sm mt-5">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-[var(--accent-light)] hover:underline ml-1">
                Register here
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
