import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export default function OpeningHours() {
  return (
    <section className="py-20 bg-background/50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl text-primary flex items-center justify-center gap-3">
            <Clock className="w-8 h-8 text-secondary" />
            OPENING HOURS
          </h2>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-6 md:gap-12 max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-primary/10 flex-1 text-center"
          >
            <div className="text-foreground/60 font-bold tracking-widest uppercase mb-2">MON TO FRI</div>
            <div className="font-display text-3xl md:text-4xl text-primary">8:00 <span className="text-secondary">—</span> 10:00</div>
            <div className="text-sm text-foreground/50 mt-2">Breakfast, Lunch & Dinner</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-primary text-white p-8 rounded-3xl shadow-md border border-primary/20 flex-1 text-center relative overflow-hidden"
          >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/20 rounded-full blur-xl"></div>
            <div className="text-background/80 font-bold tracking-widest uppercase mb-2 relative z-10">SAT TO SUN</div>
            <div className="font-display text-3xl md:text-4xl relative z-10">9:00 <span className="text-secondary">—</span> 12:00</div>
            <div className="text-sm text-background/60 mt-2 relative z-10">Late Night Weekend Bites</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
