/**
 * PizzaHero — interactive pizza with realistic cheese-pull on slice hover.
 *
 * Architecture
 * ────────────
 * z:0   Full pizza image (base) — always visible, fills any gap when a slice lifts
 * z:1   Six clipped slice images — sit on top of base at rest, carry interactions
 * z:5   SVG cheese-strand overlay — strands bridge gap → active slice, pointer-events:none
 * z:10  The one active/hovered slice — rendered on top of strands
 *
 * Root cause of the old cheese bug
 * ─────────────────────────────────
 * Without the base image, gaps left by a moving slice exposed the raw background.
 * Adjacent slices' images also bleed cheese along their edges — so the gap showed
 * an ugly mix of background + neighbour cheese fragments.  Adding the z:0 base
 * image fills any gap with the correct pizza texture, so the cheese appears to
 * stretch naturally from the pizza body to the departing slice.
 *
 * Cheese strands
 * ──────────────
 * The SVG layer draws 4 taffy-shaped bezier bands per slice, anchored at the
 * cut-line convergence point (≈ 24 % of pizza radius from the centre, right
 * where the visible cut lines meet the cheese).  Strands taper from wide at
 * the pizza side to narrow at the slice tip and shrink further as distance
 * increases — mimicking how mozzarella stretches and thins before snapping.
 * All SVG updates happen via direct setAttribute() in a requestAnimationFrame
 * loop so zero React re-renders are triggered during animation.
 */

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
// @ts-ignore
import pizzaImg from '@/assets/chicken-pizza.png';

/* ─────────────────────────── constants ─────────────────────────── */

const NUM_SLICES  = 6;
const FLOAT_DIST  = 28;   // px — how far the hovered slice lifts
const GAP_AT_REST = 1.5;  // px — tiny gap between slices at rest

/** Fixed SVG viewport (matches container max-width).  1 SVG unit ≈ 1 CSS px at max size. */
const SZ  = 420;
const CX  = SZ / 2;       // 210 — SVG centre X
const CY  = SZ / 2;       // 210 — SVG centre Y
/** Pizza radius as fraction of SZ — the circular image fills ~90 % of the square container */
const PR  = SZ * 0.435;   // ≈ 183 px at max size

/** Cheese colour sampled from the pizza image (warm mozzarella). */
const CHEESE_FILL   = '#F5E06A';
const CHEESE_STROKE = '#C6920A';

/** Degree offsets for the 4 strands spread across each slice face. */
const STRAND_DEG = [-17, -6, 6, 17] as const;

/**
 * Strand inner radius — how far from the pizza centre the strand anchors.
 * Setting this near the cut-line convergence (≈ 24 %) makes strands look
 * like they emerge right from where the slice cuts meet the cheese.
 */
const STRAND_INNER_R_FRAC = 0.24;

/** Strand starts appearing after this many CSS px of displacement. */
const SHOW_AFTER_PX = 3;

/** Maximum strand width (SVG units) at the pizza-side base. */
const MAX_W = 15;

/* ─────────────────────────── geometry ──────────────────────────── */

function rad(deg: number) { return (deg * Math.PI) / 180; }

/** Build the CSS polygon() clip-path for wedge slice i. */
function wedgeClip(i: number): string {
  const step  = 360 / NUM_SLICES;
  const start = i * step - 90;
  const end   = start + step;
  const R     = 120; // % — extends beyond element edge so boundary clips it
  const pts   = ['50% 50%'];
  for (let d = start; d <= end; d += 3) {
    const r = rad(d);
    pts.push(`${(50 + R * Math.sin(r)).toFixed(2)}% ${(50 - R * Math.cos(r)).toFixed(2)}%`);
  }
  const er = rad(end);
  pts.push(`${(50 + R * Math.sin(er)).toFixed(2)}% ${(50 - R * Math.cos(er)).toFixed(2)}%`);
  return `polygon(${pts.join(',')})`;
}

