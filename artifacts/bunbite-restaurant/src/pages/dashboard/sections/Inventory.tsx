import { useState, useMemo, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Boxes, AlertTriangle, TrendingDown, TrendingUp, Search, Plus,
  MoreHorizontal, Eye, Pencil, Trash2, History, PackagePlus, PackageMinus,
  Download, Upload, ChevronDown, X, BarChart3, Tag, Truck, QrCode,
  CalendarClock, Activity, CheckSquare, Archive, Copy,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { inventoryItems as initial, type InventoryItem, type StockEvent } from '../data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────
type StockFilter = 'all' | 'highly-wanted' | 'low' | 'medium' | 'high';
type SortKey = 'newest' | 'oldest' | 'stock-desc' | 'stock-asc';

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'bottles', 'cans', 'boxes', 'packets', 'heads', 'box'];
const PRODUCT_TYPES = ['Ingredient', 'Beverage', 'Packaging', 'Cleaning Supply', 'Equipment'];
const CATEGORIES = ['Meat', 'Poultry', 'Dairy', 'Produce', 'Bakery', 'Beverage', 'Dessert', 'Condiments', 'Spices & Dry', 'Packaging'];

const ACTION_COLORS: Record<StockEvent['action'], string> = {
  Added:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  Used:    'bg-blue-100 text-blue-700 border-blue-200',
  Removed: 'bg-orange-100 text-orange-700 border-orange-200',
  Wasted:  'bg-red-100 text-red-700 border-red-200',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStockLevel(item: InventoryItem): 'highly-wanted' | 'low' | 'medium' | 'high' {
  if (item.stock <= item.minThreshold) return 'highly-wanted';
  const r = item.stock / item.par;
  if (r < 0.35) return 'low';
  if (r < 0.70) return 'medium';
  return 'high';
}

function daysRemaining(item: InventoryItem): number {
  if (!item.avgDailyUsage || item.avgDailyUsage <= 0) return 999;
  return Math.round(item.stock / item.avgDailyUsage);
}

function fmtExpense(item: InventoryItem) {
  return `$${(item.stock * item.costPerUnit).toFixed(2)}`;
}

function stockLevelMeta(level: ReturnType<typeof getStockLevel>) {
  switch (level) {
    case 'highly-wanted': return { label: 'Urgent', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30' };
    case 'low':           return { label: 'Low',    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30' };
    case 'medium':        return { label: 'Medium', cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30' };
    case 'high':          return { label: 'High',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30' };
  }
}

function makeId(prefix = 'INV') {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function csvEscape(v: unknown) { return `"${String(v ?? '').replace(/"/g, '""')}"`; }

// ── Sub-components ────────────────────────────────────────────────────────────

function StockBar({ item }: { item: InventoryItem }) {
  const pct = Math.min(100, Math.round((item.stock / item.par) * 100));
  const level = getStockLevel(item);
  const barColor =
    level === 'highly-wanted' ? 'bg-red-500' :
    level === 'low'           ? 'bg-amber-400' :
    level === 'medium'        ? 'bg-blue-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[60px]">
        <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'history' | 'supplier'>('overview');
  const level = getStockLevel(item);
  const meta  = stockLevelMeta(level);
  const days  = daysRemaining(item);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Boxes size={18} className="text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">{item.name}</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {item.id} · {item.productType} · {item.category}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className={meta.cls}>{meta.label}</Badge>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-transparent -mb-4">
            {(['overview', 'history', 'supplier'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold capitalize rounded-t-lg transition-colors border-b-2',
                  tab === t
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t === 'history' ? 'Stock History' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {tab === 'overview' && (
            <div className="space-y-5">
              {/* Key metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Current Stock', value: `${item.stock} ${item.unit}` },
                  { label: 'Par Level',     value: `${item.par} ${item.unit}` },
                  { label: 'Min Threshold', value: `${item.minThreshold} ${item.unit}` },
                  { label: 'Days Remaining', value: days < 999 ? `~${days} days` : '—' },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{m.label}</p>
                    <p className="text-sm font-bold mt-1">{m.value}</p>
                  </div>
                ))}
              </div>

              <StockBar item={item} />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <Row label="Cost / Unit"    value={`$${item.costPerUnit.toFixed(2)}`} />
                  <Row label="Total Expense"  value={fmtExpense(item)} />
                  <Row label="Avg Daily Use"  value={`${item.avgDailyUsage} ${item.unit}/day`} />
                </div>
                <div className="space-y-2">
                  <Row label="Batch / Lot"   value={item.batchNumber} />
                  <Row label="Expiry Date"   value={item.expiryDate} />
                  <Row label="Last Updated"  value={item.updated} />
                </div>
              </div>

              {/* Barcode */}
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <QrCode size={18} className="text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Barcode / QR</p>
                  <p className="text-sm font-mono font-semibold mt-0.5">{item.barcode}</p>
                </div>
              </div>

              {/* Alerts */}
              {(level === 'highly-wanted' || level === 'low') && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {level === 'highly-wanted'
                      ? `Stock is below minimum threshold (${item.minThreshold} ${item.unit}). Immediate restock required.`
                      : `Stock is running low. Consider reordering from ${item.supplier}.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-3">
              {item.stockHistory.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No history recorded yet.</p>
              )}
              {[...item.stockHistory].reverse().map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex flex-col items-center gap-0 pt-1">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    {i < item.stockHistory.length - 1 && <div className="w-px flex-1 bg-border min-h-[24px]" />}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0.5', ACTION_COLORS[ev.action])}>
                        {ev.action}
                      </Badge>
                      <span className="text-sm font-semibold">{ev.qty} {ev.unit}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{ev.date}</span>
                    </div>
                    {ev.note && <p className="text-xs text-muted-foreground mt-1">{ev.note}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">By {ev.by}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'supplier' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Truck size={16} className="text-muted-foreground" />
                  <span className="text-sm font-semibold">Supplier Information</span>
                </div>
                <Row label="Supplier Name"    value={item.supplier} />
                <Row label="Contact / Email"  value={item.supplierContact} />
                <Row label="Product ID"       value={item.id} />
                <Row label="Barcode"          value={item.barcode} />
              </div>
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarClock size={16} className="text-muted-foreground" />
                  <span className="text-sm font-semibold">Tracking</span>
                </div>
                <Row label="Batch / Lot No." value={item.batchNumber} />
                <Row label="Expiry Date"     value={item.expiryDate} />
                <Row label="Created"         value={item.createdAt} />
                <Row label="Last Updated"    value={item.updated} />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{String(value)}</span>
    </div>
  );
}

// ── Item Form Modal (New + Edit) ───────────────────────────────────────────────
const BLANK: Omit<InventoryItem, 'id' | 'stockHistory' | 'isArchived'> = {
  name: '', productType: 'Ingredient', category: 'Produce', unit: 'kg',
  stock: 0, par: 0, minThreshold: 0, costPerUnit: 0, avgDailyUsage: 0,
  supplier: '', supplierContact: '', barcode: '', batchNumber: '', expiryDate: '',
  updated: 'Just now', createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
};

function ItemFormModal({
  initial: init,
  onSave,
  onClose,
}: {
  initial: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}) {
  const isEdit = !!init;
  const [form, setForm] = useState<typeof BLANK>(init ? { ...init } : { ...BLANK });
  const set = (k: keyof typeof BLANK, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const item: InventoryItem = {
      ...(init ?? { id: makeId(), stockHistory: [], isArchived: false }),
      ...form,
      name: form.name.trim(),
      updated: 'Just now',
    };
    onSave(item);
    onClose();
  };

  const num = (val: number) => (isNaN(val) ? 0 : val);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              {isEdit ? <Pencil size={16} className="text-primary" /> : <Plus size={16} className="text-primary" />}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{isEdit ? 'Edit Item' : 'New Inventory Item'}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {isEdit ? `Editing ${init!.name}` : 'Add a new product to inventory.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Row 1: Name + Product Type */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Name *">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Angus Beef Patties" />
            </Field>
            <Field label="Product Type">
              <Select value={form.productType} onValueChange={(v) => set('productType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>

          {/* Row 2: Category + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Unit">
              <Select value={form.unit} onValueChange={(v) => set('unit', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>

          {/* Row 3: Stock numbers */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Current Stock">
              <Input type="number" min={0} value={form.stock} onChange={(e) => set('stock', num(parseFloat(e.target.value)))} />
            </Field>
            <Field label="Par Level">
              <Input type="number" min={0} value={form.par} onChange={(e) => set('par', num(parseFloat(e.target.value)))} />
            </Field>
            <Field label="Min Threshold">
              <Input type="number" min={0} value={form.minThreshold} onChange={(e) => set('minThreshold', num(parseFloat(e.target.value)))} />
            </Field>
          </div>

          {/* Row 4: Cost + Daily usage */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Cost per ${form.unit} ($)`}>
              <Input type="number" min={0} step={0.01} value={form.costPerUnit} onChange={(e) => set('costPerUnit', num(parseFloat(e.target.value)))} />
            </Field>
            <Field label={`Avg Daily Usage (${form.unit}/day)`}>
              <Input type="number" min={0} step={0.1} value={form.avgDailyUsage} onChange={(e) => set('avgDailyUsage', num(parseFloat(e.target.value)))} />
            </Field>
          </div>

          {/* Row 5: Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Supplier Name">
              <Input value={form.supplier} onChange={(e) => set('supplier', e.target.value)} placeholder="GreenFields Meats" />
            </Field>
            <Field label="Supplier Contact">
              <Input value={form.supplierContact} onChange={(e) => set('supplierContact', e.target.value)} placeholder="orders@supplier.com" />
            </Field>
          </div>

          {/* Row 6: Tracking */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Barcode">
              <Input value={form.barcode} onChange={(e) => set('barcode', e.target.value)} placeholder="BB-M-101" />
            </Field>
            <Field label="Batch / Lot No.">
              <Input value={form.batchNumber} onChange={(e) => set('batchNumber', e.target.value)} placeholder="LOT-A1" />
            </Field>
            <Field label="Expiry Date">
              <Input value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} placeholder="Jul 25, 2026" />
            </Field>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>{isEdit ? 'Save Changes' : 'Add Item'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">{label}</Label>
      <div id={id}>{children}</div>
    </div>
  );
}

// ── Stock Adjust Modal ─────────────────────────────────────────────────────────
function StockModal({
  item,
  mode,
  onSave,
  onClose,
}: {
  item: InventoryItem;
  mode: 'add' | 'reduce';
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}) {
  const [qty, setQty]   = useState(0);
  const [note, setNote] = useState('');

  const isAdd = mode === 'add';

  const handleSave = () => {
    if (!qty || qty <= 0) return;
    const newStock = isAdd ? item.stock + qty : Math.max(0, item.stock - qty);
    const event: StockEvent = {
      id: makeId('EV'),
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      action: isAdd ? 'Added' : 'Removed',
      qty,
      unit: item.unit,
      note: note || (isAdd ? 'Manual stock addition' : 'Manual stock reduction'),
      by: 'Admin',
    };
    onSave({ ...item, stock: newStock, updated: 'Just now', stockHistory: [...item.stockHistory, event] });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full p-0 gap-0 rounded-2xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', isAdd ? 'bg-emerald-100' : 'bg-red-100')}>
              {isAdd ? <PackagePlus size={16} className="text-emerald-700" /> : <PackageMinus size={16} className="text-red-700" />}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">{isAdd ? 'Add Stock' : 'Reduce Stock'}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">{item.name} · Current: {item.stock} {item.unit}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Quantity ({item.unit})</Label>
            <Input
              type="number"
              min={1}
              autoFocus
              value={qty || ''}
              onChange={(e) => setQty(Math.max(0, parseFloat(e.target.value) || 0))}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              placeholder={`e.g. 10`}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason or reference…"
              className="resize-none min-h-[60px]"
            />
          </div>
          {!isAdd && qty > item.stock && (
            <p className="text-xs text-destructive font-medium">
              ⚠ Quantity exceeds current stock ({item.stock} {item.unit}).
            </p>
          )}
          {isAdd && qty > 0 && (
            <p className="text-xs text-emerald-600 font-medium">
              New stock: {item.stock + qty} {item.unit}
            </p>
          )}
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!qty || qty <= 0}
            className={isAdd ? 'bg-emerald-600 hover:bg-emerald-700 border-0' : 'bg-red-600 hover:bg-red-700 border-0'}
          >
            {isAdd ? 'Add Stock' : 'Reduce Stock'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Inventory() {
  const [items, setItems]               = useState<InventoryItem[]>(initial);
  const [filter, setFilter]             = useState<StockFilter>('all');
  const [search, setSearch]             = useState('');
  const [sort, setSort]                 = useState<SortKey>('newest');
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [showArchived, setShowArchived] = useState(false);
  const [detailItem, setDetailItem]     = useState<InventoryItem | null>(null);
  const [editItem, setEditItem]         = useState<InventoryItem | null>(null);
  const [stockModal, setStockModal]     = useState<{ item: InventoryItem; mode: 'add' | 'reduce' } | null>(null);
  const [newItemOpen, setNewItemOpen]   = useState(false);
  const importRef                       = useRef<HTMLInputElement>(null);
  const { toast }                       = useToast();

  // ── Derived stats ──
  const nonArchived = useMemo(() => items.filter((i) => !i.isArchived), [items]);
  const stats = useMemo(() => ({
    total:        nonArchived.length,
    highNeed:     nonArchived.filter((i) => getStockLevel(i) === 'highly-wanted').length,
    low:          nonArchived.filter((i) => getStockLevel(i) === 'low').length,
    medium:       nonArchived.filter((i) => getStockLevel(i) === 'medium').length,
    high:         nonArchived.filter((i) => getStockLevel(i) === 'high').length,
  }), [nonArchived]);

  // ── Filtered + sorted visible list ──
  const visible = useMemo(() => {
    let list = items.filter((i) => i.isArchived === showArchived);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q));
    }

    if (filter !== 'all') {
      list = list.filter((i) => getStockLevel(i) === filter);
    }

    switch (sort) {
      case 'oldest':     list = [...list].sort((a, b) => a.id.localeCompare(b.id)); break;
      case 'stock-desc': list = [...list].sort((a, b) => b.stock - a.stock); break;
      case 'stock-asc':  list = [...list].sort((a, b) => a.stock - b.stock); break;
      default:           list = [...list].sort((a, b) => b.id.localeCompare(a.id)); break;
    }

    return list;
  }, [items, filter, search, sort, showArchived]);

  // ── Handlers ──
  const upsert = (item: InventoryItem) =>
    setItems((prev) => prev.some((i) => i.id === item.id) ? prev.map((i) => i.id === item.id ? item : i) : [...prev, item]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    toast({ title: 'Item deleted' });
  };

  const archiveItem = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, isArchived: !i.isArchived } : i));
    toast({ title: items.find((i) => i.id === id)?.isArchived ? 'Item restored' : 'Item archived' });
  };

  const duplicateItem = (item: InventoryItem) => {
    const dup: InventoryItem = { ...item, id: makeId(), name: `${item.name} (Copy)`, stockHistory: [], updated: 'Just now' };
    setItems((prev) => [dup, ...prev]);
    toast({ title: 'Item duplicated', description: dup.name });
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleAll = () =>
    setSelectedIds(selectedIds.size === visible.length ? new Set() : new Set(visible.map((i) => i.id)));

  const bulkDelete = () => {
    setItems((prev) => prev.filter((i) => !selectedIds.has(i.id)));
    toast({ title: `${selectedIds.size} items deleted` });
    setSelectedIds(new Set());
  };

  const bulkArchive = () => {
    setItems((prev) => prev.map((i) => selectedIds.has(i.id) ? { ...i, isArchived: true } : i));
    toast({ title: `${selectedIds.size} items archived` });
    setSelectedIds(new Set());
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const cols = ['ID', 'Name', 'Product Type', 'Category', 'Unit', 'Stock', 'Par', 'Min Threshold',
                  'Cost/Unit ($)', 'Total Expense ($)', 'Supplier', 'Barcode', 'Batch', 'Expiry Date',
                  'Avg Daily Usage', 'Days Remaining', 'Updated'];
    const rows = (selectedIds.size > 0 ? visible.filter((i) => selectedIds.has(i.id)) : visible).map((i) => [
      i.id, i.name, i.productType, i.category, i.unit, i.stock, i.par, i.minThreshold,
      i.costPerUnit, (i.stock * i.costPerUnit).toFixed(2), i.supplier, i.barcode,
      i.batchNumber, i.expiryDate, i.avgDailyUsage,
      daysRemaining(i) < 999 ? daysRemaining(i) : '—', i.updated,
    ]);
    const csv = [cols, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n');
    const a   = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'bunbite-inventory.csv',
    });
    a.click();
    toast({ title: 'Export ready', description: `${rows.length} items exported as CSV.` });
  };

  // ── Import CSV ──
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text  = ev.target?.result as string;
      const lines = text.trim().split('\n').slice(1); // skip header
      let count = 0;
      lines.forEach((line) => {
        const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length < 5 || !cols[1]) return;
        const item: InventoryItem = {
          id: cols[0] || makeId(), name: cols[1], productType: cols[2] || 'Ingredient',
          category: cols[3] || 'Produce', unit: cols[4] || 'kg',
          stock: parseFloat(cols[5]) || 0, par: parseFloat(cols[6]) || 0,
          minThreshold: parseFloat(cols[7]) || 0, costPerUnit: parseFloat(cols[8]) || 0,
          supplier: cols[10] || '', supplierContact: '', barcode: cols[11] || '',
          batchNumber: cols[12] || '', expiryDate: cols[13] || '',
          avgDailyUsage: parseFloat(cols[14]) || 0, isArchived: false,
          updated: 'Just now', createdAt: 'Imported', stockHistory: [],
        };
        upsert(item);
        count++;
      });
      toast({ title: 'Import complete', description: `${count} items imported.` });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Filter tabs config ──
  const TABS: { key: StockFilter; label: string; count: number }[] = [
    { key: 'all',           label: 'All Stock',     count: stats.total },
    { key: 'highly-wanted', label: 'Highly Wanted', count: stats.highNeed },
    { key: 'low',           label: 'Low Stock',     count: stats.low },
    { key: 'medium',        label: 'Medium Stock',  count: stats.medium },
    { key: 'high',          label: 'High Stock',    count: stats.high },
  ];

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Inventory"
        description="Monitor, manage and track all stock levels in real time."
        actions={
          <>
            {selectedIds.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CheckSquare size={14} className="mr-1.5" />
                    {selectedIds.size} selected <ChevronDown size={12} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportCSV}><Download size={14} className="mr-2" />Export selected</DropdownMenuItem>
                  <DropdownMenuItem onClick={bulkArchive}><Archive size={14} className="mr-2" />Archive selected</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={bulkDelete} className="text-destructive focus:text-destructive">
                    <Trash2 size={14} className="mr-2" />Delete selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
              <Upload size={14} className="mr-1.5" />Import
            </Button>
            <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download size={14} className="mr-1.5" />Export
            </Button>
            <Button size="sm" onClick={() => setNewItemOpen(true)}>
              <Plus size={14} className="mr-1.5" />New Item
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard index={0} label="Total Recorded Stock" value={String(stats.total)} icon={Boxes}
          trend={{ value: '+2', positive: true }} />
        <StatCard index={1} label="Low Stock" value={String(stats.low)} icon={TrendingDown}
          accent="secondary" trend={{ value: '-1', positive: true }} />
        <StatCard index={2} label="Medium Stock" value={String(stats.medium)} icon={BarChart3}
          trend={{ value: '+1', positive: true }} />
        <StatCard index={3} label="High Stock Need" value={String(stats.highNeed)} icon={AlertTriangle}
          accent="secondary" trend={{ value: `${stats.highNeed > 0 ? '+' : ''}${stats.highNeed}`, positive: stats.highNeed === 0 }} />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
              filter === t.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {t.label}
            <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold',
              filter === t.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            )}>
              {t.count}
            </span>
          </button>
        ))}
        <button
          onClick={() => setShowArchived((p) => !p)}
          className={cn(
            'ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors',
            showArchived ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted',
          )}
        >
          <Archive size={12} />{showArchived ? 'Showing Archived' : 'Show Archived'}
        </button>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, category…" className="pl-8" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={13} />
            </button>
          )}
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="stock-desc">Highest stock</SelectItem>
            <SelectItem value="stock-asc">Lowest stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table card */}
      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-0">

          {visible.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {search ? 'No items match your search.' : 'No items in this category.'}
            </div>
          )}

          {visible.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10 pl-5">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === visible.length && visible.length > 0}
                          onChange={toggleAll}
                          className="rounded accent-primary cursor-pointer"
                        />
                      </TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Total Expense</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right pr-5">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                      {visible.map((item, i) => {
                        const level = getStockLevel(item);
                        const meta  = stockLevelMeta(level);
                        const days  = daysRemaining(item);
                        return (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ delay: i * 0.02, duration: 0.2 }}
                            className={cn(
                              'group border-b border-border/50 hover:bg-muted/30 transition-colors',
                              selectedIds.has(item.id) && 'bg-primary/5',
                            )}
                          >
                            {/* Checkbox */}
                            <TableCell className="pl-5 w-10">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(item.id)}
                                onChange={() => toggleSelect(item.id)}
                                className="rounded accent-primary cursor-pointer"
                              />
                            </TableCell>

                            {/* Product Name */}
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-sm">{item.name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', meta.cls)}>{meta.label}</Badge>
                                  <span className="text-[10px] text-muted-foreground">{item.id}</span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Type */}
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{item.productType}</span>
                              <p className="text-[10px] text-muted-foreground/60">{item.category}</p>
                            </TableCell>

                            {/* Stock */}
                            <TableCell>
                              <div className="space-y-1 min-w-[120px]">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="font-semibold text-sm">{item.stock}</span>
                                  <span className="text-xs text-muted-foreground">{item.unit}</span>
                                  {days < 999 && (
                                    <span className="text-[10px] text-muted-foreground/70 ml-auto">~{days}d left</span>
                                  )}
                                </div>
                                <StockBar item={item} />
                              </div>
                            </TableCell>

                            {/* Supplier */}
                            <TableCell>
                              <span className="text-sm">{item.supplier}</span>
                            </TableCell>

                            {/* Expense */}
                            <TableCell>
                              <span className="font-semibold text-sm">{fmtExpense(item)}</span>
                              <p className="text-[10px] text-muted-foreground">${item.costPerUnit}/{item.unit}</p>
                            </TableCell>

                            {/* Updated */}
                            <TableCell>
                              <span className="text-sm text-muted-foreground">{item.updated}</span>
                              {item.expiryDate && (
                                <p className="text-[10px] text-muted-foreground/60">Exp: {item.expiryDate}</p>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right pr-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal size={15} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem onClick={() => setDetailItem(item)}>
                                    <Eye size={14} className="mr-2" />View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEditItem(item)}>
                                    <Pencil size={14} className="mr-2" />Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setStockModal({ item, mode: 'add' })}>
                                    <PackagePlus size={14} className="mr-2 text-emerald-600" />Add Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setStockModal({ item, mode: 'reduce' })}>
                                    <PackageMinus size={14} className="mr-2 text-amber-600" />Reduce Stock
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setDetailItem(item); }}>
                                    <History size={14} className="mr-2" />Stock History
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => duplicateItem(item)}>
                                    <Copy size={14} className="mr-2" />Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => archiveItem(item.id)}>
                                    <Archive size={14} className="mr-2" />{item.isArchived ? 'Restore' : 'Archive'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => removeItem(item.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 size={14} className="mr-2" />Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-border">
                {visible.map((item) => {
                  const level = getStockLevel(item);
                  const meta  = stockLevelMeta(level);
                  return (
                    <div key={item.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.productType} · {item.category}</p>
                        </div>
                        <Badge variant="outline" className={cn('shrink-0', meta.cls)}>{meta.label}</Badge>
                      </div>
                      <StockBar item={item} />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Stock</span>
                        <span className="font-semibold">{item.stock} {item.unit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Expense</span>
                        <span className="font-semibold">{fmtExpense(item)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Supplier</span>
                        <span>{item.supplier}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setStockModal({ item, mode: 'add' })}>
                          <PackagePlus size={13} className="mr-1" />Add
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setDetailItem(item)}>
                          <Eye size={13} className="mr-1" />Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditItem(item)}>
                          <Pencil size={13} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer summary */}
          {visible.length > 0 && (
            <div className="px-5 py-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{visible.length} item{visible.length !== 1 ? 's' : ''} shown{selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ''}</span>
              <span>
                Total value: <strong className="text-foreground">
                  ${visible.reduce((s, i) => s + i.stock * i.costPerUnit, 0).toFixed(2)}
                </strong>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {detailItem && <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />}

      {editItem && (
        <ItemFormModal
          initial={editItem}
          onSave={(updated) => { upsert(updated); toast({ title: 'Item updated' }); }}
          onClose={() => setEditItem(null)}
        />
      )}

      {newItemOpen && (
        <ItemFormModal
          initial={null}
          onSave={(item) => { upsert(item); toast({ title: 'Item added', description: item.name }); }}
          onClose={() => setNewItemOpen(false)}
        />
      )}

      {stockModal && (
        <StockModal
          item={stockModal.item}
          mode={stockModal.mode}
          onSave={(updated) => { upsert(updated); toast({ title: stockModal.mode === 'add' ? 'Stock added' : 'Stock reduced', description: updated.name }); }}
          onClose={() => setStockModal(null)}
        />
      )}
    </div>
  );
}
