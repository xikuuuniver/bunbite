import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play, Clapperboard } from 'lucide-react';

/* ── Video catalogue ─────────────────────────────────────────────────────────
   Replace these IDs with your own YouTube video IDs.
   Thumbnails are fetched directly from YouTube's CDN.
   ────────────────────────────────────────────────────────────────────────── */
const VIDEOS = [
  {
    id: 'vQkiSS9r6OQ',
    title: 'Craft Burger Mastery',
    desc: 'Watch our chefs build the perfect BunBite stack, layer by layer.',
  },
  {
    id: 'SKkGV57_dPU',
    title: 'Fresh Ingredient Stories',
    desc: 'From local farms to your table — only the freshest ingredients.',
  },
  {
    id: 'oHezTtJVIiE',
    title: 'Bold Flavor Combos',
    desc: 'Unexpected pairings that turn every burger into a memory.',
  },
  {
    id: 'hT_nvWreIhg',
    title: 'Behind The Kitchen',
    desc: 'A peek inside the BunBite kitchen where the magic happens.',
  },
  {
    id: 'ZJy1ajvMU1k',
    title: 'Customer Favorites',
    desc: 'Real fans, real reactions — our most-loved burgers on camera.',
  },
];

/* ── Animation helpers ───────────────────────────────────────────────────── */
const SPRING = { type: 'spring' as const, stiffness: 280, damping: 28, mass: 0.9 };

function cardAnim(offset: number) {
  const abs = Math.abs(offset);
  return {
    x: `${offset * 76}%`,
    scale: abs === 0 ? 1 : 0.74,
    opacity: abs === 0 ? 1 : abs === 1 ? 0.48 : 0,
    filter: abs === 0
      ? 'blur(0px) brightness(1)'
      : 'blur(1.5px) brightness(0.55)',
  };
}

/* ── Thumbnail with fallback ─────────────────────────────────────────────── */
function VideoThumbnail({ id, title }: { id: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const triedMq = useRef(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!triedMq.current) {
      // Try medium-quality fallback first
      triedMq.current = true;
      (e.target as HTMLImageElement).src =
        `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    } else {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div className="w-full aspect-video bg-primary/10 flex flex-col items-center justify-center gap-3">
        <Clapperboard className="w-10 h-10 sm:w-14 sm:h-14 text-primary/30" />
        <p className="text-primary/40 text-xs sm:text-sm font-medium text-center px-4">
          {title}
        </p>
      </div>
    );
  }

  return (
    <img
      src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
      alt={title}
      className="w-full aspect-video object-cover"
      draggable={false}
      onError={handleError}
    />
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function WhyBunBite() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const n = VIDEOS.length;

  const go = useCallback(
    (dir: 1 | -1) => setActiveIdx((i) => (i + dir + n) % n),
    [n],
  );

  return (
    <section id="about" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
            WHAT MAKES BUNBITE DIFFERENT?
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto text-lg">
            We believe every burger should be an experience. Not just a meal, but a memory.
          </p>
        </motion.div>

        {/* ── Carousel ── */}
        <div className="relative">
          {/* Clipping wrapper */}
          <div className="overflow-hidden">
            <div className="relative h-[155px] sm:h-[210px] md:h-[290px] flex items-center justify-center">

              {VIDEOS.map((video, i) => {
                let offset = i - activeIdx;
                if (offset > n / 2) offset -= n;
                if (offset < -n / 2) offset += n;

                const isCenter = offset === 0;

                return (
                  <div
                    key={video.id}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: isCenter ? 10 : 5 }}
                  >
                    <motion.div
                      className="w-[75%] sm:w-[58%] md:w-[52%] pointer-events-auto cursor-pointer"
                      animate={cardAnim(offset)}
                      transition={SPRING}
                      whileHover={isCenter ? { y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } } : {}}
                      onClick={() => {
                        if (isCenter) setExpandedId(video.id);
                        else go(offset < 0 ? -1 : 1);
                      }}
                    >
                      <div className="relative rounded-[22px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.18)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition-shadow duration-300 group">

                        {/* Thumbnail with graceful fallback */}
                        <VideoThumbnail id={video.id} title={video.title} />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                        {/* Play button — center card only */}
                        {isCenter && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-secondary/90 flex items-center justify-center shadow-2xl"
                              whileHover={{ scale: 1.14 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Play className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-secondary-foreground fill-secondary-foreground ml-0.5" />
                            </motion.div>
                          </div>
                        )}

                        {/* Caption — center card only */}
                        {isCenter && (
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                            <h3 className="font-display text-base sm:text-xl md:text-2xl text-white leading-tight">
                              {video.title}
                            </h3>
                            <p className="text-white/75 text-xs sm:text-sm mt-0.5 hidden sm:block">
                              {video.desc}
                            </p>
                          </div>
                        )}

                        {/* Hover ring */}
                        {isCenter && (
                          <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-secondary/60 transition-all duration-300 pointer-events-none" />
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Left arrow */}
          <button
            onClick={() => go(-1)}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/80 hover:scale-110 active:scale-95 transition-all"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => go(1)}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/80 hover:scale-110 active:scale-95 transition-all"
            aria-label="Next video"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {VIDEOS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'w-7 h-2.5 bg-secondary'
                  : 'w-2.5 h-2.5 bg-primary/20 hover:bg-primary/40'
              }`}
              aria-label={`Go to video ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── YouTube expand modal ── */}
      <AnimatePresence>
        {expandedId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
