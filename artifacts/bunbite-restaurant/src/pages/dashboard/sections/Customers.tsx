import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users, Crown, UserPlus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { customers } from '../data';

const tierColor: Record<string, string> = {
  VIP: 'bg-secondary/25 text-primary border-secondary/40',
  Regular: 'bg-blue-50 text-blue-700 border-blue-200',
  New: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function Customers() {
  const [query, setQuery] = useState('');
  const filtered = customers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.includes(query));

  return (
    <div>
      <PageHeader title="Customers" description="Understand who's ordering and how loyal they are." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Total Customers" value={String(customers.length)} icon={Users} />
        <StatCard index={1} label="VIP Members" value={String(customers.filter((c) => c.tier === 'VIP').length)} icon={Crown} accent="secondary" />
        <StatCard index={2} label="New This Month" value={String(customers.filter((c) => c.tier === 'New').length)} icon={UserPlus} />
      </div>

      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-4 md:p-6">
          <div className="relative w-full max-w-xs mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers…" className="pl-8" data-testid="input-customers-search" />
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {filtered.map((c) => (
              <div key={c.id} data-testid={`row-customer-${c.id}`} className="rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-full ${c.avatarColor} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                      {c.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${tierColor[c.tier]}`}>{c.tier}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm pt-1">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-semibold">{c.orders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="font-semibold">${c.spent.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Last Visit</p>
                    <p className="font-semibold text-xs">{c.lastVisit}</p>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No customers match your search.</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Tier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} data-testid={`row-customer-${c.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${c.avatarColor} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                          {c.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{c.orders}</TableCell>
                    <TableCell>${c.spent.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{c.lastVisit}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={tierColor[c.tier]}>{c.tier}</Badge>
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
