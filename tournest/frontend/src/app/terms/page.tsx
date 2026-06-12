import GlassCard from '@/components/ui/GlassCard';

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center relative z-20 w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="heading-lg text-white mb-2">Terms & Conditions</h1>
        <p className="text-text-secondary">Please review our responsibilities and guidelines.</p>
      </div>

      <GlassCard className="p-8 md:p-12 text-left w-full">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span> User Responsibilities
            </h2>
            <p className="text-text-secondary leading-relaxed">
              By using our platform, you agree to provide completely accurate and current information when booking our destinations. Creating an account demands that you preserve the integrity and security of your credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span> Booking Policy
            </h2>
            <p className="text-text-secondary leading-relaxed">
              All bookings made through the app are strictly confirmed only upon successful clearance of Razorpay transactions. Once booked, an email is immediately registered against your user profile and is reflected instantly in your secure dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--warning)]"></span> Payment Disclaimer
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Payments are completely processed by our recognized third-party entity (Razorpay). TourNest intrinsically stores none of your credit card details or secure PINs directly into our Firebase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--danger)]"></span> Cancellation Policy
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Cancellations triggered up to 72 hours preceding the actual experience start date are fully refunded without fees. Cancellations processed continuously within the 72 hours window will carry a standard 20% processing penalty.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-500"></span> Limitation of Liability
            </h2>
            <p className="text-text-secondary leading-relaxed">
              TourNest only coordinates travel experiences and assumes no absolute liability for unforeseeable events directly causing bodily or psychological injuries while executing the tours independently managed by our specific local tourism operators.
            </p>
          </section>
        </div>
      </GlassCard>
    </div>
  );
}
