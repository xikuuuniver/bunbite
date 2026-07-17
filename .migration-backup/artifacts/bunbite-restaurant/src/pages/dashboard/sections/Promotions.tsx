import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgePercent, Sparkles, TrendingUp, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { promotions as initial } from '../data';
import { useToast } from '@/hooks/use-toast';

const statusColor: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Ended: 'bg-muted text-muted-foreground border-border',
};

export default function Promotions() {
  const [promos, setPromos] = useState(initial);
  const { toast } = useToast();
  const active = promos.filter((p) => p.status === 'Active').length;
  const redemptions = promos.reduce((s, p) => s + p.redemptions, 0);

  const toggleStatus = (id: string) => {
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === 'Active' ? 'Ended' : 'Active' } : p)));
  };

  return (
    <div>
      <PageHeader
        title="Promotions"
        description="Run discount codes and campaigns to drive more orders."
        actions={
          <Button data-testid="button-create-promotion" onClick={() => toast({ title: 'New promotion', description: 'Opening promotion builder…' })}>
            <Plus size={16} className="mr-1.5" /> New Promotion
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Active Campaigns" value={String(active)} icon={Sparkles} />
        <StatCard index={1} label="Total Redemptions" value={String(redemptions)} icon={TrendingUp} accent="secondary" />
        <StatCard index={2} label="All Campaigns" value={String(promos.length)} icon={BadgePercent} />
      </div>

      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-4 md:p-6">
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {promos.map((p) => (
              <div
                key={p.id}
                data-testid={`row-promotion-${p.id}`}
                onClick={() => toggleStatus(p.id)}
                className="rounded-xl border border-border p-4 space-y-2 cursor-pointer active:opacity-70 transition-opacity"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{p.title}</p>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded mt-0.5 inline-block">{p.code}</code>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${statusColor[p.status]}`}>{p.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div><span className="text-muted-foreground text-xs">Discount: </span>{p.discount}</div>
                  <div><span className="text-muted-foreground text-xs">Channel: </span>{p.channel}</div>
                  <div><span className="text-muted-foreground text-xs">Redemptions: </span>{p.redemptions}</div>
                  <div><span className="text-muted-foreground text-xs">Ends: </span>{p.ends}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Redemptions</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(p.id)}
                    data-testid={`row-promotion-${p.id}`}
                  >
                    <TableCell className="font-semibold">{p.title}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.code}</code></TableCell>
                    <TableCell>{p.discount}</TableCell>
                    <TableCell className="text-muted-foreground">{p.channel}</TableCell>
                    <TableCell>{p.redemptions}</TableCell>
                    <TableCell className="text-muted-foreground">{p.ends}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor[p.status]}>{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
