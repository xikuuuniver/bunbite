import { useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
// @ts-ignore
import pizzaImg from '@/assets/chicken-pizza.png';

/* ─── config ───────────────────────────────────────────────────── */
const NUM_SLICES  = 6;
const FLOAT_DIST  = 26;   // px — how far a hovered slice lifts
const GAP_AT_REST = 1.5;  // px — tiny gap between slices at rest

/* ─── geometry ─────────────────────────────────────────────────── */
function toRad(deg: number) { return (deg * Math.PI) / 180; }

function buildClip(i: number): string {
  const step  = 360 / NUM_SLICES;
  const start = i * step - 90;
  const end   = start + step;
  const R     = 120; // % — large so the element edge clips the arc naturally
  const pts   = ['50% 50%'];
  for (let d = start; d <= end; d += 3) {
    const r = toRad(d);
    pts.push(`${(50 + R * Math.sin(r)).toFixed(2)}% ${(50 - R * Math.cos(r)).toFixed(2)}%`);
  }
  const er = toRad(end);
  pts.push(`${(50 + R * Math.sin(er)).toFixed(2)}% ${(50 - R * Math.cos(er)).toFixed(2)}%`);
  return `polygon(${pts.join(',')})`;
}

const SLICES = Array.from({ length: NUM_SLICES }, (_, i) => {
  const step = 360 / NUM_SLICES;
  const cDeg = i * step + step / 2 - 90;
  const r    = toRad(cDeg);
  return {
    clip   : buildClip(i),
    tx     : +(Math.sin(r)  * FLOAT_DIST).toFixed(3),
    ty     : +(-Math.cos(r) * FLOAT_DIST).toFixed(3),
    rxRest : +(Math.sin(r)  * GAP_AT_REST).toFixed(3),
    ryRest : +(-Math.cos(r) * GAP_AT_REST).toFixed(3),
  };
});

/* ─── spring presets ────────────────────────────────────────────── */
type Spring = { type: 'spring'; stiffness: number; damping: number; mass: number };
const HOVER_SPRING:  Spring = { type: 'spring', stiffness: 260, damping: 22, mass: 0.6 };
const BOUNCE_SPRING: Spring = { type: 'spring', stiffness: 290, damping: 11, mass: 1.1 };

/* ─── component ─────────────────────────────────────────────────── */
export default function PizzaHero() {
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // 18 motion values — declared individually (Rules of Hooks: no loops)
  const x0 = useMotionValue(SLICES[0].rxRest); const y0 = useMotionValue(SLICES[0].ryRest); const s0 = useMotionValue(1);
  const x1 = useMotionValue(SLICES[1].rxRest); const y1 = useMotionValue(SLICES[1].ryRest); const s1 = useMotionValue(1);
  const x2 = useMotionValue(SLICES[2].rxRest); const y2 = useMotionValue(SLICES[2].ryRest); const s2 = useMotionValue(1);
  const x3 = useMotionValue(SLICES[3].rxRest); const y3 = useMotionValue(SLICES[3].ryRest); const s3 = useMotionValue(1);
  const x4 = useMotionValue(SLICES[4].rxRest); const y4 = useMotionValue(SLICES[4].ryRest); const s4 = useMotionValue(1);
  const x5 = useMotionValue(SLICES[5].rxRest); const y5 = useMotionValue(SLICES[5].ryRest); const s5 = useMotionValue(1);

  const mvX = useRef([x0, x1, x2, x3, x4, x5]);
  const mvY = useRef([y0, y1, y2, y3, y4, y5]);
  const mvS = useRef([s0, s1, s2, s3, s4, s5]);

  // Which slice is lifted — controls z-index only
  const [active, setActive] = useState<number | null>(null);
  const [tapped, setTapped] = useState<number | null>(null);
  const drag = useRef<{ index: number; startX: number; startY: number } | null>(null);

  const springTo = (i: number, x: number, y: number, sc: number, sp = HOVER_SPRING) => {
    animate(mvX.current[i], x,  sp);
    animate(mvY.current[i], y,  sp);
    animate(mvS.current[i], sc, sp);
  };

  // hover
  const onEnter = (i: number) => {
    if (isTouch || drag.current) return;
    setActive(i);
    springTo(i, SLICES[i].tx, SLICES[i].ty, 1.06);
  };
  const onLeave = (i: number) => {
    if (isTouch || drag.current?.index === i) return;
    setActive(null);
    springTo(i, SLICES[i].rxRest, SLICES[i].ryRest, 1);
  };

  // right-click drag
  const onMouseDown = (e: React.MouseEvent, i: number) => {
    if (e.button !== 2) return;
    e.preventDefault();
    const { rxRest, ryRest } = SLICES[i];
    drag.current = { index: i, startX: e.clientX, startY: e.clientY };
    setActive(i);
    const onMove = (ev: MouseEvent) => {
      if (!drag.current) return;
      mvX.current[i].set(rxRest + ev.clientX - drag.current.startX);
      mvY.current[i].set(ryRest + ev.clientY - drag.current.startY);
      mvS.current[i].set(1.08);
    };
    const onUp = (ev: MouseEvent) => {
      if (ev.button !== 2) return;
      drag.current = null;
      setActive(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      springTo(i, rxRest, ryRest, 1, BOUNCE_SPRING);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // touch tap toggle
  const onTap = (i: number) => {
    if (!isTouch) return;
    const next = tapped === i ? null : i;
    setTapped(next);
    setActive(next);
    springTo(
      i,
      next === i ? SLICES[i].tx    : SLICES[i].rxRest,
      next === i ? SLICES[i].ty    : SLICES[i].ryRest,
      next === i ? 1.06            : 1,
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
      {/* glow */}
      <div
        className="absolute inset-[10%] rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, #FCD0A1 60%, transparent 100%)' }}
      />

      {/*
       * LAYER 0 — full, unclipped pizza image.
       *
       * This is the core fix for the cheese artefact.
       *
       * Old behaviour: 6 clipped copies of the same image stacked on a dark
       * background.  When a slice translated outward the gap showed raw
       * background, while adjacent slices' cheese bled to the gap edge,
       * making the cheese look broken / floating.
       *
       * Fix: a complete pizza always sits at the bottom.  The gap left by a
       * departing slice now shows real pizza texture — cheese, sauce, toppings
       * — creating a natural "cheese still connected to the base" look with zero
       * synthetic drawing.  The departing slice's own cheese (from its clipped
       * image, layer 1) rides along on top, so the cheese appears to stretch
       * from the pizza body to the lifted slice.
       */}
      <img
        src={pizzaImg}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/*
       * LAYER 1 — 6 animated, clipped slices (z:1 normally, z:10 when active).
       *
       * At rest the clipped slices sit perfectly over the base image (the
       * tiny GAP_AT_REST offset makes the cut lines visible).
       * When the active slice moves, its z:10 puts it above every other layer;
       * the gap it leaves is filled by the unclipped base below.
       */}
      {SLICES.map(({ clip }, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 cursor-pointer"
          style={{
            clipPath : clip,
            x        : mvX.current[i],
            y        : mvY.current[i],
            scale    : mvS.current[i],
            zIndex   : active === i ? 10 : 1,
          }}
          onMouseEnter={() => onEnter(i)}
          onMouseLeave={() => onLeave(i)}
          onMouseDown={(e) => onMouseDown(e, i)}
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => onTap(i)}
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
