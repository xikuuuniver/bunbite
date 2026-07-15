import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, CalendarCheck, Clock3, Users2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useOrders } from '@/context/OrdersContext';
import { useToast } from '@/hooks/use-toast';

export default function Reservations() {
  const { preOrders, removePreOrder } = useOrders();
  const { toast } = useToast();

  const confirmed = preOrders.filter((p) => p.status === 'Confirmed').length;
  const pending = preOrders.filter((p) => p.status === 'Pending').length;

  const cancel = (id: string) => {
    removePreOrder(id);
    toast({ title: 'Reservation cancelled', description: `${id} has been removed from the schedule.` });
  };

  return (
    <div>
      <PageHeader title="Reservations" description="See upcoming table bookings made from your website." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Total Upcoming" value={String(preOrders.length)} icon={CalendarCheck} />
        <StatCard index={1} label="Confirmed" value={String(confirmed)} icon={Users2} accent="secondary" />
        <StatCard index={2} label="Pending Approval" value={String(pending)} icon={Clock3} />
      </div>

      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-4 md:p-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reservation ID</TableHead>
                <TableHead>Order / Party</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preOrders.map((p) => (
                <TableRow key={p.id} data-testid={`row-reservation-${p.id}`}>
                  <TableCell className="font-semibold">{p.id}</TableCell>
                  <TableCell>{p.items}</TableCell>
                  <TableCell className="text-muted-foreground">{p.when}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={p.statusColor}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => cancel(p.id)} data-testid={`button-cancel-${p.id}`}>
                      <X size={14} className="mr-1" /> Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {preOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No upcoming reservations.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