/** Pre-computed per-slice data (computed once at module level). */
const SLICES = Array.from({ length: NUM_SLICES }, (_, i) => {
  const step  = 360 / NUM_SLICES;
  const cDeg  = i * step + step / 2 - 90;   // centre angle of this wedge
  const r     = rad(cDeg);
  return {
    clip   : wedgeClip(i),
    tx     : +(Math.sin(r)  * FLOAT_DIST).toFixed(3),   // hover target x
    ty     : +(-Math.cos(r) * FLOAT_DIST).toFixed(3),   // hover target y
    rxRest : +(Math.sin(r)  * GAP_AT_REST).toFixed(3),  // rest x
    ryRest : +(-Math.cos(r) * GAP_AT_REST).toFixed(3),  // rest y
    cDeg,
  };
});

/* ──────────────────────── strand path builder ───────────────────── */

/**
 * Returns the SVG `d` string for a single cheese strand — a filled bezier
 * band that is wide at the pizza base, pinched at the waist, and narrow at
 * the slice tip.
 *
 * @param angleRad  outward direction of this strand
 * @param innerR    base attachment radius from pizza centre (SVG units)
 * @param dx, dy    slice displacement (SVG units)
 * @param wBase     half-width at the pizza side base
 */
function strandPath(
  angleRad: number,
  innerR: number,
  dx: number, dy: number,
  wBase: number,
): string {
  // Perpendicular unit vector (for strand width)
  const px =  Math.cos(angleRad);
  const py =  Math.sin(angleRad);

  // Base anchor point — on the stationary pizza at the cut-line zone
  const ax = CX + innerR * Math.sin(angleRad);
  const ay = CY - innerR * Math.cos(angleRad);

  // Tip anchor — same pizza-relative point shifted with the slice
  const bx = ax + dx;
  const by = ay + dy;

  // Midpoint (control point for Bezier curves)
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;

  // Width at each zone: wide base → thin waist → narrow tip
  const wA = wBase;
  const wM = wBase * 0.16;  // waist
  const wB = wBase * 0.30;  // tip

  const p = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;

  return [
    `M ${p(ax + px * wA,  ay + py * wA)}`,
    // Left edge: base → waist → tip
    `C ${p(mx + px * wM,  my + py * wM)}`,
    `  ${p(mx + px * wM,  my + py * wM)}`,
    `  ${p(bx + px * wB,  by + py * wB)}`,
    // Right edge: tip → waist → base (closes the band)
    `L ${p(bx - px * wB,  by - py * wB)}`,
    `C ${p(mx - px * wM,  my - py * wM)}`,
    `  ${p(mx - px * wM,  my - py * wM)}`,
    `  ${p(ax - px * wA,  ay - py * wA)}`,
    'Z',
  ].join(' ');
}

/* ──────────────────────── spring configs ────────────────────────── */

type Spring = { type: 'spring'; stiffness: number; damping: number; mass: number };
const HOVER_SPRING:  Spring = { type: 'spring', stiffness: 260, damping: 22, mass: 0.6 };
const BOUNCE_SPRING: Spring = { type: 'spring', stiffness: 290, damping: 11, mass: 1.1 };

/* ─────────────────────────── component ─────────────────────────── */

