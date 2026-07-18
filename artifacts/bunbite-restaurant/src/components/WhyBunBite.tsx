import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play, Clapperboard } from 'lucide-react';

/* ─── Video data ─────────────────────────────────────────────────────────── */
const VIDEOS = [
  { id: 'vQkiSS9r6OQ', title: 'Crafting The Perfect Burger', duration: '0:45' },
  { id: 'SKkGV57_dPU', title: 'The Bunbite Chicken Pizza 🍕', duration: '0:52' },
  { id: 'oHezTtJVIiE', title: 'Bunbite Meal Experience', duration: '0:48' },
  { id: 'hT_nvWreIhg', title: 'Behind The Kitchen', duration: '1:02' },
  { id: 'ZJy1ajvMU1k', title: 'Customer Favorites', duration: '0:38' },
];

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.9 };
const SIDE_SCALE  = 0.74;
const SIDE_ROTATE = 15; // rotateY degrees
const COS15 = Math.cos((SIDE_ROTATE * Math.PI) / 180); // ≈ 0.966

/*
 * Given the measured card width in px, compute how many px the side card
 * center should be offset from the stage centre so there is a ~20px gap
 * between the visible edges of adjacent cards.
 *
 *   center-card half-width      = cardW / 2
 *   side-card apparent half-w   = (cardW × SIDE_SCALE × cos15°) / 2
 *   required offset for 20px gap = center_half + 20 + side_apparent_half
 */
function sideOffsetPx(cardW: number): number {
  const centerHalf  = cardW / 2;
  const sideAppHalf = (cardW * SIDE_SCALE * COS15) / 2;
  return Math.round(centerHalf + 20 + sideAppHalf);
}

