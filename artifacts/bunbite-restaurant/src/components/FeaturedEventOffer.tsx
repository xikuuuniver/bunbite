/**
 * FeaturedEventOffer — Premium FIFA World Cup 2026 popup
 * ───────────────────────────────────────────────────────
 * • Appears automatically on first visit (1.4 s delay)
 * • Backdrop blur + dark overlay
 * • Split banner: Argentina (navy) left  ·  Spain (violet) right
 * • Real player cutout images on each side panel
 * • Centre: promo code, live countdown, Use Coupon CTA
 * • ✕ close button  +  "Don't show again" checkbox (localStorage)
 * • Coupon auth flow: guest → login modal → auto-apply on login
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Copy, Check, Ticket, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useToast } from '@/hooks/use-toast';

import argentinaPlayer from '@/assets/player-argentina.png';
import spainPlayer     from '@/assets/player-spain.jpg';

/* ─── config ─────────────────────────────────────────────────────── */
const PROMO_CODE   = 'FIFA2026';
const DISCOUNT_PCT = 20;
const EXPIRY_DATE  = new Date('2026-09-15T23:59:59Z');
const STORAGE_KEY  = `bunbite_offer_${PROMO_CODE}`;   // new code = fresh popup

/* ─── countdown ──────────────────────────────────────────────────── */
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

/* ─── soccer ball SVG ────────────────────────────────────────────── */
function Ball({ size = 36, opacity = 0.2 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="18.5"
        stroke="white" strokeWidth="1.5"
        fill="white" fillOpacity={opacity * 0.4}
      />
      <path
        d="M20 5.5 L23.8 12.5 L31.5 12.5 L25.8 17.8 L28 25.5
           L20 20.8 L12 25.5 L14.2 17.8 L8.5 12.5 L16.2 12.5 Z"
        fill="white" fillOpacity={opacity * 2.2}
      />
      <circle cx="20" cy="20" r="4" fill="white" fillOpacity={opacity} />
    </svg>
  );
}

/* ─── floating ball ──────────────────────────────────────────────── */
function FloatingBall({
  x, y, size, delay, duration, dir = 1,
}: { x: string; y: string; size: number; delay: number; duration: number; dir?: 1 | -1 }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{ y: [0, -16, 0], rotate: [0, 180 * dir, 360 * dir] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <Ball size={size} opacity={0.18} />
    </motion.div>
  );
}

