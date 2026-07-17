import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { revenueSeries } from '../data';
import { useToast } from '@/hooks/use-toast';

export default function AnalyticsReports() {
  const { toast } = useToast();
  const totalOrders = revenueSeries.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = revenueSeries.reduce((s, d) => s + d.revenue, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Deep-dive into revenue, order volume, and customer trends."
        actions={
          <Button variant="outline" onClick={() => toast({ title: 'Report exported', description: 'Your CSV report is ready to download.' })} data-testid="button-export-report">
            <Download size={16} className="mr-1.5" /> Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard index={0} label="Total Revenue (7d)" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} trend={{ value: '12.4%', positive: true }} />
        <StatCard index={1} label="Total Orders (7d)" value={String(totalOrders)} icon={ShoppingBag} accent="secondary" trend={{ value: '8.2%', positive: true }} />
        <StatCard index={2} label="Avg. Order Value" value={`$${avgOrderValue.toFixed(2)}`} icon={TrendingUp} trend={{ value: '1.9%', positive: false }} />
        <StatCard index={3} label="Repeat Customers" value="61%" icon={Users} accent="secondary" trend={{ value: '4.0%', positive: true }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-0">
            <CardTitle className="font-display text-base font-normal text-foreground">Revenue vs Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueSeries} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.15)" />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="hsl(var(--secondary))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-card-border">
          <CardHeader className="pb-0">
            <CardTitle className="font-display text-base font-normal text-foreground">Orders per Day</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueSeries} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.15)" />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