/* ─── YouTube logo ───────────────────────────────────────────────────────── */
function YTLogo({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const [w, h] = size === 'md' ? [28, 20] : [22, 16];
  return (
    <svg width={w} height={h} viewBox="0 0 28 20" fill="none" aria-label="YouTube">
      <rect width="28" height="20" rx="5" fill="#FF0000" />
      <polygon points="11,5 11,15 20,10" fill="white" />
    </svg>
  );
}

/* ─── Thumbnail + two-step 404 fallback ──────────────────────────────────── */
function VideoThumbnail({ id, title }: { id: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const triedMq = useRef(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!triedMq.current) {
      triedMq.current = true;
      (e.target as HTMLImageElement).src =
        `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center gap-2">
        <Clapperboard className="w-8 h-8 text-gray-400" />
        <p className="text-gray-400 text-xs text-center px-3 leading-tight">{title}</p>
      </div>
    );
  }

  return (
    <img
      src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
      alt={title}
      className="w-full aspect-video object-cover block"
      draggable={false}
      onError={handleError}
    />
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function WhyBunBite() {
  const [activeIdx, setActiveIdx]   = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cardW, setCardW]           = useState(0); // measured in px
  const cardRef = useRef<HTMLDivElement>(null);
  const n = VIDEOS.length;

  // Measure the center-card width whenever the layout changes
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setCardW(entry.contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => setActiveIdx((i) => (i + dir + n) % n),
    [n],
  );

  const offsetPx = cardW > 0 ? sideOffsetPx(cardW) : 0;

  // Per-card animation — uses measured px so no percentage-of-element-width confusion
  function cardVariant(offset: number) {
    const abs = Math.abs(offset);
    if (abs > 1) {
      return { x: offset * offsetPx * 1.6, scale: 0, opacity: 0, rotateY: 0, zIndex: 0 };
    }
    return {
      x: offset * offsetPx,
      scale: abs === 0 ? 1 : SIDE_SCALE,
      opacity: 1,
      rotateY: abs === 0 ? 0 : offset < 0 ? SIDE_ROTATE : -SIDE_ROTATE,
      filter: abs === 0 ? 'brightness(1)' : 'brightness(0.76)',
      zIndex: abs === 0 ? 10 : 5,
    };
  }

  return (
    <section id="about" className="py-20 bg-background">
      {/* Header */}
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
            WHAT MAKES BUNBITE DIFFERENT?
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            We believe every burger should be an experience. Not just a meal, but a memory.
          </p>
        </motion.div>
      </div>

      {/*
        CAROUSEL LAYOUT
        ───────────────
        Outer shell uses `overflow-x: clip` (NOT `overflow-hidden`) so that:
          • side cards that translate beyond the container are clipped at the
            viewport edge (no horizontal scroll bar)
          • the clip does NOT create a new scroll container, so absolutely-
            positioned children (arrows) still stack correctly

        The perspective wrapper has NO overflow restriction so the 3-D side
        cards are never clipped by their own container.

        Cards are positioned via translateX in measured pixels (not %) to avoid
        the framer-motion percentage-of-own-width ambiguity.
      */}
      <div style={{ overflowX: 'clip' }}>
        <div className="container mx-auto px-4">

          {/* Perspective stage + arrow row */}
          <div className="relative" style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}>

            {/* Left arrow — outside the card column but inside the container */}
            <button
              onClick={() => go(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20
                         w-10 h-10 rounded-full bg-white border border-gray-200
                         text-gray-500 flex items-center justify-center
                         shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
              aria-label="Previous video"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right arrow */}
            <button
              onClick={() => go(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20
                         w-10 h-10 rounded-full bg-white border border-gray-200
                         text-gray-500 flex items-center justify-center
                         shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
              aria-label="Next video"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/*
              Card column — max-width keeps the center card at a reasonable size.
              We measure this div's width to compute offsetPx dynamically.
              All sibling cards are position:absolute relative to this block,
              so they don't affect document flow / height.
            */}
            <div className="mx-auto relative" style={{ maxWidth: 460 }}>

              {/* ── Center card (in document flow, sets the row height) ── */}
              <div
                ref={cardRef}
                className="bg-white rounded-[20px] overflow-hidden"
                style={{
                  boxShadow: '0 28px 72px rgba(0,0,0,0.18), 0 8px 28px rgba(0,0,0,0.10)',
                  // Transparent — the real center card is rendered as an absolute card below.
                  // This div just holds space so the row has the right height.
                  visibility: 'hidden',
                  pointerEvents: 'none',
                }}
                aria-hidden
              >
                <div className="aspect-video w-full" />
                <div className="px-4 pt-3 pb-3.5">
                  <p className="text-base font-semibold h-6 mb-2" />
                  <div className="flex items-center justify-between mt-2 h-8" />
                </div>
              </div>

              {/* ── All five cards (absolute, animated) ── */}
              {VIDEOS.map((video, i) => {
                let offset = i - activeIdx;
                if (offset >  n / 2) offset -= n;
                if (offset < -n / 2) offset += n;
                const isCenter  = offset === 0;
                const isVisible = Math.abs(offset) <= 1;

                return (
                  <motion.div
                    key={video.id}
                    animate={cardVariant(offset)}
                    transition={SPRING}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      transformStyle: 'preserve-3d',
                      pointerEvents: isVisible ? 'auto' : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (isCenter) setExpandedId(video.id);
                      else go(offset < 0 ? -1 : 1);
                    }}
                  >
                    <div
                      className="bg-white rounded-[20px] overflow-hidden w-full select-none"
                      style={{
                        boxShadow: isCenter
                          ? '0 28px 72px rgba(0,0,0,0.18), 0 8px 28px rgba(0,0,0,0.10)'
                          : '0 8px 30px rgba(0,0,0,0.12)',
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="relative overflow-hidden">
                        <VideoThumbnail id={video.id} title={video.title} />

                        {/* Play button — red (center) · frosted (sides) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            className={`rounded-full flex items-center justify-center shadow-lg ${
                              isCenter
                                ? 'w-14 h-14 bg-red-500'
                                : 'w-11 h-11 bg-black/40 backdrop-blur-sm border-2 border-white/70'
                            }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.92 }}
                          >
                            <Play
                              className={`fill-white text-white ml-0.5 ${
                                isCenter ? 'w-6 h-6' : 'w-4 h-4'
                              }`}
                            />
                          </motion.div>
                        </div>

                        {/* Duration badge */}
                        <div className="absolute bottom-2 left-2 bg-black/65 text-white text-[11px] px-1.5 py-0.5 rounded font-semibold tracking-wide">
                          {video.duration}
                        </div>
                      </div>

                      {/* Content strip */}
                      <div className="px-4 pt-3 pb-3.5">
                        <h3
                          className={`font-semibold text-gray-900 leading-snug line-clamp-1 ${
                            isCenter
                              ? 'text-[15px] md:text-[17px]'
                              : 'text-[13px]'
                          }`}
                        >
                          {video.title}
                        </h3>

                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <YTLogo size={isCenter ? 'md' : 'sm'} />
                            <span className="text-xs text-gray-400 font-medium">YouTube</span>
                          </div>

                          {isCenter && (
                            <motion.button
                              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-secondary text-secondary text-xs font-semibold whitespace-nowrap hover:bg-secondary hover:text-secondary-foreground transition-colors"
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedId(video.id);
                              }}
                            >
                              Watch Now
                              <Play className="w-2.5 h-2.5 fill-current" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-7">
            {VIDEOS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIdx
                    ? 'w-4 h-2.5 bg-red-500'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to video ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Expanded YouTube modal ── */}
      <AnimatePresence>
        {expandedId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setExpandedId(null)}
          >
            <motion.div
              className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${expandedId}?autoplay=1&rel=0&modestbranding=1`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={() => setExpandedId(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
