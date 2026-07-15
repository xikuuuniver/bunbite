import { useMemo, useState } from 'react';
import { Pencil, Check, X as XIcon, Save } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import WidgetPicker from '../components/WidgetPicker';
import { useOrders } from '@/context/OrdersContext';
import { revenueSeries, categorySales, menuItems } from '../data';
import { buildWidgetCatalog } from '../widgetCatalog';
import { useToast } from '@/hooks/use-toast';

const LAYOUT_STORAGE_KEY = 'bunbite-dashboard-widget-layout';
const DEFAULT_LAYOUT = ['weekly-revenue', 'active-orders', 'upcoming-reservations', 'avg-rating'];

function loadLayout(): string[] {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 4 && parsed.every((id) => typeof id === 'string')) {
      return parsed;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_LAYOUT;
}

export default function DashboardHome() {
  const { unpaidOrders, preOrders } = useOrders();
  const { toast } = useToast();
  const topItems = [...menuItems].sort((a, b) => b.sold - a.sold).slice(0, 5);

  const catalog = useMemo(
    () => buildWidgetCatalog({ unpaidOrdersCount: unpaidOrders.length, preOrdersCount: preOrders.length }),
    [unpaidOrders.length, preOrders.length],
  );
  const catalogById = useMemo(() => new Map(catalog.map((w) => [w.id, w])), [catalog]);

  const [layout, setLayout] = useState<string[]>(loadLayout);
  const [editMode, setEditMode] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [pendingChange, setPendingChange] = useState<{ slot: number; widgetId: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const displayLayout = layout.map((id, i) => (pendingChange && pendingChange.slot === i ? pendingChange.widgetId : id));

  const toggleEditMode = () => {
    if (editMode && pendingChange) {
      setPendingChange(null);
    }
    setEditMode((v) => !v);
  };

  const handleSelectWidget = (widgetId: string) => {
    if (pickerSlot === null) return;
    setPendingChange({ slot: pickerSlot, widgetId });
    setPickerSlot(null);
    toast({ title: 'Preview updated', description: "Click Save Changes to make it permanent." });
  };

  const discardPreview = () => setPendingChange(null);

  const confirmSave = () => {
    if (!pendingChange) return;
    const next = [...layout];
    next[pendingChange.slot] = pendingChange.widgetId;
    setLayout(next);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(next));
    setPendingChange(null);
    setConfirmOpen(false);
    toast({ title: 'Dashboard updated', description: 'Your widget layout has been saved.' });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
        <PageHeader title="Welcome back 👋" description="Here's how BunBite is performing today." />
        <div className="flex items-center gap-2 shrink-0">
          <AnimatePresence>
            {pendingChange && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-2"
              >
                <Button variant="outline" size="sm" onClick={discardPreview} data-testid="button-discard-widget">
                  <XIcon size={14} className="mr-1" /> Discard
                </Button>
                <Button size="sm" onClick={() => setConfirmOpen(true)} data-testid="button-save-widget">
                  <Save size={14} className="mr-1" /> Save Changes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant={editMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={toggleEditMode}
            data-testid="button-edit-widgets"
          >
            {editMode ? <Check size={14} className="mr-1" /> : <Pencil size={14} className="mr-1" />}
            {editMode ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>
      {editMode && (
        <p className="text-xs text-muted-foreground mb-4">Tap any widget below to swap it for something else.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {displayLayout.map((widgetId, i) => {
          const w = catalogById.get(widgetId);
          if (!w) return null;
          const isPreview = pendingChange?.slot === i;
          return (
            <StatCard
              key={`${i}-${widgetId}`}
              index={i}
              label={w.label}
              value={w.value}
              icon={w.icon}
              accent={w.accent}
              trend={w.trend}
              editing={editMode}
              preview={isPreview}
              onClick={() => setPickerSlot(i)}
            />
          );
        })}
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

      <WidgetPicker
        open={pickerSlot !== null}
        onOpenChange={(open) => !open && setPickerSlot(null)}
        widgets={catalog}
        currentWidgetId={pickerSlot !== null ? displayLayout[pickerSlot] : undefined}
        onSelect={handleSelectWidget}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-testid="dialog-confirm-save">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to save these changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current widget with your selected preview. You can always change it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-save">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} data-testid="button-confirm-save">Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