/* ─── countdown digit ────────────────────────────────────────────── */
function Digit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-11 h-11 rounded-xl bg-white/10 border border-white/15 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={str}
            className="absolute text-lg font-black text-white tabular-nums leading-none"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.17, ease: 'easeOut' }}
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">{label}</span>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────── */
export default function FeaturedEventOffer() {
  const { user }           = useAuth();
  const { openLoginModal } = useOrders();
  const { toast }          = useToast();
  const timeLeft           = useCountdown(EXPIRY_DATE);

  const [open,         setOpen]         = useState(false);
  const [dontShow,     setDontShow]     = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [applied,      setApplied]      = useState(false);
  const [pendingApply, setPendingApply] = useState(false);

  /* Auto-open after short delay unless user dismissed */
  useEffect(() => {
    if (timeLeft.expired) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Flush pending coupon after login */
  const doApply = useCallback(() => {
    setApplied(true);
    toast({
      title: `Coupon ${PROMO_CODE} added successfully!`,
      description: `${DISCOUNT_PCT}% off your next order. Enjoy the match! 🏆`,
    });
  }, [toast]);

  useEffect(() => {
    if (user && pendingApply) {
      doApply();
      setPendingApply(false);
    }
  }, [user, pendingApply, doApply]);

  const handleClose = () => {
    if (dontShow) localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };

  const handleUseCoupon = () => {
    if (applied) return;
    if (!user) { setPendingApply(true); openLoginModal(); return; }
    doApply();
  };

  if (timeLeft.expired) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={handleClose}
            aria-hidden
          />

          {/* ── Modal wrapper (pointer-events pass-through to backdrop) ── */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="FIFA World Cup 2026 exclusive offer"
              className="pointer-events-auto relative w-full max-w-4xl overflow-hidden rounded-3xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.90, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 12 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* ── ✕ Close button ── */}
              <button
                onClick={handleClose}
                aria-label="Close offer popup"
                className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full
                           bg-black/50 border border-white/15 flex items-center justify-center
                           text-white/60 hover:text-white hover:bg-black/70
                           transition-all active:scale-90 backdrop-blur-sm"
              >
                <X size={14} strokeWidth={2.5} />
              </button>

              {/* ── Split banner ── */}
              <div
                className="flex flex-col md:flex-row overflow-hidden"
                style={{ flex: '1 1 auto', minHeight: 0 }}
              >

                {/* ══ ARGENTINA (left / top) ══ */}
                <div
                  className="relative flex-1 min-h-[180px] md:min-h-0 overflow-hidden
                              flex flex-col items-center justify-center py-8 px-6"
                  style={{
                    background:
                      'linear-gradient(145deg, #040D38 0%, #0B1E80 55%, #1737C4 100%)',
                  }}
                >
                  {/* Jersey stripe motif */}
                  {['-8%','18%','44%'].map((left, i) => (
                    <div key={i} className="absolute inset-y-0 pointer-events-none" style={{
                      left, width: '11%',
                      background: 'rgba(116,172,223,0.09)',
                      transform: 'skewX(-5deg)',
                    }} />
                  ))}

                  {/* Floating balls */}
                  <FloatingBall x="6%"  y="8%"  size={28} delay={0}   duration={5.5} />
                  <FloatingBall x="70%" y="60%" size={20} delay={1.3} duration={4.2} dir={-1} />
                  <FloatingBall x="14%" y="70%" size={38} delay={0.6} duration={6.8} />

                  {/* Player photo — transparent PNG, facing centre */}
                  <img
                    src={argentinaPlayer}
                    alt="Argentina player"
                    draggable={false}
                    className="absolute bottom-0 right-0 md:right-[-8%] select-none pointer-events-none"
                    style={{
                      height: '92%',
                      objectFit: 'contain',
                      objectPosition: 'bottom center',
                      maskImage:
                        'linear-gradient(to top, transparent 0%, black 6%, black 88%, transparent 100%)',
                      WebkitMaskImage:
                        'linear-gradient(to top, transparent 0%, black 6%, black 88%, transparent 100%)',
                      filter: 'drop-shadow(-10px 2px 28px rgba(116,172,223,0.55))',
                    }}
                  />

                  {/* Stars + number (layered behind player) */}
                  <div className="relative z-10 flex flex-col items-center pointer-events-none select-none">
                    <div className="flex gap-0.5 mb-1">
                      {[0,1,2].map(i => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <div
                      className="font-black leading-none"
                      style={{
                        fontSize: 'clamp(58px, 9vw, 110px)',
                        color: 'transparent',
                        WebkitTextStroke: '1.5px rgba(116,172,223,0.6)',
                        textShadow: '0 0 50px rgba(116,172,223,0.2)',
                      }}
                    >
                      10
                    </div>
                    <p className="font-black tracking-[0.28em] uppercase text-white/40 mt-0.5"
                       style={{ fontSize: 'clamp(9px, 1.3vw, 12px)' }}>
                      Argentina
                    </p>
                  </div>

                  {/* Blue glow */}
                  <div className="absolute bottom-0 right-0 pointer-events-none" style={{
                    width: 260, height: 260, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(116,172,223,0.18) 0%, transparent 70%)',
                    transform: 'translate(35%, 35%)',
                  }} />
                </div>

                {/* ══ CENTRE PANEL ══ */}
                <div
                  className="relative z-10 flex flex-col items-center justify-center
                              py-8 px-6 md:px-7 w-full md:w-[296px] shrink-0 text-center"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(4,8,24,0.98) 0%, rgba(3,5,18,0.99) 100%)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  {/* Trophy pulse */}
                  <motion.div
                    className="w-10 h-10 rounded-2xl bg-yellow-400/15 border border-yellow-400/25
                                flex items-center justify-center mb-3.5 shrink-0"
                    animate={{ scale: [1, 1.07, 1] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Trophy size={17} className="text-yellow-400" />
                  </motion.div>

                  <p className="text-yellow-400/70 font-black tracking-[0.22em] text-[10px] uppercase mb-1">
                    FIFA World Cup
                  </p>
                  <h2 className="text-white font-black text-[22px] sm:text-2xl leading-tight mb-0.5">
                    DISCORD OFFER
                  </h2>
                  <p className="text-white/22 text-[10px] tracking-wider mb-3">
                    ARG &nbsp;·&nbsp; 2026 &nbsp;·&nbsp; ESP
                  </p>

                  <div className="w-10 h-px bg-white/10 mb-3.5" />

                  {/* Promo code */}
                  <p className="text-white/32 text-[10px] font-semibold uppercase tracking-widest mb-2">
                    Promo Code
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                      <span className="text-white font-black text-[17px] tracking-[0.12em]">
                        {PROMO_CODE}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center
                                  justify-center text-white/50 hover:text-white hover:bg-white/20
                                  transition-all active:scale-95"
                      aria-label="Copy promo code"
                    >
                      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                    </button>
                  </div>

                  {/* Discount pill */}
                  <div className="px-3 py-1 rounded-full bg-yellow-400/12 border border-yellow-400/25 mb-4">
                    <span className="text-yellow-400 text-[11px] font-bold">
                      {DISCOUNT_PCT}% OFF YOUR ORDER
                    </span>
                  </div>

                  {/* Countdown */}
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <Digit value={timeLeft.days}    label="Days" />
                    <span className="text-white/18 text-lg font-bold pt-1.5 leading-none">:</span>
                    <Digit value={timeLeft.hours}   label="Hrs" />
                    <span className="text-white/18 text-lg font-bold pt-1.5 leading-none">:</span>
                    <Digit value={timeLeft.minutes} label="Min" />
                    <span className="text-white/18 text-lg font-bold pt-1.5 leading-none">:</span>
                    <Digit value={timeLeft.seconds} label="Sec" />
                  </div>
                  <p className="text-white/20 text-[10px] mb-4">Expires Sep 15, 2026</p>

                  {/* CTA */}
                  <motion.button
                    onClick={handleUseCoupon}
                    disabled={applied}
                    whileHover={applied ? {} : { scale: 1.04 }}
                    whileTap={applied ? {} : { scale: 0.96 }}
                    className={`w-full py-3 rounded-2xl font-black text-sm tracking-wider transition-colors
                                duration-200 ${
                      applied
                        ? 'bg-green-500/20 border border-green-500/35 text-green-400 cursor-default'
                        : 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black'
                    }`}
                    style={applied ? {} : { boxShadow: '0 4px 20px rgba(251,191,36,0.28)' }}
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
                    <p className="text-white/18 text-[10px] mt-1.5">Login required to apply</p>
                  )}
                </div>

                {/* ══ SPAIN (right / bottom) ══ */}
                <div
                  className="relative flex-1 min-h-[180px] md:min-h-0 overflow-hidden
                              flex flex-col items-center justify-center py-8 px-6"
                  style={{
                    background:
                      'linear-gradient(215deg, #180030 0%, #520A8C 55%, #8421D0 100%)',
                  }}
                >
                  {/* Spain red accent stripe */}
                  <div className="absolute inset-y-0 pointer-events-none" style={{
                    right: '38%', width: '9%',
                    background: 'rgba(196,30,58,0.28)',
                    transform: 'skewX(-4deg)',
                  }} />

                  {/* Floating balls */}
                  <FloatingBall x="72%" y="8%"  size={24} delay={0.5} duration={4.8} />
                  <FloatingBall x="10%" y="56%" size={34} delay={1.8} duration={5.9} dir={-1} />
                  <FloatingBall x="60%" y="68%" size={18} delay={1.0} duration={7.2} />

                  {/* Player photo — JPEG with white bg; radial mask hides the edges */}
                  <img
                    src={spainPlayer}
                    alt="Spain player"
                    draggable={false}
                    className="absolute bottom-0 left-0 md:left-[-8%] select-none pointer-events-none"
                    style={{
                      height: '88%',
                      objectFit: 'contain',
                      objectPosition: 'bottom center',
                      maskImage:
                        'radial-gradient(ellipse 78% 90% at 50% 52%, black 36%, transparent 74%)',
                      WebkitMaskImage:
                        'radial-gradient(ellipse 78% 90% at 50% 52%, black 36%, transparent 74%)',
                      filter: 'drop-shadow(10px 2px 24px rgba(162,36,213,0.6)) saturate(1.12)',
                    }}
                  />

                  {/* Star + number (behind player) */}
                  <div className="relative z-10 flex flex-col items-center pointer-events-none select-none">
                    <Star size={10} className="fill-yellow-400 text-yellow-400 mb-1" />
                    <div
                      className="font-black leading-none"
                      style={{
                        fontSize: 'clamp(58px, 9vw, 110px)',
                        color: 'transparent',
                        WebkitTextStroke: '1.5px rgba(253,224,71,0.6)',
                        textShadow: '0 0 50px rgba(253,224,71,0.18)',
                      }}
                    >
                      19
                    </div>
                    <p className="font-black tracking-[0.28em] uppercase text-white/40 mt-0.5"
                       style={{ fontSize: 'clamp(9px, 1.3vw, 12px)' }}>
                      España
                    </p>
                  </div>

                  {/* Violet glow */}
                  <div className="absolute bottom-0 left-0 pointer-events-none" style={{
                    width: 260, height: 260, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(196,30,58,0.14) 0%, transparent 70%)',
                    transform: 'translate(-35%, 35%)',
                  }} />
                </div>
              </div>{/* end split */}

              {/* ── "Don't show again" footer ── */}
              <div
                className="flex items-center justify-center gap-2.5 px-6 py-3 shrink-0"
                style={{ background: 'rgba(2,4,14,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <input
                  type="checkbox"
                  id="offerDontShow"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.target.checked)}
                  className="w-3.5 h-3.5 cursor-pointer accent-yellow-400 rounded"
                />
                <label
                  htmlFor="offerDontShow"
                  className="text-white/35 text-[11px] cursor-pointer select-none hover:text-white/50 transition-colors"
                >
                  Don't show this again
                </label>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
