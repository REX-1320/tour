'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Mail, Lock, User as UserIcon, LogIn, Globe } from 'lucide-react';

import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    router.push('/');
    return null;
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Handle Login
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        router.push('/');
      } else {
        // Handle Signup
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Update Auth Profile
        await updateProfile(cred.user, { displayName: formData.name });

        // Save User Data to Firestore
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: formData.name,
          email: formData.email,
          createdAt: serverTimestamp(),
          role: 'USER',
        });

        router.push('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);

      // We use setDoc with merge: true to avoid overwriting existing data if the user logs in again
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: cred.user.displayName,
        email: cred.user.email,
        avatar: cred.user.photoURL,
        lastLoginAt: serverTimestamp(),
      }, { merge: true });

      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-20 px-4 mt-16 relative">
      {/* Background glow specific to login */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[rgba(108,99,255,0.1)] blur-[100px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard strong className="overflow-hidden p-8 md:p-10 relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="heading-md mb-2">{isLogin ? 'Welcome Back' : 'Create an Account'}</h1>
            <p className="text-text-secondary text-sm">
              {isLogin 
                ? 'Sign in to access your premium travel itinerary.' 
                : 'Join TourNest and start planning your perfect getaway.'}
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)] text-danger text-sm px-4 py-3 rounded-xl overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-1 overflow-hidden"
                >
                  <label className="glass-label">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      name="name"
                      type="text"
                      className="glass-input pl-11"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1">
              <label className="glass-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  name="email"
                  type="email"
                  className="glass-input pl-11"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-2">
              <label className="glass-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  name="password"
                  type="password"
                  className="glass-input pl-11"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <GlassButton 
              type="submit" 
              variant="primary" 
              className="w-full mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </span>
              )}
            </GlassButton>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-[rgba(255,255,255,0.1)] flex-1" />
            <span className="text-text-muted text-xs uppercase tracking-wider font-bold">Or continue with</span>
            <div className="h-px bg-[rgba(255,255,255,0.1)] flex-1" />
          </div>

          {/* Social Auth */}
          <GlassButton 
            type="button" 
            className="w-full bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.06)]"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Globe className="w-5 h-5 mr-1" /> Google
          </GlassButton>

          {/* Toggle Login/Signup */}
          <div className="text-center mt-8 text-sm text-text-secondary">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-white hover:text-[var(--accent-light)] font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>

        </GlassCard>
      </motion.div>
    </div>
  );
}
