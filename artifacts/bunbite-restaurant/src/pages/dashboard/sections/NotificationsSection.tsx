import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useOrders } from '@/context/OrdersContext';
import { cn } from '@/lib/utils';

export default function NotificationsSection() {
  const { notifications } = useOrders();

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Order, payment, and system alerts for the restaurant team."
        actions={
          <Button variant="outline" data-testid="button-mark-all-read">
            <CheckCheck size={16} className="mr-1.5" /> Mark All Read
          </Button>
        }
      />

      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-2 md:p-3">
          {notifications.length === 0 && (
            <p className="text-center text-muted-foreground py-10">You're all caught up.</p>
          )}
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn('flex items-start gap-3 rounded-xl p-3.5 hover:bg-muted/60 transition-colors', n.unread && 'bg-muted/40')}
              data-testid={`row-notification-${n.id}`}
            >
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', n.iconClass)}>
                <n.Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[11px] text-muted-foreground">{n.time}</span>
                {n.unread && <span className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
