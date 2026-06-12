'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, MapPin, Calendar, DollarSign, Check, X, Plane, ArrowLeft,
  Trash2, Plus, Pencil, Save, PackageOpen, Users, Globe, Star, Image as ImageIcon, Sparkles
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { REGIONS } from '@/context/RegionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

// ─── Types ────────────────────────────────────────────────────
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

interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  destinationId: string;
  destinationTitle: string;
  price: number;
  bookingDate: { seconds: number; nanoseconds: number };
  status: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

type Tab = 'destinations' | 'bookings';

const emptyDest = {
  title: '', location: '', price: 0, rating: 0, image: '', tags: [] as string[], region: 'India',
};

// ─── Component ────────────────────────────────────────────────
function AdminPanelContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('destinations');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingDest, setLoadingDest] = useState(true);
  const [loadingBook, setLoadingBook] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyDest);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  // ─── Auth guard ─────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, authLoading, isAdmin, router]);

  // ─── Fetch destinations ─────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoadingDest(true);
      try {
        const snap = await getDocs(collection(db, 'destinations'));
        setDestinations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination)));
      } catch (e) { console.error(e); }
      finally { setLoadingDest(false); }
    };
    if (isAdmin) fetch();
  }, [isAdmin]);

  // ─── Fetch bookings ────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoadingBook(true);
      try {
        const snap = await getDocs(collection(db, 'bookings'));
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        docs.sort((a, b) => (b.bookingDate?.seconds || 0) - (a.bookingDate?.seconds || 0));
        setBookings(docs);
      } catch (e) { console.error(e); }
      finally { setLoadingBook(false); }
    };
    if (isAdmin) fetch();
  }, [isAdmin]);

  // ─── Destination CRUD ───────────────────────────────────────
  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyDest);
    setTagInput('');
    setShowForm(true);
  };

  const openEditForm = (dest: Destination) => {
    setEditingId(dest.id);
    setForm({ title: dest.title, location: dest.location, price: dest.price, rating: dest.rating, image: dest.image, tags: dest.tags || [], region: dest.region });
    setTagInput((dest.tags || []).join(', '));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.region) {
      showToast('Title and Region are required', 'error');
      return;
    }
    setSaving(true);
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    const data = { ...form, tags, rating: form.rating, price: form.price };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'destinations', editingId), data);
        setDestinations((prev) => prev.map((d) => d.id === editingId ? { ...d, ...data } : d));
        showToast('Destination updated', 'success');
      } else {
        const ref = await addDoc(collection(db, 'destinations'), data);
        setDestinations((prev) => [...prev, { id: ref.id, ...data }]);
        showToast('Destination added', 'success');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyDest);
    } catch (e) {
      console.error(e);
      showToast('Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteDest = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'destinations', id));
      setDestinations((prev) => prev.filter((d) => d.id !== id));
      showToast('Destination deleted', 'success');
    } catch (e) {
      console.error(e);
      showToast('Delete failed', 'error');
    } finally { setDeletingId(null); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    showToast('Generating AI Destinations...', 'success');
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to generate');
      
      // Refresh destinations
      const snap = await getDocs(collection(db, 'destinations'));
      setDestinations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination)));
      
      showToast(`Success! Generated new places.`, 'success');
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'bookings', id));
      setBookings((prev) => prev.filter((b) => b.id !== id));
      showToast('Booking deleted', 'success');
    } catch (e) {
      console.error(e);
      showToast('Delete failed', 'error');
    } finally { setDeletingId(null); }
  };

  const formatDate = (ts: { seconds: number } | undefined) => {
    if (!ts) return 'N/A';
    return new Date(ts.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-32 pb-20 px-4">

      {/* Toasts */}
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

      <div className="container-main max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
          <GlassButton href="/" size="sm" className="mb-6 pointer-events-auto z-20">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </GlassButton>
          <h1 className="heading-lg text-white mb-2">Admin Panel</h1>
          <p className="text-text-secondary text-sm">Manage destinations and view bookings.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {([
            { key: 'destinations' as Tab, label: 'Destinations', icon: <Globe className="w-4 h-4" />, count: destinations.length },
            { key: 'bookings' as Tab, label: 'Bookings', icon: <Users className="w-4 h-4" />, count: bookings.length },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                tab === t.key
                  ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] text-white shadow-[0_4px_20px_var(--accent-glow)]'
                  : 'glass text-text-secondary hover:text-white'
              }`}
            >
              {t.icon} {t.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20' : 'bg-[rgba(255,255,255,0.06)]'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ═══════════════ DESTINATIONS TAB ═══════════════ */}
        {tab === 'destinations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Action Buttons */}
            <div className="flex justify-between mb-6">
              <GlassButton onClick={handleGenerate} disabled={generating} className="flex-shrink-0 mr-4">
                {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2 text-[var(--accent-light)]" />}
                {generating ? 'Generating...' : 'AI Generate Now'}
              </GlassButton>
              <GlassButton variant="primary" onClick={openAddForm}>
                <Plus className="w-4 h-4 mr-2" /> Add Destination
              </GlassButton>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mb-8"
                >
                  <GlassCard className="!rounded-2xl" hoverEffect={false}>
                    <h3 className="text-white font-bold text-lg mb-6">
                      {editingId ? 'Edit Destination' : 'Add New Destination'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="glass-label">Title *</label>
                        <input className="glass-input" placeholder="e.g. Coorg Coffee Trails" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                      </div>
                      <div>
                        <label className="glass-label">Location</label>
                        <input className="glass-input" placeholder="e.g. Karnataka, India" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                      </div>
                      <div>
                        <label className="glass-label">Price</label>
                        <input className="glass-input" type="number" placeholder="e.g. 12499" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <label className="glass-label">Rating (0-5)</label>
                        <input className="glass-input" type="number" step="0.1" min="0" max="5" placeholder="4.8" value={form.rating || ''} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="glass-label">Image URL</label>
                        <input className="glass-input" placeholder="Leave empty for AI-generated image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                      </div>
                      <div>
                        <label className="glass-label">Tags (comma separated)</label>
                        <input className="glass-input" placeholder="Beach, Luxury, Adventure" value={tagInput} onChange={(e) => setTagInput(e.target.value)} />
                      </div>
                      <div>
                        <label className="glass-label">Region *</label>
                        <select className="glass-input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <GlassButton variant="primary" onClick={handleSave}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {editingId ? 'Update' : 'Add'}
                      </GlassButton>
                      <GlassButton onClick={() => { setShowForm(false); setEditingId(null); }}>
                        Cancel
                      </GlassButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading */}
            {loadingDest && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                <p className="text-text-muted text-sm">Loading destinations...</p>
              </div>
            )}

            {/* Empty */}
            {!loadingDest && destinations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-20 h-20 rounded-full glass flex items-center justify-center"><PackageOpen className="w-10 h-10 text-text-muted" /></div>
                <h3 className="text-white text-lg font-bold">No destinations</h3>
                <p className="text-text-muted text-sm">Add your first destination above.</p>
              </div>
            )}

            {/* Destination Cards */}
            {!loadingDest && destinations.length > 0 && (
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {destinations.map((dest, i) => (
                    <motion.div
                      key={dest.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      transition={{ duration: 0.4, delay: i * 0.03 }}
                    >
                      <GlassCard className="!rounded-2xl !p-4 md:!p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" hoverEffect={false}>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-base truncate">{dest.title}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                            {dest.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />{dest.location}</span>}
                            {dest.price > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-[var(--accent)]" />{formatPrice(dest.price)}</span>}
                            {dest.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-[var(--warning)]" />{dest.rating}</span>}
                            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-[var(--accent)]" />{dest.region}</span>
                          </div>
                          {dest.tags && dest.tags.length > 0 && (
                            <div className="flex gap-1.5 mt-2">
                              {dest.tags.map((t) => (
                                <span key={t} className="badge text-[10px] px-2 py-0.5">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => openEditForm(dest)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass text-text-secondary hover:text-white transition-all cursor-pointer">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            disabled={deletingId === dest.id}
                            onClick={() => handleDeleteDest(dest.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.25)] text-[var(--danger)] hover:bg-[rgba(248,113,113,0.2)] transition-all cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === dest.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
                          </motion.button>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════ BOOKINGS TAB ═══════════════ */}
        {tab === 'bookings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {loadingBook && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                <p className="text-text-muted text-sm">Loading bookings...</p>
              </div>
            )}

            {!loadingBook && bookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-20 h-20 rounded-full glass flex items-center justify-center"><PackageOpen className="w-10 h-10 text-text-muted" /></div>
                <h3 className="text-white text-lg font-bold">No bookings yet</h3>
                <p className="text-text-muted text-sm">Bookings from users will appear here.</p>
              </div>
            )}

            {!loadingBook && bookings.length > 0 && (
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {bookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      transition={{ duration: 0.4, delay: i * 0.03 }}
                    >
                      <GlassCard className="!rounded-2xl !p-4 md:!p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" hoverEffect={false}>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-base truncate">{booking.destinationTitle}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-[var(--accent)]" />{booking.userEmail}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-[var(--accent)]" />{formatPrice(booking.price)}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />{formatDate(booking.bookingDate)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className={`w-2 h-2 rounded-full ${booking.status === 'confirmed' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'}`} />
                            <span className={`text-xs font-medium capitalize ${booking.status === 'confirmed' ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>{booking.status}</span>
                          </div>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          disabled={deletingId === booking.id}
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.25)] text-[var(--danger)] hover:bg-[rgba(248,113,113,0.2)] transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
                        >
                          {deletingId === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
                        </motion.button>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  return (
    <ProtectedRoute>
      <AdminPanelContent />
    </ProtectedRoute>
  );
}
