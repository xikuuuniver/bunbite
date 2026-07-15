import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { useOrders } from '@/context/OrdersContext';
import { useToast } from '@/hooks/use-toast';

export default function Orders() {
  const { unpaidOrders, confirmOrders } = useOrders();
  const { toast } = useToast();
  const [query, setQuery] = useState('');

  const filtered = unpaidOrders.filter((o) =>
    (o.id + o.items).toLowerCase().includes(query.toLowerCase()),
  );
  const totalValue = unpaidOrders.reduce((s, o) => s + o.total, 0);

  const markPaid = (id: string) => {
    const order = unpaidOrders.find((o) => o.id === id);
    if (!order) return;
    confirmOrders([order], 'Front Desk');
    toast({ title: 'Order marked as paid', description: `${order.id} has been moved to the kitchen queue.` });
  };

  return (
    <div>
      <PageHeader title="Orders" description="Track and manage every order awaiting payment or preparation." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Open Orders" value={String(unpaidOrders.length)} icon={ShoppingCart} />
        <StatCard index={1} label="Value Awaiting Payment" value={`$${totalValue.toFixed(2)}`} icon={DollarSign} accent="secondary" />
        <StatCard index={2} label="Avg. Wait Time" value="14 min" icon={Clock} />
      </div>

      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-full max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order id or item…"
                className="pl-8"
                data-testid="input-orders-search"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} data-testid={`row-order-${o.id}`}>
                    <TableCell className="font-semibold">{o.id}</TableCell>
                    <TableCell>{o.items}</TableCell>
                    <TableCell>${o.total.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{o.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Awaiting Payment</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => markPaid(o.id)} data-testid={`button-mark-paid-${o.id}`}>
                        <CheckCircle2 size={14} className="mr-1.5" /> Mark Paid
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No orders match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
