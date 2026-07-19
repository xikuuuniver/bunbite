import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
// @ts-ignore
import pizzaImg from '@/assets/chicken-pizza.png';

/* ── Config ──────────────────────────────────────────────────── */
const NUM_SLICES  = 6;
const FLOAT_DIST  = 24;   // px — how far a hovered slice lifts
const GAP_AT_REST = 1.5;  // px — tiny separation between slices at rest

// Fixed SVG coordinate space (matches container max-width in CSS px)
const SVG_SIZE = 420;
const SVG_CX   = SVG_SIZE / 2;        // 210
const SVG_CY   = SVG_SIZE / 2;        // 210
const SVG_R    = SVG_SIZE * 0.46;     // pizza radius in SVG units ≈ 193

// Cheese strand visual config
const CHEESE_FILL    = '#F7E59E';     // warm mozzarella yellow
const CHEESE_STROKE  = '#C9972A';     // slightly darker edge for depth
const STRAND_OFFSETS = [-16, -6, 5, 15]; // degree offsets → 4 strands per slice
const MIN_PULL_PX    = 2;             // px — below this, no strands rendered
const MAX_STRAND_W   = 13;            // SVG units — width at the pizza-side base

/* ── Geometry helpers ─────────────────────────────────────────── */
function toRad(deg: number) { return (deg * Math.PI) / 180; }

/** Build a CSS polygon clip-path for wedge slice `i`. */
function buildClipPath(i: number): string {
  const step     = 360 / NUM_SLICES;
  const startDeg = i * step - 90;
  const endDeg   = startDeg + step;
  const R        = 120; // %-radius (can exceed 100; clipped by the element boundary)
  const pts: string[] = ['50% 50%'];
  for (let d = startDeg; d <= endDeg; d += 3) {
    const r = toRad(d);
    pts.push(`${(50 + R * Math.sin(r)).toFixed(2)}% ${(50 - R * Math.cos(r)).toFixed(2)}%`);
  }
  const er = toRad(endDeg);
  pts.push(`${(50 + R * Math.sin(er)).toFixed(2)}% ${(50 - R * Math.cos(er)).toFixed(2)}%`);
  return `polygon(${pts.join(', ')})`;
}

/** Pre-computed per-slice geometry (stable across renders). */
const SLICES = Array.from({ length: NUM_SLICES }, (_, i) => {
  const step      = 360 / NUM_SLICES;
  const centerDeg = i * step + step / 2 - 90;
  const rad       = toRad(centerDeg);
  return {
    clipPath  : buildClipPath(i),
    tx        : +(Math.sin(rad)  * FLOAT_DIST).toFixed(3),
    ty        : +(-Math.cos(rad) * FLOAT_DIST).toFixed(3),
    rxRest    : +(Math.sin(rad)  * GAP_AT_REST).toFixed(3),
    ryRest    : +(-Math.cos(rad) * GAP_AT_REST).toFixed(3),
    centerDeg,
  };
});

/* ── Cheese strand path builder ──────────────────────────────── */
/**
 * Returns the SVG `d` attribute for a single taffy-pull cheese strand.
 *
 * The shape is a filled bezier band:
 *   – wide at the pizza base (cheese side)
 *   – pinched at the waist (middle of pull)
 *   – narrow at the slice tip (where it would snap)
 *
 * @param cx, cy   – SVG centre of the pizza
 * @param rad      – outward angle of this strand (radians)
 * @param innerR   – radius of the base anchor point (SVG units)
 * @param dx, dy   – slice displacement in SVG units
 * @param wBase    – strand half-width at the pizza base
 */
function buildStrandPath(
  cx: number, cy: number,
  rad: number,
  innerR: number,
  dx: number, dy: number,
  wBase: number,
): string {
  // Unit vectors: along the strand direction and perpendicular to it
  const alX =  Math.sin(rad);
  const alY = -Math.cos(rad);
  const pX  =  Math.cos(rad);   // perpendicular (for width)
  const pY  =  Math.sin(rad);

  // Base anchor – on the stationary pizza body
  const ax = cx + innerR * alX;
  const ay = cy + innerR * alY;

  // Tip anchor – same pizza-relative point displaced with the slice
  const bx = ax + dx;
  const by = ay + dy;

  // Control point at the mid-line
  const midX = (ax + bx) / 2;
  const midY = (ay + by) / 2;

  // Width at each section
  const wA = wBase;            // base (pizza side) — widest
  const wM = wBase * 0.18;    // waist — narrowest
  const wB = wBase * 0.28;    // tip (slice side) — still narrow

  function pt(x: number, y: number) { return `${x.toFixed(2)},${y.toFixed(2)}`; }

  return [
    // Left edge: base → waist → tip
    `M ${pt(ax + pX * wA, ay + pY * wA)}`,
    `C ${pt(midX + pX * wM, midY + pY * wM)}`,
    `  ${pt(midX + pX * wM, midY + pY * wM)}`,
    `  ${pt(bx + pX * wB,   by + pY * wB)}`,
    // Right edge: tip → waist → base (closing the band)
    `L ${pt(bx - pX * wB,   by - pY * wB)}`,
    `C ${pt(midX - pX * wM, midY - pY * wM)}`,
    `  ${pt(midX - pX * wM, midY - pY * wM)}`,
    `  ${pt(ax - pX * wA,   ay - pY * wA)}`,
    `Z`,
  ].join(' ');
}

