import { motion } from 'framer-motion';
import { Leaf, Zap, PenTool, Rocket } from 'lucide-react';
// @ts-ignore
import giantBurgerImg from '@assets/generated_images/giant-stacked-burger.jpg';

const features = [
  {
    icon: <Leaf className="w-8 h-8 text-secondary" />,
    title: "Fresh Ingredients",
    desc: "We source only the freshest, locally-grown produce and premium meats"
  },
  {
    icon: <Zap className="w-8 h-8 text-secondary" />,
    title: "Fun Flavor Combos",
    desc: "Our chefs craft bold, unexpected flavor combinations that surprise and delight"
  },
  {
    icon: <PenTool className="w-8 h-8 text-secondary" />,
    title: "Custom Your Taste",
    desc: "Build your perfect burger with endless topping and sauce combinations"
  },
  {
    icon: <Rocket className="w-8 h-8 text-secondary" />,
    title: "Fast Delivery",
    desc: "From our kitchen to your door in 30 minutes or less, guaranteed"
  }
];

export default function WhyBunBite() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">WHAT MAKES BUNBITE DIFFERENT?</h2>
          <p className="text-foreground/80 max-w-2xl mx-auto text-lg">
            We believe every burger should be an experience. Not just a meal, but a memory.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-6 rounded-2xl shadow-sm border border-card-border hover:shadow-md transition-shadow hover:-translate-y-1 duration-300"
              >
                <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl text-primary mb-2">{f.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px]"
          >
            <img 
              src={giantBurgerImg} 
              alt="Giant stacked juicy burger" 
              className="w-full h-full object-cover"
              data-testid="img-why-burger"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="font-display text-3xl mb-1 text-secondary drop-shadow-md">Warning:</div>
              <div className="text-xl font-medium drop-shadow-md">May cause intense cravings.</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
