import { useEffect, useState } from 'react';
import { X, Sparkles, Wrench, Zap, ChevronRight } from 'lucide-react';

// ─── Release data ─────────────────────────────────────────────────────────────
// Update `version` on every release. The popup will show once per version.
// Add entries to each section as needed — empty arrays hide that section.

const RELEASE: {
  version: string;
  date: string;
  improvements: string[];
  bugsFixed: string[];
  whatsNew: string[];
} = {
  version: '1.28',
  date: 'July 2026',
  improvements: [
    'Faster page load times across all sections through optimised asset bundling.',
    'Menu browsing now feels snappier with skeleton loaders and smoother transitions.',
    'Reservation form validation gives clearer, more helpful error messages.',
    'Dashboard analytics charts render up to 40 % faster on large data sets.',
    'Improved keyboard navigation throughout the site for better accessibility.',
  ],
  bugsFixed: [
    'Fixed an issue where the cart total could display incorrectly after applying a promo code.',
    'Resolved a rare crash on the order history page when payment records were missing.',
    'Fixed overlapping text in the mobile navigation menu on small screens.',
    'Corrected an intermittent 404 error when refreshing the dashboard on certain routes.',
    'Fixed the date-picker not closing after a reservation date was selected.',
  ],
  whatsNew: [
    'Introducing the all-new Best Sellers carousel — discover our most-loved dishes at a glance.',
    'Table reservations can now be made directly from the home page without signing in.',
    'Dark-mode support has been extended to the dashboard and order history views.',
    'New "Chef\'s Special" badge highlights limited-time items on the menu page.',
    'Email confirmation is now sent automatically after every successful reservation.',
  ],
};

const STORAGE_KEY = 'bunbite_last_seen_version';

// ─── Section component ────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  items,
  accentClass,
  dotClass,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  accentClass: string;
  dotClass: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className={`flex items-center gap-2 mb-3`}>
        <span className={`flex items-center justify-center w-7 h-7 rounded-lg ${accentClass}`}>
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed">
            <span className={`mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReleaseNotes() {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== RELEASE.version) {
      // Slight delay so the page can paint first
      const t = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)));
      }, 600);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible]);

  function handleClose() {
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, RELEASE.version);
    }, 280);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Release Notes v${RELEASE.version}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: animateIn ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[520px] max-h-[88dvh] flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'linear-gradient(160deg, #111827 0%, #0b0f1a 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Header */}
        <div className="relative flex items-start justify-between px-6 pt-6 pb-5 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Version badge */}
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #ca8a04 100%)' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-lg leading-tight">
                  New Release
                </h2>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(234,179,8,0.15)',
                    border: '1px solid rgba(234,179,8,0.3)',
                    color: '#fbbf24',
                  }}
                >
                  v{RELEASE.version}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">{RELEASE.date}</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-600 hover:text-white hover:bg-white/8 transition-colors mt-0.5 flex-shrink-0"
            aria-label="Close release notes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5 space-y-6">
          <Section
            icon={<Zap className="w-3.5 h-3.5 text-blue-400" />}
            title="Improvements"
            items={RELEASE.improvements}
            accentClass="bg-blue-500/15"
            dotClass="bg-blue-400"
          />
          <Section
            icon={<Wrench className="w-3.5 h-3.5 text-green-400" />}
            title="Bugs Fixed"
            items={RELEASE.bugsFixed}
            accentClass="bg-green-500/15"
            dotClass="bg-green-400"
          />
          <Section
            icon={<Sparkles className="w-3.5 h-3.5 text-yellow-400" />}
            title="What's New?"
            items={RELEASE.whatsNew}
            accentClass="bg-yellow-500/15"
            dotClass="bg-yellow-400"
          />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/8">
          {/* Thank-you message */}
          <div className="px-6 py-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <p className="text-xs text-gray-500 leading-relaxed text-center">
              <span className="text-gray-400 font-medium">Thank you for using our platform.</span>
              {' '}We hope you enjoy the latest improvements and enhancements!
            </p>
          </div>

          {/* CTA */}
          <div className="px-6 py-4">
            <button
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }}
            >
              Got it, let's go
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
