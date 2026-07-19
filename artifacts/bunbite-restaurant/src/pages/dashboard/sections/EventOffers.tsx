import { useState } from 'react';
import {
  Trophy, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useToast } from '@/hooks/use-toast';

/* ─── types ── */
interface EventOffer {
  id: string;
  title: string;
  promoCode: string;
  discountLabel: string;
  discountPct: number;
  leftTeam: string;
  rightTeam: string;
  leftBg: string;
  rightBg: string;
  startDate: string;
  expiryDate: string;
  status: 'Active' | 'Scheduled' | 'Ended';
  redemptions: number;
  countdown: boolean;
}

type FormData = Omit<EventOffer, 'id' | 'redemptions'>;

/* ─── initial data ── */
const INITIAL_OFFERS: EventOffer[] = [
  {
    id: 'EO-001',
    title: 'Argentina vs Spain — FIFA World Cup 2026',
    promoCode: 'FIFA2026',
    discountLabel: '20% off',
    discountPct: 20,
    leftTeam: 'Argentina',
    rightTeam: 'España',
    leftBg: '#0B1E80',
    rightBg: '#520A8C',
    startDate: '2026-07-19',
    expiryDate: '2026-09-15',
    status: 'Active',
    redemptions: 147,
    countdown: true,
  },
];

const BLANK_FORM: FormData = {
  title: '',
  promoCode: '',
  discountLabel: '',
  discountPct: 10,
  leftTeam: '',
  rightTeam: '',
  leftBg: '#0B1E80',
  rightBg: '#520A8C',
  startDate: '',
  expiryDate: '',
  status: 'Scheduled',
  countdown: true,
};

/* ─── badge colours ── */
const STATUS_CLS: Record<EventOffer['status'], string> = {
  Active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Ended:     'bg-muted text-muted-foreground border-border',
};

let nextId = 2;

