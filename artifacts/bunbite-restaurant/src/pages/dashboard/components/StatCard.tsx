import { motion } from 'framer-motion';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: 'primary' | 'secondary';
  index?: number;
}

export default function StatCard({ label, value, icon: Icon, trend, accent = 'primary', index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="rounded-2xl border border-card-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
      data-testid={`stat-card-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="mt-2 text-2xl md:text-3xl font-display text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            'flex items-center justify-center w-11 h-11 rounded-xl shrink-0',
            accent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-secondary-foreground',
          )}
        >
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold">
          <span className={cn('flex items-center gap-0.5', trend.positive ? 'text-emerald-600' : 'text-red-500')}>
            {trend.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend.value}
          </span>
          <span className="text-muted-foreground font-normal">vs last week</span>
        </div>
      )}
    </motion.div>
  );
}
