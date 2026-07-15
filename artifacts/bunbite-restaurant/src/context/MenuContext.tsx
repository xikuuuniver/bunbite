import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { menuItems as initialMenuItems, type MenuItem } from '@/pages/dashboard/data';

interface MenuContextValue {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'sold' | 'cost'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  removeMenuItem: (id: string) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const counterRef = useRef(100);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id' | 'sold' | 'cost'>) => {
    counterRef.current++;
    const newItem: MenuItem = {
      id: `MI-${counterRef.current}`,
      sold: 0,
      cost: 0,
      ...item,
    };
    setMenuItems((prev) => [newItem, ...prev]);
  }, []);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const removeMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <MenuContext.Provider value={{ menuItems, addMenuItem, updateMenuItem, removeMenuItem }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within <MenuProvider>');
  return ctx;
}
