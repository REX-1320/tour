'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Calendar, DollarSign, Check, X, Plane, ArrowLeft, Trash2,
  TrendingUp, CreditCard, Heart, SortAsc, SortDesc, UserCircle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface Booking {
  id: string;
  destinationId: string;
  destinationTitle: string;
  amount?: number;
  price?: number;
  bookingDate?: { seconds: number; nanoseconds: number };
  createdAt?: { seconds: number; nanoseconds: number };
  travelDate?: { seconds: number; nanoseconds: number };
  travelers?: number;
  status: string;
  userEmail: string;
  paymentId?: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt?: { seconds: number; nanoseconds: number };
  bookingId?: string;
  orderId?: string;
  paymentId?: string;
}

interface Destination {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

type SortOrder = 'newest' | 'oldest';

function DashboardContent() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [wishlist, setWishlist] = useState<Destination[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<Destination[]>([]);
  const [recommendedDestinations, setRecommendedDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);



  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Booking[];
        docs.sort((a, b) => (b.createdAt?.seconds || b.bookingDate?.seconds || 0) - (a.createdAt?.seconds || a.bookingDate?.seconds || 0));
        setBookings(docs);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  useEffect(() => {
    const fetchExtras = async () => {
      if (!user) return;
      setLoadingExtras(true);
      try {
        const paymentsQuery = query(collection(db, 'payments'), where('userId', '==', user.uid));
        const paymentsSnap = await getDocs(paymentsQuery);
        const paymentDocs = paymentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Payment[];
        setPayments(paymentDocs);

        const wishlistQuery = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
        const wishlistSnap = await getDocs(wishlistQuery);
        const wishlistIds = wishlistSnap.docs.map((d) => d.data().destinationId).filter(Boolean) as string[];
        if (wishlistIds.length > 0) {
          const wishDocs = await Promise.all(wishlistIds.map((id) => getDoc(doc(db, 'destinations', id))));
          setWishlist(wishDocs.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() })) as Destination[]);
        } else {
          setWishlist([]);
        }

        const recentKey = 'tournest_recent_destinations';
        const recentIds = JSON.parse(localStorage.getItem(recentKey) || '[]') as string[];
        if (recentIds.length > 0) {
          const recentDocs = await Promise.all(recentIds.map((id) => getDoc(doc(db, 'destinations', id))));
          setRecentDestinations(recentDocs.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() })) as Destination[]);
        } else {
          setRecentDestinations([]);
        }

        const allDestinationsSnap = await getDocs(collection(db, 'destinations'));
        const allDestinations = allDestinationsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Destination[];
        const recommended = [...allDestinations]
          .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        setRecommendedDestinations(recommended);
      } catch (error) {
        console.error('Error fetching dashboard extras:', error);
      } finally {
        setLoadingExtras(false);
      }
    };

    if (user) fetchExtras();
  }, [user]);

  // Cancel booking
  const handleCancel = async (bookingId: string, title: string) => {
    setCancellingId(bookingId);
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      showToast(`Cancelled booking for ${title}`, 'success');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast('Failed to cancel. Please try again.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  // Format Firestore timestamp
  const formatDate = (ts: { seconds: number; nanoseconds: number } | undefined) => {
    if (!ts) return 'N/A';
    return new Date(ts.seconds * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (ts: { seconds: number; nanoseconds: number } | undefined) => {
    if (!ts) return 'N/A';
    return new Date(ts.seconds * 1000).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };



  // ─── Analytics ────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const totalBookings = bookings.length;
    const totalSpent = payments.length > 0
      ? payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
      : bookings.reduce((sum, b) => sum + Number(b.amount || b.price || 0), 0);

    // Most booked destination
    const destCount: Record<string, number> = {};
    bookings.forEach((b) => {
      destCount[b.destinationTitle] = (destCount[b.destinationTitle] || 0) + 1;
    });
    const favoriteDestination = Object.entries(destCount).sort((a, b) => b[1] - a[1])[0];

    // Spending by destination (top 5 for mini bar chart)
    const destSpend: Record<string, number> = {};
    bookings.forEach((b) => {
      destSpend[b.destinationTitle] = (destSpend[b.destinationTitle] || 0) + Number(b.amount || b.price || 0);
    });
    const spendingChart = Object.entries(destSpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const maxSpend = spendingChart.length > 0 ? spendingChart[0][1] : 0;

    return { totalBookings, totalSpent, favoriteDestination, spendingChart, maxSpend };
  }, [bookings, payments]);

  // ─── Sorted bookings ─────────────────────────────────────────
  const sortedBookings = useMemo(() => {
    const sorted = [...bookings];
    if (sortOrder === 'newest') {
      sorted.sort((a, b) => (b.createdAt?.seconds || b.bookingDate?.seconds || 0) - (a.createdAt?.seconds || a.bookingDate?.seconds || 0));
    } else {
      sorted.sort((a, b) => (a.createdAt?.seconds || a.bookingDate?.seconds || 0) - (b.createdAt?.seconds || b.bookingDate?.seconds || 0));
    }
    return sorted;
  }, [bookings, sortOrder]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4">

      {/* Toast Notifications */}
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
                toast.type === 'success' ? 'bg-[rgba(52,211,153,0.2)]' : 'bg-[rgba(248,113,113,0.2)]'
              }`}>
                {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium text-white">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="container-main max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <GlassButton href="/" size="sm" className="mb-6 pointer-events-auto z-20">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </GlassButton>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="heading-lg text-white mb-2">My Dashboard</h1>
              <p className="text-text-secondary">
                Welcome back, <span className="text-white font-medium">{user.displayName || user.email?.split('@')[0]}</span>. Here&apos;s your travel overview.
              </p>
            </div>
            <div className="glass rounded-2xl p-4 border border-white/10 flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-text-muted" />
                </div>
              )}
              <div>
                <div className="text-xs uppercase tracking-wider text-text-muted">Profile</div>
                <div className="text-white font-semibold">{user.displayName || 'Traveler'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
            <p className="text-text-muted text-sm">Loading your dashboard...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
          >
            <div className="w-24 h-24 rounded-full glass flex items-center justify-center mb-2">
              <Plane className="w-12 h-12 text-text-muted" />
            </div>
            <h3 className="text-white text-xl font-bold">No bookings yet</h3>
            <p className="text-text-muted text-sm max-w-md text-center">
              You haven&apos;t booked any destinations yet. Start exploring and book your dream trip!
            </p>
            <GlassButton variant="primary" href="/" className="mt-2 pointer-events-auto z-20">
              Explore Destinations
            </GlassButton>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {!loading && (
          <>
            {/* ─── Analytics Cards ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            >
              {/* Total Bookings */}
              <div className="glass rounded-2xl p-5 border border-[rgba(255,255,255,0.08)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(108,99,255,0.15)] flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-[var(--accent-light)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Total Bookings</p>
                  <p className="text-white text-2xl font-bold">{analytics.totalBookings}</p>
                </div>
              </div>

              {/* Total Spent */}
              <div className="glass rounded-2xl p-5 border border-[rgba(255,255,255,0.08)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(52,211,153,0.15)] flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-[var(--success)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Total Spent</p>
                  <p className="text-white text-2xl font-bold">{formatCurrency(analytics.totalSpent)}</p>
                </div>
              </div>

              {/* Saved Destinations */}
              <div className="glass rounded-2xl p-5 border border-[rgba(255,255,255,0.08)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(248,113,113,0.15)] flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-[var(--danger)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Wishlist</p>
                  <p className="text-white text-2xl font-bold">{wishlist.length}</p>
                </div>
              </div>

              {/* Favorite Destination */}
              <div className="glass rounded-2xl p-5 border border-[rgba(255,255,255,0.08)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(251,191,36,0.15)] flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-[var(--warning)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Favorite Destination</p>
                  <p className="text-white text-lg font-bold truncate">
                    {analytics.favoriteDestination ? analytics.favoriteDestination[0] : '—'}
                  </p>
                  {analytics.favoriteDestination && analytics.favoriteDestination[1] > 1 && (
                    <p className="text-text-muted text-xs">{analytics.favoriteDestination[1]} bookings</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ─── Spending Chart ───────────────────────────────────── */}
            {analytics.spendingChart.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-10"
              >
                <GlassCard className="!rounded-2xl" hoverEffect={false}>
                  <h3 className="text-white font-bold text-base mb-5">Spending by Destination</h3>
                  <div className="flex flex-col gap-3">
                    {analytics.spendingChart.map(([name, amount], i) => (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-text-secondary text-xs w-32 truncate flex-shrink-0 text-right">{name}</span>
                        <div className="flex-1 h-7 rounded-lg bg-[rgba(255,255,255,0.03)] overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(amount / analytics.maxSpend) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] relative"
                          >
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white whitespace-nowrap">
                              {formatCurrency(amount)}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* ─── Wishlist ───────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">Wishlist</h2>
                <span className="text-text-muted text-xs">{wishlist.length} saved</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loadingExtras && wishlist.length === 0 && (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl bg-[rgba(255,255,255,0.06)] animate-pulse" />
                  ))
                )}
                {!loadingExtras && wishlist.length === 0 && (
                  <div className="text-text-muted">No saved destinations yet.</div>
                )}
                {wishlist.map((place) => (
                  <GlassCard key={place.id} className="p-4 border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{place.title}</h3>
                        <p className="text-text-muted text-sm">{place.location}</p>
                      </div>
                      <GlassButton href={`/destination/${place.id}`} size="sm">View</GlassButton>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>

            {/* ─── Recently Viewed ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">Recently Viewed</h2>
                <span className="text-text-muted text-xs">Last 6 visits</span>
              </div>
              {recentDestinations.length === 0 ? (
                <div className="text-text-muted">No recent destinations yet.</div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {recentDestinations.map((place) => (
                    <GlassCard key={place.id} className="min-w-[220px] p-4 border-white/10">
                      <h3 className="text-white font-semibold">{place.title}</h3>
                      <p className="text-text-muted text-sm">{place.location}</p>
                      <GlassButton href={`/destination/${place.id}`} size="sm" className="mt-3">Open</GlassButton>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ─── Payment History ─────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">Payment History</h2>
                <span className="text-text-muted text-xs">{payments.length} payments</span>
              </div>
              {payments.length === 0 ? (
                <div className="text-text-muted">No payments yet.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {payments.map((payment) => (
                    <GlassCard key={payment.id} className="!rounded-2xl !p-5 border-white/10" hoverEffect={false}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="text-white font-semibold">{formatCurrency(Number(payment.amount || 0))}</div>
                          <div className="text-text-muted text-xs">{formatDateTime(payment.createdAt)}</div>
                        </div>
                        <div className="text-xs text-text-muted">Order: {payment.orderId || '—'}</div>
                        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          payment.status === 'success'
                            ? 'bg-[rgba(52,211,153,0.15)] text-[var(--success)]'
                            : 'bg-[rgba(248,113,113,0.15)] text-[var(--danger)]'
                        }`}>
                          {payment.status}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ─── AI Recommendations ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">AI Recommendations</h2>
                <span className="text-text-muted text-xs">Curated for you</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendedDestinations.map((place) => (
                  <GlassCard key={place.id} className="p-4 border-white/10">
                    <h3 className="text-white font-semibold">{place.title}</h3>
                    <p className="text-text-muted text-sm">{place.location}</p>
                    <GlassButton href={`/destination/${place.id}`} size="sm" className="mt-3">View</GlassButton>
                  </GlassCard>
                ))}
              </div>
            </motion.div>

            {/* ─── Booking History ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">Booking History</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-[rgba(255,255,255,0.1)] text-xs font-medium text-text-secondary hover:text-white transition-all cursor-pointer"
                  >
                    {sortOrder === 'newest' ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
                    {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                  </button>
                  <span className="text-text-muted text-xs">
                    {bookings.length} total
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {sortedBookings.length === 0 && (
                    <GlassCard className="!rounded-2xl !p-6 border-white/10" hoverEffect={false}>
                      <div className="text-text-muted">No bookings yet. Start exploring and book your first trip.</div>
                    </GlassCard>
                  )}
                  {sortedBookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                      layout
                    >
                      <GlassCard className="!rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 !p-5" hoverEffect={false}>
                        {/* Booking Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-base mb-1.5 truncate">{booking.destinationTitle}</h3>
                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                            <div className="flex items-center gap-1.5 text-text-secondary">
                              <DollarSign className="w-4 h-4 text-[var(--accent)]" />
                              <span>{formatCurrency(Number(booking.amount || booking.price || 0))}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-text-secondary">
                              <Calendar className="w-4 h-4 text-[var(--accent)]" />
                              <span>{formatDate(booking.createdAt || booking.bookingDate)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${
                                booking.status === 'confirmed' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
                              }`} />
                              <span className={`text-sm font-medium capitalize ${
                                booking.status === 'confirmed' ? 'text-[var(--success)]' : 'text-[var(--warning)]'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Cancel Button */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancel(booking.id, booking.destinationTitle)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.25)] text-[var(--danger)] hover:bg-[rgba(248,113,113,0.2)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </motion.button>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
