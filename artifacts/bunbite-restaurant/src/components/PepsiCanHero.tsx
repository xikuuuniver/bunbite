import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
// @ts-ignore
import pepsiImg from '@/assets/pepsi-can.png';

const HOVER_SPRING  = { type: 'spring' as const, stiffness: 280, damping: 20, mass: 0.7 };
const BOUNCE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 10, mass: 1.2 };
const TILT_SPRING   = { stiffness: 300, damping: 25 };

export default function PepsiCanHero() {
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const x      = useMotionValue(0);
  const y      = useMotionValue(0);
  const scale  = useMotionValue(1);
  const rotateX = useSpring(0, TILT_SPRING);
  const rotateY = useSpring(0, TILT_SPRING);
  const rotateZ = useMotionValue(0);

  const isDragging   = useRef(false);
  const dragOrigin   = useRef<{ x: number; y: number; mx: number; my: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tapped, setTapped] = useState(false);

  const resetToRest = useCallback((spring = HOVER_SPRING) => {
    animate(x, 0, spring);
    animate(y, 0, spring);
    animate(scale, 1, spring);
    animate(rotateZ, 0, spring);
    rotateX.set(0);
    rotateY.set(0);
  }, [x, y, scale, rotateX, rotateY, rotateZ]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current || isTouch) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateX.set(-dy * 18);
    rotateY.set( dx * 18);
  }, [isTouch, rotateX, rotateY]);

  const handleMouseEnter = useCallback(() => {
    if (isDragging.current || isTouch) return;
    animate(y, -10, HOVER_SPRING);
    animate(scale, 1.07, HOVER_SPRING);
    animate(rotateZ, 4, HOVER_SPRING);
  }, [isTouch, y, scale, rotateZ]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging.current || isTouch) return;
    resetToRest();
  }, [isTouch, resetToRest]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || isTouch) return;
    e.preventDefault();
    isDragging.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY, mx: x.get(), my: y.get() };
    animate(scale, 1.1, HOVER_SPRING);
    rotateX.set(0);
    rotateY.set(0);
    animate(rotateZ, 0, HOVER_SPRING);

    const onMove = (ev: MouseEvent) => {
      if (!dragOrigin.current) return;
      x.set(dragOrigin.current.mx + ev.clientX - dragOrigin.current.x);
      y.set(dragOrigin.current.my + ev.clientY - dragOrigin.current.y);
      const vx = ev.clientX - dragOrigin.current.x;
      rotateZ.set(Math.max(-20, Math.min(20, vx * 0.06)));
    };

    const onUp = () => {
      isDragging.current = false;
      dragOrigin.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      resetToRest(BOUNCE_SPRING);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
  }, [isTouch, x, y, scale, rotateX, rotateY, rotateZ, resetToRest]);

  const handleTap = useCallback(() => {
    if (!isTouch) return;
    const next = !tapped;
    setTapped(next);
    if (next) {
      animate(y, -14, HOVER_SPRING);
      animate(scale, 1.08, HOVER_SPRING);
      animate(rotateZ, 6, HOVER_SPRING);
    } else {
      resetToRest();
    }
  }, [isTouch, tapped, y, scale, rotateZ, resetToRest]);

  return (
    <motion.div
      ref={containerRef}
      className="relative select-none cursor-grab active:cursor-grabbing"
      style={{
        width: '100%',
        maxWidth: 180,
        aspectRatio: '0.45 / 1',
        x, y, scale, rotateX, rotateY, rotateZ,
        transformStyle: 'preserve-3d',
        perspective: 800,
        willChange: 'transform',
      }}
      initial={{ opacity: 0, scale: 0.75, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => e.preventDefault()}
      onClick={handleTap}
      aria-label="Interactive Pepsi can"
    >
      {/* Soft glow beneath the can */}
      <div
        className="absolute inset-x-[15%] bottom-0 h-[25%] rounded-full blur-2xl opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1d4ed8 0%, #3b82f6 60%, transparent 100%)' }}
      />
      <img
        src={pepsiImg}
        alt="Pepsi can"
        draggable={false}
        className="w-full h-full object-contain pointer-events-none drop-shadow-2xl"
      />
    </motion.div>
  );
}
