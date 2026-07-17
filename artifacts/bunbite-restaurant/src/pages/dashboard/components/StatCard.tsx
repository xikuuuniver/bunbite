import { motion } from 'framer-motion';
import { type LucideIcon, ArrowUpRight, ArrowDownRight, Pencil, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean; label?: string };
  accent?: 'primary' | 'secondary';
  index?: number;
  /** When true, the card wiggles and becomes clickable to open the widget picker. */
  editing?: boolean;
  /** When true, this card is showing an unsaved preview of a replacement widget. */
  preview?: boolean;
  onClick?: () => void;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = 'primary',
  index = 0,
  editing = false,
  preview = false,
  onClick,
}: StatCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={
        editing
          ? { opacity: 1, y: 0, rotate: [0, -1.6, 1.6, -1.2, 1.2, 0] }
          : { opacity: 1, y: 0, rotate: 0 }
      }
      transition={
        editing
          ? { rotate: { duration: 0.55, repeat: Infinity, repeatDelay: 0.15, ease: 'easeInOut' }, opacity: { duration: 0.3 }, y: { duration: 0.3 } }
          : { duration: 0.35, delay: index * 0.05 }
      }
      whileHover={editing ? { scale: 1.02 } : undefined}
      whileTap={editing ? { scale: 0.98 } : undefined}
      onClick={editing ? onClick : undefined}
      className={cn(
        'relative rounded-2xl border bg-card p-5 shadow-sm transition-shadow',
        editing
          ? 'cursor-pointer border-dashed border-secondary/70 ring-2 ring-secondary/30 hover:shadow-lg'
          : 'border-card-border hover:shadow-md',
        preview && 'border-solid ring-2 ring-primary/50 bg-primary/[0.03]',
      )}
      data-testid={`stat-card-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
    >
      {editing && (
        <div
          className={cn(
            'absolute -top-2.5 -right-2.5 flex items-center justify-center w-7 h-7 rounded-full shadow-sm border',
            preview ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-secondary',
          )}
        >
          {preview ? <Sparkles size={13} /> : <Pencil size={12} />}
        </div>
      )}
      {preview && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Preview
        </span>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="mt-2 text-2xl md:text-3xl font-display text-foreground">{value}</p>
        </div>
        {!preview && (
          <div
            className={cn(
              'flex items-center justify-center w-11 h-11 rounded-xl shrink-0',
              accent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-secondary-foreground',
            )}
          >
            <Icon size={20} />
          </div>
        )}
        {preview && (
          <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 bg-primary/10 text-primary mt-4">
            <Icon size={20} />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold">
          <span className={cn('flex items-center gap-0.5', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
            {trend.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend.value}
          </span>
          <span className="text-muted-foreground font-normal">{trend.label ?? 'vs last week'}</span>
        </div>
      )}
      {editing && !preview && (
        <p className="mt-3 text-[11px] font-medium text-secondary-foreground/70">Tap to change widget</p>
      )}
    </motion.div>
  );
}
