import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/context/CategoryContext';
import { Tag } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function AddCategoryModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { addCategory, categories } = useCategories();
  const [name, setName] = useState('');

  const handleClose = () => {
    setName('');
    onOpenChange(false);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast({ title: 'Category name is required', variant: 'destructive' });
      return;
    }
    const maxOrder = Math.max(...categories.map((c) => c.displayOrder), 0);
    addCategory({
      name: name.trim(),
      description: '',
      displayOrder: maxOrder + 1,
      visible: true,
      status: 'Active',
    });
    toast({ title: 'Category created', description: `"${name.trim()}" is now live on the menu.` });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-full rounded-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Tag size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Add Category</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                New categories appear instantly on the menu.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Recipe Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="e.g. Burgers, Drinks, Desserts"
              maxLength={60}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
