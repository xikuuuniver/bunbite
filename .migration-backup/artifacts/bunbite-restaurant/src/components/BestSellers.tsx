import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useMenu } from '@/context/MenuContext';
import ItemDetailModal from '@/components/ItemDetailModal';
import { type MenuItem } from '@/pages/dashboard/data';

export default function BestSellers() {
  const { user } = useAuth();
  const { buyItem, setPendingBuy, openLoginModal, toggleFavorite, isFavorite } = useOrders();
  const { menuItems } = useMenu();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Top 3 available items by sold count; featured items get the "Most Popular" badge
  const topItems = useMemo(
    () =>
      menuItems
        .filter((i) => i.status !== "86'd")
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 3),
    [menuItems],
  );

  const handleBuy = (item: MenuItem) => {
    if (!user) {
      setPendingBuy({ name: item.name, price: item.price });
      openLoginModal();
    } else {
      buyItem({ name: item.name, price: item.price }, user.firstName || user.username);
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
              The dishes people order again and again. Tried, loved, and always coming back.
            </p>
          </motion.div>
          <motion.a
            href="#menu"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="shrink-0 text-primary font-bold hover:text-secondary transition-colors underline underline-offset-4"
            data-testid="button-view-all-best-sellers"
          >
            View All Menu
          </motion.a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {topItems.map((p, i) => (
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
              {/* Clickable image */}
              <button
                onClick={() => setSelectedItem(p)}
                className="relative h-64 overflow-hidden w-full focus:outline-none focus:ring-2 focus:ring-secondary/50 group"
                aria-label={`View details for ${p.name}`}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  data-testid={`img-product-${p.id}`}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                    <Eye size={13} /> View Details
                  </span>
                </div>
                {p.featured && (
                  <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}
              </button>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex text-secondary mb-2">
                  {Array.from({ length: 5 }).map((_, j) => {
                    const filled = p.sold >= 400 ? 5 : p.sold >= 200 ? 4 : 3;
                    return (
                      <Star
                        key={j}
                        className={`w-4 h-4 ${j < filled ? 'fill-current' : 'opacity-20'}`}
                      />
                    );
                  })}
                  <span className="ml-2 text-xs text-muted-foreground font-sans font-normal self-center">
                    {p.sold.toLocaleString()} orders
                  </span>
                </div>

                {/* Clickable name */}
                <button
                  onClick={() => setSelectedItem(p)}
                  className="font-display text-2xl text-primary mb-2 text-left hover:text-secondary transition-colors focus:outline-none"
                >
                  {p.name}
                </button>

                <p className="text-sm text-foreground/70 mb-6 flex-1 line-clamp-3">
                  {p.desc || '—'}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/10">
                  <span className="font-display text-2xl">${p.price.toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite({ name: p.name, price: p.price, image: p.image, desc: p.desc })}
                      aria-label={isFavorite(p.name) ? `Remove ${p.name} from favorites` : `Add ${p.name} to favorites`}
                      aria-pressed={isFavorite(p.name)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all active:scale-90 ${
                        isFavorite(p.name)
                          ? 'bg-secondary/10 border-secondary text-secondary'
                          : 'bg-white border-primary/10 text-primary/40 hover:text-secondary hover:border-secondary/40'
                      }`}
                      data-testid={`button-like-${p.id}`}
                    >
                      <Heart size={16} className={isFavorite(p.name) ? 'fill-secondary' : ''} />
                    </button>
                    <button
                      onClick={() => handleBuy(p)}
                      className={`flex items-center gap-2 ${
                        p.featured ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'
                      } px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-sm`}
                      data-testid={`button-buy-${p.id}`}
                    >
                      <ShoppingCart size={15} />
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product detail modal */}
      <ItemDetailModal
        item={selectedItem}
        open={selectedItem !== null}
        onOpenChange={(v) => { if (!v) setSelectedItem(null); }}
      />
    </section>
  );
}
