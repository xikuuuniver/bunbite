import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

export interface BuyItem {
  name: string;
  price: number;
}

export interface UnpaidOrder {
  id: string;
  items: string;
  total: number;
  time: string;
}

interface OrdersContextValue {
  unpaidOrders: UnpaidOrder[];
  addUnpaidOrder: (item: BuyItem) => void;
  removeUnpaidOrder: (id: string) => void;
  /** Item the user tried to buy before logging in; cleared after it's added. */
  pendingBuy: BuyItem | null;
  setPendingBuy: (item: BuyItem | null) => void;
  /** Increments on every successful add — consumers animate on change. */
  badgePulse: number;
  /** Triggers the Navbar login modal from anywhere in the tree. */
  openLoginModal: () => void;
  /** Called once by Navbar to register its setIsLoginOpen(true). */
  registerLoginOpener: (fn: () => void) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

const INITIAL_UNPAID: UnpaidOrder[] = [
  { id: '#BB-4655', items: '1x Cheesy Boom, 1x Coke',  total: 15.5, time: '2 hours ago' },
  { id: '#BB-4600', items: '2x Smoky Burst',            total: 26.0, time: 'Yesterday'  },
];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrder[]>(INITIAL_UNPAID);
  const [pendingBuy,   setPendingBuy]   = useState<BuyItem | null>(null);
  const [badgePulse,   setBadgePulse]   = useState(0);
  const loginOpenerRef = useRef<() => void>(() => {});
  /** Instance-scoped order ID counter — safe across remounts and HMR. */
  const counterRef = useRef(5000);

  const addUnpaidOrder = useCallback((item: BuyItem) => {
    counterRef.current++;
    setUnpaidOrders((prev) => [
      { id: `#BB-${counterRef.current}`, items: `1x ${item.name}`, total: item.price, time: 'Just now' },
      ...prev,
    ]);
    setBadgePulse((n) => n + 1);
  }, []);

  const removeUnpaidOrder = useCallback((id: string) =>
    setUnpaidOrders((prev) => prev.filter((o) => o.id !== id)), []);

  const openLoginModal = useCallback(() => loginOpenerRef.current(), []);

  const registerLoginOpener = useCallback((fn: () => void) => {
    loginOpenerRef.current = fn;
  }, []);

  return (
    <OrdersContext.Provider value={{
      unpaidOrders, addUnpaidOrder, removeUnpaidOrder,
      pendingBuy, setPendingBuy,
      badgePulse, openLoginModal, registerLoginOpener,
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
