import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Wallet, Banknote } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { payments } from '../data';
import { DollarSign, RotateCcw, Clock3 } from 'lucide-react';

const methodIcon: Record<string, typeof CreditCard> = { Card: CreditCard, Wallet, Cash: Banknote };
const statusColor: Record<string, string> = {
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Refunded: 'bg-red-50 text-red-700 border-red-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function Payments() {
  const totalPaid = payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const refunded = payments.filter((p) => p.status === 'Refunded').length;
  const pending = payments.filter((p) => p.status === 'Pending').length;

  return (
    <div>
      <PageHeader title="Payments" description="A ledger of every transaction processed by BunBite." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Collected Today" value={`$${totalPaid.toFixed(2)}`} icon={DollarSign} />
        <StatCard index={1} label="Refunded" value={String(refunded)} icon={RotateCcw} accent="secondary" />
        <StatCard index={2} label="Pending Settlement" value={String(pending)} icon={Clock3} />
      </div>

      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-4 md:p-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const Icon = methodIcon[p.method];
                return (
                  <TableRow key={p.id} data-testid={`row-payment-${p.id}`}>
                    <TableCell className="font-semibold">{p.id}</TableCell>
                    <TableCell>{p.customer}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Icon size={14} /> {p.method}
                      </span>
                    </TableCell>
                    <TableCell>${p.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor[p.status]}>{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
