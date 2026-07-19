/**
 * FeaturedEventOffer — Premium FIFA World Cup 2026 popup
 * ───────────────────────────────────────────────────────
 * • Appears automatically on first visit (0.6 s delay)
 * • Split banner: Argentina (navy) left · Spain (violet) right
 * • Transparent player cutouts — same height, symmetric alignment
 * • Jersey number sits behind each player (z-10 number, z-20 player)
 * • Centre: promo code, live countdown, Use Coupon CTA
 * • ✕ close + "Don't show again" checkbox (localStorage)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Copy, Check, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useToast } from '@/hooks/use-toast';

import argentinaPlayer from '@/assets/player-argentina.png';
import spainPlayer     from '@/assets/player-spain.png';

/* ─── config ─────────────────────────────────────────────────────── */
const PROMO_CODE   = 'FIFA2026';
const DISCOUNT_PCT = 20;
const EXPIRY_DATE  = new Date('2026-09-15T23:59:59Z');
const STORAGE_KEY  = `bunbite_offer_${PROMO_CODE}`;

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

/* ─── animated soccer ball ───────────────────────────────────────── */
function FloatingBall({
  x, y, size, delay, duration, dir = 1,
}: { x: string; y: string; size: number; delay: number; duration: number; dir?: 1 | -1 }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, zIndex: 2 }}
      animate={{ y: [0, -14, 0], rotate: [0, 180 * dir, 360 * dir] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18.5" stroke="white" strokeWidth="1.5"
          fill="white" fillOpacity={0.06} />
        <path d="M20 5.5 L23.8 12.5 L31.5 12.5 L25.8 17.8 L28 25.5
                 L20 20.8 L12 25.5 L14.2 17.8 L8.5 12.5 L16.2 12.5 Z"
          fill="white" fillOpacity={0.35} />
        <circle cx="20" cy="20" r="4" fill="white" fillOpacity={0.18} />
      </svg>
    </motion.div>
  );
}

