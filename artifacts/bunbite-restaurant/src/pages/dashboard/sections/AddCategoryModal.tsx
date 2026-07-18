import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/context/CategoryContext';
import { useToast } from '@/hooks/use-toast';
import { Tag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Preset accent colours ──────────────────────────────────────────────────────
const PRESET_COLORS = [
  { label: 'Forest',  value: '#2C4A1E' },
  { label: 'Gold',    value: '#C8A415' },
  { label: 'Crimson', value: '#C0392B' },
  { label: 'Ocean',   value: '#1A6B8A' },
  { label: 'Violet',  value: '#6C3483' },
  { label: 'Slate',   value: '#34495E' },
  { label: 'Amber',   value: '#E67E22' },
  { label: 'Sage',    value: '#6B8E4E' },
];

// ── Live preview card ─────────────────────────────────────────────────────────
function PreviewCard({
  name, description, icon, color,
}: { name: string; description: string; icon: string; color: string }) {
  const bg = color || '#2C4A1E';
  const displayName  = name.trim()        || 'Category Name';
  const displayDesc  = description.trim() || 'A short description of this category.';
  const displayIcon  = icon.trim()        || '🏷️';

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-3 shadow-lg select-none"
      style={{ background: `linear-gradient(135deg, ${bg}ee, ${bg}99)` }}
    >
      {/* Decorative blob */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-xl"
        style={{ background: '#fff' }}
      />
      <div className="relative flex items-center gap-3">
        <span className="text-3xl leading-none">{displayIcon}</span>
        <div>
          <p className="text-white font-bold text-base leading-tight tracking-wide">{displayName}</p>
          <p className="text-white/60 text-xs mt-0.5 font-medium uppercase tracking-widest">Category</p>
        </div>
      </div>
      <p className="relative text-white/75 text-xs leading-relaxed line-clamp-2">{displayDesc}</p>
      <div className="relative flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        <span className="text-[10px] text-white/50 font-medium">0 items · Active</span>
      </div>
    </motion.div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function AddCategoryModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { addCategory, categories } = useCategories();

  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon]               = useState('');
  const [color, setColor]             = useState(PRESET_COLORS[0].value);
  const [customColor, setCustomColor] = useState('');

  // Reset when opened
  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setIcon('');
      setColor(PRESET_COLORS[0].value);
      setCustomColor('');
    }
  }, [open]);

  const activeColor = customColor || color;

  // Validation
  const nameTrimmed      = name.trim();
  const nameEmpty        = nameTrimmed.length === 0;
  const nameExists       = categories.some(
    (c) => c.name.toLowerCase() === nameTrimmed.toLowerCase(),
  );
  const canCreate = !nameEmpty && !nameExists;

  const handleClose = () => onOpenChange(false);

  const handleCreate = () => {
    if (!canCreate) return;
    const maxOrder = Math.max(...categories.map((c) => c.displayOrder), 0);
    addCategory({
      name: nameTrimmed,
      description: description.trim(),
      icon: icon.trim() || undefined,
      color: activeColor || undefined,
      displayOrder: maxOrder + 1,
      visible: true,
      status: 'Active',
    });
    toast({
      title: 'Category created!',
      description: `"${nameTrimmed}" is now live across the dashboard and customer menu.`,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `${activeColor}20`, border: `1.5px solid ${activeColor}40` }}
            >
              <Tag size={18} style={{ color: activeColor }} />
            </motion.div>
            <div>
              <DialogTitle className="text-base font-semibold">Create New Category</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Appears instantly on the dashboard and customer menu.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-5">

          {/* Live preview */}
          <PreviewCard name={name} description={description} icon={icon} color={activeColor} />

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && canCreate) handleCreate(); }}
              placeholder="e.g. Burgers, Drinks, Desserts"
              maxLength={60}
              className={cn(nameExists && 'border-destructive focus-visible:ring-destructive')}
            />
            <AnimatePresence>
              {nameExists && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-xs text-destructive font-medium"
                >
                  A category with this name already exists.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Short Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this category special…"
              className="resize-none min-h-[68px]"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right -mt-1">{description.length}/160</p>
          </div>

          {/* Icon + Color row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Icon */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Icon <span className="text-muted-foreground font-normal">(emoji)</span>
              </Label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🍔"
                maxLength={4}
                className="text-2xl text-center h-11"
              />
            </div>

            {/* Custom colour */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Custom Color
              </Label>
              <div className="flex items-center gap-2 h-11 px-3 rounded-md border border-input bg-background">
                <input
                  type="color"
                  value={customColor || color}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {customColor || color}
                </span>
              </div>
            </div>
          </div>

          {/* Preset colours */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preset Colors</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((p) => {
                const isActive = !customColor && color === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    title={p.label}
                    onClick={() => { setColor(p.value); setCustomColor(''); }}
                    className={cn(
                      'h-7 w-7 rounded-full border-2 transition-all hover:scale-110',
                      isActive ? 'border-foreground scale-110 shadow-md' : 'border-transparent',
                    )}
                    style={{ background: p.value }}
                  />
                );
              })}
              {/* "Clear custom" chip */}
              {customColor && (
                <button
                  type="button"
                  onClick={() => setCustomColor('')}
                  className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 self-center"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles size={11} />
            Syncs instantly — no refresh needed.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!canCreate}
              style={canCreate ? { background: activeColor } : undefined}
              className={cn(canCreate && 'hover:opacity-90 transition-opacity border-0')}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
