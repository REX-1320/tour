"use client";

import { useState, useEffect, useMemo, useCallback, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, Timestamp, updateDoc, increment, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { getSafeImageUrl } from '@/lib/imageUtils';
import { ArrowLeft, MapPin, Star, Loader2, Info, CalendarDays, UtensilsCrossed, Landmark, ShieldCheck, Wallet, Compass, Camera, HelpCircle, BookOpen } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { useAuth } from '@/context/AuthContext';

interface DestinationItinerary {
  day: number;
  title: string;
  activities: string[];
}

interface DestinationFaq {
  question: string;
  answer: string;
}

interface DestinationDetails {
  id: string;
  title: string;
  location: string;
  region: string;
  image: string;
  price: number;
  rating: number;
  tags: string[];
  shortDescription: string;
  fullDescription: string;
  famousFor: string[];
  highlights: string[];
  bestTimeToVisit: string;
  weather: string;
  culture: string;
  food: string[];
  activities: string[];
  nearbyPlaces: string[];
  travelTips: string[];
  howToReach: {
    air: string;
    rail: string;
    road: string;
  };
  stayOptions: string[];
  budgetBreakdown: {
    hotel: string;
    food: string;
    transport: string;
  };
  itinerary: DestinationItinerary[];
  gallery: string[];
  faqs: DestinationFaq[];
}

export default function DestinationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [dest, setDest] = useState<DestinationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    travelers: 1,
    travelDate: '',
  });
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchDest = async () => {
      try {
        const destRef = doc(db, 'destinations', id as string);
        const docSnap = await getDoc(destRef);
        if (docSnap.exists()) {
          setDest({ id: docSnap.id, ...docSnap.data() } as DestinationDetails);
        } else {
          setError('Destination not found');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDest();
  }, [id]);

  useEffect(() => {
    if (!dest) return;
    setBookingForm((prev) => ({
      ...prev,
      name: user?.displayName || prev.name,
      email: user?.email || prev.email,
      travelers: prev.travelers || 1,
    }));
  }, [dest, user]);

  useEffect(() => {
    if (!dest?.id) return;
    try {
      const key = 'tournest_recent_destinations';
      const existing = JSON.parse(localStorage.getItem(key) || '[]') as string[];
      const updated = [dest.id, ...existing.filter((item) => item !== dest.id)].slice(0, 6);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to update recent destinations:', err);
    }
  }, [dest?.id]);

  const galleryItems = useMemo(() => {
    if (dest?.gallery && dest.gallery.length > 0) return dest.gallery;
    return dest?.image ? [dest.image] : [];
  }, [dest]);

  const blurDataUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PC9zdmc+";

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleBookNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsBookingOpen(true);
  };

  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dest || !user) return;

    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.travelDate) {
      showToast('Please fill all booking details.', 'error');
      return;
    }

    if (bookingSubmitting) return;
    setBookingSubmitting(true);
    setBookingInProgress(true);

    try {
      const pricePerPerson = Number(dest.price);
      const travelersCount = Math.max(1, Number(bookingForm.travelers || 1));
      const totalAmount = pricePerPerson * travelersCount;

      if (isNaN(totalAmount) || totalAmount <= 0) {
        showToast('Invalid price for this destination.', 'error');
        setBookingSubmitting(false);
        setBookingInProgress(false);
        return;
      }

      const bookingRef = doc(collection(db, 'bookings'));
      await setDoc(bookingRef, {
        bookingId: bookingRef.id,
        userId: user.uid,
        userEmail: user.email,
        travelerName: bookingForm.name,
        travelerPhone: bookingForm.phone,
        destinationId: dest.id,
        destinationTitle: dest.title,
        amount: totalAmount,
        travelers: travelersCount,
        travelDate: Timestamp.fromDate(new Date(bookingForm.travelDate)),
        status: 'pending',
        createdAt: Timestamp.now(),
      });

      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          destinationId: dest.id,
          destinationTitle: dest.title,
          bookingId: bookingRef.id,
          userId: user.uid,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TourNest',
        description: `Booking — ${dest.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: bookingForm.name,
          email: bookingForm.email,
          contact: bookingForm.phone,
        },
        theme: {
          color: '#6c63ff',
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            await updateDoc(bookingRef, {
              status: 'confirmed',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });

            await addDoc(collection(db, 'payments'), {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              amount: totalAmount,
              userId: user.uid,
              bookingId: bookingRef.id,
              status: 'success',
              createdAt: Timestamp.now(),
            });

            try {
              const destRef = doc(db, 'destinations', dest.id);
              await updateDoc(destRef, {
                bookings: increment(1)
              });
            } catch (err) {
              console.error('Error updating destination bookings:', err);
            }

            setIsBookingOpen(false);
            showToast('Payment successful. Booking confirmed.', 'success');
            router.push(`/payment/success?bookingId=${bookingRef.id}`);
          } catch (err) {
            console.error('Error saving booking:', err);
            showToast('Payment succeeded but booking save failed. Contact support.', 'error');
          } finally {
            setBookingInProgress(false);
            setBookingSubmitting(false);
          }
        },
        modal: {
          ondismiss: async () => {
            await updateDoc(bookingRef, { status: 'cancelled' });
            setBookingInProgress(false);
            setBookingSubmitting(false);
            showToast('Payment cancelled', 'error');
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', async (response: any) => {
        await updateDoc(bookingRef, { status: 'failed' });
        showToast(`Payment failed: ${response.error?.description || 'Unknown error'}`, 'error');
        setBookingInProgress(false);
        setBookingSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Booking error:', err);
      showToast(err?.message || 'Something went wrong', 'error');
      setBookingInProgress(false);
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-(--accent)" />
        <p className="text-white">Loading destination...</p>
      </div>
    );
  }

  // Error handling: If data is missing or destination not found
  if (error || !dest) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-6 text-center">
        <div className="glass p-8 rounded-4xl border border-[rgba(255,255,255,0.1)] flex flex-col items-center">
          <Info className="w-10 h-10 text-danger mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong.</h2>
          <p className="text-text-secondary mb-6">{error || "The destination data could not be found."}</p>
          <GlassButton onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </GlassButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center w-full max-w-6xl mx-auto z-20 relative">
      {/* Toast Notifications */}
      <div className="fixed top-24 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-[rgba(52,211,153,0.12)] border-[rgba(52,211,153,0.3)] text-(--success)'
                : 'bg-[rgba(248,113,113,0.12)] border-[rgba(248,113,113,0.3)] text-(--danger)'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === 'success' ? 'bg-[rgba(52,211,153,0.2)]' : 'bg-[rgba(248,113,113,0.2)]'
            }`}>
              {toast.type === 'success' ? <Star className="w-4 h-4" /> : <Info className="w-4 h-4" />}
            </div>
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </div>
        ))}
      </div>
      <div className="w-full mb-6">
        <GlassButton onClick={() => router.back()} className="w-max">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </GlassButton>
      </div>

      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="relative w-full aspect-square md:aspect-video lg:aspect-square overflow-hidden rounded-4xl group border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] transition-all duration-700">
          <Image
            src={getSafeImageUrl(dest.image, dest.title)}
            alt={dest.title || 'destination image'}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            loading="lazy"
            placeholder="blur"
            blurDataURL={blurDataUrl}
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60 pointer-events-none opacity-50" />

          {dest.tags?.length > 0 && (
            <div className="absolute top-6 left-6 flex flex-wrap gap-2 pr-6">
              {dest.tags.map((tag) => (
                <div key={tag} className="glass px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md border border-[rgba(255,255,255,0.2)]">
                  {tag}
                </div>
              ))}
            </div>
          )}

          {dest.rating && (
            <div className="absolute bottom-6 left-6 glass px-4 py-2 rounded-full border border-white/20 flex items-center gap-1.5 backdrop-blur-md">
              <Star className="w-4 h-4 fill-(--warning) text-(--warning)" />
              <span className="text-white text-sm font-bold">{dest.rating}</span>
            </div>
          )}
        </GlassCard>

        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div>
            <h1 className="heading-xl text-white mb-2">{dest.title}</h1>
            <div className="flex items-center gap-4 text-text-muted">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {dest.location}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-4 glass rounded-2xl border border-[rgba(255,255,255,0.05)] w-max">
            <span className="text-xs text-text-muted uppercase tracking-wider font-bold">Estimated Cost</span>
            <span className="text-3xl font-bold text-white">
              {dest.price ? `INR ${dest.price.toLocaleString('en-IN')}` : 'Price N/A'} <span className="text-base font-normal text-text-muted">/ person</span>
            </span>
          </div>

          <GlassCard strong className="p-6 md:p-8 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-(--accent)" /> About this Destination
            </h3>
            <p className="text-text-secondary leading-relaxed text-[15px] md:text-base">
              {dest.shortDescription || 'Details will be updated soon.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-[rgba(255,255,255,0.1)] pt-8">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-(--warning)" /> Famous For
                </h4>
                <ul className="flex flex-wrap gap-2">
                  {(dest.famousFor || []).map((item, i) => (
                    <li key={i} className="text-xs font-medium bg-[rgba(108,99,255,0.1)] text-(--accent-light) px-3 py-1.5 rounded-lg border border-[rgba(108,99,255,0.2)]">
                      {item}
                    </li>
                  ))}
                  {(dest.famousFor || []).length === 0 && <li className="text-xs text-text-muted">Not specified</li>}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Highlights</h4>
                <ul className="flex flex-col gap-3">
                  {(dest.highlights || []).map((item, i) => (
                    <li key={i} className="text-[14px] text-text-secondary flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-(--accent-light) mt-1.5 shrink-0" />
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                  {(dest.highlights || []).length === 0 && <li className="text-xs text-text-muted">Not specified</li>}
                </ul>
              </div>
            </div>
          </GlassCard>

          <GlassButton
            variant="primary"
            className="w-full justify-center py-4! text-lg hover:scale-[1.02] shadow-[0_4px_20px_var(--accent-glow)]"
            onClick={handleBookNow}
            disabled={bookingInProgress}
          >
            {bookingInProgress ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </span>
            ) : (
              'Proceed to Booking'
            )}
          </GlassButton>
        </div>
      </section>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-9998 bg-black/70 flex items-center justify-center p-6">
          <GlassCard className="w-full max-w-2xl p-6 md:p-8 border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Confirm Booking</h2>
                <p className="text-text-muted text-sm">Complete details to continue to payment.</p>
              </div>
              <button
                className="text-sm text-text-muted hover:text-white"
                onClick={() => setIsBookingOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleBookingSubmit}>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-wider text-text-muted">Destination</label>
                <div className="glass rounded-2xl px-4 py-3 text-white border border-white/10 mt-2">
                  {dest?.title}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-text-muted">Full Name</label>
                <input
                  className="w-full glass rounded-2xl px-4 py-3 text-white bg-transparent border border-white/10 mt-2"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-text-muted">Email</label>
                <input
                  className="w-full glass rounded-2xl px-4 py-3 text-white bg-transparent border border-white/10 mt-2"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-text-muted">Phone</label>
                <input
                  className="w-full glass rounded-2xl px-4 py-3 text-white bg-transparent border border-white/10 mt-2"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 90000 00000"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-text-muted">Travelers</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  className="w-full glass rounded-2xl px-4 py-3 text-white bg-transparent border border-white/10 mt-2"
                  value={bookingForm.travelers}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, travelers: Number(e.target.value) }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-wider text-text-muted">Travel Date</label>
                <input
                  type="date"
                  className="w-full glass rounded-2xl px-4 py-3 text-white bg-transparent border border-white/10 mt-2"
                  value={bookingForm.travelDate}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, travelDate: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between glass rounded-2xl px-4 py-3 border border-white/10">
                <div>
                  <div className="text-xs uppercase tracking-wider text-text-muted">Total Amount</div>
                  <div className="text-lg font-bold text-white">
                    ₹{(Number(dest?.price) * Math.max(1, Number(bookingForm.travelers || 1))).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-xs text-text-muted">Includes all taxes</span>
              </div>
              <div className="md:col-span-2">
                <GlassButton
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  disabled={bookingSubmitting}
                >
                  {bookingSubmitting ? 'Processing...' : 'Proceed to Payment'}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      <section className="w-full mt-16">
        <GlassCard strong className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 text-(--accent)" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">About Destination</h2>
          </div>
          <p className="text-text-secondary leading-relaxed text-base">
            {dest.fullDescription || 'Details will be updated soon.'}
          </p>
        </GlassCard>
      </section>

      <section className="w-full mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <CalendarDays className="w-5 h-5 text-(--accent)" />
            <h2 className="text-xl font-bold text-white">Best Time to Visit</h2>
          </div>
          <p className="text-text-secondary">{dest.bestTimeToVisit || 'Details will be updated soon.'}</p>
          <p className="text-text-muted text-sm mt-3">{dest.weather}</p>
        </GlassCard>
        <GlassCard className="p-6 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Landmark className="w-5 h-5 text-(--accent)" />
            <h2 className="text-xl font-bold text-white">Culture</h2>
          </div>
          <p className="text-text-secondary">{dest.culture || 'Details will be updated soon.'}</p>
        </GlassCard>
      </section>

      <section className="w-full mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <UtensilsCrossed className="w-5 h-5 text-(--accent)" />
            <h2 className="text-xl font-bold text-white">Food & Culture</h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {(dest.food || []).map((item, i) => (
              <li key={i} className="text-xs font-medium bg-[rgba(108,99,255,0.1)] text-(--accent-light) px-3 py-1.5 rounded-lg border border-[rgba(108,99,255,0.2)]">
                {item}
              </li>
            ))}
            {(dest.food || []).length === 0 && <li className="text-xs text-text-muted">Not specified</li>}
          </ul>
        </GlassCard>
        <GlassCard className="p-6 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-5 h-5 text-(--accent)" />
            <h2 className="text-xl font-bold text-white">Activities</h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {(dest.activities || []).map((item, i) => (
              <li key={i} className="text-xs font-medium bg-[rgba(255,255,255,0.08)] text-white px-3 py-1.5 rounded-lg border border-white/10">
                {item}
              </li>
            ))}
            {(dest.activities || []).length === 0 && <li className="text-xs text-text-muted">Not specified</li>}
          </ul>
        </GlassCard>
      </section>

      <section className="w-full mt-16">
        <div className="flex items-center gap-3 mb-6">
          <Camera className="w-5 h-5 text-(--accent)" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">Nearby Places</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {(dest.nearbyPlaces || []).map((place, i) => (
            <GlassCard key={i} className="min-w-55 p-4 border-white/10">
              <div className="text-white font-semibold">{place}</div>
              <div className="text-text-muted text-sm mt-2">Explore on day trips.</div>
            </GlassCard>
          ))}
          {(dest.nearbyPlaces || []).length === 0 && (
            <div className="text-text-muted">Not specified</div>
          )}
        </div>
      </section>

      <section className="w-full mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-(--accent)" />
            <h2 className="text-xl font-bold text-white">Travel Guide</h2>
          </div>
          <div className="flex flex-col gap-3 text-sm text-text-secondary">
            <div><span className="text-white font-semibold">By Air:</span> {dest.howToReach?.air || 'Details coming soon.'}</div>
            <div><span className="text-white font-semibold">By Rail:</span> {dest.howToReach?.rail || 'Details coming soon.'}</div>
            <div><span className="text-white font-semibold">By Road:</span> {dest.howToReach?.road || 'Details coming soon.'}</div>
          </div>
        </GlassCard>
        <GlassCard className="p-6 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-(--accent)" />
            <h2 className="text-xl font-bold text-white">Budget Breakdown</h2>
          </div>
          <div className="flex flex-col gap-3 text-sm text-text-secondary">
            <div><span className="text-white font-semibold">Hotel:</span> {dest.budgetBreakdown?.hotel || 'Details coming soon.'}</div>
            <div><span className="text-white font-semibold">Food:</span> {dest.budgetBreakdown?.food || 'Details coming soon.'}</div>
            <div><span className="text-white font-semibold">Transport:</span> {dest.budgetBreakdown?.transport || 'Details coming soon.'}</div>
          </div>
        </GlassCard>
      </section>

      <section className="w-full mt-16">
        <GlassCard strong className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <Compass className="w-5 h-5 text-(--accent)" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Stay Options</h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {(dest.stayOptions || []).map((item, i) => (
              <li key={i} className="text-xs font-medium bg-[rgba(255,255,255,0.08)] text-white px-3 py-1.5 rounded-lg border border-white/10">
                {item}
              </li>
            ))}
            {(dest.stayOptions || []).length === 0 && <li className="text-xs text-text-muted">Not specified</li>}
          </ul>
        </GlassCard>
      </section>

      <section className="w-full mt-16">
        <GlassCard strong className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <CalendarDays className="w-5 h-5 text-(--accent)" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">2-3 Day Itinerary</h2>
          </div>
          <div className="flex flex-col gap-6">
            {(dest.itinerary || []).map((dayPlan, index) => (
              <div key={`${dayPlan.day}-${index}`} className="glass rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Day {dayPlan.day}</h3>
                  <span className="text-xs text-text-muted uppercase tracking-wider">{dayPlan.title}</span>
                </div>
                <ul className="flex flex-col gap-2 text-sm text-text-secondary">
                  {(dayPlan.activities || []).map((activity, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-(--accent-light) mt-2 shrink-0" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {(dest.itinerary || []).length === 0 && <div className="text-text-muted">No itinerary available yet.</div>}
          </div>
        </GlassCard>
      </section>

      <section className="w-full mt-16">
        <GlassCard strong className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-(--accent)" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">Travel Tips</h2>
          </div>
          <ul className="flex flex-col gap-3 text-sm text-text-secondary">
            {(dest.travelTips || []).map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-(--accent-light) mt-2 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
            {(dest.travelTips || []).length === 0 && <li className="text-text-muted">No tips available yet.</li>}
          </ul>
        </GlassCard>
      </section>

      <section className="w-full mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Image Gallery</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {galleryItems.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              className="relative min-w-60 md:min-w-75 h-48 rounded-3xl overflow-hidden group"
              onClick={() => setActiveGalleryImage(imageUrl)}
            >
              <Image
                src={getSafeImageUrl(imageUrl, dest.title)}
                alt={dest.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
                placeholder="blur"
                blurDataURL={blurDataUrl}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            </button>
          ))}
          {galleryItems.length === 0 && <div className="text-text-muted">Gallery coming soon.</div>}
        </div>
      </section>

      <section className="w-full mt-16">
        <GlassCard strong className="p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-5 h-5 text-(--accent)" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">FAQs</h2>
          </div>
          <div className="flex flex-col gap-4">
            {(dest.faqs || []).map((faq, index) => (
              <div key={`${faq.question}-${index}`} className="glass rounded-2xl border border-white/10">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                >
                  <span className="text-white font-semibold">{faq.question}</span>
                  <span className="text-text-muted text-sm">{openFaqIndex === index ? 'Hide' : 'Show'}</span>
                </button>
                {openFaqIndex === index && (
                  <div className="px-5 pb-4 text-sm text-text-secondary">{faq.answer}</div>
                )}
              </div>
            ))}
            {(dest.faqs || []).length === 0 && <div className="text-text-muted">No FAQs yet.</div>}
          </div>
        </GlassCard>
      </section>

      {activeGalleryImage && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-6">
          <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10">
            <button
              className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm"
              onClick={() => setActiveGalleryImage(null)}
            >
              Close
            </button>
            <div className="relative w-full h-[70vh]">
              <Image
                src={getSafeImageUrl(activeGalleryImage, dest.title)}
                alt={dest.title}
                fill
                className="object-cover"
                loading="lazy"
                placeholder="blur"
                blurDataURL={blurDataUrl}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
