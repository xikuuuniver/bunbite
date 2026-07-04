import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
// @ts-ignore
import midnightBiteImg from '@assets/generated_images/midnight-bite.jpg';

const menuCategories = [
  {
    id: 'burger',
    name: 'BURGER',
    items: [
      { name: 'Ocean Crunch', desc: 'Fresh crispy seafood burger with lettuce and special sauce', price: 16.00 },
      { name: 'Golden Stack', desc: 'Double patty with caramelized onions and cheddar', price: 12.00 },
      { name: 'Truffle Dream', desc: 'Truffle aioli, mushrooms, and swiss cheese', price: 15.00 },
      { name: 'Chili Smash', desc: 'Spicy smash patty with jalapeños and chipotle mayo', price: 16.00 },
    ]
  },
  {
    id: 'sides',
    name: 'SIDES',
    items: [
      { name: 'Loaded Fries', desc: 'Crispy fries topped with cheese sauce and bacon bits', price: 6.50 },
      { name: 'Onion Rings', desc: 'Thick-cut, beer-battered golden onion rings', price: 5.50 },
      { name: 'Mozzarella Sticks', desc: 'Served with house-made marinara sauce', price: 7.00 },
    ]
  },
  {
    id: 'chicken',
    name: 'CHICKEN',
    items: [
      { name: 'Spicy Bird', desc: 'Nashville hot chicken sandwich with pickles', price: 13.50 },
      { name: 'Classic Crispy', desc: 'Buttermilk fried chicken with slaw', price: 12.50 },
    ]
  },
  {
    id: 'drinks',
    name: 'DRINKS',
    items: [
      { name: 'Vanilla Shake', desc: 'Thick hand-spun vanilla bean milkshake', price: 6.00 },
      { name: 'Craft Cola', desc: 'Artisanal cane sugar cola', price: 3.50 },
      { name: 'Lemonade', desc: 'Fresh squeezed daily', price: 4.00 },
    ]
  }
];

export default function DiscoverMenus() {
  const [activeCategory, setActiveCategory] = useState('burger');

  return (
    <section id="menu" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">DISCOVER OUR MENUS</h2>
          <p className="text-foreground/80 max-w-2xl mx-auto text-lg">
            A complete menu of handcrafted burgers, crispy sides, and refreshing drinks
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Categories Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {menuCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 font-display text-xl ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg translate-x-2' 
                      : 'bg-white text-primary hover:bg-primary/5 shadow-sm border border-transparent'
                  }`}
                  data-testid={`tab-category-${cat.id}`}
                >
                  <div className="flex items-center gap-3">
                    {isActive && <div className="w-2 h-2 rounded-full bg-secondary"></div>}
                    {cat.name}
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'rotate-180 text-secondary' : 'text-primary/40'}`} />
                </button>
              );
            })}
          </div>

          {/* Menu Items List */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-primary/5 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full"
              >
                <div className="flex-1">
                  {menuCategories.find(c => c.id === activeCategory)?.items.map((item, i) => (
                    <div 
                      key={i} 
                      className="group flex items-start sm:items-center gap-4 p-4 border-b border-primary/10 last:border-0 hover:bg-background/50 rounded-xl transition-colors"
                    >
                      <div className="hidden sm:block w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-secondary transition-colors">
                        {/* Reusing thumbnail for all for simplicity, or could leave empty */}
                        <img src={midnightBiteImg} alt="Thumbnail" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-display text-xl text-primary">{item.name}</h4>
                          <span className="font-display text-lg text-secondary ml-4">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-foreground/70 pr-4">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-primary/10 flex justify-end">
                  <button 
                    className="bg-secondary text-secondary-foreground px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform shadow-md"
                    data-testid={`button-order-${activeCategory}`}
                  >
                    Order {menuCategories.find(c => c.id === activeCategory)?.name.toLowerCase()} Now
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
