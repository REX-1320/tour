'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Loader2, Sparkles, MapPin, Star, Plane, Zap, AlertCircle, Heart } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSafeImageUrl } from '@/lib/imageUtils';
import { useAuth } from '@/context/AuthContext';

interface Destination {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  tags: string[];
  region: string;
  bookings: number;
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
        <p className="text-white text-lg font-medium">Loading...</p>
      </div>
    }>
      <DestinationsContent />
    </Suspense>
  );
}

function DestinationsContent() {
  const { user } = useAuth();
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [searchResults, setSearchResults] = useState<Destination[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIntent, setSearchIntent] = useState<any>(null);
  const [searchMessage, setSearchMessage] = useState('');
  const [wishlistMap, setWishlistMap] = useState<Record<string, string>>({});
  const router = useRouter();

  // Timer for debounced AI search
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Load all destinations on mount
  const fetchDestinations = async () => {
    setLoading(true);
    setError('');
    try {
      const q = collection(db, 'destinations');
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
      setAllDestinations(docs);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setError('Failed to load destinations');
      setAllDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

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
      } else {
        const ref = await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          destinationId: dest.id,
          createdAt: Timestamp.now(),
        });
        setWishlistMap((prev) => ({ ...prev, [dest.id]: ref.id }));
      }
    } catch (err) {
      console.error('Wishlist update failed:', err);
    }
  };



  const formatPrice = (amount: any) => {
    const num = Number(amount);
    if (isNaN(num) || typeof amount === 'undefined' || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  // AI Search handler
  const performAISearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      setSearchIntent(null);
      setSearchMessage('');
      return;
    }

    setSearching(true);
    setSearchMessage('');
    setSearchIntent(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();

      if (res.ok) {
        setSearchResults(data.results || []);
        setSearchIntent(data.intent || null);
        setSearchMessage(data.message || '');
      } else {
        setSearchResults([]);
        setSearchMessage('Search failed. Showing all destinations.');
      }
    } catch {
      setSearchResults([]);
      setSearchMessage('Search error. Please try again.');
    } finally {
      setSearching(false);
    }
  }, []);

  // Auto-search from URL query param (from homepage)
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [hasAutoSearched, setHasAutoSearched] = useState(false);

  useEffect(() => {
    if (initialQuery && !hasAutoSearched && !loading) {
      setSearchQuery(initialQuery);
      performAISearch(initialQuery);
      setHasAutoSearched(true);
    }
  }, [initialQuery, hasAutoSearched, loading, performAISearch]);


  // Debounced search on input change
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value.trim()) {
      setSearchResults(null);
      setSearchIntent(null);
      setSearchMessage('');
      return;
    }

    const timer = setTimeout(() => {
      performAISearch(value);
    }, 600); // 600ms debounce
    setDebounceTimer(timer);
  };

  // Submit handler (Enter key / button)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (debounceTimer) clearTimeout(debounceTimer);
    performAISearch(searchQuery);
  };

  const generateMore = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      await fetchDestinations();
      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "Could not generate more destinations.");
      }
    } catch (e) {
      console.error(e);
      alert('Error generating destinations');
    }
    setLoading(false);
  };

  // Display data
  const isSearchActive = searchResults !== null;
  const sortedAll = Array.isArray(allDestinations)
    ? [...allDestinations].sort((a, b) => ((b.bookings || 0) - (a.bookings || 0)) || ((b.rating || 0) - (a.rating || 0)))
    : [];
  const trending = !isSearchActive ? sortedAll.slice(0, 3) : [];
  const explore = !isSearchActive ? sortedAll.slice(3) : [];
  const displayResults = isSearchActive ? (Array.isArray(searchResults) ? searchResults : []) : [];

  const DestinationCard = ({ dest, i }: { dest: Destination; i: number }) => (
    (() => {
      const safeDest = {
        id: dest.id,
        title: dest.title || 'Unknown Destination',
        location: dest.location || 'India',
        price: Number(dest.price) || 0,
        rating: Number(dest.rating) || 4.5,
        image: getSafeImageUrl(dest.image, dest.title || 'Destination'),
        tags: Array.isArray(dest.tags) ? dest.tags : [],
        bookings: Number(dest.bookings) || 0,
      };
      return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
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
              wishlistMap[safeDest.id]
                ? 'bg-[rgba(248,113,113,0.2)] border-[rgba(248,113,113,0.5)]'
                : 'bg-white/10 border-white/20'
            }`}
            onClick={(e) => handleToggleWishlist(e, dest)}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlistMap[safeDest.id] ? 'text-[var(--danger)] fill-[var(--danger)]' : 'text-white'}`} />
          </button>
          {safeDest.tags.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 pr-4">
              {safeDest.tags.slice(0, 3).map((tag) => (
                <div key={tag} className="glass px-3 py-1 rounded-full text-xs font-bold text-white tracking-wide border border-[rgba(255,255,255,0.2)]">
                  {tag}
                </div>
              ))}
            </div>
          )}
          <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[var(--warning)] text-[var(--warning)]" />
            <span className="text-white text-xs font-bold">{safeDest.rating}</span>
          </div>
        </div>
        <div className="px-3 pb-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-bold text-xl group-hover:text-[var(--accent-light)] transition-colors">{safeDest.title}</h3>
            {safeDest.bookings > 0 && (
              <span className="text-[10px] bg-[rgba(108,99,255,0.2)] text-[var(--accent-light)] px-2 py-1 rounded-md font-bold whitespace-nowrap">
                {safeDest.bookings} Booked
              </span>
            )}
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
                {safeDest.price ? `₹${safeDest.price.toLocaleString('en-IN')}` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
      );
    })()
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center relative z-20 w-full max-w-[1400px] mx-auto">
      {/* Header & Controls */}
      <div className="w-full flex flex-col md:flex-row items-start justify-between gap-6 mb-12">
        <div className="flex flex-col">
          <GlassButton href="/" className="w-max mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back Home
          </GlassButton>
          <h1 className="heading-lg text-white mb-2">Destinations</h1>
          <p className="text-text-secondary">Discover AI-curated premium experiences across India.</p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          {/* AI Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full">
            <GlassCard strong className="flex items-center px-4 py-3 border-[rgba(255,255,255,0.15)] w-full md:w-96 gap-3">
              {searching ? (
                <Loader2 className="w-5 h-5 text-[var(--accent-light)] animate-spin shrink-0" />
              ) : (
                <Zap className="w-5 h-5 text-[var(--accent-light)] shrink-0" />
              )}
              <input
                type="text"
                placeholder='Try "beaches in goa" or "cheap hill places"...'
                className="bg-transparent border-none outline-none text-white w-full text-sm placeholder:text-text-muted"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
              />
              <button type="submit" className="shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white hover:brightness-110 transition-all disabled:opacity-50" disabled={searching || !searchQuery.trim()}>
                <Search className="w-4 h-4" />
              </button>
            </GlassCard>
          </form>

          <GlassButton onClick={generateMore} className="whitespace-nowrap" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2 text-[var(--accent-light)]" />}
            AI Auto Generate
          </GlassButton>
        </div>
      </div>

      {/* AI Intent Chip */}
      <AnimatePresence>
        {searchIntent && isSearchActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full mb-8"
          >
            <div className="flex flex-wrap items-center gap-3 glass rounded-2xl px-5 py-3 border border-[rgba(108,99,255,0.2)]">
              <Zap className="w-4 h-4 text-[var(--accent-light)]" />
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider">AI Understood:</span>
              {searchIntent.correctedQuery && searchIntent.correctedQuery.toLowerCase() !== searchQuery.toLowerCase() && (
                <span className="text-xs bg-[rgba(52,211,153,0.15)] text-[var(--success)] px-2 py-1 rounded-lg border border-[rgba(52,211,153,0.2)]">
                  Corrected → &quot;{searchIntent.correctedQuery}&quot;
                </span>
              )}
              {searchIntent.region && (
                <span className="text-xs bg-[rgba(108,99,255,0.15)] text-[var(--accent-light)] px-2 py-1 rounded-lg border border-[rgba(108,99,255,0.2)]">
                  📍 {searchIntent.region}
                </span>
              )}
              {searchIntent.tags && searchIntent.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-[rgba(255,255,255,0.05)] text-white px-2 py-1 rounded-lg border border-[rgba(255,255,255,0.1)]">
                  {tag}
                </span>
              ))}
              {searchIntent.budget && (
                <span className="text-xs bg-[rgba(251,191,36,0.15)] text-[var(--warning)] px-2 py-1 rounded-lg border border-[rgba(251,191,36,0.2)]">
                  💰 {searchIntent.budget} budget
                </span>
              )}
              <button
                onClick={() => { setSearchQuery(''); setSearchResults(null); setSearchIntent(null); setSearchMessage(''); }}
                className="ml-auto text-xs text-text-muted hover:text-white transition-colors underline"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State (initial) */}
      {loading && allDestinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin mb-4" />
          <p className="text-white text-lg font-medium">Loading Destinations...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32">
          <AlertCircle className="w-12 h-12 text-text-muted mb-4" />
          <p className="text-white text-lg font-medium">Failed to load destinations</p>
          <p className="text-text-muted text-sm">Please refresh the page and try again.</p>
        </div>
      ) : (
        <div className="w-full">
          {/* ── AI Search Results ──────────────────────── */}
          {isSearchActive && (
            <AnimatePresence mode="wait">
              <motion.div key="search-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 mb-8">
                  <Search className="w-6 h-6 text-[var(--accent)]" />
                  <h2 className="text-2xl font-bold text-white">
                    {searching ? 'Searching...' : `AI Search Results`}
                  </h2>
                  {!searching && displayResults.length > 0 && (
                    <span className="text-sm text-text-muted">({displayResults.length} found)</span>
                  )}
                </div>

                {searching ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
                    <p className="text-text-muted text-sm">AI is analyzing your query...</p>
                  </div>
                ) : displayResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {displayResults.map((dest, i) => (
                      <DestinationCard key={dest.id} dest={dest} i={i} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <AlertCircle className="w-12 h-12 text-text-muted" />
                    <p className="text-text-muted text-lg">No results found. Try another search.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Trending Section (only when not searching) ────── */}
          {!isSearchActive && trending.length > 0 && (
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-6 h-6 text-[var(--warning)]" />
                <h2 className="text-2xl font-bold text-white">Trending Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trending.map((dest, i) => (
                  <DestinationCard key={dest.id} dest={dest} i={i} />
                ))}
              </div>
            </div>
          )}

          {/* ── Explore More (only when not searching) ────── */}
          {!isSearchActive && explore.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Plane className="w-6 h-6 text-[var(--accent)]" />
                <h2 className="text-2xl font-bold text-white">Explore More</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {explore.map((dest, i) => (
                  <DestinationCard key={dest.id} dest={dest} i={i} />
                ))}
              </div>
            </div>
          )}

          {!isSearchActive && allDestinations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-text-muted text-lg">No destinations available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
