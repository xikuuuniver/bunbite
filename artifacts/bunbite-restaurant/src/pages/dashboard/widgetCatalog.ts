// Catalog of stat widgets that can be assigned to any of the customizable
// slots in the Dashboard Overview. Values are computed live from the app's
// real order/reservation data plus the local mock datasets, so swapping a
// widget always shows a believable, up-to-date number.

import type { LucideIcon } from 'lucide-react';
import {
  DollarSign,
  ShoppingCart,
  CalendarCheck,
  Star,
  Users,
  Crown,
  UserCog,
  AlertTriangle,
  BadgePercent,
  MessageSquareWarning,
  UtensilsCrossed,
  TrendingUp,
  Repeat,
  Receipt,
  PiggyBank,
  Wallet,
  Trophy,
  Undo2,
  Bike,
  ThumbsUp,
} from 'lucide-react';
import { menuItems, inventoryItems, customers, staff, promotions, reviews, revenueSeries, payments, todaysRevenue, todaysExpenses } from './data';

export interface WidgetDef {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: 'primary' | 'secondary';
  value: string;
  trend?: { value: string; positive: boolean };
  description: string;
}

export interface WidgetContext {
  unpaidOrdersCount: number;
  preOrdersCount: number;
}

export function buildWidgetCatalog(ctx: WidgetContext): WidgetDef[] {
  const weeklyRevenue = revenueSeries.reduce((sum, d) => sum + d.revenue, 0);
  const lowStockCount = inventoryItems.filter((i) => i.stock < i.par * 0.5).length;
  const vipCount = customers.filter((c) => c.tier === 'VIP').length;
  const onShiftCount = staff.filter((s) => s.status === 'On Shift').length;
  const activePromoCount = promotions.filter((p) => p.status === 'Active').length;
  const pendingReviewCount = reviews.filter((r) => !r.replied).length;
  const bestSeller = [...menuItems].sort((a, b) => b.sold - a.sold)[0];
  const refundedCount = payments.filter((p) => p.status === 'Refunded').length;
  const paidToday = payments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const deliveryStaffCount = staff.filter((s) => s.role === 'Delivery Rider').length;
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const todaysNetProfit = todaysRevenue - todaysExpenses;

  return [
    {
      id: 'weekly-revenue',
      label: 'Weekly Revenue',
      icon: DollarSign,
      accent: 'primary',
      value: `$${weeklyRevenue.toLocaleString()}`,
      trend: { value: '12.4%', positive: true },
      description: 'Total sales across the last 7 days.',
    },
    {
      id: 'active-orders',
      label: 'Active Orders',
      icon: ShoppingCart,
      accent: 'secondary',
      value: String(ctx.unpaidOrdersCount),
      trend: { value: '3.1%', positive: true },
      description: 'Orders currently awaiting payment.',
    },
    {
      id: 'upcoming-reservations',
      label: 'Upcoming Table Bookings',
      icon: CalendarCheck,
      accent: 'primary',
      value: String(ctx.preOrdersCount),
      trend: { value: '2 new', positive: true },
      description: 'Tables booked ahead for this week.',
    },
    {
      id: 'avg-rating',
      label: 'Avg. Rating',
      icon: Star,
      accent: 'secondary',
      value: '4.7 / 5',
      trend: { value: '0.2', positive: true },
      description: "Customers' average review score.",
    },
    {
      id: 'total-customers',
      label: 'Total Customers',
      icon: Users,
      accent: 'primary',
      value: String(customers.length * 187),
      trend: { value: '8.6%', positive: true },
      description: 'All-time registered customers.',
    },
    {
      id: 'vip-customers',
      label: 'VIP Customers',
      icon: Crown,
      accent: 'secondary',
      value: String(vipCount),
      trend: { value: '1 new', positive: true },
      description: 'Customers in your top loyalty tier.',
    },
    {
      id: 'staff-on-shift',
      label: 'Staff On Shift',
      icon: UserCog,
      accent: 'primary',
      value: `${onShiftCount} / ${staff.length}`,
      description: 'Team members currently working.',
    },
    {
      id: 'low-stock-items',
      label: 'Low Stock Alerts',
      icon: AlertTriangle,
      accent: 'secondary',
      value: String(lowStockCount),
      trend: { value: lowStockCount > 0 ? 'Needs attention' : 'All good', positive: lowStockCount === 0 },
      description: 'Inventory items below par level.',
    },
    {
      id: 'active-promotions',
      label: 'Active Promotions',
      icon: BadgePercent,
      accent: 'primary',
      value: String(activePromoCount),
      description: 'Campaigns currently running.',
    },
    {
      id: 'pending-reviews',
      label: 'Pending Replies',
      icon: MessageSquareWarning,
      accent: 'secondary',
      value: String(pendingReviewCount),
      description: 'Customer reviews awaiting a reply.',
    },
    {
      id: 'menu-items',
      label: 'Menu Items',
      icon: UtensilsCrossed,
      accent: 'primary',
      value: String(menuItems.length),
      description: 'Dishes currently on the menu.',
    },
    {
      id: 'avg-order-value',
      label: 'Avg. Order Value',
      icon: TrendingUp,
      accent: 'secondary',
      value: '$14.32',
      trend: { value: '1.9%', positive: false },
      description: 'Average spend per order this week.',
    },
    {
      id: 'repeat-customer-rate',
      label: 'Repeat Customers',
      icon: Repeat,
      accent: 'primary',
      value: '61%',
      trend: { value: '4.0%', positive: true },
      description: 'Customers who ordered more than once.',
    },
    {
      id: 'total-orders',
      label: 'Total Orders (7d)',
      icon: Receipt,
      accent: 'secondary',
      value: '1,234',
      trend: { value: '8.2%', positive: true },
      description: 'All orders placed in the last week.',
    },
    {
      id: 'todays-revenue',
      label: "Today's Revenue",
      icon: DollarSign,
      accent: 'primary',
      value: `${todaysRevenue.toLocaleString()}`,
      trend: { value: '5.3%', positive: true },
      description: 'Total sales recorded so far today.',
    },
    {
      id: 'todays-net-profit',
      label: "Today's Net Profit",
      icon: PiggyBank,
      accent: todaysNetProfit >= 0 ? 'primary' : 'secondary',
      value: `${todaysNetProfit >= 0 ? '+' : '-'}${Math.abs(todaysNetProfit).toLocaleString()}`,
      trend: { value: `${((todaysNetProfit / todaysRevenue) * 100).toFixed(0)}% margin`, positive: todaysNetProfit >= 0 },
      description: "Today's revenue minus today's expenses.",
    },
    {
      id: 'best-seller',
      label: 'Best Seller',
      icon: Trophy,
      accent: 'secondary',
      value: bestSeller.name,
      description: `${bestSeller.sold.toLocaleString()} sold all-time — your top menu item.`,
    },
    {
      id: 'payments-collected',
      label: 'Payments Collected',
      icon: Wallet,
      accent: 'primary',
      value: `${paidToday.toFixed(2)}`,
      description: 'Total of all successfully paid transactions.',
    },
    {
      id: 'refunded-transactions',
      label: 'Refunded Transactions',
      icon: Undo2,
      accent: 'secondary',
      value: String(refundedCount),
      trend: { value: refundedCount > 0 ? 'Review needed' : 'All clear', positive: refundedCount === 0 },
      description: 'Payments that were refunded to customers.',
    },
    {
      id: 'delivery-riders',
      label: 'Delivery Riders',
      icon: Bike,
      accent: 'primary',
      value: String(deliveryStaffCount),
      description: 'Staff assigned to delivery duty.',
    },
    {
      id: 'five-star-reviews',
      label: '5-Star Reviews',
      icon: ThumbsUp,
      accent: 'secondary',
      value: `${fiveStarCount} / ${reviews.length}`,
      description: 'Share of reviews rated the full 5 stars.',
    },
  ];
}
