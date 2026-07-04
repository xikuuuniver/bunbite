import { motion } from 'framer-motion';
// @ts-ignore
import heroBurgerImg from '@assets/generated_images/hero-burger.jpg';

export default function HeroSection() {
  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-[100dvh] pt-20 bg-primary overflow-hidden flex items-center">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10 py-12">
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

        <motion.div 
          className="relative w-full aspect-square max-w-lg mx-auto"
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Cloud Blob Background */}
          <div className="absolute inset-0 bg-background rounded-full mix-blend-screen opacity-20 filter blur-3xl transform scale-110"></div>
          <div className="absolute inset-4 bg-background rounded-[40%_60%_70%_30%/40%_50%_60%_50%] shadow-[0_0_50px_rgba(245,237,216,0.3)] animate-[spin_20s_linear_infinite] z-0"></div>
          
          <img 
            src={heroBurgerImg} 
            alt="Delicious massive burger held by hands" 
            className="relative z-10 w-full h-full object-cover rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-500 border-4 border-secondary"
            data-testid="img-hero-burger"
          />
        </motion.div>
      </div>
    </section>
  );
}
