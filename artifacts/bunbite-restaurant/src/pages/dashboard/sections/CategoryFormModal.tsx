import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/context/CategoryContext';
import { type Category } from '../data';
import { ImagePlus, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTION = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2';

function Field({
  label, hint, required, children,
}: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editTarget?: Category | null;
}

export default function CategoryFormModal({ open, onOpenChange, editTarget }: Props) {
  const { toast } = useToast();
  const { addCategory, updateCategory, categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!editTarget;

  // Form fields
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon]               = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [visible, setVisible]         = useState(true);
  const [active, setActive]           = useState(true);

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (editTarget) {
        setImagePreview(editTarget.image ?? null);
        setName(editTarget.name);
        setDescription(editTarget.description);
        setIcon(editTarget.icon ?? '');
        setDisplayOrder(String(editTarget.displayOrder));
        setVisible(editTarget.visible);
        setActive(editTarget.status === 'Active');
      } else {
        // Default display order = max + 1
        const max = Math.max(...categories.map((c) => c.displayOrder), 0);
        setImagePreview(null);
        setName('');
        setDescription('');
        setIcon('');
        setDisplayOrder(String(max + 1));
        setVisible(true);
        setActive(true);
      }
    }
  }, [open, editTarget, categories]);

  const handleImageFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  }, []);

  const handleClose = () => onOpenChange(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({ title: 'Category name is required', variant: 'destructive' });
      return;
    }

    const order = displayOrder ? parseInt(displayOrder, 10) : categories.length + 1;

    if (isEdit && editTarget) {
      updateCategory(editTarget.id, {
        name: name.trim(),
        description: description.trim(),
        image: imagePreview ?? undefined,
        icon: icon.trim() || undefined,
        displayOrder: order,
        visible,
        status: active ? 'Active' : 'Inactive',
      });
      toast({ title: 'Category updated', description: `"${name.trim()}" has been updated.` });
    } else {
      addCategory({
        name: name.trim(),
        description: description.trim(),
        image: imagePreview ?? undefined,
        icon: icon.trim() || undefined,
        displayOrder: order,
        visible,
        status: active ? 'Active' : 'Inactive',
      });
      toast({ title: 'Category created', description: `"${name.trim()}" has been added to the menu.` });
    }

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Tag size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEdit ? 'Edit Category' : 'New Category'}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isEdit
                  ? 'Update category details. Changes apply instantly across the menu.'
                  : 'Add a new category to organise your menu. Fields marked * are required.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-5 space-y-6">

            {/* Image */}
            <section>
              <div className={SECTION}><ImagePlus size={13} /> Category Image <span className="font-normal normal-case opacity-60">(optional)</span></div>
              <div
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => !imagePreview && fileInputRef.current?.click()}
                className={cn(
                  'relative w-full rounded-xl border-2 border-dashed transition-colors',
                  imagePreview
                    ? 'border-transparent cursor-default'
                    : 'border-border hover:border-primary/50 cursor-pointer bg-muted/30 hover:bg-muted/50',
                )}
              >
                {imagePreview ? (
                  <div className="relative h-36 rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="Category preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-7">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                      <ImagePlus size={18} className="text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Drop an image or click to upload</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP · max 5 MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
                />
              </div>
            </section>

            <div className="border-t" />

            {/* Details */}
            <section className="space-y-4">
              <Field label="Category Name" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Burgers, Drinks, Desserts"
                  maxLength={60}
                />
              </Field>

              <Field label="Description" hint="Shown in the admin dashboard and optionally on the customer menu.">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this category contains…"
                  className="resize-none min-h-[72px]"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right -mt-1">{description.length}/200</p>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Icon (Emoji)" hint="Optional — shown next to the name">
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🍔"
                    maxLength={4}
                    className="text-xl text-center"
                  />
                </Field>

                <Field label="Display Order" hint="Lower numbers appear first">
                  <Input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="1"
                  />
                </Field>
              </div>
            </section>

            <div className="border-t" />

            {/* Visibility & Status */}
            <section className="space-y-3">
              <div className={SECTION}><span>Visibility & Status</span></div>

              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Show on Customer Site</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hidden categories are invisible to customers but remain in the dashboard.
                  </p>
                </div>
                <Switch checked={visible} onCheckedChange={setVisible} />
              </div>

              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inactive categories and their items are hidden from customers.
                  </p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-2 shrink-0">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
