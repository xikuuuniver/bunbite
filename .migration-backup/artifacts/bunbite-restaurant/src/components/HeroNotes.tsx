import { motion } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Sparkles,
  UtensilsCrossed,
  Megaphone,
  Truck,
} from 'lucide-react';

type Note = {
  Icon: typeof CalendarDays;
  title: string;
  body: string;
  color: string;      // paper background
  tape: string;        // washi tape color
  rotate: number;      // resting tilt
  z: number;
};

const notes: Note[] = [
  {
    Icon: CalendarDays,
    title: 'Open Every Day',
    body: 'Mon–Sun\nNo days off, ever.',
    color: '#FFE9A8',
    tape: '#C8A415',
    rotate: -6,
    z: 10,
  },
  {
    Icon: Clock,
    title: 'Kitchen Hours',
    body: '11:00 AM – 11:00 PM\nLast order 10:30 PM',
    color: '#FFD8D8',
    tape: '#E0776D',
    rotate: 4,
    z: 20,
  },
  {
    Icon: Sparkles,
    title: 'Happy Hour',
    body: 'Buy 1 Get 1 Free\nEveryday 3–6 PM',
    color: '#D6F5D0',
    tape: '#2C4A1E',
    rotate: -3,
    z: 30,
  },
  {
    Icon: UtensilsCrossed,
    title: 'Table Reservation',
    body: 'Book ahead for\nweekends — spots fill fast!',
    color: '#DCEBFF',
    tape: '#4A7FC8',
    rotate: 7,
    z: 20,
  },
  {
    Icon: Megaphone,
    title: "Chef's Special",
    body: 'Smoky BBQ Burger\nOnly $9.99 this week',
    color: '#FFE0C2',
    tape: '#D97706',
    rotate: -8,
    z: 40,
  },
  {
    Icon: Truck,
    title: 'Now Delivering',
    body: 'Order online for\npickup & delivery',
    color: '#F1DCFF',
    tape: '#9061C2',
    rotate: 5,
    z: 15,
  },
];

/** Small stagger + tilt-in entrance so notes feel hand-placed. */
const noteVariants = {
  hidden: (rotate: number) => ({ opacity: 0, y: 30, scale: 0.7, rotate: rotate * 2.2 }),
  show: (rotate: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate,
    transition: { type: 'spring' as const, stiffness: 120, damping: 12 },
  }),
};

function StickyNote({ note, index }: { note: Note; index: number }) {
  const { Icon, title, body, color, tape, rotate, z } = note;
  return (
    <motion.div
      custom={rotate}
      variants={noteVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: 0.15 + index * 0.12 }}
      whileHover={{ scale: 1.07, rotate: 0, zIndex: 50, transition: { duration: 0.25 } }}
      style={{ zIndex: z }}
      className="relative w-[46%] sm:w-40 md:w-44 shrink-0 select-none"
      data-testid={`note-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div
        className="relative rounded-sm px-4 pt-6 pb-5 shadow-[0_10px_25px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
        style={{
          background: `linear-gradient(160deg, ${color} 0%, ${color} 70%, rgba(0,0,0,0.05) 100%)`,
        }}
      >
        {/* Washi tape */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 rounded-[2px] opacity-90 shadow-sm"
          style={{
            background: tape,
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 3px, transparent 3px, transparent 7px)',
          }}
        />
        {/* Subtle paper fold corner */}
        <div className="pointer-events-none absolute bottom-0 right-0 w-4 h-4 bg-black/10 [clip-path:polygon(100%_0,0_100%,100%_100%)] rounded-br-sm" />

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-black/10 backdrop-blur-sm"
          style={{ color: '#1A1A1A' }}
        >
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <p className="font-display text-base leading-tight text-black/85 mb-1">{title}</p>
        <p className="font-sans text-[11px] leading-snug text-black/70 whitespace-pre-line font-medium">
          {body}
        </p>
      </div>
    </motion.div>
  );
}

export default function HeroNotes() {
  return (
    <motion.div
      className="relative w-full max-w-lg mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Soft glow backdrop so the notes read as a premium display, not a cluttered board */}
      <div className="absolute inset-0 bg-background rounded-[40%_60%_65%_35%/45%_55%_50%_55%] opacity-10 blur-3xl scale-110" />

      <div className="relative flex flex-wrap justify-center gap-x-3 gap-y-6 sm:gap-x-4 py-6">
        {notes.map((note, i) => (
          <div
            key={note.title}
            className={
              i % 3 === 1 ? 'sm:translate-y-6' : i % 3 === 2 ? 'sm:-translate-y-3' : 'sm:translate-y-0'
            }
          >
            <StickyNote note={note} index={i} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
