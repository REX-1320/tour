'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { saveUser } from '@/lib/saveUser';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageSquare, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

/* ─── Error mapper ───────────────────────────────────────────────────── */
function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-phone-number': 'Enter a valid number with country code (e.g. +919876543210).',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
    'auth/invalid-verification-code': 'Incorrect OTP. Please try again.',
    'auth/code-expired': 'OTP expired. Please go back and resend.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/captcha-check-failed': 'reCAPTCHA failed. Please refresh and try again.',
    'auth/quota-exceeded': 'SMS quota exceeded. Try again later.',
    'auth/user-disabled': 'This account has been disabled.',
  };
  return map[code] || `Error: ${code}`;
}

type Step = 'phone' | 'otp' | 'success';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const RECAPTCHA_CONTAINER_ID = 'phone-auth-recaptcha-container';

export default function PhoneAuthModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('phone');
        setPhone('');
        setOtp('');
        setOtpDigits(['', '', '', '', '', '']);
        setError('');
        setLoading(false);
        setCountdown(0);
        confirmationRef.current = null;
        if (recaptchaRef.current) {
          try { recaptchaRef.current.clear(); } catch (_) {}
          recaptchaRef.current = null;
        }
      }, 300);
    }
  }, [isOpen]);

  /* ─── Init invisible reCAPTCHA ──────────────────────────────────── */
  const initRecaptcha = () => {
    if (recaptchaRef.current) return recaptchaRef.current;
    const container = document.getElementById(RECAPTCHA_CONTAINER_ID);
    if (!container) throw new Error('reCAPTCHA container not found');

    const verifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        recaptchaRef.current = null;
      },
    });
    recaptchaRef.current = verifier;
    return verifier;
  };

  /* ─── Step 1: Send OTP ──────────────────────────────────────────── */
  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (!trimmed) { setError('Please enter your phone number.'); return; }
    if (!/^\+[1-9]\d{6,14}$/.test(trimmed)) {
      setError('Include country code, e.g. +919876543210');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const verifier = initRecaptcha();
      const result = await signInWithPhoneNumber(auth, trimmed, verifier);
      confirmationRef.current = result;
      setStep('otp');
      setCountdown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      console.error('[PhoneAuth] Send OTP error:', err);
      setError(friendlyError(err.code || ''));
      // Reset reCAPTCHA on failure so it can be reinitialised
      try { recaptchaRef.current?.clear(); } catch (_) {}
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  /* ─── Step 2: Verify OTP ────────────────────────────────────────── */
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) { setError('Enter the full 6-digit OTP.'); return; }
    if (!confirmationRef.current) { setError('Session expired. Please go back and resend.'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(code);
      await saveUser(result.user);
      setStep('success');
      setTimeout(() => {
        onClose();
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('[PhoneAuth] Verify OTP error:', err);
      setError(friendlyError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  /* ─── OTP digit box handlers ────────────────────────────────────── */
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (next.every(Boolean)) {
      // Auto-submit when all 6 digits filled
      setTimeout(() => handleVerifyOtpWithCode(next.join('')), 100);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpWithCode = async (code: string) => {
    if (!confirmationRef.current) return;
    setError('');
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(code);
      await saveUser(result.user);
      setStep('success');
      setTimeout(() => {
        onClose();
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(friendlyError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setStep('phone');
    try { recaptchaRef.current?.clear(); } catch (_) {}
    recaptchaRef.current = null;
  };

  return (
    <>
      {/* Invisible reCAPTCHA — always in DOM when modal could open */}
      <div id={RECAPTCHA_CONTAINER_ID} />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-[200] bg-[rgba(0,0,0,0.6)] backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[201] flex items-center justify-center px-4 pointer-events-none"
            >
              <div className="glass-strong rounded-[28px] w-full max-w-sm p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] pointer-events-auto relative overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[rgba(108,99,255,0.15)] blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-transparent pointer-events-none rounded-[28px]" />

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10">

                  {/* ── Success ────────────────────────────────── */}
                  {step === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center py-6 gap-4 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.3)] flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
                      </div>
                      <h2 className="text-white text-xl font-bold">Verified!</h2>
                      <p className="text-text-secondary text-sm">Redirecting to your dashboard…</p>
                    </motion.div>
                  )}

                  {/* ── Phone Input ───────────────────────────── */}
                  {step === 'phone' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="w-12 h-12 rounded-2xl bg-[rgba(108,99,255,0.15)] border border-[rgba(108,99,255,0.25)] flex items-center justify-center mb-5">
                        <Phone className="w-5 h-5 text-[var(--accent-light)]" />
                      </div>
                      <h2 className="text-white text-xl font-bold mb-1">Phone Sign‑In</h2>
                      <p className="text-text-secondary text-sm mb-6">
                        We&apos;ll send a one-time code to verify your number.
                      </p>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2 bg-[rgba(248,113,113,0.12)] border border-[rgba(248,113,113,0.3)] text-[var(--danger)] rounded-xl px-4 py-3 text-sm mb-4"
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="relative mb-4">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          autoFocus
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--accent-light)] transition-colors placeholder:text-text-muted text-sm"
                        />
                      </div>

                      <p className="text-xs text-text-muted mb-5">
                        Include country code. E.g. <span className="text-text-secondary">+91</span> for India, <span className="text-text-secondary">+1</span> for USA.
                      </p>

                      <button
                        onClick={handleSendOtp}
                        disabled={loading || !phone.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_var(--accent-glow)] cursor-pointer"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Sending OTP…' : 'Send OTP'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </motion.div>
                  )}

                  {/* ── OTP Input ─────────────────────────────── */}
                  {step === 'otp' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <button
                        onClick={handleResend}
                        className="flex items-center gap-1 text-text-muted hover:text-white text-xs mb-5 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Back
                      </button>

                      <div className="w-12 h-12 rounded-2xl bg-[rgba(108,99,255,0.15)] border border-[rgba(108,99,255,0.25)] flex items-center justify-center mb-5">
                        <MessageSquare className="w-5 h-5 text-[var(--accent-light)]" />
                      </div>
                      <h2 className="text-white text-xl font-bold mb-1">Enter OTP</h2>
                      <p className="text-text-secondary text-sm mb-6">
                        6-digit code sent to <span className="text-white font-medium">{phone}</span>
                      </p>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-start gap-2 bg-[rgba(248,113,113,0.12)] border border-[rgba(248,113,113,0.3)] text-[var(--danger)] rounded-xl px-4 py-3 text-sm mb-4"
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 6 box OTP */}
                      <div className="flex gap-2 justify-center mb-6">
                        {otpDigits.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => { otpRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className={`w-10 h-12 text-center text-lg font-bold rounded-xl border transition-all focus:outline-none ${
                              digit
                                ? 'bg-[rgba(108,99,255,0.15)] border-[var(--accent-light)] text-white'
                                : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white focus:border-[var(--accent-light)]'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleVerifyOtp}
                        disabled={loading || otpDigits.some((d) => !d)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_var(--accent-glow)] cursor-pointer mb-4"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Verifying…' : 'Verify & Sign In'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                      </button>

                      {/* Resend */}
                      <p className="text-center text-xs text-text-muted">
                        Didn&apos;t get the code?{' '}
                        {countdown > 0 ? (
                          <span className="text-text-secondary">Resend in {countdown}s</span>
                        ) : (
                          <button
                            onClick={handleResend}
                            className="text-[var(--accent-light)] hover:underline cursor-pointer"
                          >
                            Resend OTP
                          </button>
                        )}
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
