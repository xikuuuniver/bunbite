import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
// @ts-ignore
import pizzaImg from '@/assets/chicken-pizza.png';

/* ── Config ─────────────────────────────────────────────── */
const NUM_SLICES   = 6;
const FLOAT_DIST   = 22;   // px each slice travels outward on hover
const GAP_AT_REST  = 1.5;  // px of resting separation (always slightly apart)

/* ── Helpers ─────────────────────────────────────────────── */
function toRad(deg: number) { return (deg * Math.PI) / 180; }

/** Build a CSS polygon clip-path that covers the i-th pie slice */
function buildClipPath(i: number): string {
  const step     = 360 / NUM_SLICES;
  const startDeg = i * step - 90;          // rotate so slice 0 points up
  const endDeg   = startDeg + step;
  const R        = 120;                    // % — extends beyond element edges
  const pts: string[] = ['50% 50%'];

  for (let d = startDeg; d <= endDeg; d += 3) {
    const r = toRad(d);
    pts.push(
      `${(50 + R * Math.sin(r)).toFixed(2)}% ${(50 - R * Math.cos(r)).toFixed(2)}%`
    );
  }
  // Guarantee the exact end point is included
  const er = toRad(endDeg);
  pts.push(`${(50 + R * Math.sin(er)).toFixed(2)}% ${(50 - R * Math.cos(er)).toFixed(2)}%`);

  return `polygon(${pts.join(', ')})`;
}

/* ── Precomputed slice data ──────────────────────────────── */
const SLICES = Array.from({ length: NUM_SLICES }, (_, i) => {
  const step      = 360 / NUM_SLICES;
  const centerDeg = i * step + step / 2 - 90; // midpoint angle of the slice
  const rad       = toRad(centerDeg);
  return {
    clipPath : buildClipPath(i),
    // Full hover offset
    tx       : +(Math.sin(rad) * FLOAT_DIST).toFixed(3),
    ty       : +(-Math.cos(rad) * FLOAT_DIST).toFixed(3),
    // Small resting offset so there's a subtle gap at rest
    rxRest   : +(Math.sin(rad) * GAP_AT_REST).toFixed(3),
    ryRest   : +(-Math.cos(rad) * GAP_AT_REST).toFixed(3),
  };
});

/* ── Spring config ───────────────────────────────────────── */
const SPRING = { type: 'spring' as const, stiffness: 180, damping: 18, mass: 0.7 };

/* ── Component ───────────────────────────────────────────── */
export default function PizzaHero() {
  const ref       = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped,  setTapped]  = useState(false);

  // Trigger the float when the pizza scrolls into view on touch devices
  const inView = useInView(ref, { once: false, margin: '-15% 0px -15% 0px' });

  // Detect touch-only devices (no fine pointer)
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const floatActive = hovered || (isTouch && (tapped || inView));

  return (
    <motion.div
      ref={ref}
      className="relative w-full max-w-[420px] mx-auto aspect-square select-none cursor-pointer"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => isTouch && setTapped((t) => !t)}
      aria-label="Interactive chicken pizza illustration"
    >
      {/* Soft glow beneath the pizza */}
      <div
        className="absolute inset-[10%] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, #FCD0A1 60%, transparent 100%)' }}
      />

      {/* Pizza slices */}
      {SLICES.map(({ clipPath, tx, ty, rxRest, ryRest }, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{ clipPath }}
          animate={
            floatActive
              ? { x: tx,     y: ty,     scale: 1.03 }
              : { x: rxRest, y: ryRest, scale: 1    }
          }
          transition={{ ...SPRING, delay: i * 0.03 }}
        >
          <img
            src={pizzaImg}
            alt=""
            aria-hidden
            draggable={false}
            className="w-full h-full object-contain pointer-events-none"
          />
        </motion.div>
      ))}

      {/* Hover hint label — fades out once hovered */}
      <motion.p
        className="absolute -bottom-8 left-0 right-0 text-center text-white/50 text-xs font-medium pointer-events-none hidden sm:block"
        animate={{ opacity: floatActive ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {isTouch ? 'Tap to interact' : 'Hover to interact'}
      </motion.p>
    </motion.div>
  );
}
