import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "I love how fresh everything tastes! The flavors are amazing and the burgers are always juicy and satisfying.",
    name: "Sarah K.",
    initials: "SK"
  },
  {
    id: 2,
    quote: "BunBite is my go-to. I can never finish just one — always end up ordering more! The Truffle Dream is unmatched.",
    name: "Marcus T.",
    initials: "MT"
  },
  {
    id: 3,
    quote: "Best burger joint in the city. Period. The custom options make it feel personal every time.",
    name: "Jamie L.",
    initials: "JL"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-primary text-white relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0 L100,100 M100,0 L0,100" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-background mb-4">BITES OF HAPPINESS</h2>
          <p className="text-background/80 max-w-2xl mx-auto text-lg">
            Real customers, real love. Here's what our regulars say about their BunBite experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-3xl p-8 text-primary relative mt-8 shadow-xl"
            >
              <div className="absolute -top-8 left-8 w-16 h-16 bg-secondary rounded-full flex items-center justify-center border-4 border-primary shadow-lg text-secondary-foreground font-display text-xl">
                {t.initials}
              </div>
              <Quote className="absolute top-6 right-8 w-10 h-10 text-primary/10" />
              
              <div className="mt-6 mb-4 flex gap-1 text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              
              <p className="text-foreground/80 italic mb-6 leading-relaxed">
                "{t.quote}"
              </p>
              
              <div className="font-display text-lg text-primary border-t border-primary/10 pt-4">
                {t.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
