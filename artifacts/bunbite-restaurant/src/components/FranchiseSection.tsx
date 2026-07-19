/**
 * FranchiseSection
 * ─────────────────
 * Displays all BunBite franchise locations from franchiseData.ts.
 * Each card shows: name, city, address, hours, phone, email,
 * and a "Get Directions" button that opens Google Maps.
 *
 * To add a new location: edit src/data/franchiseData.ts only.
 */

import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Navigation,
  Store,
} from 'lucide-react';
import { FRANCHISE_LOCATIONS, type FranchiseLocation } from '@/data/franchiseData';

/* ─── helpers ──────────────────────────────────────────────────── */
function mapsHref(loc: FranchiseLocation) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapsQuery)}`;
}

/* ─── card ─────────────────────────────────────────────────────── */
function FranchiseCard({
  loc,
  index,
}: {
  loc: FranchiseLocation;
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.42, delay: (index % 3) * 0.08, ease: 'easeOut' }}
      className="group relative bg-white rounded-3xl border border-primary/8
                 shadow-sm hover:shadow-xl hover:-translate-y-1
                 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Accent top bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary
                      bg-[length:200%_100%] group-hover:animate-[shimmer_1.2s_ease_infinite]" />

      <div className="p-6 flex flex-col gap-4 flex-1">

        {/* Header row */}
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
          <div className="w-10 h-10 rounded-2xl bg-primary/6 flex items-center justify-center
                          group-hover:bg-primary group-hover:text-white transition-colors duration-300 shrink-0">
            <Store className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary/8" />

        {/* Info rows */}
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

        {/* CTA */}
        <a
          href={mapsHref(loc)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-2 w-full
                     py-3 rounded-2xl bg-primary text-white font-bold text-sm
                     tracking-wide hover:bg-primary/90 active:scale-95
                     transition-all duration-200 group/btn
                     shadow-[0_4px_18px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
          aria-label={`Get directions to ${loc.name}`}
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
    <section id="franchise" className="py-20 bg-background">
      <div className="container mx-auto px-4">

        {/* Section header */}
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
          className="flex flex-wrap justify-center gap-8 mb-14 mt-10"
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

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {FRANCHISE_LOCATIONS.map((loc, i) => (
            <FranchiseCard key={loc.id} loc={loc} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center mt-14"
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
