import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Pencil, Trash2, Plus, ChefHat, Tag } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { type MenuItem } from '../data';
import { useToast } from '@/hooks/use-toast';
import { useMenu } from '@/context/MenuContext';
import { useCategories } from '@/context/CategoryContext';
import NewRecipeModal from './NewRecipeModal';
import AddCategoryModal from './AddCategoryModal';

export default function MenuManagement() {
  const { menuItems: items, updateMenuItem, removeMenuItem } = useMenu();
  const { categories } = useCategories();
  const [query, setQuery] = useState('');
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const { toast } = useToast();

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Build display groups — always show all active categories (including empty ones
  // when no search query is active), ordered by CategoryContext displayOrder.
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }

    const activeCategories = categories
      .filter((c) => c.status === 'Active')
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // When searching: only show categories that have matching items
    // When not searching: show all active categories (so newly created ones appear)
    const result: Array<{ name: string; icon?: string; color?: string; items: MenuItem[] }> = [];

    if (query.trim()) {
      for (const cat of activeCategories) {
        const catItems = map.get(cat.name) ?? [];
        if (catItems.length > 0) result.push({ name: cat.name, icon: cat.icon, color: cat.color, items: catItems });
      }
      // Append items whose category isn't in CategoryContext
      for (const [catName, catItems] of map.entries()) {
        if (!activeCategories.find((c) => c.name === catName)) {
          result.push({ name: catName, icon: undefined, color: undefined, items: catItems });
        }
      }
    } else {
      for (const cat of activeCategories) {
        result.push({ name: cat.name, icon: cat.icon, color: cat.color, items: map.get(cat.name) ?? [] });
      }
      // Append orphaned items whose category isn't in CategoryContext
      for (const [catName, catItems] of map.entries()) {
        if (!activeCategories.find((c) => c.name === catName)) {
          result.push({ name: catName, icon: undefined, color: undefined, items: catItems });
        }
      }
    }

    return result;
  }, [filtered, categories, query]);

  const toggleAvailability = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    updateMenuItem(id, { status: item.status === "86'd" ? 'Available' : "86'd" });
  };

  const removeItem = (id: string, name: string) => {
    removeMenuItem(id);
    toast({ title: 'Menu item removed', description: `${name} was removed from the live menu.` });
  };

  return (
    <div>
      <PageHeader
        title="Menu Management"
        description="Manage menu items and categories from one place."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus size={16} className="mr-1.5" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onSelect={() => setRecipeModalOpen(true)}
              >
                <ChefHat size={14} />
                Add Recipe
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onSelect={() => setCategoryModalOpen(true)}
              >
                <Tag size={14} />
                Add Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Search */}
      <div className="relative w-full max-w-xs mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search menu items…"
          className="pl-8"
          data-testid="input-menu-search"
        />
      </div>

      {grouped.length === 0 && (
        <p className="text-center text-muted-foreground py-10">
          {query ? 'No menu items match your search.' : 'No menu items yet. Click "New → Add Recipe" to get started.'}
        </p>
      )}

      <div className="space-y-8">
        {grouped.map(({ name: category, icon: catIcon, color: catColor, items: categoryItems }) => (
          <section key={category}>
            <div className="flex items-center gap-3 mb-4">
              {catIcon && <span className="text-base leading-none">{catIcon}</span>}
              <h2
                className="text-sm font-semibold tracking-wide uppercase"
                style={{ color: catColor || undefined }}
              >
                {category}
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {categoryItems.length === 0 && (
              <p className="text-sm text-muted-foreground italic py-4 pl-1">
                No recipes in this category yet — add one using <strong>New → Add Recipe</strong>.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {categoryItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="rounded-2xl border-card-border overflow-hidden">
                    <div className="h-32 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm text-foreground">{item.name}</p>
                        {item.status === 'Seasonal' && (
                          <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                            Seasonal
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {item.sold} sold · ${item.price.toFixed(2)} price
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.status !== "86'd"}
                            onCheckedChange={() => toggleAvailability(item.id)}
                            data-testid={`switch-availability-${item.id}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {item.status === "86'd" ? "86'd" : 'Available'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            data-testid={`button-edit-${item.id}`}
                            onClick={() => toast({ title: 'Edit item', description: `Editing ${item.name}…` })}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            data-testid={`button-delete-${item.id}`}
                            onClick={() => removeItem(item.id, item.name)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <NewRecipeModal open={recipeModalOpen} onOpenChange={setRecipeModalOpen} />
      <AddCategoryModal open={categoryModalOpen} onOpenChange={setCategoryModalOpen} />
    </div>
  );
}