/* ─── countdown digit ────────────────────────────────────────────── */
function Digit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-11 h-11 rounded-xl bg-white/10 border border-white/15
                      overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={str}
            className="absolute text-[17px] font-black text-white tabular-nums leading-none"
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{ y: 18,   opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
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

  useEffect(() => {
    if (timeLeft.expired) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const doApply = useCallback(() => {
    setApplied(true);
    toast({
      title: `Coupon ${PROMO_CODE} added!`,
      description: `${DISCOUNT_PCT}% off your next order. Enjoy the match! 🏆`,
    });
  }, [toast]);

  useEffect(() => {
    if (user && pendingApply) { doApply(); setPendingApply(false); }
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

  /**
   * Shared player base style — height-driven so both players occupy the
   * same fraction of the panel regardless of source image dimensions.
   */
  const playerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    height: '92%',       // both players fill the same panel height
    width: 'auto',       // aspect ratio preserved
    maxWidth: '95%',     // never overflow the panel on narrow viewports
    objectFit: 'contain',
    objectPosition: 'bottom center',
    zIndex: 20,
    userSelect: 'none',
    pointerEvents: 'none',
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            aria-hidden
          />

          {/* Modal wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="FIFA World Cup 2026 exclusive offer"
              className="pointer-events-auto relative w-full max-w-[900px] overflow-hidden rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
              initial={{ opacity: 0, scale: 0.88, y: 28 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{ opacity: 0,   scale: 0.92,  y: 14 }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              style={{ maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}
            >
              {/* ✕ Close */}
              <button
                onClick={handleClose}
                aria-label="Close offer popup"
                className="absolute top-3 right-3 z-40 w-8 h-8 rounded-full
                           bg-black/55 border border-white/15 flex items-center justify-center
                           text-white/55 hover:text-white hover:bg-black/75
                           transition-all active:scale-90 backdrop-blur-sm"
              >
                <X size={14} strokeWidth={2.5} />
              </button>

              {/* ── Split banner ── */}
              <div className="flex flex-col md:flex-row" style={{ flex: '1 1 auto', minHeight: 0 }}>

                {/* ══ ARGENTINA (left) ══ */}
                <div
                  className="relative flex-1 overflow-hidden"
                  style={{
                    minHeight: 260,
                    background: 'linear-gradient(150deg, #020B2E 0%, #0A1A6E 45%, #1535B8 100%)',
                  }}
                >
                  {/* Vertical jersey stripes */}
                  {['-6%', '20%', '46%', '72%'].map((left, i) => (
                    <div key={i} className="absolute inset-y-0 pointer-events-none" style={{
                      left, width: '10%',
                      background: 'rgba(100,160,230,0.07)',
                      transform: 'skewX(-6deg)',
                    }} />
                  ))}

                  {/* Radial glow behind player */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse 70% 60% at 50% 85%, rgba(80,140,230,0.30) 0%, transparent 70%)',
                    zIndex: 1,
                  }} />

                  {/* Floating balls (z-2, behind jersey number) */}
                  <FloatingBall x="8%"  y="10%" size={26} delay={0}   duration={5.5} />
                  <FloatingBall x="68%" y="55%" size={18} delay={1.2} duration={4.3} dir={-1} />
                  <FloatingBall x="15%" y="68%" size={34} delay={0.7} duration={6.6} />

                  {/* ── Jersey number layer (z-10, BEHIND player) ── */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
                    style={{ zIndex: 10 }}
                  >
                    {/* Stars row */}
                    <div className="flex gap-0.5 mb-2">
                      {[0,1,2].map(i => (
                        <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill="#FACC15" opacity={0.85}>
                          <polygon points="5,0.5 6.1,3.6 9.5,3.6 6.8,5.6 7.9,8.7 5,6.7 2.1,8.7 3.2,5.6 0.5,3.6 3.9,3.6" />
                        </svg>
                      ))}
                    </div>
                    {/* Number */}
                    <div
                      className="font-black leading-[0.82] select-none"
                      style={{
                        fontSize: 'clamp(96px, 14vw, 160px)',
                        color: 'transparent',
                        WebkitTextStroke: '2px rgba(100,162,240,0.50)',
                        textShadow: '0 0 80px rgba(100,162,240,0.18)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      10
                    </div>
                    {/* Country label */}
                    <p
                      className="font-black uppercase tracking-[0.32em] text-white/25 mt-2"
                      style={{ fontSize: 'clamp(8px, 1.1vw, 11px)' }}
                    >
                      Argentina
                    </p>
                  </div>

                  {/* ── Player image (z-20, IN FRONT of number) ── */}
                  <img
                    src={argentinaPlayer}
                    alt="Messi — Argentina"
                    draggable={false}
                    style={{
                      ...playerStyle,
                      filter: 'drop-shadow(-12px 0px 28px rgba(80,140,230,0.65)) drop-shadow(0px -6px 24px rgba(80,140,230,0.20))',
                    }}
                  />
                </div>

                {/* ══ CENTRE PANEL ══ */}
                <div
                  className="relative z-10 flex flex-col items-center justify-center
                              py-7 px-5 md:px-6 w-full md:w-[278px] shrink-0 text-center"
                  style={{
                    background: 'linear-gradient(180deg, #03060F 0%, #020409 100%)',
                    borderLeft:  '1px solid rgba(255,255,255,0.05)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Trophy icon */}
                  <motion.div
                    className="w-10 h-10 rounded-2xl bg-yellow-400/15 border border-yellow-400/25
                                flex items-center justify-center mb-3 shrink-0"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Trophy size={17} className="text-yellow-400" />
                  </motion.div>

                  <p className="text-yellow-400/65 font-black tracking-[0.24em] text-[9.5px] uppercase mb-1">
                    FIFA World Cup
                  </p>
                  <h2 className="text-white font-black text-[21px] sm:text-[23px] leading-tight mb-0.5 tracking-tight">
                    DISCORD OFFER
                  </h2>
                  <p className="text-white/20 text-[10px] tracking-widest mb-3">
                    ARG &nbsp;·&nbsp; 2026 &nbsp;·&nbsp; ESP
                  </p>

                  <div className="w-8 h-px bg-white/10 mb-3" />

                  {/* Promo code */}
                  <p className="text-white/28 text-[9.5px] font-semibold uppercase tracking-widest mb-1.5">
                    Promo Code
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                      <span className="text-white font-black text-[16px] tracking-[0.14em]">
                        {PROMO_CODE}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center
                                  justify-center text-white/45 hover:text-white hover:bg-white/20
                                  transition-all active:scale-95"
                      aria-label="Copy promo code"
                    >
                      {copied
                        ? <Check size={13} className="text-green-400" />
                        : <Copy  size={13} />}
                    </button>
                  </div>

                  {/* Discount badge */}
                  <div className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/22 mb-3.5">
                    <span className="text-yellow-400 text-[11px] font-bold tracking-wide">
                      {DISCOUNT_PCT}% OFF YOUR ORDER
                    </span>
                  </div>

                  {/* Countdown */}
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <Digit value={timeLeft.days}    label="Days" />
                    <span className="text-white/18 text-[17px] font-bold pt-1.5 leading-none">:</span>
                    <Digit value={timeLeft.hours}   label="Hrs"  />
                    <span className="text-white/18 text-[17px] font-bold pt-1.5 leading-none">:</span>
                    <Digit value={timeLeft.minutes} label="Min"  />
                    <span className="text-white/18 text-[17px] font-bold pt-1.5 leading-none">:</span>
                    <Digit value={timeLeft.seconds} label="Sec"  />
                  </div>
                  <p className="text-white/18 text-[10px] mb-4">Expires Sep 15, 2026</p>

                  {/* CTA */}
                  <motion.button
                    onClick={handleUseCoupon}
                    disabled={applied}
                    whileHover={applied ? {} : { scale: 1.04 }}
                    whileTap={applied   ? {} : { scale: 0.96 }}
                    className={`w-full py-3 rounded-2xl font-black text-[13px] tracking-wider transition-colors
                                duration-200 ${
                      applied
                        ? 'bg-green-500/20 border border-green-500/35 text-green-400 cursor-default'
                        : 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black hover:from-yellow-300 hover:to-amber-300'
                    }`}
                    style={applied ? {} : { boxShadow: '0 4px 22px rgba(251,191,36,0.30)' }}
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

                {/* ══ SPAIN (right) ══ */}
                <div
                  className="relative flex-1 overflow-hidden"
                  style={{
                    minHeight: 260,
                    background: 'linear-gradient(210deg, #120025 0%, #4A0882 45%, #7B18C8 100%)',
                  }}
                >
                  {/* Diagonal stripes */}
                  {['12%', '38%', '64%', '90%'].map((left, i) => (
                    <div key={i} className="absolute inset-y-0 pointer-events-none" style={{
                      left, width: '10%',
                      background: i % 2 === 0
                        ? 'rgba(190,30,55,0.10)'
                        : 'rgba(200,120,255,0.06)',
                      transform: 'skewX(-6deg)',
                    }} />
                  ))}

                  {/* Radial glow behind player */}
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse 70% 60% at 50% 85%, rgba(150,40,230,0.32) 0%, transparent 70%)',
                    zIndex: 1,
                  }} />

                  {/* Floating balls */}
                  <FloatingBall x="72%" y="10%" size={22} delay={0.5} duration={4.8} />
                  <FloatingBall x="10%" y="55%" size={32} delay={1.7} duration={5.9} dir={-1} />
                  <FloatingBall x="58%" y="68%" size={16} delay={1.0} duration={7.1} />

                  {/* ── Jersey number layer (z-10, BEHIND player) ── */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
                    style={{ zIndex: 10 }}
                  >
                    {/* Crown star */}
                    <div className="mb-2">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="#FACC15" opacity={0.85}>
                        <polygon points="5,0.5 6.1,3.6 9.5,3.6 6.8,5.6 7.9,8.7 5,6.7 2.1,8.7 3.2,5.6 0.5,3.6 3.9,3.6" />
                      </svg>
                    </div>
                    {/* Number */}
                    <div
                      className="font-black leading-[0.82] select-none"
                      style={{
                        fontSize: 'clamp(96px, 14vw, 160px)',
                        color: 'transparent',
                        WebkitTextStroke: '2px rgba(230,160,255,0.50)',
                        textShadow: '0 0 80px rgba(200,80,255,0.18)',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      19
                    </div>
                    {/* Country label */}
                    <p
                      className="font-black uppercase tracking-[0.32em] text-white/25 mt-2"
                      style={{ fontSize: 'clamp(8px, 1.1vw, 11px)' }}
                    >
                      España
                    </p>
                  </div>

                  {/* ── Player image (z-20, IN FRONT of number) ── */}
                  <img
                    src={spainPlayer}
                    alt="Lamine Yamal — Spain"
                    draggable={false}
                    style={{
                      ...playerStyle,
                      filter: [
                        'drop-shadow(12px 0px 32px rgba(160,40,230,0.70))',  // side glow
                        'drop-shadow(-6px 0px 18px rgba(200,80,255,0.40))',  // inner edge highlight
                        'drop-shadow(0px -8px 24px rgba(160,40,230,0.22))', // top rim light
                        'saturate(1.12)',
                        'brightness(1.04)',
                      ].join(' '),
                    }}
                  />
                </div>

              </div>{/* end split */}

              {/* "Don't show again" footer */}
              <div
                className="flex items-center justify-center gap-2.5 px-6 py-3 shrink-0"
                style={{ background: '#020409', borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <input
                  type="checkbox"
                  id="offerDontShow"
                  checked={dontShow}
                  onChange={e => setDontShow(e.target.checked)}
                  className="w-3.5 h-3.5 cursor-pointer accent-yellow-400 rounded"
                />
                <label
                  htmlFor="offerDontShow"
                  className="text-white/32 text-[11px] cursor-pointer select-none hover:text-white/50 transition-colors"
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
