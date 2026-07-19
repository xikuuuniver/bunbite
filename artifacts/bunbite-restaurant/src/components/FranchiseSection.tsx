/**
 * FranchiseSection — Green premium theme
 * ─────────────────────────────────────────
 * Displays all BunBite franchise locations from franchiseData.ts.
 * To add a new location: edit src/data/franchiseData.ts only.
 */

import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, Navigation, Store } from 'lucide-react';
import { FRANCHISE_LOCATIONS, type FranchiseLocation } from '@/data/franchiseData';

/* ─── helpers ──────────────────────────────────────────────────── */
function mapsHref(loc: FranchiseLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapsQuery)}`;
}

/* ─── card ─────────────────────────────────────────────────────── */
function FranchiseCard({ loc, index }: { loc: FranchiseLocation; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.44, delay: (index % 3) * 0.09, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden rounded-3xl
                 border border-white/10 hover:border-[#4ade80]/40
                 bg-white/5 backdrop-blur-sm
                 hover:bg-white/8 hover:-translate-y-1.5
                 shadow-[0_2px_24px_rgba(0,0,0,0.25)]
                 hover:shadow-[0_8px_40px_rgba(34,197,94,0.18)]
                 transition-all duration-350"
    >
      {/* Top accent bar — animates on hover */}
      <div
        className="h-[3px] w-full shrink-0"
        style={{
          background: 'linear-gradient(90deg, #15803d 0%, #4ade80 50%, #15803d 100%)',
        }}
      />

      <div className="p-6 flex flex-col gap-4 flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-white leading-tight">
              {loc.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
              <span className="text-sm font-semibold text-[#4ade80]">{loc.city}</span>
            </div>
          </div>
          {/* Store icon badge */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
                       bg-white/8 border border-white/10
                       group-hover:bg-[#4ade80] group-hover:border-[#4ade80]
                       transition-all duration-300"
          >
            <Store className="w-5 h-5 text-[#86efac] group-hover:text-[#14532d] transition-colors duration-300" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Info list */}
        <ul className="flex flex-col gap-3 flex-1">
          {/* Address */}
          <li className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#166534]/60 border border-[#4ade80]/20
                             flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-[#86efac]" />
            </span>
            <p className="text-sm text-white/65 leading-snug pt-1">{loc.address}</p>
          </li>

          {/* Hours */}
          <li className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#166534]/60 border border-[#4ade80]/20
                             flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4 text-[#86efac]" />
            </span>
            <div className="flex flex-col gap-0.5 pt-1">
              <p className="text-sm text-white/65">
                <span className="font-semibold text-white/85">Mon–Fri&nbsp;</span>
                {loc.hours.weekdays}
              </p>
              <p className="text-sm text-white/65">
                <span className="font-semibold text-white/85">Sat–Sun&nbsp;</span>
                {loc.hours.weekends}
              </p>
            </div>
          </li>

          {/* Phone */}
          <li className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#166534]/60 border border-[#4ade80]/20
                             flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-[#86efac]" />
            </span>
            <a
              href={`tel:${loc.phone.replace(/\s/g, '')}`}
              className="text-sm text-white/65 hover:text-[#4ade80] transition-colors"
            >
              {loc.phone}
            </a>
          </li>

          {/* Email */}
          <li className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#166534]/60 border border-[#4ade80]/20
                             flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-[#86efac]" />
            </span>
            <a
              href={`mailto:${loc.email}`}
              className="text-sm text-white/65 hover:text-[#4ade80] transition-colors truncate"
            >
              {loc.email}
            </a>
          </li>
        </ul>

        {/* Get Directions CTA */}
        <a
          href={mapsHref(loc)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get directions to ${loc.name}`}
          className="mt-2 flex items-center justify-center gap-2 w-full py-3
                     rounded-2xl font-bold text-sm tracking-wide
                     text-[#14532d] bg-gradient-to-r from-[#4ade80] to-[#22c55e]
                     hover:from-[#86efac] hover:to-[#4ade80]
                     active:scale-95 transition-all duration-200 group/btn
                     shadow-[0_4px_18px_rgba(74,222,128,0.30)]
                     hover:shadow-[0_6px_28px_rgba(74,222,128,0.45)]"
        >
          <Navigation className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-12" />
          Get Directions
        </a>
      </div>
    </motion.article>
  );
}

/* ─── section ──────────────────────────────────────────────────── */
export default function FranchiseSection() {
  return (
    <section
      id="franchise"
      className="relative py-24 overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #052e12 0%, #0a4a1f 35%, #083d19 65%, #041a0b 100%)',
      }}
    >
      {/* ── Decorative glow blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(74,222,128,0.10) 0%, transparent 70%)',
          filter: 'blur(48px)',
        }}
      />
      {/* Subtle dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #86efac 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative container mx-auto px-4">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.42 }}
          className="text-center mb-4"
        >
          {/* Pill badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5
                       border border-[#4ade80]/30"
            style={{ background: 'rgba(74,222,128,0.10)' }}
          >
            <Store className="w-3.5 h-3.5 text-[#4ade80]" />
            <span className="text-[#4ade80] text-xs font-bold tracking-widest uppercase">
              Our Locations
            </span>
          </div>

          <h2
            className="font-display text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 30%, #86efac 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            FRANCHISE
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-base leading-relaxed">
            Find a BunBite near you — or explore a new city through its flavours.
            Every location brings the same bold taste, locally loved.
          </p>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.42, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-10 mt-10 mb-16"
        >
          {[
            { value: `${FRANCHISE_LOCATIONS.length}+`, label: 'Locations' },
            { value: '4', label: 'Countries' },
            { value: '12K+', label: 'Daily Guests' },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              {i > 0 && (
                <div className="hidden sm:block absolute -left-5 top-1/2 -translate-y-1/2 w-px h-8 bg-white/15" />
              )}
              <div
                className="font-display text-4xl"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 20%, #4ade80 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-bold tracking-widest uppercase text-white/35 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {FRANCHISE_LOCATIONS.map((loc, i) => (
            <FranchiseCard key={loc.id} loc={loc} index={i} />
          ))}
        </div>

        {/* ── Bottom enquiry CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.42, delay: 0.12 }}
          className="text-center mt-16"
        >
          <p className="text-white/40 text-sm mb-4">
            Interested in opening a BunBite franchise?
          </p>
          <a
            href="mailto:franchise@bunbite.com"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl
                       font-bold text-sm tracking-wide
                       border-2 border-[#4ade80]/50 text-[#4ade80]
                       hover:bg-[#4ade80] hover:text-[#14532d] hover:border-[#4ade80]
                       transition-all duration-200 active:scale-95"
          >
            <Mail className="w-4 h-4" />
            Enquire About Franchising
          </a>
        </motion.div>

      </div>
    </section>
  );
}
