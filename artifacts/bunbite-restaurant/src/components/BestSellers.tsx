import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
// @ts-ignore
import midnightBiteImg from '@assets/generated_images/midnight-bite.jpg';
// @ts-ignore
import cheesyBoomImg from '@assets/generated_images/cheesy-boom.jpg';
// @ts-ignore
import smokyBurstImg from '@assets/generated_images/smoky-burst.jpg';

const products = [
  {
    id: 1,
    name: "Midnight Bite",
    desc: "Dark smoky burger with activated charcoal bun, truffle mayo, and aged cheddar.",
    price: 12.00,
    image: midnightBiteImg,
    featured: false
  },
  {
    id: 2,
    name: "Cheesy Boom",
    desc: "A devastating explosion of three melted cheeses overflowing on a double patty.",
    price: 14.00,
    image: cheesyBoomImg,
    featured: true
  },
  {
    id: 3,
    name: "Smoky Burst",
    desc: "Thick-cut bacon, crispy onion rings, and our signature hickory BBQ sauce.",
    price: 13.00,
    image: smokyBurstImg,
    featured: false
  }
];

export default function BestSellers() {
  const { user } = useAuth();
  const { addUnpaidOrder, setPendingBuy, openLoginModal } = useOrders();

  const handleBuy = (item: { name: string; price: number }) => {
    if (!user) {
      setPendingBuy(item);
      openLoginModal();
    } else {
      addUnpaidOrder(item);
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">BEST SELLERS</h2>
            <p className="text-foreground/80 text-lg">
              The burgers people order again and again. Tried, loved, and always coming back.
            </p>
          </motion.div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="shrink-0 text-primary font-bold hover:text-secondary transition-colors underline underline-offset-4"
            data-testid="button-view-all-best-sellers"
          >
            View All Menu
          </motion.button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`bg-background rounded-3xl overflow-hidden flex flex-col ${
                p.featured ? 'ring-4 ring-secondary shadow-xl' : 'shadow-md hover:shadow-xl hover:-translate-y-2'
              } transition-all duration-300`}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                  data-testid={`img-product-${p.id}`}
                />
                {p.featured && (
                  <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex text-secondary mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <h3 className="font-display text-2xl text-primary mb-2">{p.name}</h3>
                <p className="text-sm text-foreground/70 mb-6 flex-1">{p.desc}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/10">
                  <span className="font-display text-2xl">${p.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleBuy(p)}
                    className={`flex items-center gap-2 ${p.featured ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'} px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-sm`}
                    data-testid={`button-buy-${p.id}`}
                  >
                    <ShoppingCart size={15} />
                    Buy
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