export default function PizzaHero() {
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* ── Motion values (18 total — one set per slice, declared individually
        at the top level to satisfy Rules of Hooks — no loops, no conditions) */
  const x0 = useMotionValue(SLICES[0].rxRest); const y0 = useMotionValue(SLICES[0].ryRest); const s0 = useMotionValue(1);
  const x1 = useMotionValue(SLICES[1].rxRest); const y1 = useMotionValue(SLICES[1].ryRest); const s1 = useMotionValue(1);
  const x2 = useMotionValue(SLICES[2].rxRest); const y2 = useMotionValue(SLICES[2].ryRest); const s2 = useMotionValue(1);
  const x3 = useMotionValue(SLICES[3].rxRest); const y3 = useMotionValue(SLICES[3].ryRest); const s3 = useMotionValue(1);
  const x4 = useMotionValue(SLICES[4].rxRest); const y4 = useMotionValue(SLICES[4].ryRest); const s4 = useMotionValue(1);
  const x5 = useMotionValue(SLICES[5].rxRest); const y5 = useMotionValue(SLICES[5].ryRest); const s5 = useMotionValue(1);

  const mvX = useRef([x0, x1, x2, x3, x4, x5]);
  const mvY = useRef([y0, y1, y2, y3, y4, y5]);
  const mvS = useRef([s0, s1, s2, s3, s4, s5]);

  /** Which slice is currently active (hover / tap / drag). Drives z-index. */
  const [activeSlice,  setActiveSlice]  = useState<number | null>(null);
  const [tappedSlice,  setTappedSlice]  = useState<number | null>(null);
  const dragRef = useRef<{ index: number; startX: number; startY: number } | null>(null);

  /** Outer element — measured so we can convert CSS-px motion values → SVG units. */
  const containerRef  = useRef<HTMLDivElement>(null);
  const pizzaSizePx   = useRef(SZ); // updated by ResizeObserver, never triggers re-render

  /* ── SVG element refs — updated by the RAF loop, never via React state ── */
  const svgGroupRefs = useRef<(SVGGElement    | null)[]>(Array(NUM_SLICES).fill(null));
  const svgPathRefs  = useRef<(SVGPathElement | null)[][]>(
    Array.from({ length: NUM_SLICES }, () => Array(STRAND_DEG.length).fill(null)),
  );

  /* ── Track container width for CSS px → SVG unit conversion ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      pizzaSizePx.current = e.contentRect.width || SZ;
    });
    ro.observe(el);
    pizzaSizePx.current = el.offsetWidth || SZ;
    return () => ro.disconnect();
  }, []);

  /* ── RAF loop: update cheese strand SVG paths via direct DOM writes
        (zero React re-renders during animation) ── */
  useEffect(() => {
    let raf: number;

    const tick = () => {
      /**
       * Scale: converts CSS px (motion values) → SVG coordinate units.
       * SVG viewBox is always SZ×SZ; container may be smaller on mobile.
       * e.g. container=280 px → scale = 420/280 = 1.5, so 24 px → 36 SVG units.
       */
      const scale   = SZ / (pizzaSizePx.current || SZ);
      const innerR  = PR * STRAND_INNER_R_FRAC;

      for (let i = 0; i < NUM_SLICES; i++) {
        const { rxRest, ryRest, cDeg } = SLICES[i];

        // Displacement from rest (CSS px → SVG units)
        const dx   = (mvX.current[i].get() - rxRest) * scale;
        const dy   = (mvY.current[i].get() - ryRest) * scale;
        const dist = Math.hypot(dx, dy);

        const grp = svgGroupRefs.current[i];
        if (!grp) continue;

        const threshold = SHOW_AFTER_PX * scale;
        if (dist < threshold) {
          grp.setAttribute('opacity', '0');
          continue;
        }

        // Smooth fade-in once the slice starts moving
        const opacity = Math.min(0.95, (dist - threshold) / (4 * scale));
        grp.setAttribute('opacity', opacity.toFixed(3));

        // Strand width narrows as the slice pulls further away
        const maxStretch = FLOAT_DIST * 3 * scale;
        const stretch    = Math.min(1, dist / maxStretch); // 0=just lifted, 1=max
        const w          = MAX_W * (1 - stretch * 0.72);

        for (let j = 0; j < STRAND_DEG.length; j++) {
          const a = rad(cDeg + STRAND_DEG[j]);
          const d = strandPath(a, innerR, dx, dy, w);
          svgPathRefs.current[i][j]?.setAttribute('d', d);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []); // reads only from refs — no deps needed

  /* ── Animation helper ── */
  const springTo = (i: number, x: number, y: number, sc: number, sp = HOVER_SPRING) => {
    animate(mvX.current[i], x,  sp);
    animate(mvY.current[i], y,  sp);
    animate(mvS.current[i], sc, sp);
  };

  /* ── Hover (desktop / trackpad) ── */
  const onEnter = (i: number) => {
    if (isTouch || dragRef.current) return;
    setActiveSlice(i);
    springTo(i, SLICES[i].tx, SLICES[i].ty, 1.06);
  };
  const onLeave = (i: number) => {
    if (isTouch || dragRef.current?.index === i) return;
    setActiveSlice(null);
    springTo(i, SLICES[i].rxRest, SLICES[i].ryRest, 1);
  };

  /* ── Right-click drag ── */
  const onMouseDown = (e: React.MouseEvent, i: number) => {
    if (e.button !== 2) return;
    e.preventDefault();
    const { rxRest, ryRest } = SLICES[i];
    dragRef.current = { index: i, startX: e.clientX, startY: e.clientY };
    setActiveSlice(i);

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      mvX.current[i].set(rxRest + ev.clientX - dragRef.current.startX);
      mvY.current[i].set(ryRest + ev.clientY - dragRef.current.startY);
      mvS.current[i].set(1.08);
    };
    const onUp = (ev: MouseEvent) => {
      if (ev.button !== 2) return;
      dragRef.current = null;
      setActiveSlice(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      springTo(i, rxRest, ryRest, 1, BOUNCE_SPRING);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  /* ── Touch tap toggle ── */
  const onTap = (i: number) => {
    if (!isTouch) return;
    const next = tappedSlice === i ? null : i;
    setTappedSlice(next);
    setActiveSlice(next);
    springTo(
      i,
      next === i ? SLICES[i].tx    : SLICES[i].rxRest,
      next === i ? SLICES[i].ty    : SLICES[i].ryRest,
      next === i ? 1.06            : 1,
    );
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full max-w-[420px] mx-auto aspect-square select-none"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
      aria-label="Interactive chicken pizza illustration"
    >
      {/* ── Warm glow behind the pizza ── */}
      <div
        className="absolute inset-[10%] rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, #FCD0A1 60%, transparent 100%)' }}
      />

      {/*
       * ── z:0  BASE PIZZA IMAGE ───────────────────────────────────
       * This is the key architectural fix.  The full, unclipped pizza
       * image sits at the very bottom.  When a slice moves outward the
       * gap it leaves is filled by this image — showing the correct
       * cheese/toppings — rather than the raw page background.
       * This eliminates the "floating cheese" artefact completely.
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
       * ── z:1  SIX CLIPPED SLICE LAYERS ──────────────────────────
       * Each carries the interaction surface and the slight at-rest
       * separation (GAP_AT_REST).  At rest they cover the base image
       * perfectly.  The active slice is promoted to z:10 so it renders
       * above the cheese strand SVG (z:5).
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
            zIndex   : activeSlice === i ? 10 : 1,
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

      {/*
       * ── z:5  CHEESE STRAND SVG ──────────────────────────────────
       * Sits between the static slices (z:1) and the active one (z:10).
       * Four taffy-shaped bezier bands per slice, anchored at the
       * cut-line convergence zone, stretch and thin as the slice lifts.
       * All updates via direct setAttribute() in the RAF loop above.
       *
       * viewBox is fixed at SZ×SZ.  The RAF loop converts CSS-px motion
       * values to SVG units using the measured container pixel width.
       */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', zIndex: 5, overflow: 'visible' }}
        viewBox={`0 0 ${SZ} ${SZ}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {SLICES.map((_, i) => (
          <g
            key={i}
            ref={(el) => { svgGroupRefs.current[i] = el; }}
            opacity={0}
          >
            {STRAND_DEG.map((_, j) => (
              <path
                key={j}
                ref={(el) => { svgPathRefs.current[i][j] = el; }}
                fill={CHEESE_FILL}
                stroke={CHEESE_STROKE}
                strokeWidth={0.8}
                strokeLinejoin="round"
              />
            ))}
          </g>
        ))}
      </svg>
    </motion.div>
  );
}
