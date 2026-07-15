import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Search, Pencil, Trash2, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { menuItems as initialItems, type MenuItem } from '../data';
import { useToast } from '@/hooks/use-toast';

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  const filtered = items.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: i.status === "86'd" ? 'Available' : "86'd" } : i)),
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
          <Button data-testid="button-add-menu-item" onClick={() => toast({ title: 'Add item', description: 'Opening menu item builder…' })}>
            <Plus size={16} className="mr-1.5" /> Add Item
          </Button>
        }
      />

      <div className="relative w-full max-w-xs mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search menu items…" className="pl-8" data-testid="input-menu-search" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="rounded-2xl border-card-border overflow-hidden">
              <div className="h-32 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm text-foreground">{item.name}</p>
                  <Badge variant="outline" className="shrink-0">{item.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{item.sold} sold · ${item.price.toFixed(2)} price</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={item.status !== "86'd"} onCheckedChange={() => toggleAvailability(item.id)} data-testid={`switch-availability-${item.id}`} />
                    <span className="text-xs text-muted-foreground">{item.status === "86'd" ? '86\'d' : 'Available'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" data-testid={`button-edit-${item.id}`} onClick={() => toast({ title: 'Edit item', description: `Editing ${item.name}…` })}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" data-testid={`button-delete-${item.id}`} onClick={() => removeItem(item.id, item.name)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-10">No menu items match your search.</p>
        )}
      </div>
    </div>
  );
}
