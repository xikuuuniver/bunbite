/**
 * FeaturedEventOffer
 * ──────────────────
 * Full-width split banner for the Argentina vs Spain FIFA World Cup 2026
 * promotional offer.  Placed directly below the "Discover Our Menus" section.
 *
 * Features
 *   • Split design  — Argentina (dark navy) left, Spain (deep violet) right
 *   • Jersey number art (#10 / #19) + floating animated soccer balls
 *   • Centre panel — promo code, live countdown, Use Coupon CTA
 *   • Coupon logic — triggers login modal for guests; applies instantly when logged in
 *   • Smooth entrance animation via framer-motion whileInView
 *   • Fully responsive (flex-col on mobile → flex-row on md+)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Copy, Check, Ticket, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useToast } from '@/hooks/use-toast';

/* ─── offer config ──────────────────────────────────────────────── */
const PROMO_CODE    = 'FIFA2026';
const DISCOUNT_PCT  = 20;
const EXPIRY_DATE   = new Date('2026-09-15T23:59:59Z');

/* ─── countdown ────────────────────────────────────────────────── */
function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days   : Math.floor(diff / 86_400_000),
    hours  : Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
    expired: diff <= 0,
  };
}

function useCountdown(target: Date) {
  const [tl, setTl] = useState(() => getTimeLeft(target));
  useEffect(() => {
    const id = setInterval(() => setTl(getTimeLeft(target)), 1_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return tl;
}

/* ─── soccer ball SVG ───────────────────────────────────────────── */
function Ball({ size = 36, opacity = 0.2 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18.5"
        stroke="white" strokeWidth="1.5"
        fill="white" fillOpacity={opacity * 0.4}
      />
      {/* simplified pentagon patch */}
      <path
        d="M20 5.5 L23.8 12.5 L31.5 12.5 L25.8 17.8 L28 25.5
           L20 20.8 L12 25.5 L14.2 17.8 L8.5 12.5 L16.2 12.5 Z"
        fill="white" fillOpacity={opacity * 2.2}
      />
      <circle cx="20" cy="20" r="4" fill="white" fillOpacity={opacity} />
    </svg>
  );
}

/* ─── floating ball ─────────────────────────────────────────────── */
function FloatingBall({
  x, y, size, delay, duration, dir = 1,
}: {
  x: string; y: string; size: number; delay: number; duration: number; dir?: 1 | -1;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -18, 0], rotate: [0, 180 * dir, 360 * dir] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <Ball size={size} opacity={0.22} />
    </motion.div>
  );
}

/* ─── countdown digit block ─────────────────────────────────────── */
function Digit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-12 h-12 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={str}
            className="absolute text-xl font-black text-white tabular-nums leading-none"
            initial={{ y: -22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 22, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-bold tracking-widest text-white/35 uppercase">
        {label}
      </span>
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────── */
export default function FeaturedEventOffer() {
  const { user }           = useAuth();
  const { openLoginModal } = useOrders();
  const { toast }          = useToast();
  const timeLeft           = useCountdown(EXPIRY_DATE);

  const [copied,       setCopied]       = useState(false);
  const [applied,      setApplied]      = useState(false);
  const [pendingApply, setPendingApply] = useState(false);

  const doApply = useCallback(() => {
    setApplied(true);
    toast({
      title: `Coupon ${PROMO_CODE} added successfully!`,
      description: `${DISCOUNT_PCT}% off your next order. Enjoy the match! 🏆`,
    });
  }, [toast]);

  /* flush pending coupon after successful login */
  useEffect(() => {
    if (user && pendingApply) {
      doApply();
      setPendingApply(false);
    }
  }, [user, pendingApply, doApply]);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };

  const handleUseCoupon = () => {
    if (applied) return;
    if (!user) {
      setPendingApply(true);
      openLoginModal();
      return;
    }
    doApply();
  };

  /* hide widget once the offer has expired */
  if (timeLeft.expired) return null;

  return (
    <section
      className="py-10 px-4 sm:px-6 lg:px-8"
      aria-label="FIFA World Cup 2026 exclusive discount offer"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section label above the banner */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase text-white/40">
            <Trophy size={12} className="text-yellow-400" />
            Featured Event Offer
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        {/* ── banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row"
          style={{ minHeight: 380 }}
        >

          {/* ══════════════════ ARGENTINA (left / top) ══════════════════ */}
          <div
            className="relative flex-1 min-h-[170px] md:min-h-0 overflow-hidden
                        flex flex-col items-center justify-center py-8 px-6"
            style={{
              background:
                'linear-gradient(145deg, #040D38 0%, #0B1E80 55%, #1737C4 100%)',
            }}
          >
            {/* Argentina jersey stripe motif */}
            <div className="absolute inset-0 pointer-events-none">
              {['-8%', '18%', '44%'].map((left, i) => (
                <div
                  key={i}
                  className="absolute inset-y-0"
                  style={{
                    left,
                    width: '11%',
                    background: 'rgba(116,172,223,0.09)',
                    transform: 'skewX(-5deg)',
                  }}
                />
              ))}
            </div>

            {/* Floating soccer balls */}
            <FloatingBall x="6%"  y="8%"  size={30} delay={0}   duration={5.5} />
            <FloatingBall x="70%" y="58%" size={22} delay={1.3} duration={4.2} dir={-1} />
            <FloatingBall x="16%" y="68%" size={44} delay={0.6} duration={6.8} />

            {/* Stars (3 World Cup wins) */}
            <div className="relative z-10 flex gap-0.5 mb-2">
              {[0, 1, 2].map((i) => (
                <Star key={i} size={11} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Jersey number */}
            <div
              className="relative z-10 font-black leading-none select-none"
              style={{
                fontSize: 'clamp(70px, 11vw, 128px)',
                color: 'transparent',
                WebkitTextStroke: '2px rgba(116,172,223,0.85)',
                textShadow: '0 0 60px rgba(116,172,223,0.25)',
              }}
            >
              10
            </div>

            <p
              className="relative z-10 font-black tracking-[0.28em] uppercase text-white/45 mt-1"
              style={{ fontSize: 'clamp(10px, 1.4vw, 13px)' }}
            >
              Argentina
            </p>

            {/* Blue radial glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: 0, right: 0,
                width: 280, height: 280,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(116,172,223,0.18) 0%, transparent 70%)',
                transform: 'translate(35%, 35%)',
              }}
            />
          </div>

          {/* ══════════════════ CENTER PANEL ══════════════════════════ */}
          <div
            className="relative z-10 flex flex-col items-center justify-center
                        py-10 px-7 w-full md:w-[310px] shrink-0 text-center"
            style={{
              background:
                'linear-gradient(180deg, rgba(4,8,24,0.97) 0%, rgba(3,5,18,0.99) 100%)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Trophy pulse */}
            <motion.div
              className="w-10 h-10 rounded-2xl bg-yellow-400/15 border border-yellow-400/25
                          flex items-center justify-center mb-4 shrink-0"
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Trophy size={18} className="text-yellow-400" />
            </motion.div>

            {/* Headline */}
            <p className="text-yellow-400/75 font-black tracking-[0.22em] text-[10px] uppercase mb-1">
              FIFA World Cup
            </p>
            <h2 className="text-white font-black text-2xl sm:text-[26px] leading-tight mb-0.5">
              DISCORD OFFER
            </h2>
            <p className="text-white/25 text-[10px] tracking-wider mb-3">
              ARG &nbsp;·&nbsp; 2026 &nbsp;·&nbsp; ESP
            </p>

            <div className="w-10 h-px bg-white/12 mb-4" />

            {/* Promo code */}
            <p className="text-white/35 text-[10px] font-semibold uppercase tracking-widest mb-2">
              Promo Code
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                <span className="text-white font-black text-lg tracking-[0.12em]">
                  {PROMO_CODE}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center
                            justify-center text-white/50 hover:text-white hover:bg-white/20
                            transition-all active:scale-95"
                aria-label="Copy promo code"
              >
                {copied
                  ? <Check size={13} className="text-green-400" />
                  : <Copy size={13} />}
              </button>
            </div>

            {/* Discount pill */}
            <div className="px-3 py-1 rounded-full bg-yellow-400/12 border border-yellow-400/25 mb-5">
              <span className="text-yellow-400 text-[11px] font-bold">
                {DISCOUNT_PCT}% OFF YOUR ORDER
              </span>
            </div>

            {/* Countdown */}
            <div className="flex items-start gap-1.5 mb-1.5">
              <Digit value={timeLeft.days}    label="Days" />
              <span className="text-white/20 text-lg font-bold pt-2 leading-none">:</span>
              <Digit value={timeLeft.hours}   label="Hrs" />
              <span className="text-white/20 text-lg font-bold pt-2 leading-none">:</span>
              <Digit value={timeLeft.minutes} label="Min" />
              <span className="text-white/20 text-lg font-bold pt-2 leading-none">:</span>
              <Digit value={timeLeft.seconds} label="Sec" />
            </div>
            <p className="text-white/20 text-[10px] mb-5">Expires Sep 15, 2026</p>

            {/* CTA button */}
            <motion.button
              onClick={handleUseCoupon}
              disabled={applied}
              whileHover={applied ? {} : { scale: 1.04 }}
              whileTap={applied ? {} : { scale: 0.96 }}
              className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wider
                          transition-colors duration-200 ${
                applied
                  ? 'bg-green-500/20 border border-green-500/35 text-green-400 cursor-default'
                  : 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black'
              }`}
              style={
                applied
                  ? {}
                  : { boxShadow: '0 4px 20px rgba(251,191,36,0.28)' }
              }
            >
              {applied ? (
                <span className="flex items-center justify-center gap-2">
                  <Check size={14} strokeWidth={3} /> Coupon Applied!
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Ticket size={14} /> Use Coupon
                </span>
              )}
            </motion.button>

            {!user && !applied && (
              <p className="text-white/20 text-[10px] mt-2 leading-snug">
                Login required to apply
              </p>
            )}
          </div>

          {/* ══════════════════ SPAIN (right / bottom) ════════════════ */}
          <div
            className="relative flex-1 min-h-[170px] md:min-h-0 overflow-hidden
                        flex flex-col items-center justify-center py-8 px-6"
            style={{
              background:
                'linear-gradient(215deg, #180030 0%, #520A8C 55%, #8421D0 100%)',
            }}
          >
            {/* Spain red accent stripe */}
            <div
              className="absolute inset-y-0 pointer-events-none"
              style={{
                right: '38%',
                width: '9%',
                background: 'rgba(196,30,58,0.28)',
                transform: 'skewX(-4deg)',
              }}
            />

            {/* Floating soccer balls */}
            <FloatingBall x="72%" y="8%"  size={26} delay={0.5} duration={4.8} />
            <FloatingBall x="10%" y="56%" size={38} delay={1.8} duration={5.9} dir={-1} />
            <FloatingBall x="60%" y="68%" size={20} delay={1.0} duration={7.2} />

            {/* Star (1 World Cup win) */}
            <div className="relative z-10 flex gap-0.5 mb-2">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
            </div>

            {/* Jersey number */}
            <div
              className="relative z-10 font-black leading-none select-none"
              style={{
                fontSize: 'clamp(70px, 11vw, 128px)',
                color: 'transparent',
                WebkitTextStroke: '2px rgba(253,224,71,0.78)',
                textShadow: '0 0 60px rgba(253,224,71,0.22)',
              }}
            >
              19
            </div>

            <p
              className="relative z-10 font-black tracking-[0.28em] uppercase text-white/45 mt-1"
              style={{ fontSize: 'clamp(10px, 1.4vw, 13px)' }}
            >
              España
            </p>

            {/* Gold/red radial glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: 0, left: 0,
                width: 280, height: 280,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(196,30,58,0.14) 0%, transparent 70%)',
                transform: 'translate(-35%, 35%)',
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