/* ── Spring configs ───────────────────────────────────────────── */
interface SpringConfig { type: 'spring'; stiffness: number; damping: number; mass: number; }
const HOVER_SPRING:  SpringConfig = { type: 'spring', stiffness: 260, damping: 22, mass: 0.6 };
const BOUNCE_SPRING: SpringConfig = { type: 'spring', stiffness: 290, damping: 11, mass: 1.1 };

/* ── Component ───────────────────────────────────────────────── */
export default function PizzaHero() {
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /*
   * All motion values declared individually at the top level — this strictly
   * follows React's Rules of Hooks (no loops, no conditionals).
   * NUM_SLICES = 6 → exactly 18 values (x, y, scale × 6).
   */
  const x0 = useMotionValue(SLICES[0].rxRest); const y0 = useMotionValue(SLICES[0].ryRest); const s0 = useMotionValue(1);
  const x1 = useMotionValue(SLICES[1].rxRest); const y1 = useMotionValue(SLICES[1].ryRest); const s1 = useMotionValue(1);
  const x2 = useMotionValue(SLICES[2].rxRest); const y2 = useMotionValue(SLICES[2].ryRest); const s2 = useMotionValue(1);
  const x3 = useMotionValue(SLICES[3].rxRest); const y3 = useMotionValue(SLICES[3].ryRest); const s3 = useMotionValue(1);
  const x4 = useMotionValue(SLICES[4].rxRest); const y4 = useMotionValue(SLICES[4].ryRest); const s4 = useMotionValue(1);
  const x5 = useMotionValue(SLICES[5].rxRest); const y5 = useMotionValue(SLICES[5].ryRest); const s5 = useMotionValue(1);

  const mx = useRef([x0, x1, x2, x3, x4, x5]);
  const my = useRef([y0, y1, y2, y3, y4, y5]);
  const ms = useRef([s0, s1, s2, s3, s4, s5]);

  const [tappedSlice, setTappedSlice] = useState<number | null>(null);
  /** Which slice is currently lifted (drives z-index). */
  const [activeSlice,  setActiveSlice]  = useState<number | null>(null);
  const dragRef      = useRef<{ index: number; startX: number; startY: number } | null>(null);
  /** Ref to the outer div so we can measure its actual pixel width. */
  const containerRef = useRef<HTMLDivElement>(null);
  /** Actual container width in CSS px (kept in a ref, never triggers re-renders). */
  const pizzaSizeRef = useRef(SVG_SIZE);

  /* ─── SVG element refs updated directly in the RAF loop (no re-renders) ─── */
  const strandGroupRefs = useRef<(SVGGElement | null)[]>(Array(NUM_SLICES).fill(null));
  const strandPathRefs  = useRef<(SVGPathElement | null)[][]>(
    Array.from({ length: NUM_SLICES }, () => Array(STRAND_OFFSETS.length).fill(null)),
  );

  /* ── Track container size (CSS px → SVG unit scale factor) ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      pizzaSizeRef.current = entries[0].contentRect.width || SVG_SIZE;
    });
    ro.observe(el);
    pizzaSizeRef.current = el.offsetWidth || SVG_SIZE;
    return () => ro.disconnect();
  }, []);

  /* ── RAF loop: update cheese strand SVG paths via direct DOM writes ── */
  useEffect(() => {
    let rafId: number;

    const tick = () => {
      /*
       * Scale factor converts CSS-px motion values to SVG coordinate units.
       * The SVG uses a fixed 420×420 viewBox; if the container is 280px wide
       * the scale is 420/280 = 1.5 — so a 24px hover lift becomes 36 SVG units.
       */
      const scale  = SVG_SIZE / (pizzaSizeRef.current || SVG_SIZE);
      const innerR = SVG_R * 0.30; // cheese attachment radius in SVG units

      for (let i = 0; i < NUM_SLICES; i++) {
        const { rxRest, ryRest, centerDeg } = SLICES[i];

        // Displacement from the at-rest position, in SVG units
        const dx   = (mx.current[i].get() - rxRest) * scale;
        const dy   = (my.current[i].get() - ryRest) * scale;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const group = strandGroupRefs.current[i];
        if (!group) continue;

        const threshold = MIN_PULL_PX * scale;
        if (dist < threshold) {
          group.setAttribute('opacity', '0');
          continue;
        }

        // Fade in quickly once the slice starts moving
        const fadeRange = 5 * scale;
        const opacity   = Math.min(0.95, (dist - threshold) / fadeRange);
        group.setAttribute('opacity', opacity.toFixed(3));

        // Strand width narrows as the slice pulls further away
        const maxPull   = FLOAT_DIST * 3 * scale;
        const pullRatio = Math.min(1, dist / maxPull);
        const w         = MAX_STRAND_W * (1 - pullRatio * 0.70);

        for (let j = 0; j < STRAND_OFFSETS.length; j++) {
          const angleRad = toRad(centerDeg + STRAND_OFFSETS[j]);
          const d        = buildStrandPath(SVG_CX, SVG_CY, angleRad, innerR, dx, dy, w);
          const path     = strandPathRefs.current[i]?.[j];
          if (path) path.setAttribute('d', d);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []); // no deps — reads from refs only

  /* ── Animation helper ─────────────────────────────────────── */
  const springTo = (
    i: number,
    x: number, y: number, scale: number,
    spring = HOVER_SPRING,
  ) => {
    animate(mx.current[i], x,     spring);
    animate(my.current[i], y,     spring);
    animate(ms.current[i], scale, spring);
  };

  /* ── Hover (desktop) ─────────────────────────────────────── */
  const handleMouseEnter = (i: number) => {
    if (isTouch || dragRef.current) return;
    setActiveSlice(i);
    springTo(i, SLICES[i].tx, SLICES[i].ty, 1.06);
  };

  const handleMouseLeave = (i: number) => {
    if (isTouch || dragRef.current?.index === i) return;
    setActiveSlice(null);
    springTo(i, SLICES[i].rxRest, SLICES[i].ryRest, 1);
  };

  /* ── Right-click drag ────────────────────────────────────── */
  const handleMouseDown = (e: React.MouseEvent, i: number) => {
    if (e.button !== 2) return;
    e.preventDefault();
    const { rxRest, ryRest } = SLICES[i];
    dragRef.current = { index: i, startX: e.clientX, startY: e.clientY };
    setActiveSlice(i);

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      mx.current[i].set(rxRest + ev.clientX - dragRef.current.startX);
      my.current[i].set(ryRest + ev.clientY - dragRef.current.startY);
      ms.current[i].set(1.08);
    };

    const onUp = (ev: MouseEvent) => {
      if (ev.button !== 2) return;
      dragRef.current = null;
      setActiveSlice(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      springTo(i, rxRest, ryRest, 1, BOUNCE_SPRING);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  };

  /* ── Touch tap toggle ────────────────────────────────────── */
  const handleTap = (i: number) => {
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

  const mvX = mx.current;
  const mvY = my.current;
  const mvS = ms.current;

  return (
    /*
     * Outer div measured via containerRef so the RAF loop knows the actual
     * CSS pixel width for coordinate conversion.
     */
    <div
      ref={containerRef}
      className="relative w-full max-w-[420px] mx-auto aspect-square"
    >
      <motion.div
        className="relative w-full h-full select-none"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
        aria-label="Interactive chicken pizza illustration"
      >
        {/* Warm under-glow */}
        <div
          className="absolute inset-[10%] rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F97316 0%, #FCD0A1 60%, transparent 100%)' }}
        />

        {/*
         * Z-layer stack (all absolute, same inset-0 origin):
         *   z-1   base pizza slices (all non-active)
         *   z-5   cheese strand SVG overlay
         *   z-10  the currently active/hovered slice (rendered last → on top)
         *
         * This makes strands appear to emerge from the pizza surface (below the
         * active slice) while still being visible over the neighbouring slices.
         */}

        {/* ── Base pizza slices ── */}
        {SLICES.map(({ clipPath }, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 cursor-pointer"
            style={{
              clipPath,
              x: mvX[i],
              y: mvY[i],
              scale: mvS[i],
              zIndex: activeSlice === i ? 10 : 1,
            }}
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

        {/*
         * ── Cheese pull strand SVG (z-5) ──
         *
         * Sits between the static pizza slices (z-1) and the active slice (z-10).
         * Updated every animation frame by reading motion values directly —
         * zero React re-renders; only direct SVGElement.setAttribute() calls.
         *
         * viewBox is fixed at SVG_SIZE × SVG_SIZE. The container's actual CSS
         * width is stored in pizzaSizeRef and used to scale motion-value px into
         * SVG coordinate units inside the RAF loop.
         */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%', zIndex: 5, overflow: 'visible' }}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {SLICES.map((_, i) => (
            <g
              key={i}
              ref={(el) => { strandGroupRefs.current[i] = el; }}
              opacity={0}
            >
              {STRAND_OFFSETS.map((_, j) => (
                <path
                  key={j}
                  ref={(el) => { strandPathRefs.current[i][j] = el; }}
                  fill={CHEESE_FILL}
                  stroke={CHEESE_STROKE}
                  strokeWidth={0.7}
                  strokeLinejoin="round"
                />
              ))}
            </g>
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
