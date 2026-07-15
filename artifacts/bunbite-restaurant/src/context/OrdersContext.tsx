import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { ShoppingBag, CheckCircle2, type LucideIcon } from 'lucide-react';
// @ts-ignore
import midnightBiteImg from '@assets/generated_images/midnight-bite.jpg';
// @ts-ignore
import cheesyBoomImg from '@assets/generated_images/cheesy-boom.jpg';
// @ts-ignore
import smokyBurstImg from '@assets/generated_images/smoky-burst.jpg';

export interface BuyItem {
  name: string;
  price: number;
}

export interface FavoriteItem {
  name: string;
  price: number;
  image: string;
  desc?: string;
}

/** Kitchen/staff progress status for an order, tracked in the management dashboard. */
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface UnpaidOrder {
  id: string;
  /** Product name — used to group repeat orders of the same item. */
  name: string;
  /** Unit price of a single item. */
  price: number;
  /** How many of this item are in the order. */
  qty: number;
  items: string;
  total: number;
  time: string;
  /** Staff-managed progress status — defaults to 'pending' for new orders. */
  status: OrderStatus;
}

export interface AppNotification {
  id: number;
  Icon: LucideIcon;
  iconClass: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

interface OrdersContextValue {
  unpaidOrders: UnpaidOrder[];
  addUnpaidOrder: (item: BuyItem) => string;
  removeUnpaidOrder: (id: string) => void;
  /** Adds order + fires buy notification atomically. Use for all buy paths. */
  buyItem: (item: BuyItem, displayName: string) => void;
  /** Removes the given unpaid orders and fires one payment-confirmed notification per order. */
  confirmOrders: (orders: UnpaidOrder[], displayName: string) => void;
  /** Updates the staff-managed progress status of an order (dashboard Orders section). */
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  /** Item the user tried to buy before logging in; cleared after it's added. */
  pendingBuy: BuyItem | null;
  setPendingBuy: (item: BuyItem | null) => void;
  /** Increments on every successful add — consumers animate on change. */
  badgePulse: number;
  /** Triggers the Navbar login modal from anywhere in the tree. */
  openLoginModal: () => void;
  /** Called once by Navbar to register its setIsLoginOpen(true). */
  registerLoginOpener: (fn: () => void) => void;
  /** Live notification list — most recent first. */
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id'>) => void;
  unreadCount: number;
  /** Liked/favorited products — shown in the Navbar Favorites popup. */
  favorites: FavoriteItem[];
  /** Adds or removes a product from favorites. Never fires a notification. */
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (name: string) => boolean;
  /** Live pre-order list — shown in the Navbar Pre-Orders popup. */
  preOrders: PreOrder[];
  /** Adds a new pre-order (e.g. from a table reservation) and returns its id. Does not fire a notification. */
  addPreOrder: (order: Omit<PreOrder, 'id'>) => string;
  removePreOrder: (id: string) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

const INITIAL_FAVORITES: FavoriteItem[] = [
  { name: 'Cheesy Boom',   price: 14.0, image: cheesyBoomImg   },
  { name: 'Smoky Burst',   price: 13.0, image: smokyBurstImg   },
  { name: 'Midnight Bite', price: 12.0, image: midnightBiteImg },
];

const INITIAL_UNPAID: UnpaidOrder[] = [
  { id: '#BB-4655', name: 'Cheesy Boom',   price: 14.0, qty: 1, items: '1x Cheesy Boom', total: 14.0, time: '2 hours ago', status: 'pending'     },
  { id: '#BB-4600', name: 'Smoky Burst',   price: 13.0, qty: 2, items: '2x Smoky Burst', total: 26.0, time: 'Yesterday',  status: 'in_progress'  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 1, Icon: ShoppingBag,  iconClass: 'text-blue-500 bg-blue-50',   title: 'Order #BB-4821 is being processed', desc: 'Your order is on its way to the kitchen.',        time: '2 min ago',  unread: true  },
  { id: 2, Icon: CheckCircle2, iconClass: 'text-green-500 bg-green-50', title: 'Payment of $32.50 confirmed',       desc: 'Credit card payment received successfully.',      time: '5 min ago',  unread: true  },
  { id: 3, Icon: ShoppingBag,  iconClass: 'text-blue-500 bg-blue-50',   title: 'Order #BB-4790 delivered',          desc: 'Your order has been delivered. Enjoy!',           time: '38 min ago', unread: false },
  { id: 4, Icon: CheckCircle2, iconClass: 'text-green-500 bg-green-50', title: 'Order #BB-4655 placed',             desc: '1x Cheesy Boom — awaiting payment.',              time: '2 hours ago',unread: false },
];

export interface PreOrder {
  id: string;
  items: string;
  when: string;
  status: string;
  statusColor: string;
  /** Fee charged if this pre-order is cancelled. 0 means cancellation is free. */
  fee: number;
}

const INITIAL_PREORDERS: PreOrder[] = [
  { id: '#PO-1042', items: '3x Cheesy Boom',           when: 'Tomorrow, 12:30 PM',     status: 'Confirmed', statusColor: 'bg-green-100 text-green-700', fee: 5.0 },
  { id: '#PO-1039', items: '1x Smoky Burst, 2x Fries', when: 'Fri, Jul 10 · 7:00 PM',  status: 'Pending',   statusColor: 'bg-amber-100 text-amber-700', fee: 0   },
];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [unpaidOrders,   setUnpaidOrders]   = useState<UnpaidOrder[]>(INITIAL_UNPAID);
  const [pendingBuy,     setPendingBuy]     = useState<BuyItem | null>(null);
  const [badgePulse,     setBadgePulse]     = useState(0);
  const [notifications,  setNotifications]  = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [favorites,      setFavorites]      = useState<FavoriteItem[]>(INITIAL_FAVORITES);
  const [preOrders,      setPreOrders]      = useState<PreOrder[]>(INITIAL_PREORDERS);
  const loginOpenerRef = useRef<() => void>(() => {});
  /** Instance-scoped order ID counter — safe across remounts and HMR. */
  const counterRef     = useRef(5000);
  const notifCountRef  = useRef(INITIAL_NOTIFICATIONS.length);
  const preorderCounterRef = useRef(1042);

