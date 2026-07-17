import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useOrders, type OrderStatus } from '@/context/OrdersContext';
import { useToast } from '@/hooks/use-toast';

const STATUS_META: Record<OrderStatus, { label: string; badgeClass: string }> = {
  pending:     { label: 'Pending',     badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'   },
  in_progress: { label: 'In Progress', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'      },
  completed:   { label: 'Completed',   badgeClass: 'bg-green-50 text-green-700 border-green-200'   },
  cancelled:   { label: 'Cancelled',   badgeClass: 'bg-red-50 text-red-700 border-red-200'         },
};

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

export default function Orders() {
  const { unpaidOrders, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const [query, setQuery] = useState('');

  const filtered = unpaidOrders.filter((o) =>
    (o.id + o.items).toLowerCase().includes(query.toLowerCase()),
  );

  const countByStatus = (status: OrderStatus) => unpaidOrders.filter((o) => o.status === status).length;

  const handleStatusChange = (id: string, status: OrderStatus) => {
    const order = unpaidOrders.find((o) => o.id === id);
    if (!order) return;
    updateOrderStatus(id, status);
    toast({ title: 'Order status updated', description: `${order.id} is now ${STATUS_META[status].label}.` });
  };

  return (
    <div>
      <PageHeader title="Orders" description="Track and manage every order awaiting payment or preparation." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard index={0} label="Active Orders" value={String(countByStatus('pending'))} icon={Clock} />
        <StatCard index={1} label="In Progress Orders" value={String(countByStatus('in_progress'))} icon={Loader2} accent="secondary" />
        <StatCard index={2} label="Completed Orders" value={String(countByStatus('completed'))} icon={CheckCircle2} />
        <StatCard index={3} label="Cancelled Orders" value={String(countByStatus('cancelled'))} icon={XCircle} accent="secondary" />
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

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {filtered.map((o) => (
              <div key={o.id} data-testid={`row-order-${o.id}`} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{o.id}</p>
                    <p className="text-xs text-muted-foreground truncate">{o.items}</p>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${STATUS_META[o.status].badgeClass}`}>
                    {STATUS_META[o.status].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{o.time}</span>
                  <span className="font-semibold">${o.total.toFixed(2)}</span>
                </div>
                <Select value={o.status} onValueChange={(value) => handleStatusChange(o.id, value as OrderStatus)}>
                  <SelectTrigger className="w-full" data-testid={`select-status-${o.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} data-testid={`option-status-${status}-${o.id}`}>
                        {STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No orders match your search.</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
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
                      <Badge variant="outline" className={STATUS_META[o.status].badgeClass}>
                        {STATUS_META[o.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={o.status}
                        onValueChange={(value) => handleStatusChange(o.id, value as OrderStatus)}
                      >
                        <SelectTrigger className="w-[150px] ml-auto" data-testid={`select-status-${o.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status} data-testid={`option-status-${status}-${o.id}`}>
                              {STATUS_META[status].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
