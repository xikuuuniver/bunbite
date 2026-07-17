import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { WidgetDef } from '../widgetCatalog';

interface WidgetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgets: WidgetDef[];
  currentWidgetId?: string;
  onSelect: (widgetId: string) => void;
}

export default function WidgetPicker({ open, onOpenChange, widgets, currentWidgetId, onSelect }: WidgetPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-widget-picker">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-normal">Choose a widget</DialogTitle>
          <DialogDescription>
            Pick a replacement widget below. You'll see a preview first — nothing changes until you save.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1 -mr-1">
          {widgets.map((w, i) => {
            const isCurrent = w.id === currentWidgetId;
            const Icon = w.icon;
            return (
              <motion.button
                key={w.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(w.id)}
                data-testid={`widget-option-${w.id}`}
                className={cn(
                  'relative text-left rounded-xl border p-4 transition-colors',
                  isCurrent
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/40'
                    : 'border-card-border hover:border-secondary/70 hover:bg-secondary/5',
                )}
              >
                {isCurrent && (
                  <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                    <Check size={12} />
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                      w.accent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-secondary-foreground',
                    )}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{w.label}</p>
                    <p className="text-lg font-display text-foreground">{w.value}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{w.description}</p>
              </motion.button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
