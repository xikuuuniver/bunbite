import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, CalendarRange, Calendar, Receipt, PiggyBank } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { cn } from '@/lib/utils';
import { todaysRevenue, todaysExpenses, weeklyFinance, monthlyFinance } from '../data';

export default function Financial() {
  const weekRevenue = weeklyFinance.reduce((s, d) => s + d.revenue, 0);
  const weekExpenses = weeklyFinance.reduce((s, d) => s + d.expenses, 0);

  const currentMonth = monthlyFinance[monthlyFinance.length - 1];
  const monthRevenue = currentMonth.revenue;
  const monthExpenses = currentMonth.expenses;

  const netProfit = monthRevenue - monthExpenses;
  const profitMargin = (netProfit / monthRevenue) * 100;
  const isProfitable = netProfit >= 0;

  return (
    <div>
      <PageHeader
        title="Financial"
        description="A complete view of revenue, expenses, and profitability so you can monitor cash flow and make informed decisions."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          index={0}
          label="Today's Revenue"
          value={`$${todaysRevenue.toLocaleString()}`}
          icon={CalendarDays}
          trend={{ value: '6.1%', positive: true }}
        />
        <StatCard
          index={1}
          label="This Week's Revenue"
          value={`$${weekRevenue.toLocaleString()}`}
          icon={CalendarRange}
          accent="secondary"
          trend={{ value: '9.4%', positive: true }}
        />
        <StatCard
          index={2}
          label="This Month's Revenue"
          value={`$${monthRevenue.toLocaleString()}`}
          icon={Calendar}
          trend={{ value: '4.7%', positive: true }}
        />
        <StatCard
          index={3}
          label="This Month's Expenses"
          value={`$${monthExpenses.toLocaleString()}`}
          icon={Receipt}
          accent="secondary"
          trend={{ value: '2.3%', positive: false }}
        />
      </div>

      {/* Net profit highlight banner */}
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
            <p className="text-sm text-muted-foreground font-medium">Net Profit (Month to Date)</p>
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
              ${monthRevenue.toLocaleString()} revenue vs ${monthExpenses.toLocaleString()} expenses this month.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-0">
            <CardTitle className="font-display text-base font-normal text-foreground">Weekly Revenue vs. Expense</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyFinance} margin={{ left: 0, right: 10, top: 10 }}>
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
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v: number) => `${v}`} />
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

        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-0">
            <CardTitle className="font-display text-base font-normal text-foreground">Monthly Revenue vs. Expense</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyFinance} margin={{ left: 0, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.15)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  width={56}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--card-border))', fontSize: 12 }}
                  formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" barSize={16} />
                <Bar dataKey="expenses" name="Expenses" radius={[6, 6, 0, 0]} fill="hsl(var(--secondary))" barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
