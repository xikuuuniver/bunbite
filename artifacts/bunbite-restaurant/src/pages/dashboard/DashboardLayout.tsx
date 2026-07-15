import { useEffect, useState } from 'react';
import { useLocation, useParams, Switch, Route } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { dashboardNav, navPath } from './nav';

import DashboardHome from './sections/DashboardHome';
import Financial from './sections/Financial';
import Orders from './sections/Orders';
import Reservations from './sections/Reservations';
import MenuManagement from './sections/MenuManagement';
import Inventory from './sections/Inventory';
import Resources from './sections/Resources';
import Customers from './sections/Customers';
import Payments from './sections/Payments';
import StaffManagement from './sections/StaffManagement';
import Promotions from './sections/Promotions';
import AnalyticsReports from './sections/AnalyticsReports';
import NotificationsSection from './sections/NotificationsSection';
import ReviewsFeedback from './sections/ReviewsFeedback';
import SettingsSection from './sections/SettingsSection';

const sectionComponents: Record<string, React.ComponentType> = {
  '': DashboardHome,
  financial: Financial,
  orders: Orders,
  reservations: Reservations,
  menu: MenuManagement,
  inventory: Inventory,
  resources: Resources,
  customers: Customers,
  payments: Payments,
  staff: StaffManagement,
  promotions: Promotions,
  analytics: AnalyticsReports,
  notifications: NotificationsSection,
  reviews: ReviewsFeedback,
  settings: SettingsSection,
};

export default function DashboardLayout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ section?: string }>();
  const activeSlug = params.section && sectionComponents[params.section] ? params.section : '';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!user) setLocation('/');
  }, [user, setLocation]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [activeSlug]);

  if (!user) return null;

  const activeItem = dashboardNav.find((n) => n.slug === activeSlug) ?? dashboardNav[0];
  const ActiveComponent = sectionComponents[activeSlug];

  return (
    <div className="h-[100dvh] w-full flex bg-muted/40 font-sans overflow-hidden">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 264 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="hidden lg:block shrink-0 h-full overflow-hidden"
      >
        <Sidebar activeSlug={activeSlug} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      </motion.aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-72 border-none">
          <Sidebar activeSlug={activeSlug} collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 h-full flex flex-col min-w-0">
        <Topbar title={activeItem.label} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {ActiveComponent && <ActiveComponent />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
