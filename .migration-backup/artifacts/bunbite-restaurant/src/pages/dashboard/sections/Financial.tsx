import { useMemo, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  CalendarDays, CalendarRange, Calendar, Receipt, PiggyBank, Download,
  Trophy, Crown, Medal, Award, ShoppingBag,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  financePeriods, getFinanceTotals, getFinanceTrend, getFinancePreviousMonthDelta,
  getExpenseRecordsForPeriod, getTopMenuItemsForPeriod, type FinancePeriodId,
} from '../data';

const rankIcon = [Crown, Medal, Award];

function toCsvValue(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function Financial() {
  const { toast } = useToast();
  const [periodId, setPeriodId] = useState<FinancePeriodId>('jul2026');

  const period = financePeriods.find((p) => p.id === periodId)!;
  const { revenue, expenses } = getFinanceTotals(periodId);
  const trend = getFinanceTrend(periodId);
  const monthDelta = getFinancePreviousMonthDelta(periodId);
  const records = useMemo(() => getExpenseRecordsForPeriod(periodId), [periodId]);
  const topItems = useMemo(() => getTopMenuItemsForPeriod(periodId), [periodId]);

  const netProfit = revenue - expenses;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const isProfitable = netProfit >= 0;
  const recordsTotal = records.reduce((s, r) => s + r.amount, 0);
  const topItemsOrders = topItems.reduce((s, i) => s + i.orders, 0);
  const topItemsRevenue = topItems.reduce((s, i) => s + i.revenue, 0);
  const bestSeller = topItems[0];

  function handleExport() {
    const rows: string[] = [];
    rows.push(`BunBite Financial Report — ${period.label}`);
    rows.push('');
    rows.push('Summary');
    rows.push(['Metric', 'Value'].join(','));
    rows.push(['Total Revenue', revenue].join(','));
    rows.push(['Total Expenses', expenses].join(','));
    rows.push(['Net Profit', netProfit].join(','));
    rows.push(['Profit Margin (%)', profitMargin.toFixed(1)].join(','));
    rows.push('');
    rows.push('Expense Records');
    rows.push(['Date', 'Category', 'Description', 'Vendor', 'Amount'].map(toCsvValue).join(','));
    for (const r of records) {
      rows.push([r.dateLabel, r.category, r.description, r.vendor, r.amount.toFixed(2)].map(toCsvValue).join(','));
    }
    rows.push('');
    rows.push('Top Menu Items');
    rows.push(['Rank', 'Item', 'Category', 'Orders', 'Revenue'].map(toCsvValue).join(','));
    for (const item of topItems) {
      rows.push([item.rank, item.name, item.category, item.orders, item.revenue.toFixed(2)].map(toCsvValue).join(','));
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunbite-financial-report-${periodId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    toast({ title: 'Report exported', description: `${period.label} financial report downloaded as CSV.` });
  }

  return (
    <div>
      <PageHeader
        title="Financial"
        description="A complete view of revenue, expenses, and profitability so you can monitor cash flow and make informed decisions."
        actions={
          <>
            <Select value={periodId} onValueChange={(v) => setPeriodId(v as FinancePeriodId)}>
              <SelectTrigger className="w-full sm:w-[210px]" data-testid="select-finance-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {financePeriods.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} data-testid="button-export-report">
              <Download size={16} className="mr-1.5" /> Export Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          index={0}
          label={period.kind === 'today' ? "Today's Revenue" : period.kind === 'week' ? "This Week's Revenue" : `${period.shortLabel} Revenue`}
          value={`$${revenue.toLocaleString()}`}
          icon={period.kind === 'today' ? CalendarDays : period.kind === 'week' ? CalendarRange : Calendar}
          trend={monthDelta ? { value: `${Math.abs(monthDelta.revenuePct).toFixed(1)}%`, positive: monthDelta.revenuePct >= 0, label: 'vs prior month' } : undefined}
        />
        <StatCard
          index={1}
          label={period.kind === 'today' ? "Today's Expenses" : period.kind === 'week' ? "This Week's Expenses" : `${period.shortLabel} Expenses`}
          value={`$${expenses.toLocaleString()}`}
          icon={Receipt}
          accent="secondary"
          trend={monthDelta ? { value: `${Math.abs(monthDelta.expensesPct).toFixed(1)}%`, positive: monthDelta.expensesPct < 0, label: 'vs prior month' } : undefined}
        />
        <StatCard index={2} label="Net Profit" value={`${isProfitable ? '+' : '-'}$${Math.abs(netProfit).toLocaleString()}`} icon={PiggyBank} />
        <StatCard index={3} label="Best Seller" value={bestSeller ? bestSeller.name : '—'} icon={Trophy} accent="secondary" />
      </div>

      {/* Net profit / margin banner */}
      <Card className="rounded-2xl border-card-border mb-6 overflow-hidden">
        <CardContent className="p-5 flex flex-wrap items-center gap-5">
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
              isProfitable ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500',
            )}
          >
            <PiggyBank size={22} />
          </div>
          <div className="min-w-[180px]">
            <p className="text-sm text-muted-foreground font-medium">Net Profit ({period.shortLabel})</p>
            <p className={cn('mt-1 text-2xl md:text-3xl font-display', isProfitable ? 'text-emerald-600' : 'text-red-500')}>
              {isProfitable ? '+' : '-'}${Math.abs(netProfit).toLocaleString()}
            </p>
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Profit margin</span>
              <span className="font-semibold text-foreground">{profitMargin.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full', isProfitable ? 'bg-emerald-500' : 'bg-red-500')}
                style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ${revenue.toLocaleString()} revenue vs ${expenses.toLocaleString()} expenses · {period.label}.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trend chart */}
      <Card className="rounded-2xl border-card-border mb-6">
        <CardHeader className="pb-0">
          <CardTitle className="font-display text-base font-normal text-foreground">Revenue vs. Expense — {period.label}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend} margin={{ left: 0, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="finRevFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="finExpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.15)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--card-border))', fontSize: 12 }}
                formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#finRevFill)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(var(--secondary))" strokeWidth={2.5} fill="url(#finExpFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Expense records */}
        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base font-normal text-foreground">Expense Records</CardTitle>
            <span className="text-xs text-muted-foreground">{records.length} entries · ${recordsTotal.toLocaleString()}</span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[360px] overflow-auto -mx-1 px-1">
              <Table className="min-w-[560px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No expense records for this period.
                      </TableCell>
                    </TableRow>
                  )}
                  {records.map((r) => (
                    <TableRow key={r.id} data-testid={`row-expense-${r.id}`}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{r.dateLabel}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap font-normal text-[11px]">{r.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm text-foreground whitespace-nowrap">{r.description}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{r.vendor}</p>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground whitespace-nowrap">
                        ${r.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Order & revenue analytics */}
        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base font-normal text-foreground">Order &amp; Revenue Analytics</CardTitle>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShoppingBag size={13} /> {topItemsOrders.toLocaleString()} orders · ${topItemsRevenue.toLocaleString()}
            </span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-[360px] overflow-auto -mx-1 px-1">
              <Table className="min-w-[440px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Orders</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topItems.map((item) => {
                    const Icon = rankIcon[item.rank - 1];
                    return (
                      <TableRow key={item.name} data-testid={`row-topitem-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        <TableCell>
                          {Icon ? (
                            <Icon
                              size={16}
                              className={cn(
                                item.rank === 1 ? 'text-amber-500' : item.rank === 2 ? 'text-slate-400' : 'text-orange-600',
                              )}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground pl-1">{item.rank}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </TableCell>
                        <TableCell className="text-right text-foreground whitespace-nowrap">{item.orders.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground whitespace-nowrap">
                          ${item.revenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
