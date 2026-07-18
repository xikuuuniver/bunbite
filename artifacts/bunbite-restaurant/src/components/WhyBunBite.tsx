import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play, Clapperboard } from 'lucide-react';

/* ── Video data ──────────────────────────────────────────────────────────── */
const VIDEOS = [
  {
    id: 'vQkiSS9r6OQ',
    title: 'Crafting The Perfect Burger',
    duration: '0:45',
  },
  {
    id: 'SKkGV57_dPU',
    title: 'The Bunbite Chicken Pizza 🍕',
    duration: '0:52',
  },
  {
    id: 'oHezTtJVIiE',
    title: 'Bunbite Meal Experience',
    duration: '0:48',
  },
  {
    id: 'hT_nvWreIhg',
    title: 'Behind The Kitchen',
    duration: '1:02',
  },
  {
    id: 'ZJy1ajvMU1k',
    title: 'Customer Favorites',
    duration: '0:38',
  },
];

/* ── Animation ───────────────────────────────────────────────────────────── */
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.9 };

function cardAnim(offset: number) {
  const abs = Math.abs(offset);
  return {
    x: `${offset * 86}%`,
    scale: abs === 0 ? 1 : 0.72,
    opacity: abs === 0 ? 1 : abs === 1 ? 1 : 0,
    rotateY: abs === 0 ? 0 : offset < 0 ? 16 : -16,
    filter: abs === 0 ? 'brightness(1)' : 'brightness(0.82)',
  };
}

/* ── YouTube logo ────────────────────────────────────────────────────────── */
function YTLogo({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const w = size === 'md' ? 28 : 22;
  const h = size === 'md' ? 20 : 16;
  return (
    <svg width={w} height={h} viewBox="0 0 28 20" fill="none">
      <rect width="28" height="20" rx="5" fill="#FF0000" />
      <polygon points="11,5 11,15 20,10" fill="white" />
    </svg>
  );
}

/* ── Thumbnail with fallback ─────────────────────────────────────────────── */
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
      <div className="w-full aspect-video bg-gray-100 flex flex-col items-center justify-center gap-2">
        <Clapperboard className="w-8 h-8 text-gray-300" />
        <p className="text-gray-300 text-xs text-center px-2">{title}</p>
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
    <section id="about" className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
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

        {/* ── Carousel wrapper ── */}
        <div className="relative px-10 sm:px-14">

          {/* 3-D perspective stage */}
          <div className="overflow-hidden" style={{ perspective: '1100px' }}>
            <div
              className="relative flex items-center justify-center"
              style={{ height: 'clamp(220px, 40vw, 480px)' }}
            >
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
                      className="w-[72%] sm:w-[56%] md:w-[44%] pointer-events-auto"
                      animate={cardAnim(offset)}
                      transition={SPRING}
                      style={{ transformStyle: 'preserve-3d', cursor: isCenter ? 'pointer' : 'pointer' }}
                      onClick={() => {
                        if (isCenter) setExpandedId(video.id);
                        else go(offset < 0 ? -1 : 1);
                      }}
                    >
                      {/* Card shell */}
                      <div
                        className="bg-white rounded-[20px] overflow-hidden"
                        style={{
                          boxShadow: isCenter
                            ? '0 24px 64px rgba(0,0,0,0.16), 0 6px 24px rgba(0,0,0,0.10)'
                            : '0 8px 28px rgba(0,0,0,0.13)',
                        }}
                      >
                        {/* ── Thumbnail ── */}
                        <div className="relative overflow-hidden">
                          <VideoThumbnail id={video.id} title={video.title} />

                          {/* Play button */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className={`rounded-full flex items-center justify-center shadow-lg ${
                                isCenter
                                  ? 'w-10 h-10 sm:w-14 sm:h-14 bg-red-500'
                                  : 'w-8 h-8 sm:w-11 sm:h-11 bg-black/40 backdrop-blur-sm border-2 border-white/70'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.92 }}
                            >
                              <Play
                                className={`fill-white text-white ml-0.5 ${
                                  isCenter
                                    ? 'w-4 h-4 sm:w-5 sm:h-5'
                                    : 'w-3 h-3 sm:w-4 sm:h-4'
                                }`}
                              />
                            </motion.div>
                          </div>

                          {/* Duration badge */}
                          <div className="absolute bottom-2 left-2 bg-black/65 text-white text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded font-semibold tracking-wide">
                            {video.duration}
                          </div>
                        </div>

                        {/* ── Below-thumbnail content ── */}
                        <div className="px-3 pt-2 pb-2.5 sm:px-4 sm:pt-3 sm:pb-3.5">
                          <h3
                            className={`font-semibold text-gray-900 leading-snug ${
                              isCenter
                                ? 'text-sm sm:text-base md:text-[17px]'
                                : 'text-[11px] sm:text-sm'
                            }`}
                          >
                            {video.title}
                          </h3>

                          <div className="flex items-center justify-between mt-1.5 sm:mt-2 gap-2">
                            {/* YouTube badge */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <YTLogo size={isCenter ? 'md' : 'sm'} />
                              <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
                                YouTube
                              </span>
                            </div>

                            {/* Watch Now — center card only */}
                            {isCenter && (
                              <motion.button
                                className="flex items-center gap-1 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-secondary text-secondary text-[10px] sm:text-xs font-semibold whitespace-nowrap hover:bg-secondary hover:text-secondary-foreground transition-colors"
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
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left arrow */}
          <button
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
            aria-label="Next video"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
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

      {/* ── Expanded YouTube modal ── */}
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
