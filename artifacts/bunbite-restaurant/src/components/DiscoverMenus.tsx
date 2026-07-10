import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
// @ts-ignore
import midnightBiteImg from '@assets/generated_images/midnight-bite.jpg';
// @ts-ignore
import cheesyBoomImg from '@assets/generated_images/cheesy-boom.jpg';
// @ts-ignore
import smokyBurstImg from '@assets/generated_images/smoky-burst.jpg';
// @ts-ignore
import crispyChickenImg from '@assets/generated_images/crispy-chicken.jpg';
// @ts-ignore
import firePizzaImg from '@assets/generated_images/fire-pizza.jpg';
// @ts-ignore
import clubSandwichImg from '@assets/generated_images/club-sandwich.jpg';
// @ts-ignore
import goldenFriesImg from '@assets/generated_images/golden-fries.jpg';
// @ts-ignore
import icedDrinkImg from '@assets/generated_images/iced-drink.jpg';
// @ts-ignore
import chocolateLavaCakeImg from '@assets/generated_images/chocolate-lava-cake.jpg';

const menuCategories = [
  {
    id: 'burger',
    name: 'BURGERS',
    items: [
      { name: 'Ocean Crunch', desc: 'Fresh crispy seafood burger with lettuce and special sauce', price: 16.00, image: smokyBurstImg },
      { name: 'Golden Stack', desc: 'Double patty with caramelized onions and cheddar', price: 12.00, image: midnightBiteImg },
      { name: 'Truffle Dream', desc: 'Truffle aioli, mushrooms, and swiss cheese', price: 15.00, image: cheesyBoomImg },
      { name: 'Chili Smash', desc: 'Spicy smash patty with jalapeños and chipotle mayo', price: 16.00, image: smokyBurstImg },
    ]
  },
  {
    id: 'chicken',
    name: 'CHICKEN',
    items: [
      { name: 'Spicy Bird', desc: 'Nashville hot chicken sandwich with pickles', price: 13.50, image: crispyChickenImg },
      { name: 'Classic Crispy', desc: 'Buttermilk fried chicken with slaw', price: 12.50, image: crispyChickenImg },
      { name: 'Honey Glazed Tenders', desc: 'Crispy tenders drizzled with hot honey', price: 11.00, image: crispyChickenImg },
      { name: 'BBQ Chicken Bites', desc: 'Smoky BBQ glazed bite-sized chicken', price: 10.50, image: crispyChickenImg },
    ]
  },
  {
    id: 'pizza',
    name: 'PIZZA',
    items: [
      { name: 'Pepperoni Classic', desc: 'Wood-fired crust with pepperoni and mozzarella', price: 17.00, image: firePizzaImg },
      { name: 'Margherita', desc: 'San Marzano tomatoes, fresh basil, and buffalo mozzarella', price: 15.00, image: firePizzaImg },
      { name: 'BBQ Chicken Pizza', desc: 'Smoky BBQ sauce, grilled chicken, and red onion', price: 18.00, image: firePizzaImg },
      { name: 'Four Cheese', desc: 'Mozzarella, gorgonzola, parmesan, and provolone', price: 16.50, image: firePizzaImg },
    ]
  },
  {
    id: 'sandwiches',
    name: 'SANDWICHES',
    items: [
      { name: 'Classic Club', desc: 'Triple-decker with turkey, bacon, lettuce, and tomato', price: 12.00, image: clubSandwichImg },
      { name: 'Philly Cheesesteak', desc: 'Shaved steak, peppers, onions, and melted provolone', price: 14.00, image: clubSandwichImg },
      { name: 'Grilled Veggie Melt', desc: 'Roasted vegetables with pesto and mozzarella', price: 11.00, image: clubSandwichImg },
    ]
  },
  {
    id: 'fries',
    name: 'FRIES & SIDES',
    items: [
      { name: 'Loaded Fries', desc: 'Crispy fries topped with cheese sauce and bacon bits', price: 6.50, image: goldenFriesImg },
      { name: 'Classic Fries', desc: 'Golden crispy fries with sea salt', price: 4.50, image: goldenFriesImg },
      { name: 'Onion Rings', desc: 'Thick-cut, beer-battered golden onion rings', price: 5.50, image: goldenFriesImg },
      { name: 'Mozzarella Sticks', desc: 'Served with house-made marinara sauce', price: 7.00, image: goldenFriesImg },
    ]
  },
  {
    id: 'drinks',
    name: 'DRINKS',
    items: [
      { name: 'Vanilla Shake', desc: 'Thick hand-spun vanilla bean milkshake', price: 6.00, image: icedDrinkImg },
      { name: 'Craft Cola', desc: 'Artisanal cane sugar cola', price: 3.50, image: icedDrinkImg },
      { name: 'Lemonade', desc: 'Fresh squeezed daily', price: 4.00, image: icedDrinkImg },
      { name: 'Iced Berry Tea', desc: 'Cold-brewed black tea with mixed berries', price: 4.50, image: icedDrinkImg },
    ]
  },
  {
    id: 'desserts',
    name: 'DESSERTS',
    items: [
      { name: 'Chocolate Lava Cake', desc: 'Warm molten center with vanilla ice cream', price: 8.00, image: chocolateLavaCakeImg },
      { name: 'New York Cheesecake', desc: 'Creamy classic with a graham cracker crust', price: 7.50, image: chocolateLavaCakeImg },
      { name: 'Churros', desc: 'Cinnamon sugar churros with chocolate dip', price: 6.50, image: chocolateLavaCakeImg },
    ]
  }
];

export default function DiscoverMenus() {
  const [activeCategory, setActiveCategory] = useState('burger');
  const { user } = useAuth();
  const { buyItem, setPendingBuy, openLoginModal } = useOrders();

  const handleBuy = (item: { name: string; price: number }) => {
    if (!user) {
      // Save item so Navbar can add it after login
      setPendingBuy(item);
      openLoginModal();
    } else {
      buyItem(item, user.firstName || user.username);
    }
  };

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
            A complete menu of handcrafted burgers, chicken, pizza, sandwiches, fries, drinks, and desserts
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
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1 gap-4">
                          <h4 className="font-display text-xl text-primary truncate">{item.name}</h4>
                          <span className="font-display text-lg text-secondary shrink-0">${item.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-foreground/70 pr-4">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => handleBuy(item)}
                        className="shrink-0 flex items-center gap-1.5 bg-secondary text-secondary-foreground px-4 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-md"
                        data-testid={`button-buy-${activeCategory}-${i}`}
                      >
                        <ShoppingCart size={15} />
                        Buy
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