  const addNotification = useCallback((n: Omit<AppNotification, 'id'>) => {
    notifCountRef.current++;
    setNotifications((prev) => [{ ...n, id: notifCountRef.current }, ...prev]);
  }, []);

  /**
   * Returns the order id so callers can reference it in notifications.
   * If the same product is already unpaid, its quantity is incremented and the
   * row is bumped to the top instead of creating a duplicate entry.
   */
  const addUnpaidOrder = useCallback((item: BuyItem): string => {
    const existing = unpaidOrders.find((o) => o.name === item.name);

    if (existing) {
      const id = existing.id;
      setUnpaidOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === id);
        if (idx === -1) return prev;
        const qty = prev[idx].qty + 1;
        const updated: UnpaidOrder = {
          ...prev[idx],
          qty,
          items: `${qty}x ${item.name}`,
          total: item.price * qty,
          time: 'Just now',
        };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
      setBadgePulse((n) => n + 1);
      return id;
    }

    counterRef.current++;
    const id = `#BB-${counterRef.current}`;
    setUnpaidOrders((prev) => [
      { id, name: item.name, price: item.price, qty: 1, items: `1x ${item.name}`, total: item.price, time: 'Just now', status: 'pending' },
      ...prev,
    ]);
    setBadgePulse((n) => n + 1);
    return id;
  }, [unpaidOrders]);

  /** Adds order + fires buy notification atomically. Use for all buy paths. */
  const buyItem = useCallback((item: BuyItem, displayName: string) => {
    const id = addUnpaidOrder(item);
    addNotification({
      Icon:      ShoppingBag,
      iconClass: 'text-blue-500 bg-blue-50',
      title:     `${displayName} added a ${item.name} order.`,
      desc:      `Order ${id} (${item.price.toFixed(2)}) is awaiting payment.`,
      time:      'Just now',
      unread:    true,
    });
  }, [addUnpaidOrder, addNotification]);

  const removeUnpaidOrder = useCallback((id: string) =>
    setUnpaidOrders((prev) => prev.filter((o) => o.id !== id)), []);

  /** Updates the staff-managed progress status of an order (dashboard Orders section). */
  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setUnpaidOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  /** Removes the given unpaid orders and fires one payment-confirmed notification per order. */
  const confirmOrders = useCallback((orders: UnpaidOrder[], displayName: string) => {
    const ids = new Set(orders.map((o) => o.id));
    setUnpaidOrders((prev) => prev.filter((o) => !ids.has(o.id)));
    orders.forEach((order) => {
      addNotification({
        Icon:      CheckCircle2,
        iconClass: 'text-green-500 bg-green-50',
        title:     `Univer confirmed ${displayName}'s order.`,
        desc:      `Order ${order.id} — ${order.items} has been paid and is now being processed.`, // items already includes qty (e.g. "3x Burger")
        time:      'Just now',
        unread:    true,
      });
    });
  }, [addNotification]);

  /** Adds a new pre-order and returns its id. Does not fire a notification — callers do that. */
  const addPreOrder = useCallback((order: Omit<PreOrder, 'id'>): string => {
    preorderCounterRef.current++;
    const id = `#PO-${preorderCounterRef.current}`;
    setPreOrders((prev) => [{ id, ...order }, ...prev]);
    return id;
  }, []);

  const removePreOrder = useCallback((id: string) =>
    setPreOrders((prev) => prev.filter((o) => o.id !== id)), []);

  const isFavorite = useCallback(
    (name: string) => favorites.some((f) => f.name === name),
    [favorites],
  );

  /** Adds or removes a product from favorites. Never fires a notification. */
  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) =>
      prev.some((f) => f.name === item.name)
        ? prev.filter((f) => f.name !== item.name)
        : [item, ...prev],
    );
  }, []);

  const openLoginModal = useCallback(() => loginOpenerRef.current(), []);

  const registerLoginOpener = useCallback((fn: () => void) => {
    loginOpenerRef.current = fn;
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <OrdersContext.Provider value={{
      unpaidOrders, addUnpaidOrder, removeUnpaidOrder, buyItem, confirmOrders, updateOrderStatus,
      favorites, toggleFavorite, isFavorite,
      preOrders, addPreOrder, removePreOrder,
      pendingBuy, setPendingBuy,
      badgePulse, openLoginModal, registerLoginOpener,
      notifications, addNotification, unreadCount,
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within <OrdersProvider>');
  return ctx;
}
