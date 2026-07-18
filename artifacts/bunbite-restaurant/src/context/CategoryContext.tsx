import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { categories as initialCategories, type Category } from '@/pages/dashboard/data';

interface CategoryContextValue {
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  duplicateCategory: (id: string) => void;
  reorderCategories: (newOrder: Category[]) => void;
  getCategoryById: (id: string) => Category | undefined;
  /** Returns categories that are Active and visible, sorted by displayOrder. */
  visibleActiveCategories: Category[];
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const counterRef = useRef(10);

  const now = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const addCategory = useCallback((cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    counterRef.current++;
    const today = now();
    const newCat: Category = {
      id: `CAT-${String(counterRef.current).padStart(2, '0')}`,
      createdAt: today,
      updatedAt: today,
      ...cat,
    };
    setCategories((prev) => [...prev, newCat]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now() } : c)),
    );
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const duplicateCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const source = prev.find((c) => c.id === id);
      if (!source) return prev;
      counterRef.current++;
      const today = now();
      const maxOrder = Math.max(...prev.map((c) => c.displayOrder), 0);
      const copy: Category = {
        ...source,
        id: `CAT-${String(counterRef.current).padStart(2, '0')}`,
        name: `${source.name} (Copy)`,
        displayOrder: maxOrder + 1,
        createdAt: today,
        updatedAt: today,
      };
      return [...prev, copy];
    });
  }, []);

  const reorderCategories = useCallback((newOrder: Category[]) => {
    setCategories(
      newOrder.map((cat, i) => ({ ...cat, displayOrder: i + 1, updatedAt: now() })),
    );
  }, []);

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories],
  );

  const visibleActiveCategories = categories
    .filter((c) => c.status === 'Active' && c.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        removeCategory,
        duplicateCategory,
        reorderCategories,
        getCategoryById,
        visibleActiveCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used within <CategoryProvider>');
  return ctx;
}
