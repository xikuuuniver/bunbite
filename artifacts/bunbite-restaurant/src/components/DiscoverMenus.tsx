import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useMenu } from '@/context/MenuContext';
import { useCategories } from '@/context/CategoryContext';
import ItemDetailModal from '@/components/ItemDetailModal';
import { type MenuItem } from '@/pages/dashboard/data';

export default function DiscoverMenus() {
  const { user } = useAuth();
  const { buyItem, setPendingBuy, openLoginModal, toggleFavorite, isFavorite } = useOrders();
  const { menuItems } = useMenu();
  const { visibleActiveCategories } = useCategories();

  // Exclude 86'd items for customers
  const visibleItems = useMemo(
    () => menuItems.filter((i) => i.status !== "86'd"),
    [menuItems],
  );

  // Build category tabs from CategoryContext (so newly created empty categories appear),
  // then attach matching menu items for each category.
  const categories = useMemo(() => {
    return visibleActiveCategories.map((cat) => ({
      id: cat.name,
      name: cat.name.toUpperCase(),
      items: visibleItems.filter((i) => i.category === cat.name),
    }));
  }, [visibleActiveCategories, visibleItems]);

  const [activeCategory, setActiveCategory] = useState<string>(() => categories[0]?.id ?? '');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Keep activeCategory valid if categories change
  const activeCat = categories.find((c) => c.id === activeCategory) ?? categories[0];

  const handleBuy = (item: MenuItem) => {
    if (!user) {
      setPendingBuy({ name: item.name, price: item.price });
      openLoginModal();
    } else {
      buyItem({ name: item.name, price: item.price }, user.firstName || user.username);
    }
  };

  if (categories.length === 0) {
    return (
      <section id="menu" className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          No menu items available right now. Check back soon!
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl transform translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">DISCOVER OUR MENUS</h2>
          <p className="text-foreground/80 max-w-2xl mx-auto text-lg">
            Fresh, handcrafted dishes across every category — click any item to see the full details.
          </p>
        </motion.div>

        {/* Mobile: horizontal scroll tabs */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => {
            const isActive = activeCat?.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                data-testid={`tab-category-${cat.id}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full font-display text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-primary border border-primary/20 hover:border-primary/40'
                }`}
              >
                {cat.name}
                <span className={`text-xs font-sans font-normal ${isActive ? 'text-white/70' : 'text-primary/40'}`}>
                  ({cat.items.length})
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Categories Sidebar — desktop only */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-2">
            {categories.map((cat) => {
              const isActive = activeCat?.id === cat.id;
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
                    {isActive && <div className="w-2 h-2 rounded-full bg-secondary" />}
                    {cat.name}
                    <span className={`text-sm font-sans font-normal ${isActive ? 'text-white/70' : 'text-primary/40'}`}>
                      ({cat.items.length})
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isActive ? 'rotate-180 text-secondary' : 'text-primary/40'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Menu Items Panel */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-primary/5 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCat?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeCat?.items.map((item, i) => (
                  <div
                    key={item.id}
                    className="group flex items-start sm:items-center gap-4 p-4 border-b border-primary/10 last:border-0 hover:bg-background/50 rounded-xl transition-colors"
                  >
                    {/* Clickable image → detail modal */}
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="hidden sm:block w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      aria-label={`View details for ${item.name}`}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1 gap-4">
                        {/* Clickable name → detail modal */}
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="font-display text-xl text-primary truncate hover:text-secondary transition-colors focus:outline-none text-left"
                        >
                          {item.name}
                          {item.status === 'Seasonal' && (
                            <span className="ml-2 text-xs font-sans font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                              Seasonal
                            </span>
                          )}
                        </button>
                        <span className="font-display text-lg text-secondary shrink-0">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      {item.desc && (
                        <p className="text-sm text-foreground/70 pr-4 line-clamp-2">{item.desc}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="w-9 h-9 sm:flex hidden items-center justify-center rounded-full border bg-white border-primary/10 text-primary/40 hover:text-primary hover:border-primary/30 transition-all active:scale-90"
                        aria-label={`View details for ${item.name}`}
                        title="View details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => toggleFavorite({ name: item.name, price: item.price, image: item.image, desc: item.desc })}
                        aria-label={isFavorite(item.name) ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                        aria-pressed={isFavorite(item.name)}
                        className={`w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-full border transition-all active:scale-90 ${
                          isFavorite(item.name)
                            ? 'bg-secondary/10 border-secondary text-secondary'
                            : 'bg-white border-primary/10 text-primary/40 hover:text-secondary hover:border-secondary/40'
                        }`}
                        data-testid={`button-like-${activeCategory}-${i}`}
                      >
                        <Heart size={14} className={isFavorite(item.name) ? 'fill-secondary' : ''} />
                      </button>
                      <button
                        onClick={() => handleBuy(item)}
                        className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-4 py-2.5 sm:py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-md"
                        data-testid={`button-buy-${activeCategory}-${i}`}
                      >
                        <ShoppingCart size={14} />
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
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