/* ─── component ── */
export default function EventOffers() {
  const { toast } = useToast();

  const [offers, setOffers]         = useState<EventOffer[]>(INITIAL_OFFERS);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<EventOffer | null>(null);
  const [form, setForm]             = useState<FormData>(BLANK_FORM);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  /* ── derived stats ── */
  const active      = offers.filter((o) => o.status === 'Active').length;
  const redemptions = offers.reduce((s, o) => s + o.redemptions, 0);

  /* ── helpers ── */
  const openCreate = () => {
    setEditTarget(null);
    setForm(BLANK_FORM);
    setModalOpen(true);
  };

  const openEdit = (offer: EventOffer) => {
    setEditTarget(offer);
    const { id: _id, redemptions: _r, ...rest } = offer;
    setForm(rest);
    setModalOpen(true);
  };

  const patch = <K extends keyof FormData>(key: K, val: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.title.trim() || !form.promoCode.trim()) {
      toast({ title: 'Required fields missing', description: 'Title and promo code are required.', variant: 'destructive' });
      return;
    }
    if (editTarget) {
      setOffers((prev) => prev.map((o) => o.id === editTarget.id ? { ...o, ...form } : o));
      toast({ title: 'Event offer updated', description: `"${form.title}" saved.` });
    } else {
      const newOffer: EventOffer = { ...form, id: `EO-${String(nextId++).padStart(3, '0')}`, redemptions: 0 };
      setOffers((prev) => [newOffer, ...prev]);
      toast({ title: 'Event offer created', description: `"${form.title}" is now live.` });
    }
    setModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next = o.status === 'Active' ? 'Ended' : 'Active';
        return { ...o, status: next };
      }),
    );
  };

  const handleDelete = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    setDeleteId(null);
    toast({ title: 'Event offer deleted' });
  };

  return (
    <div>
      <PageHeader
        title="Event Offers"
        description="Create and manage featured promotional banners for special events."
        actions={
          <Button onClick={openCreate} data-testid="button-create-event-offer">
            <Plus size={16} className="mr-1.5" /> New Event Offer
          </Button>
        }
      />

      {/* ── stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard index={0} label="Total Offers"       value={String(offers.length)} icon={Trophy} />
        <StatCard index={1} label="Active Offers"      value={String(active)}        icon={ToggleRight} accent="secondary" />
        <StatCard index={2} label="Total Redemptions"  value={String(redemptions)}   icon={Calendar} />
      </div>

      {/* ── table ── */}
      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-4 md:p-6">

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {offers.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-border p-4 space-y-2"
                data-testid={`row-event-offer-${o.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{o.title}</p>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded mt-0.5 inline-block">
                      {o.promoCode}
                    </code>
                  </div>
                  <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_CLS[o.status]}`}>
                    {o.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{o.discountLabel} · {o.redemptions} uses</span>
                  <span>{o.expiryDate}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(o)} className="flex-1 h-8 text-xs">
                    <Edit2 size={12} className="mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleStatus(o.id)} className="flex-1 h-8 text-xs">
                    {o.status === 'Active' ? <ToggleLeft size={12} className="mr-1" /> : <ToggleRight size={12} className="mr-1" />}
                    {o.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteId(o.id)} className="h-8 text-xs text-destructive hover:text-destructive">
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
            {offers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No event offers yet.</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Countdown</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Redemptions</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((o) => (
                  <TableRow key={o.id} data-testid={`row-event-offer-${o.id}`}>
                    <TableCell className="font-medium max-w-[200px] truncate">{o.title}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{o.promoCode}</code>
                    </TableCell>
                    <TableCell className="text-sm">{o.discountLabel}</TableCell>
                    <TableCell className="text-sm">
                      <span className="text-blue-600 font-medium">{o.leftTeam}</span>
                      <span className="text-muted-foreground mx-1">vs</span>
                      <span className="text-purple-600 font-medium">{o.rightTeam}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.expiryDate}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${o.countdown ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                        {o.countdown ? 'On' : 'Off'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_CLS[o.status]}`}>
                        {o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{o.redemptions}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(o)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          aria-label="Edit offer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => toggleStatus(o.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          aria-label={o.status === 'Active' ? 'Deactivate' : 'Activate'}
                          title={o.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {o.status === 'Active'
                            ? <ToggleLeft size={13} />
                            : <ToggleRight size={13} className="text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => setDeleteId(o.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          aria-label="Delete offer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {offers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                      No event offers yet. Click "New Event Offer" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ══ Create / Edit modal ══════════════════════════════════════ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" />
              {editTarget ? 'Edit Event Offer' : 'New Event Offer'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">

            {/* Event info */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Event Details
              </h3>
              <div>
                <Label htmlFor="eo-title">Event Title *</Label>
                <Input
                  id="eo-title"
                  className="mt-1"
                  placeholder="e.g. Argentina vs Spain — FIFA World Cup 2026"
                  value={form.title}
                  onChange={(e) => patch('title', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="eo-left-team">Left Team Name</Label>
                  <Input
                    id="eo-left-team"
                    className="mt-1"
                    placeholder="e.g. Argentina"
                    value={form.leftTeam}
                    onChange={(e) => patch('leftTeam', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="eo-right-team">Right Team Name</Label>
                  <Input
                    id="eo-right-team"
                    className="mt-1"
                    placeholder="e.g. España"
                    value={form.rightTeam}
                    onChange={(e) => patch('rightTeam', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Visual — background colours */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Background Colours
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="eo-left-bg">Left Panel Colour</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="eo-left-bg"
                      value={form.leftBg}
                      onChange={(e) => patch('leftBg', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                    />
                    <Input
                      value={form.leftBg}
                      onChange={(e) => patch('leftBg', e.target.value)}
                      placeholder="#0B1E80"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eo-right-bg">Right Panel Colour</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      id="eo-right-bg"
                      value={form.rightBg}
                      onChange={(e) => patch('rightBg', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                    />
                    <Input
                      value={form.rightBg}
                      onChange={(e) => patch('rightBg', e.target.value)}
                      placeholder="#520A8C"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Player Images (optional URLs)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="eo-left-img">Left Player Image URL</Label>
                  <Input
                    id="eo-left-img"
                    className="mt-1 text-sm"
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <Label htmlFor="eo-right-img">Right Player Image URL</Label>
                  <Input
                    id="eo-right-img"
                    className="mt-1 text-sm"
                    placeholder="https://…"
                  />
                </div>
              </div>
            </div>

            {/* Promo code */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Promotion
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="eo-code">Promo Code *</Label>
                  <Input
                    id="eo-code"
                    className="mt-1 font-mono"
                    placeholder="FIFA2026"
                    value={form.promoCode}
                    onChange={(e) => patch('promoCode', e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <Label htmlFor="eo-discount-label">Discount Label</Label>
                  <Input
                    id="eo-discount-label"
                    className="mt-1"
                    placeholder="e.g. 20% off"
                    value={form.discountLabel}
                    onChange={(e) => patch('discountLabel', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="eo-discount-pct">Discount Amount (%)</Label>
                <Input
                  id="eo-discount-pct"
                  type="number"
                  min={1}
                  max={100}
                  className="mt-1 w-32"
                  value={form.discountPct}
                  onChange={(e) => patch('discountPct', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Schedule
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="eo-start">Start Date</Label>
                  <Input
                    id="eo-start"
                    type="date"
                    className="mt-1"
                    value={form.startDate}
                    onChange={(e) => patch('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="eo-expiry">Expiry Date</Label>
                  <Input
                    id="eo-expiry"
                    type="date"
                    className="mt-1"
                    value={form.expiryDate}
                    onChange={(e) => patch('expiryDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-muted/30">
                <div>
                  <p className="text-sm font-medium">Countdown Timer</p>
                  <p className="text-xs text-muted-foreground">Show live countdown on the banner</p>
                </div>
                <Switch
                  checked={form.countdown}
                  onCheckedChange={(v) => patch('countdown', v)}
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="eo-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => patch('status', v as FormData['status'])}>
                <SelectTrigger id="eo-status" className="mt-1 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editTarget ? 'Save Changes' : 'Create Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ Delete confirmation dialog ══════════════════════════════ */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Event Offer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the event offer. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
