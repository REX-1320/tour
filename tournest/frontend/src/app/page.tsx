'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plane, Shield, Star, MapPin, Calendar, Users, Search, Loader2, Check, X, Heart } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import Image from 'next/image';
import InteractiveMap from '@/components/ui/InteractiveMap';
import { useRegion } from '@/context/RegionContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { getSafeImageUrl } from '@/lib/imageUtils';

interface Destination {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  tags: string[];
  region: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function Home() {
  const { selectedRegion } = useRegion();
  const { user } = useAuth();
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookedDestinations, setBookedDestinations] = useState<Set<string>>(new Set());
  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');

  // Format price as currency (INR by default for Razorpay context)
  const formatPrice = (amount: any) => {
    const num = Number(amount);
    if (isNaN(num) || typeof amount === 'undefined' || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch user's existing bookings to prevent duplicates
  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user) {
        setBookedDestinations(new Set());
        return;
      }
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const ids = new Set(snapshot.docs.map((doc) => doc.data().destinationId as string));
        setBookedDestinations(ids);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };
    fetchUserBookings();
  }, [user]);

  // Fetch user's wishlist for quick toggles
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlistMap({});
        return;
      }
      try {
        const q = query(
          collection(db, 'wishlist'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const map: Record<string, string> = {};
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.destinationId) {
            map[data.destinationId] = docSnap.id;
          }
        });
        setWishlistMap(map);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };
    fetchWishlist();
  }, [user]);

  const handleToggleWishlist = async (e: React.MouseEvent, dest: Destination) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }

    const existingId = wishlistMap[dest.id];
    try {
      if (existingId) {
        await deleteDoc(doc(db, 'wishlist', existingId));
        setWishlistMap((prev) => {
          const next = { ...prev };
          delete next[dest.id];
          return next;
        });
        showToast('Removed from wishlist', 'success');
      } else {
        const ref = await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          destinationId: dest.id,
          createdAt: Timestamp.now(),
        });
        setWishlistMap((prev) => ({ ...prev, [dest.id]: ref.id }));
        showToast('Saved to wishlist', 'success');
      }
    } catch (err) {
      console.error('Wishlist update failed:', err);
      showToast('Wishlist update failed', 'error');
    }
  };

  // Fetch destinations based on region
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      setError('');
      try {
        const q = query(
          collection(db, 'destinations'),
          where('region', '==', selectedRegion)
        );
        const snapshot = await getDocs(q);
        console.log('Firestore response:', snapshot.docs);
        const docs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            price: Number(data.price),
          };
        }) as Destination[];
        console.log('Fetched destinations:', docs);
        setDestinations(docs);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        setError('Failed to load destinations');
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [selectedRegion]);

  // Route to destination details for booking form
  const handleBooking = (dest: Destination) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (bookedDestinations.has(dest.id)) {
      showToast('You have already booked this destination!', 'error');
      return;
    }

    setBookingId(dest.id);
    router.push(`/destination/${dest.id}`);
    setBookingId(null);
  };

  return (
    <div className="flex flex-col gap-0 w-full overflow-hidden min-h-screen">

      {/* ─── Toast Notifications ──────────────────────────────────── */}
      <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
                toast.type === 'success'
                  ? 'bg-[rgba(52,211,153,0.12)] border-[rgba(52,211,153,0.3)] text-[var(--success)]'
                  : 'bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.3)] text-[var(--danger)]'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.type === 'success'
                  ? 'bg-[rgba(52,211,153,0.2)]'
                  : 'bg-[rgba(248,113,113,0.2)]'
              }`}>
                {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium text-white">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 px-4 md:px-0 z-10 w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] bg-[rgba(108,99,255,0.15)] blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container-main flex flex-col items-center text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[rgba(255,255,255,0.1)] mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium text-white tracking-wide">New destinations available for Summer 2026</span>
          </motion.div>

          <motion.h1
            className="heading-xl max-w-5xl mb-6 text-white"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Discover The World With <br className="hidden md:block" />
            <span className="text-gradient">Unparalleled Elegance</span>
          </motion.h1>

          <motion.p
            className="text-body text-lg md:text-xl max-w-2xl text-text-secondary mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Curated premium travel experiences for the modern explorer. Experience destinations curated for luxury, comfort, and authenticity.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-20 w-full justify-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassButton variant="primary" size="lg" className="w-full sm:w-auto relative z-20 pointer-events-auto" href="/destinations">
              Explore Destinations <ArrowRight className="w-5 h-5 ml-2" />
            </GlassButton>
            <GlassButton size="lg" className="w-full sm:w-auto relative z-20 pointer-events-auto" onClick={() => alert('High-quality destination video loading...')}>
              Watch Video
            </GlassButton>
          </motion.div>

          {/* Search Bar Glass Component */}
          <motion.div
            className="w-full max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlassCard strong className="p-2 sm:p-2 md:p-3 flex flex-col md:flex-row gap-2 relative z-20">
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <MapPin className="text-[var(--accent)] w-5 h-5" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">AI Search</span>
                  <input
                    type="text"
                    placeholder='Try "beaches in goa" or "cheap hill places"...'
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-secondary"
                    value={homeSearchQuery}
                    onChange={(e) => setHomeSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && homeSearchQuery.trim()) {
                        router.push(`/destinations?q=${encodeURIComponent(homeSearchQuery.trim())}`);
                      }
                    }}
                  />
                </div>
              </div>
              <GlassButton
                variant="primary"
                className="!p-4 ml-auto rounded-xl flex-shrink-0 h-full hidden md:flex pointer-events-auto"
                onClick={() => {
                  if (homeSearchQuery.trim()) {
                    router.push(`/destinations?q=${encodeURIComponent(homeSearchQuery.trim())}`);
                  } else {
                    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Search className="w-5 h-5" />
              </GlassButton>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────────────── */}
      <section className="section bg-[rgba(255,255,255,0.01)] border-y border-[rgba(255,255,255,0.05)] w-full">
        <div className="container-main grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <MapPin className="w-8 h-8 text-[var(--accent)]" />, title: 'Handpicked Locations', desc: 'Every destination is carefully vetted for premium quality.' },
            { icon: <Shield className="w-8 h-8 text-[var(--accent)]" />, title: 'Secure Booking', desc: 'Enterprise-grade security for peace of mind.' },
            { icon: <Plane className="w-8 h-8 text-[var(--accent)]" />, title: 'End-to-End Service', desc: 'From flights to accommodations, we handle it all.' },
          ].map((feature, i) => (
            <GlassCard key={i} className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl glass mb-6 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">
                {feature.icon}
              </div>
              <h3 className="text-white text-lg font-bold mb-3">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ─── Featured Destinations (Dynamic from Firebase) ────────── */}
      <section className="section w-full" id="destinations">
        <div className="container-main">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="heading-lg mb-4 text-white">Trending in {selectedRegion}</h2>
              <p className="text-body text-text-secondary">Discover the most sought-after locations for the upcoming season, crafted for those who demand the remarkable.</p>
            </div>
            <GlassButton>View All Places <ArrowRight className="w-4 h-4 ml-2" /></GlassButton>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
              <p className="text-text-muted text-sm">Loading destinations...</p>
            </div>
          )}

          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-2">
                <X className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-white text-lg font-bold">Failed to load destinations</h3>
              <p className="text-text-muted text-sm max-w-md text-center">
                Please refresh the page or try again later.
              </p>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && destinations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-2">
                <MapPin className="w-10 h-10 text-text-muted" />
              </div>
              <h3 className="text-white text-lg font-bold">No destinations yet</h3>
              <p className="text-text-muted text-sm max-w-md text-center">
                We&apos;re curating amazing experiences for {selectedRegion}. Check back soon or explore other regions!
              </p>
            </motion.div>
          )}

          {/* Destination Cards */}
          {!loading && !error && Array.isArray(destinations) && destinations.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRegion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {destinations.map((dest, i) => {
                  const safeDest = {
                    id: dest.id,
                    title: dest.title || 'Unknown Destination',
                    location: dest.location || 'India',
                    price: Number(dest.price) || 0,
                    rating: Number(dest.rating) || 4.5,
                    image: getSafeImageUrl(dest.image, dest.title || 'Destination'),
                    tags: Array.isArray(dest.tags) ? dest.tags : [],
                  };
                  const isBooked = bookedDestinations.has(dest.id);
                  const isBooking = bookingId === dest.id;

                  return (
                    <motion.div
                      key={safeDest.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="group cursor-pointer relative"
                      onClick={() => router.push(`/destination/${safeDest.id}`)}
                    >
                      <div className="glass rounded-[2rem] p-3 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]">
                        <div className="relative w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4">
                          <Image
                            src={safeDest.image}
                            alt={safeDest.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

                          <button
                            className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                              wishlistMap[dest.id]
                                ? 'bg-[rgba(248,113,113,0.2)] border-[rgba(248,113,113,0.5)]'
                                : 'bg-white/10 border-white/20'
                            }`}
                            onClick={(e) => handleToggleWishlist(e, dest)}
                            aria-label="Toggle wishlist"
                          >
                            <Heart className={`w-5 h-5 ${wishlistMap[dest.id] ? 'text-[var(--danger)] fill-[var(--danger)]' : 'text-white'}`} />
                          </button>
                          
                          {/* Floating Info inside Image */}
                          {safeDest.tags.length > 0 && (
                            <div className="absolute top-4 left-4 flex gap-2">
                              {safeDest.tags.map(tag => (
                                <div key={tag} className="glass px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide border border-[rgba(255,255,255,0.2)]">
                                  {tag}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {safeDest.rating && (
                            <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-[var(--warning)] text-[var(--warning)]" />
                              <span className="text-white text-xs font-bold">{safeDest.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="px-3 pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-white font-bold text-xl group-hover:text-[var(--accent-light)] transition-colors">{safeDest.title}</h3>
                          </div>
                          {safeDest.location && (
                            <div className="flex items-center gap-1.5 text-text-muted text-sm mb-4">
                              <MapPin className="w-4 h-4" /> {safeDest.location}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Starting From</span>
                              <span className="text-white font-bold text-lg">
                                {safeDest.price ? `₹${safeDest.price.toLocaleString('en-IN')}` : "N/A"} <span className="text-sm font-normal text-text-muted">/ person</span>
                              </span>
                            </div>
                            <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-white transition-colors duration-300">
                              <ArrowRight className="w-5 h-5 text-text-primary" />
                            </div>
                          </div>

                          {/* Book Now Button */}
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            disabled={isBooked || isBooking}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBooking(dest);
                            }}
                            className={`w-full mt-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                              isBooked
                                ? 'bg-[rgba(52,211,153,0.15)] border border-[rgba(52,211,153,0.3)] text-[var(--success)]'
                                : 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] border border-[rgba(108,99,255,0.3)] text-white shadow-[0_4px_20px_var(--accent-glow)] hover:shadow-[0_8px_32px_var(--accent-glow)] hover:brightness-110'
                            } disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            {isBooked ? (
                              <>
                                <Check className="w-4 h-4" />
                                Booked
                              </>
                            ) : (
                              <>
                                <Plane className="w-4 h-4" />
                                Proceed to Booking
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ─── Interactive Region Map ──────────────────────────────── */}
      {!loading && destinations.length > 0 && (
        <section className="section w-full relative z-10" id="map">
          <div className="container-main">
            <div className="flex flex-col mb-10">
              <h2 className="heading-md mb-2 text-white">Explore {selectedRegion} Map</h2>
              <p className="text-body text-text-secondary">View all available curated experiences actively mapped across {selectedRegion}.</p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <InteractiveMap destinations={destinations} />
            </motion.div>
          </div>
        </section>
      )}


      
      {/* ─── Call To Action ──────────────────────────────────────── */}
      <section className="section w-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(108,99,255,0.05)] to-transparent pointer-events-none -z-10" />
        <div className="container-main max-w-5xl">
          <GlassCard strong className="flex flex-col md:flex-row items-center justify-between p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden text-center md:text-left">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--accent)] rounded-full blur-[100px] opacity-20 pointer-events-none" />
            
            <div className="max-w-xl mb-8 md:mb-0 relative z-10">
              <h2 className="heading-lg text-white mb-4">Ready for your next great adventure?</h2>
              <p className="text-text-secondary text-lg">Join thousands of premium travelers and start planning the journey of a lifetime.</p>
            </div>
            
            <div className="relative z-10">
              <GlassButton variant="primary" size="lg">
                Start Planning <Plane className="w-5 h-5 ml-2" />
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </section>
      
    </div>
  );
}
