import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarCheck, Clock3, CheckCircle2, Users2, TableProperties, XCircle, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useOrders, type BookingStatus, BOOKING_STATUS_COLOR } from '@/context/OrdersContext';
import { useToast } from '@/hooks/use-toast';

const TOTAL_TABLES = 20;

const BOOKING_STATUS_META: Record<BookingStatus, { label: string; badgeClass: string }> = {
  pending:   { label: 'Pending',   badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'  },
  approved:  { label: 'Approved',  badgeClass: 'bg-green-50 text-green-700 border-green-200'  },
  arrived:   { label: 'Arrived',   badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'     },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-red-50 text-red-700 border-red-200'        },
};

const STATUS_OPTIONS: BookingStatus[] = ['pending', 'approved', 'arrived', 'cancelled'];

const FILTER_TABS: Array<{ value: BookingStatus | 'all'; label: string }> = [
  { value: 'all',       label: 'All'       },
  { value: 'pending',   label: 'Pending'   },
  { value: 'approved',  label: 'Approved'  },
  { value: 'arrived',   label: 'Arrived'   },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Reservations() {
  const { preOrders, updatePreOrderStatus } = useOrders();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const countBy = (status: BookingStatus) => preOrders.filter((p) => p.status === status).length;
  const activeCount = preOrders.filter((p) => p.status !== 'cancelled').length;
  const availableTables = Math.max(0, TOTAL_TABLES - activeCount);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return preOrders.filter((p) => {
      const matchesQuery =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [preOrders, query, statusFilter]);

  const handleStatusChange = (id: string, status: BookingStatus) => {
    const booking = preOrders.find((p) => p.id === id);
    if (!booking) return;
    updatePreOrderStatus(id, status);
    toast({
      title: 'Booking status updated',
      description: `${booking.id} (${booking.fullName}) is now ${BOOKING_STATUS_META[status].label}.`,
    });
  };

  return (
    <div>
      <PageHeader title="Table Bookings" description="Manage all table bookings and track guest arrivals in real time." />

      {/* ── Stat widgets ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard index={0} label="Pending Bookings"   value={String(countBy('pending'))}   icon={Clock3}           />
        <StatCard index={1} label="Approved Bookings"  value={String(countBy('approved'))}  icon={CheckCircle2}     accent="secondary" />
        <StatCard index={2} label="Arrived Guests"     value={String(countBy('arrived'))}   icon={Users2}           />
        <StatCard index={3} label="Available Tables"   value={String(availableTables)}      icon={TableProperties}  accent="secondary" />
        <StatCard index={4} label="Cancelled Bookings" value={String(countBy('cancelled'))} icon={XCircle}          />
      </div>

      {/* ── Booking list card ── */}
      <Card className="rounded-2xl border-card-border">
        <CardContent className="p-4 md:p-6">

          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative w-full sm:max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, username, or booking #…"
                className="pl-8"
                data-testid="input-bookings-search"
              />
            </div>

            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-1.5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  data-testid={`filter-tab-${tab.value}`}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border',
                    statusFilter === tab.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground/30',
                  ].join(' ')}
                >
                  {tab.label}
                  {tab.value !== 'all' && (
                    <span className="ml-1.5 opacity-60">
                      {countBy(tab.value as BookingStatus)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} data-testid={`row-booking-${p.id}`} className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{p.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{p.username} · {p.id}</p>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${BOOKING_STATUS_META[p.status].badgeClass}`}>
                    {BOOKING_STATUS_META[p.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="font-medium text-xs mt-0.5">{p.bookingDateTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Guests</p>
                    <p className="font-medium mt-0.5">{p.guests}</p>
                  </div>
                </div>
                <Select value={p.status} onValueChange={(value) => handleStatusChange(p.id, value as BookingStatus)}>
                  <SelectTrigger className="w-full" data-testid={`select-booking-status-${p.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} data-testid={`option-booking-${status}-${p.id}`}>
                        {BOOKING_STATUS_META[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                <CalendarCheck size={32} className="mx-auto mb-2 opacity-25" />
                <p className="text-sm">{query || statusFilter !== 'all' ? 'No bookings match your search or filter.' : 'No table bookings yet.'}</p>
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-center">Guests</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} data-testid={`row-booking-${p.id}`}>
                    <TableCell className="font-semibold whitespace-nowrap">{p.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">@{p.username}</TableCell>
                    <TableCell className="font-mono text-sm">{p.id}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{p.bookingDateTime}</TableCell>
                    <TableCell className="text-center">{p.guests}</TableCell>
                    <TableCell className="text-right">
                      {p.fee > 0 ? `${p.fee.toFixed(2)}` : <span className="text-muted-foreground text-xs">Free</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={BOOKING_STATUS_META[p.status].badgeClass}>
                        {BOOKING_STATUS_META[p.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={p.status}
                        onValueChange={(value) => handleStatusChange(p.id, value as BookingStatus)}
                      >
                        <SelectTrigger className="w-[140px] ml-auto" data-testid={`select-booking-status-${p.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              data-testid={`option-booking-${status}-${p.id}`}
                            >
                              {BOOKING_STATUS_META[status].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                      <CalendarCheck size={32} className="mx-auto mb-2 opacity-25" />
                      {query || statusFilter !== 'all'
                        ? 'No bookings match your search or filter.'
                        : 'No table bookings yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
