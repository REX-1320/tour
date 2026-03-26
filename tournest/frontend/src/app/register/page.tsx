'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import GlassButton from '@/components/ui/GlassButton';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[600px] bg-[rgba(108,99,255,0.1)] blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong p-8 rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(255,255,255,0.05)] to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="heading-md text-white mb-2">Create Account</h1>
          <p className="text-text-secondary text-sm mb-8">Start your journey with TourNest.</p>

          {error && (
            <div className="bg-[rgba(248,113,113,0.15)] border border-[rgba(248,113,113,0.3)] text-[var(--danger)] p-3 rounded-lg text-sm flex items-center gap-2 mb-6 pointer-events-auto relative z-20">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="flex flex-col gap-4 mb-8">
            <div className="relative pointer-events-auto z-20">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--accent-light)] transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative pointer-events-auto z-20">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="password" 
                placeholder="Password (min 6 chars)" 
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--accent-light)] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister(e as any)}
              />
            </div>
          </div>

          <GlassButton 
            variant="primary" 
            className="w-full justify-center relative z-20 pointer-events-auto" 
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Register'} <ArrowRight className="w-4 h-4 ml-2" />
          </GlassButton>

          <p className="text-center text-text-secondary text-sm mt-6 relative z-20 pointer-events-auto">
            Already have an account? <a href="/login" className="text-[var(--accent-light)] hover:underline ml-1">Sign In</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
