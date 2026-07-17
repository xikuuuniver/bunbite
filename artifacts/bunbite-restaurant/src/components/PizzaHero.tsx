import { useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import pizzaImg from '@/assets/chicken-pizza.png';

/* ── Config ─────────────────────────────────────────────── */
const NUM_SLICES  = 6;
const FLOAT_DIST  = 24;   // px each hovered slice travels outward
const GAP_AT_REST = 1.5;  // px of constant resting separation

/* ── Helpers ─────────────────────────────────────────────── */
function toRad(deg: number) { return (deg * Math.PI) / 180; }

/** CSS polygon clip-path covering the i-th pie slice */
function buildClipPath(i: number): string {
  const step     = 360 / NUM_SLICES;
  const startDeg = i * step - 90;   // rotate so slice 0 points upward
  const endDeg   = startDeg + step;
  const R        = 120;             // % — safely extends past element edges
  const pts: string[] = ['50% 50%'];

  for (let d = startDeg; d <= endDeg; d += 3) {
    const r = toRad(d);
    pts.push(
      `${(50 + R * Math.sin(r)).toFixed(2)}% ${(50 - R * Math.cos(r)).toFixed(2)}%`
    );
  }
  // Guarantee the exact end angle is included
  const er = toRad(endDeg);
  pts.push(`${(50 + R * Math.sin(er)).toFixed(2)}% ${(50 - R * Math.cos(er)).toFixed(2)}%`);

  return `polygon(${pts.join(', ')})`;
}

/* ── Precomputed per-slice data ──────────────────────────── */
interface SliceData {
  clipPath : string;
  /** Hover: translate outward along slice centre angle */
  tx       : number;
  ty       : number;
  /** Rest: tiny gap so cuts are always subtly visible */
  rxRest   : number;
  ryRest   : number;
}

const SLICES: SliceData[] = Array.from({ length: NUM_SLICES }, (_, i) => {
  const step      = 360 / NUM_SLICES;
  const centerDeg = i * step + step / 2 - 90; // midpoint angle of this slice
  const rad       = toRad(centerDeg);
  return {
    clipPath : buildClipPath(i),
    tx       : +(Math.sin(rad) * FLOAT_DIST).toFixed(3),
    ty       : +(-Math.cos(rad) * FLOAT_DIST).toFixed(3),
    rxRest   : +(Math.sin(rad) * GAP_AT_REST).toFixed(3),
    ryRest   : +(-Math.cos(rad) * GAP_AT_REST).toFixed(3),
  };
});

/* ── Spring ──────────────────────────────────────────────── */
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 22, mass: 0.6 };

/* ── Component ───────────────────────────────────────────── */
export default function PizzaHero() {
  /** Which slice (by index) is currently hovered; null = none */
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  /** On touch devices, tapped slice toggles its animation */
  const [tappedSlice, setTappedSlice]   = useState<number | null>(null);

  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const handleTap = (i: number) => {
    if (!isTouch) return;
    setTappedSlice((prev) => (prev === i ? null : i));
  };

  return (
    <motion.div
      className="relative w-full max-w-[420px] mx-auto aspect-square select-none"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
      aria-label="Interactive chicken pizza illustration"
    >
      {/* Warm glow beneath the pizza */}
      <div
        className="absolute inset-[10%] rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, #F97316 0%, #FCD0A1 60%, transparent 100%)',
        }}
      />

      {/* Pizza slices — each listens only for events inside its own wedge */}
      {SLICES.map(({ clipPath, tx, ty, rxRest, ryRest }, i) => {
        const isHovered = hoveredSlice === i;
        const isTapped  = tappedSlice  === i;
        const active    = isHovered || isTapped;

        return (
          <motion.div
            key={i}
            className="absolute inset-0 cursor-pointer"
            style={{
              clipPath,
              // clip-path also clips pointer-events, so only the visible
              // wedge area receives mouse/touch events for this element.
            }}
            animate={
              active
                ? { x: tx,     y: ty,     scale: 1.06 }
                : { x: rxRest, y: ryRest, scale: 1    }
            }
            transition={SPRING}
            onMouseEnter={() => !isTouch && setHoveredSlice(i)}
            onMouseLeave={() => !isTouch && setHoveredSlice(null)}
            onClick={() => handleTap(i)}
          >
            <img
              src={pizzaImg}
              alt=""
              aria-hidden
              draggable={false}
              className="w-full h-full object-contain pointer-events-none"
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
