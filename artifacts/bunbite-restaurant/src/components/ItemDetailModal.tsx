import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Dialog, DialogPortal, DialogOverlay, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { type MenuItem } from '@/pages/dashboard/data';
import {
  X,
  Star,
  Clock,
  Flame,
  Users,
  Zap,
  Heart,
  ShoppingCart,
  ChevronDown,
  Package,
  AlertTriangle,
  Leaf,
  BookOpen,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-muted/60 flex-1 min-w-0">
      <Icon size={15} className="text-primary/70 shrink-0" />
      <span className="text-[11px] text-muted-foreground leading-none">{label}</span>
      <span className="text-xs font-semibold text-foreground text-center leading-snug">{value}</span>
    </div>
  );
}

export default function ItemDetailModal({ item, open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { buyItem, setPendingBuy, openLoginModal, toggleFavorite, isFavorite } = useOrders();
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  if (!item) return null;

  const handleBuy = () => {
    onOpenChange(false);
    if (!user) {
      setPendingBuy({ name: item.name, price: item.price });
      openLoginModal();
    } else {
      buyItem({ name: item.name, price: item.price }, user.firstName || user.username);
    }
  };

  const handleFavorite = () => {
    toggleFavorite({ name: item.name, price: item.price, image: item.image, desc: item.desc });
  };

  const favorited = isFavorite(item.name);
  const isUnavailable = item.status === "86'd";

  // Quick stats — only show if a value is present
  const stats: { icon: React.ElementType; label: string; value: string }[] = [];
  if (item.prepTime != null) stats.push({ icon: Clock, label: 'Prep', value: `${item.prepTime} min` });
  if (item.cookTime != null) stats.push({ icon: Flame, label: 'Cook', value: `${item.cookTime} min` });
  if (item.servingSize) stats.push({ icon: Users, label: 'Serves', value: item.servingSize });
  if (item.calories != null) stats.push({ icon: Zap, label: 'Calories', value: `${item.calories} kcal` });

  // Stars based on sales tiers
  const starCount = item.sold >= 400 ? 5 : item.sold >= 200 ? 4 : 3;

  const CATEGORY_COLORS: Record<string, string> = {
    Burgers: 'bg-amber-100 text-amber-800',
    Chicken: 'bg-orange-100 text-orange-800',
    Pizza: 'bg-red-100 text-red-800',
    Sandwich: 'bg-yellow-100 text-yellow-800',
    Sides: 'bg-green-100 text-green-800',
    Drinks: 'bg-blue-100 text-blue-800',
    Desserts: 'bg-pink-100 text-pink-800',
  };
  const catColor = CATEGORY_COLORS[item.category] ?? 'bg-muted text-muted-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            'w-[calc(100vw-2rem)] max-w-2xl max-h-[92vh]',
            'flex flex-col overflow-hidden rounded-2xl bg-background shadow-2xl border',
            'duration-200',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          )}
        >
          {/* ── Hero image ──────────────────────────────────────────── */}
          <div className="relative h-56 sm:h-64 shrink-0 overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Top-left badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', catColor)}>
                {item.category}
              </span>
              {item.featured && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#C8A415] text-white uppercase tracking-wide">
                  Most Popular
                </span>
              )}
              {item.status === 'Seasonal' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white">
                  Seasonal
                </span>
              )}
              {isUnavailable && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-600 text-white">
                  Currently 86'd
                </span>
              )}
            </div>

            {/* Close button */}
            <DialogClose className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
              <X size={15} />
              <span className="sr-only">Close</span>
            </DialogClose>

            {/* Price pinned to bottom-right of image */}
            <div className="absolute bottom-3 right-4">
              <span className="text-2xl font-bold text-white drop-shadow-md">
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* ── Scrollable body ─────────────────────────────────────── */}
          <ScrollArea className="flex-1 overflow-auto">
            <div className="px-5 sm:px-6 pt-5 pb-4 space-y-5">

              {/* Name + stars */}
              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-primary leading-tight mb-1.5">
                  {item.name}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex text-[#C8A415]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < starCount ? 'fill-current' : 'opacity-25'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.sold.toLocaleString()} orders
                  </span>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 ml-1">
                      {item.tags.slice(0, 3).map((t) => (
                        <span key={t} className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          <Tag size={9} />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {item.desc && (
                <p className="text-sm text-foreground/80 leading-relaxed">{item.desc}</p>
              )}

              {/* Quick stats */}
              {stats.length > 0 && (
                <div className="flex gap-2">
                  {stats.map((s) => (
                    <StatPill key={s.label} icon={s.icon} label={s.label} value={s.value} />
                  ))}
                </div>
              )}

              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Package size={12} /> Ingredients
                  </h3>
                  <div className="rounded-xl border divide-y overflow-hidden">
                    {item.ingredients.map((ing) => (
                      <div key={ing.inventoryId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                        <span className="font-medium text-foreground">{ing.name}</span>
                        <span className="text-muted-foreground text-xs">{ing.qty} {ing.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {item.allergens && item.allergens.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Allergens
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {item.allergens.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-destructive/30 bg-destructive/5 text-destructive"
                      >
                        <AlertTriangle size={10} />
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition */}
              {item.nutritionNotes && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Leaf size={12} /> Nutrition
                  </h3>
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 leading-relaxed">
                    {item.nutritionNotes}
                  </p>
                </div>
              )}

              {/* Instructions — collapsible */}
              {item.instructions && (
                <div>
                  <button
                    onClick={() => setInstructionsOpen((o) => !o)}
                    className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 hover:text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={12} /> Preparation Notes
                    </span>
                    <ChevronDown
                      size={14}
                      className={cn('transition-transform', instructionsOpen && 'rotate-180')}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {instructionsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 leading-relaxed whitespace-pre-line">
                          {item.instructions}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="h-1" />
            </div>
          </ScrollArea>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <div className="px-5 sm:px-6 py-4 border-t bg-muted/20 flex items-center gap-3 shrink-0">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">${item.price.toFixed(2)}</p>
            </div>

            <button
              onClick={handleFavorite}
              aria-label={favorited ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
              className={cn(
                'h-11 w-11 flex items-center justify-center rounded-full border transition-all active:scale-90',
                favorited
                  ? 'bg-[#C8A415]/10 border-[#C8A415] text-[#C8A415]'
                  : 'bg-white border-primary/15 text-primary/40 hover:text-[#C8A415] hover:border-[#C8A415]/50',
              )}
            >
              <Heart size={18} className={favorited ? 'fill-[#C8A415]' : ''} />
            </button>

            <button
              onClick={handleBuy}
              disabled={isUnavailable}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-transform active:scale-95 shadow-sm',
                isUnavailable
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:scale-105',
              )}
            >
              <ShoppingCart size={16} />
              {isUnavailable ? 'Unavailable' : 'Add to Order'}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
