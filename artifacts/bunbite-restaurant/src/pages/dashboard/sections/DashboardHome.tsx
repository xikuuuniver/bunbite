import { ShoppingCart, CalendarCheck, DollarSign, Star } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useOrders } from '@/context/OrdersContext';
import { revenueSeries, categorySales, menuItems } from '../data';

export default function DashboardHome() {
  const { unpaidOrders, preOrders } = useOrders();
  const weeklyRevenue = revenueSeries.reduce((sum, d) => sum + d.revenue, 0);
  const topItems = [...menuItems].sort((a, b) => b.sold - a.sold).slice(0, 5);

  return (
    <div>
      <PageHeader title="Welcome back 👋" description="Here's how BunBite is performing today." />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard index={0} label="Weekly Revenue" value={`$${weeklyRevenue.toLocaleString()}`} icon={DollarSign} trend={{ value: '12.4%', positive: true }} />
        <StatCard index={1} label="Active Orders" value={String(unpaidOrders.length)} icon={ShoppingCart} accent="secondary" trend={{ value: '3.1%', positive: true }} />
        <StatCard index={2} label="Upcoming Reservations" value={String(preOrders.length)} icon={CalendarCheck} trend={{ value: '2 new', positive: true }} />
        <StatCard index={3} label="Avg. Rating" value="4.7 / 5" icon={Star} accent="secondary" trend={{ value: '0.2', positive: true }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <Card className="xl:col-span-2 rounded-2xl border-card-border">
          <CardHeader className="pb-0">
            <CardTitle className="font-display text-base font-normal text-foreground">Revenue This Week</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueSeries} margin={{ left: -20, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.15)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--card-border))', fontSize: 13 }}
                  formatter={(v: number) => [`$${v}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-0">
            <CardTitle className="font-display text-base font-normal text-foreground">Sales by Category</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categorySales} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {categorySales.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-2">
              {categorySales.map((c) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  {c.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 rounded-2xl border-card-border">
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle className="font-display text-base font-normal text-foreground">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="divide-y divide-border/60">
              {unpaidOrders.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">No active orders right now.</p>
              )}
              {unpaidOrders.map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{o.id} · {o.items}</p>
                    <p className="text-xs text-muted-foreground">{o.time}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">${o.total.toFixed(2)}</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Awaiting Payment</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-0">
            <CardTitle className="font-display text-base font-normal text-foreground">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={topItems} layout="vertical" margin={{ left: 0, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => [`${v} sold`, '']} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="sold" radius={[0, 6, 6, 0]} fill="hsl(var(--secondary))" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
