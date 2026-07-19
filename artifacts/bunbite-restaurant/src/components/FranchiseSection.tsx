/**
 * FranchiseSection
 * ─────────────────
 * Displays all BunBite franchise locations from franchiseData.ts.
 * Cards are suspended from animated balloons — each unit floats
 * gently with a staggered sine-wave motion.
 *
 * To add a new location: edit src/data/franchiseData.ts only.
 */

import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Mail, Navigation, Store } from 'lucide-react';
import { FRANCHISE_LOCATIONS, type FranchiseLocation } from '@/data/franchiseData';

/* ─── helpers ──────────────────────────────────────────────────── */
function mapsHref(loc: FranchiseLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapsQuery)}`;
}

/* ─── balloon colours — one per card slot, cycling ──────────────── */
const BALLOON_COLORS = [
  { body: '#ef4444', shine: '#fca5a5', knot: '#b91c1c' }, // red
  { body: '#f97316', shine: '#fdba74', knot: '#c2410c' }, // orange
  { body: '#a855f7', shine: '#d8b4fe', knot: '#7e22ce' }, // purple
  { body: '#3b82f6', shine: '#93c5fd', knot: '#1d4ed8' }, // blue
  { body: '#ec4899', shine: '#f9a8d4', knot: '#be185d' }, // pink
  { body: '#14b8a6', shine: '#5eead4', knot: '#0f766e' }, // teal
];

/* ─── balloon SVG ──────────────────────────────────────────────── */
function Balloon({ color }: { color: (typeof BALLOON_COLORS)[number] }) {
  return (
    <svg
      width="56"
      height="72"
      viewBox="0 0 56 72"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {/* Main balloon body */}
      <ellipse cx="28" cy="26" rx="22" ry="25" fill={color.body} />
      {/* Highlight shine */}
      <ellipse cx="20" cy="16" rx="7" ry="9" fill={color.shine} opacity="0.45" />
      {/* Bottom nub */}
      <path d="M28 50 L24 56 L28 54 L32 56 Z" fill={color.knot} />
      {/* String (top portion — connects to line below) */}
      <line x1="28" y1="56" x2="28" y2="72" stroke={color.knot} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── card ─────────────────────────────────────────────────────── */
function FranchiseCard({ loc, index }: { loc: FranchiseLocation; index: number }) {
  const balloonColor = BALLOON_COLORS[index % BALLOON_COLORS.length];

  // Stagger the floating phase per card so they don't all move in sync
  const floatDelay   = index * 0.55;
  const floatDuration = 3.4 + (index % 3) * 0.5; // 3.4 – 4.4 s

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.09, ease: 'easeOut' }}
      className="flex flex-col items-center"
    >
      {/* ── Floating wrapper (balloon + string + card) ── */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: floatDuration,
          delay: floatDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex flex-col items-center w-full"
      >
        {/* Balloon */}
        <Balloon color={balloonColor} />

        {/* String between balloon nub and card top */}
        <div
          className="w-px"
          style={{
            height: 32,
            background: `linear-gradient(to bottom, ${balloonColor.knot}, ${balloonColor.knot}88)`,
          }}
        />

        {/* Card */}
        <article
          className="group relative bg-white rounded-3xl border border-primary/8
                     shadow-[0_6px_32px_rgba(0,0,0,0.10)] w-full overflow-hidden flex flex-col
                     hover:shadow-[0_16px_48px_rgba(0,0,0,0.16)] transition-shadow duration-300"
        >
          {/* Accent top bar — matches balloon colour */}
          <div
            className="h-[3px] w-full shrink-0"
            style={{ background: `linear-gradient(90deg, ${balloonColor.knot}, ${balloonColor.body}, ${balloonColor.knot})` }}
          />

          <div className="p-6 flex flex-col gap-4 flex-1">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl text-primary leading-tight">
                  {loc.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
                  <span className="text-sm font-semibold text-secondary">{loc.city}</span>
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
                           transition-colors duration-300"
                style={{ background: `${balloonColor.body}18` }}
              >
                <Store className="w-5 h-5" style={{ color: balloonColor.body }} />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-primary/8" />

            {/* Info list */}
            <ul className="flex flex-col gap-3 flex-1">
              {/* Address */}
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/6 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </span>
                <p className="text-sm text-foreground/65 leading-snug pt-1">{loc.address}</p>
              </li>

              {/* Hours */}
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/6 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-primary" />
                </span>
                <div className="flex flex-col gap-0.5 pt-1">
                  <p className="text-sm text-foreground/65">
                    <span className="font-semibold text-foreground/80">Mon–Fri&nbsp;</span>
                    {loc.hours.weekdays}
                  </p>
                  <p className="text-sm text-foreground/65">
                    <span className="font-semibold text-foreground/80">Sat–Sun&nbsp;</span>
                    {loc.hours.weekends}
                  </p>
                </div>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/6 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </span>
                <a
                  href={`tel:${loc.phone.replace(/\s/g, '')}`}
                  className="text-sm text-foreground/65 hover:text-primary transition-colors"
                >
                  {loc.phone}
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary/6 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </span>
                <a
                  href={`mailto:${loc.email}`}
                  className="text-sm text-foreground/65 hover:text-primary transition-colors truncate"
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
                         rounded-2xl bg-primary text-white font-bold text-sm
                         tracking-wide hover:bg-primary/90 active:scale-95
                         transition-all duration-200 group/btn
                         shadow-[0_4px_18px_rgba(0,0,0,0.12)]
                         hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
            >
              <Navigation className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-12" />
              Get Directions
            </a>
          </div>
        </article>
      </motion.div>
    </motion.div>
  );
}

/* ─── section ──────────────────────────────────────────────────── */
export default function FranchiseSection() {
  return (
    <section id="franchise" className="py-20 bg-background">
      <div className="container mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-secondary/10 border border-secondary/20 mb-5">
            <Store className="w-3.5 h-3.5 text-secondary" />
            <span className="text-secondary text-xs font-bold tracking-widest uppercase">
              Our Locations
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl text-primary mb-3">
            FRANCHISE
          </h2>
          <p className="text-foreground/55 max-w-xl mx-auto text-base leading-relaxed">
            Find a BunBite near you — or explore a new city through its flavours.
            Every location brings the same bold taste, locally loved.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-8 mb-16 mt-10"
        >
          {[
            { value: `${FRANCHISE_LOCATIONS.length}+`, label: 'Locations' },
            { value: '4', label: 'Countries' },
            { value: '12K+', label: 'Daily Guests' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl text-primary">{stat.value}</div>
              <div className="text-xs font-bold tracking-widest uppercase text-foreground/40 mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Cards grid — extra top padding to make room for balloons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto pt-4">
          {FRANCHISE_LOCATIONS.map((loc, i) => (
            <FranchiseCard key={loc.id} loc={loc} index={i} />
          ))}
        </div>

        {/* Bottom enquiry CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center mt-16"
        >
          <p className="text-foreground/45 text-sm mb-4">
            Interested in opening a BunBite franchise?
          </p>
          <a
            href="mailto:franchise@bunbite.com"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl
                       border-2 border-primary text-primary font-bold text-sm tracking-wide
                       hover:bg-primary hover:text-white transition-all duration-200 active:scale-95"
          >
            <Mail className="w-4 h-4" />
            Enquire About Franchising
          </a>
        </motion.div>

      </div>
    </section>
  );
}
