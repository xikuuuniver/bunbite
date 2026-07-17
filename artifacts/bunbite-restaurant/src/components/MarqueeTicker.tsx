import { motion } from 'framer-motion';

const words = [
  "★ HAPPY BITES",
  "★ FUN FLAVORS",
  "★ SO TASTY",
  "★ FAST & FRESH",
  "★ SNACK TIME",
  "★ HAPPY BITES",
  "★ FUN FLAVORS"
];

export default function MarqueeTicker() {
  return (
    <div className="bg-secondary py-3 overflow-hidden border-y-4 border-primary/20 flex whitespace-nowrap">
      <motion.div
        className="flex gap-8 items-center"
        animate={{
          x: [0, -1035],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 15,
            ease: "linear",
          },
        }}
      >
        {/* Render twice for seamless loop */}
        {[...words, ...words, ...words].map((word, i) => (
          <span 
            key={i} 
            className="text-primary font-display text-2xl tracking-widest uppercase whitespace-nowrap"
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
