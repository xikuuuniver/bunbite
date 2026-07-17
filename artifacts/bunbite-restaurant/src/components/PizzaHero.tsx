import { useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
// @ts-ignore
import pizzaImg from '@/assets/chicken-pizza.png';

/* ── Config ─────────────────────────────────────────────── */
const NUM_SLICES  = 6;
const FLOAT_DIST  = 24;   // px: hover outward travel
const GAP_AT_REST = 1.5;  // px: constant resting separation

/* ── Helpers ─────────────────────────────────────────────── */
function toRad(deg: number) { return (deg * Math.PI) / 180; }

function buildClipPath(i: number): string {
  const step     = 360 / NUM_SLICES;
  const startDeg = i * step - 90;
  const endDeg   = startDeg + step;
  const R        = 120;
  const pts: string[] = ['50% 50%'];
  for (let d = startDeg; d <= endDeg; d += 3) {
    const r = toRad(d);
    pts.push(`${(50 + R * Math.sin(r)).toFixed(2)}% ${(50 - R * Math.cos(r)).toFixed(2)}%`);
  }
  const er = toRad(endDeg);
  pts.push(`${(50 + R * Math.sin(er)).toFixed(2)}% ${(50 - R * Math.cos(er)).toFixed(2)}%`);
  return `polygon(${pts.join(', ')})`;
}

/* ── Precomputed slice data ──────────────────────────────── */
const SLICES = Array.from({ length: NUM_SLICES }, (_, i) => {
  const step      = 360 / NUM_SLICES;
  const centerDeg = i * step + step / 2 - 90;
  const rad       = toRad(centerDeg);
  return {
    clipPath : buildClipPath(i),
    tx       : +(Math.sin(rad) * FLOAT_DIST).toFixed(3),
    ty       : +(-Math.cos(rad) * FLOAT_DIST).toFixed(3),
    rxRest   : +(Math.sin(rad) * GAP_AT_REST).toFixed(3),
    ryRest   : +(-Math.cos(rad) * GAP_AT_REST).toFixed(3),
  };
});

/* ── Spring configs ──────────────────────────────────────── */
const HOVER_SPRING  = { type: 'spring', stiffness: 260, damping: 22, mass: 0.6 } as const;
// Lower damping → visible bounce oscillation on drop
const BOUNCE_SPRING = { type: 'spring', stiffness: 290, damping: 11, mass: 1.1 } as const;

/* ── Component ───────────────────────────────────────────── */
export default function PizzaHero() {
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /*
   * One useMotionValue per axis per slice — declared individually at the top
   * level so React's hook rules are satisfied (fixed count, fixed order).
   * We drive these imperatively during drag (no re-render) and hand off to
   * Framer Motion's standalone animate() for spring/bounce transitions.
   */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mx = SLICES.map((s) => useMotionValue(s.rxRest));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const my = SLICES.map((s) => useMotionValue(s.ryRest));
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ms = SLICES.map(() => useMotionValue(1));

  const [tappedSlice, setTappedSlice] = useState<number | null>(null);
  const dragRef = useRef<{ index: number; startX: number; startY: number } | null>(null);

  /* Animate a single slice's motion values with a given spring */
  const springTo = (
    i: number,
    x: number, y: number, scale: number,
    spring = HOVER_SPRING,
  ) => {
    animate(mx[i], x, spring);
    animate(my[i], y, spring);
    animate(ms[i], scale, spring);
  };

  /* ── Hover ── */
  const handleMouseEnter = (i: number) => {
    if (isTouch || dragRef.current) return;
    springTo(i, SLICES[i].tx, SLICES[i].ty, 1.06);
  };

  const handleMouseLeave = (i: number) => {
    if (isTouch || dragRef.current?.index === i) return;
    springTo(i, SLICES[i].rxRest, SLICES[i].ryRest, 1);
  };

  /* ── Right-click drag ── */
  const handleMouseDown = (e: React.MouseEvent, i: number) => {
    if (e.button !== 2) return;   // only right mouse button
    e.preventDefault();

    dragRef.current = { index: i, startX: e.clientX, startY: e.clientY };
    const { rxRest, ryRest } = SLICES[i];

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      // Direct set — instant follow, zero re-renders
      mx[i].set(rxRest + dx);
      my[i].set(ryRest + dy);
      ms[i].set(1.08);
    };

    const onUp = (ev: MouseEvent) => {
      if (ev.button !== 2) return;
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      // Bounce back with realistic spring drop
      springTo(i, rxRest, ryRest, 1, BOUNCE_SPRING);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ── Touch tap toggle ── */
  const handleTap = (i: number) => {
    if (!isTouch) return;
    const next = tappedSlice === i ? null : i;
    setTappedSlice(next);
    springTo(
      i,
      next === i ? SLICES[i].tx     : SLICES[i].rxRest,
      next === i ? SLICES[i].ty     : SLICES[i].ryRest,
      next === i ? 1.06             : 1,
    );
  };

  return (
    <motion.div
      className="relative w-full max-w-[420px] mx-auto aspect-square select-none"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
      aria-label="Interactive chicken pizza illustration"
    >
      {/* Warm under-glow */}
      <div
        className="absolute inset-[10%] rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, #F97316 0%, #FCD0A1 60%, transparent 100%)',
        }}
      />

      {SLICES.map(({ clipPath }, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 cursor-pointer"
          style={{ clipPath, x: mx[i], y: my[i], scale: ms[i] }}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={() => handleMouseLeave(i)}
          onMouseDown={(e) => handleMouseDown(e, i)}
          onContextMenu={(e) => e.preventDefault()}
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
      ))}
    </motion.div>
  );
}
