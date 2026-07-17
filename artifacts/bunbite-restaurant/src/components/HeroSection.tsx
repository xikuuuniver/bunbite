import { motion } from 'framer-motion';
import PizzaHero from './PizzaHero';

export default function HeroSection() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative pt-20 bg-primary overflow-hidden flex items-start lg:items-center lg:min-h-[100dvh]">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 py-16 sm:py-20 lg:py-12 w-full">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <motion.h1 
            className="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-tight mb-6 transform -rotate-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
          >
            DELICIOUS<br/>
            <span className="text-secondary">BURGERS</span>
          </motion.h1>
          <motion.p 
            className="text-white/90 text-lg md:text-xl mb-8 max-w-md font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Handcrafted burgers made with the freshest ingredients and boldest flavors.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button 
              onClick={() => document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 hover:shadow-xl active:scale-95"
              data-testid="button-hero-order"
            >
              Order Now
            </button>
            <button 
              onClick={scrollToMenu}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
              data-testid="button-hero-menu"
            >
              View Menu
            </button>
          </motion.div>
        </motion.div>

        <PizzaHero />
      </div>
    </section>
  );
}
