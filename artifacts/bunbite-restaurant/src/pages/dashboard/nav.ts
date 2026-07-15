import {
  LayoutDashboard, Palette, ShoppingCart, CalendarCheck, UtensilsCrossed,
  Boxes, FolderOpen, Users, CreditCard, UserCog, BadgePercent,
  BarChart3, Bell, MessageSquareHeart, Settings, type LucideIcon,
} from 'lucide-react';

export interface DashboardNavItem {
  slug: string;
  label: string;
  icon: LucideIcon;
}

export const dashboardNav: DashboardNavItem[] = [
  { slug: '',              label: 'Dashboard',           icon: LayoutDashboard },
  { slug: 'themes',        label: 'Themes',               icon: Palette },
  { slug: 'orders',        label: 'Orders',                icon: ShoppingCart },
  { slug: 'reservations',  label: 'Reservations',          icon: CalendarCheck },
  { slug: 'menu',          label: 'Menu Management',       icon: UtensilsCrossed },
  { slug: 'inventory',     label: 'Inventory',             icon: Boxes },
  { slug: 'resources',     label: 'Resources',             icon: FolderOpen },
  { slug: 'customers',     label: 'Customers',             icon: Users },
  { slug: 'payments',      label: 'Payments',              icon: CreditCard },
  { slug: 'staff',         label: 'Staff Management',      icon: UserCog },
  { slug: 'promotions',    label: 'Promotions',            icon: BadgePercent },
  { slug: 'analytics',     label: 'Analytics & Reports',   icon: BarChart3 },
  { slug: 'notifications', label: 'Notifications',         icon: Bell },
  { slug: 'reviews',       label: 'Reviews & Feedback',    icon: MessageSquareHeart },
  { slug: 'settings',      label: 'Settings',              icon: Settings },
];

export function navPath(slug: string) {
  return slug ? `/dashboard/${slug}` : '/dashboard';
}
