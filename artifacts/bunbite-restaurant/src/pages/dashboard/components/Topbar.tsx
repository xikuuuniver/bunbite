import { Menu, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { Link } from 'wouter';
import { navPath } from '../nav';

interface TopbarProps {
  title: string;
  onOpenMobileNav: () => void;
}

export default function Topbar({ title, onOpenMobileNav }: TopbarProps) {
  const { user } = useAuth();
  const { unreadCount } = useOrders();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-card-border bg-card/90 backdrop-blur px-4 md:px-6 h-16 shrink-0">
      <button
        onClick={onOpenMobileNav}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted text-foreground shrink-0"
        aria-label="Open navigation"
        data-testid="button-dashboard-open-mobile-nav"
      >
        <Menu size={20} />
      </button>

      <h2 className="font-display text-lg md:text-xl text-foreground truncate mr-auto">{title}</h2>

      <div className="hidden md:flex items-center gap-2 bg-muted rounded-full px-3.5 py-2 w-64 lg:w-80">
        <Search size={16} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search orders, menu, customers…"
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/70"
          data-testid="input-dashboard-search"
        />
      </div>

      <Link
        href={navPath('notifications')}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-muted hover:bg-muted/70 text-foreground shrink-0"
        aria-label="Notifications"
        data-testid="link-dashboard-notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 1.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 700, damping: 14 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center leading-none"
          >
            {unreadCount}
          </motion.span>
        )}
      </Link>

      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
        {(user?.firstName?.[0] || user?.username[0] || '?').toUpperCase()}
      </div>
    </header>
  );
}
