import { useMemo } from 'react';
import { useState } from 'react';
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
import { Search, Pencil, Trash2, Plus, ChefHat, Tag, ChevronDown } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { menuItems as initialItems, type MenuItem } from '../data';
import { useToast } from '@/hooks/use-toast';

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase()),
  );

  // Group filtered items by category, preserving natural insertion order
  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of filtered) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [filtered]);

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === "86'd" ? 'Available' : "86'd" } : i,
      ),
    );
  };

  const removeItem = (id: string, name: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast({ title: 'Menu item removed', description: `${name} was removed from the live menu.` });
  };

  return (
    <div>
      <PageHeader
        title="Menu Management"
        description="Update prices, availability, and details for everything customers can order."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-testid="button-add-menu">
                <Plus size={16} className="mr-1.5" />
                Add
                <ChevronDown size={14} className="ml-1.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                data-testid="menu-new-recipe"
                onSelect={() =>
                  toast({ title: 'New Recipe', description: 'Opening recipe builder…' })
                }
              >
                <ChefHat size={15} className="mr-2 text-muted-foreground" />
                New Recipe
              </DropdownMenuItem>
              <DropdownMenuItem
                data-testid="menu-new-category"
                onSelect={() =>
                  toast({ title: 'New Category', description: 'Opening category builder…' })
                }
              >
                <Tag size={15} className="mr-2 text-muted-foreground" />
                New Category
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

      {/* Category sections */}
      {grouped.size === 0 && (
        <p className="text-center text-muted-foreground py-10">No menu items match your search.</p>
      )}

      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([category, categoryItems]) => (
          <section key={category}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
                {category}
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Cards grid */}
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
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
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
                            onClick={() =>
                              toast({ title: 'Edit item', description: `Editing ${item.name}…` })
                            }
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
    </div>
  );
}
