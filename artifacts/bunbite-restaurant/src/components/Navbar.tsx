import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  CalendarClock,
  Heart,
  Bell,
  LogOut,
  UserCircle,
  History,
  Receipt,
  CreditCard,
  Settings,
  HelpCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import OrderHistoryModal from './OrderHistoryModal';
import PaymentHistoryModal from './PaymentHistoryModal';
import PaymentMethodsModal from './PaymentMethodsModal';
import PaymentMethodModal, { type PaymentSelection } from './PaymentMethodModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import PaymentProcessingModal from './PaymentProcessingModal';
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import type { UnpaidOrder } from '@/context/OrdersContext';

type PopupKey = 'orders' | 'preorder' | 'favorites' | 'notifications';

/* ── Static mock data for non-reactive popups ── */
const MOCK_ORDERS = [
  { id: '#BB-4821', items: '2x Cheesy Boom, 1x Fries',  status: 'Processing', statusColor: 'bg-amber-100 text-amber-700', total: 32.5, time: '5 min ago'  },
  { id: '#BB-4790', items: '1x Smoky Burst, 1x Coke',   status: 'Delivered',  statusColor: 'bg-blue-100 text-blue-700',   total: 17.0, time: '38 min ago' },
  { id: '#BB-4712', items: '1x Midnight Bite',           status: 'Completed',  statusColor: 'bg-green-100 text-green-700', total: 12.0, time: 'Yesterday'  },
];

const MOCK_PREORDERS = [
  { id: '#PO-1042', items: '3x Cheesy Boom',             when: 'Tomorrow, 12:30 PM',      status: 'Confirmed', statusColor: 'bg-green-100 text-green-700' },
  { id: '#PO-1039', items: '1x Smoky Burst, 2x Fries',   when: 'Fri, Jul 10 · 7:00 PM',  status: 'Pending',   statusColor: 'bg-amber-100 text-amber-700' },
];

/* Derive initials from a user object */
function getInitials(user: AuthUser): string {
  if (user.firstName && user.lastName)
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  const parts = user.username.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return user.username.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const { user, login, logout } = useAuth();
  const {
    unpaidOrders, removeUnpaidOrder, confirmOrders,
    pendingBuy, setPendingBuy, buyItem,
    badgePulse, registerLoginOpener,
    notifications, addNotification, unreadCount,
    favorites,
  } = useOrders();

  const [isMobileMenuOpen,      setIsMobileMenuOpen]      = useState(false);
  const [isLoginOpen,           setIsLoginOpen]           = useState(false);
  const [isSignupOpen,          setIsSignupOpen]          = useState(false);
  const [profileOpen,           setProfileOpen]           = useState(false);
  const [isOrderHistoryOpen,    setIsOrderHistoryOpen]    = useState(false);
  const [isPaymentHistoryOpen,  setIsPaymentHistoryOpen]  = useState(false);
  const [isPaymentMethodsOpen,  setIsPaymentMethodsOpen]  = useState(false);

  /* Unpaid order selection + checkout flow (method -> confirm -> processing) */
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [checkoutOrders,   setCheckoutOrders]   = useState<UnpaidOrder[] | null>(null);
  const [checkoutStage,    setCheckoutStage]    = useState<'method' | 'confirm' | 'processing' | null>(null);
  const [checkoutPayment,  setCheckoutPayment]  = useState<PaymentSelection | null>(null);

  /* Register our login opener so any component can call openLoginModal() */
  useEffect(() => {
    registerLoginOpener(() => setIsLoginOpen(true));
  }, [registerLoginOpener]);

  const openSignup = () => { setIsLoginOpen(false); setIsSignupOpen(true); };
  const openLogin  = () => { setIsSignupOpen(false); setIsLoginOpen(true); };

  const handleLogin = (u: AuthUser) => {
    login(u);
    setIsLoginOpen(false);
    // pendingBuy flush runs in the effect below, after auth state commits
  };

  /* Flush pendingBuy after auth state commits — buyItem handles order + notification atomically */
  useEffect(() => {
    if (user && pendingBuy) {
      buyItem(pendingBuy, user.firstName || user.username);
      setPendingBuy(null);
    }
  }, [user, pendingBuy]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignupComplete = (u: AuthUser) => { login(u); setIsSignupOpen(false); };

  /* ── Unpaid order selection ── */
  const toggleOrderSelection = (id: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  /* ── Checkout flow: method -> confirm -> processing ── */
  const startCheckout = (orders: UnpaidOrder[]) => {
    if (orders.length === 0) return;
    setActivePopup(null);
    setCheckoutOrders(orders);
    setCheckoutPayment(null);
    setCheckoutStage('method');
  };

  const handleConfirmSelected = () =>
    startCheckout(unpaidOrders.filter((o) => selectedOrderIds.has(o.id)));

  const handleConfirmAllOrders = () => startCheckout(unpaidOrders);

  const handlePaymentContinue = (selection: PaymentSelection) => {
    setCheckoutPayment(selection);
    setCheckoutStage('confirm');
  };

  const closeCheckout = () => {
    setCheckoutStage(null);
    setCheckoutOrders(null);
    setCheckoutPayment(null);
  };

  const handleOrderConfirm = () => setCheckoutStage('processing');

  const handleProcessingComplete = () => {
    if (checkoutOrders && user) {
      confirmOrders(checkoutOrders, user.firstName || user.username);
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        checkoutOrders.forEach((o) => next.delete(o.id));
        return next;
      });
    }
    setCheckoutOrders(null);
    setCheckoutPayment(null);
    setCheckoutStage(null);
  };

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  /* Popup state — scoped to desktop/mobile instance */
  const [activePopup, setActivePopup] = useState<{ scope: 'desktop' | 'mobile'; key: PopupKey } | null>(null);
  const togglePopup = (scope: 'desktop' | 'mobile', key: PopupKey) => (open: boolean) =>
    setActivePopup(open ? { scope, key } : null);
  const isPopupOpen = (scope: 'desktop' | 'mobile', key: PopupKey) =>
    activePopup?.scope === scope && activePopup.key === key;

  /* ── Bubble content components ── */
  const OrdersBubble = () => (
    <div className="w-80 max-w-[85vw]">
      <p className="px-4 pt-4 pb-2 text-sm font-bold text-gray-800">Orders</p>
      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
        {MOCK_ORDERS.map((order) => (
          <div key={order.id} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">{order.id}</p>
              <p className="text-xs text-gray-500 truncate">{order.items}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{order.time}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${order.statusColor}`}>
                {order.status}
              </span>
              <span className="text-xs font-bold text-gray-700">${order.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-t border-gray-100">
        <p className="text-sm font-bold text-gray-800">Unpaid Orders</p>
        {unpaidOrders.length > 0 && (
          <button
            onClick={() =>
              setSelectedOrderIds((prev) =>
                prev.size === unpaidOrders.length ? new Set() : new Set(unpaidOrders.map((o) => o.id))
              )
            }
            className="text-[11px] font-semibold text-secondary hover:underline"
          >
            {selectedOrderIds.size === unpaidOrders.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>
      {unpaidOrders.length === 0 ? (
        <p className="px-4 pb-4 text-xs text-gray-400">No unpaid orders.</p>
      ) : (
        <>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {unpaidOrders.map((order) => {
              const checked = selectedOrderIds.has(order.id);
              return (
                <label
                  key={order.id}
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50/80"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOrderSelection(order.id)}
                    className="shrink-0 w-4 h-4 rounded accent-secondary cursor-pointer"
                    aria-label={`Select order ${order.id}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">{order.id}</p>
                    <p className="text-xs text-gray-500 truncate">{order.items}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{order.time} · ${order.total.toFixed(2)}</p>
                  </div>
                </label>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={handleConfirmSelected}
              disabled={selectedOrderIds.size === 0}
              className="flex-1 bg-white border border-secondary text-secondary text-xs font-bold px-3 py-2 rounded-full shadow-sm hover:bg-secondary/5 active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
            >
              Confirm{selectedOrderIds.size > 0 ? ` (${selectedOrderIds.size})` : ''}
            </button>
            <button
              onClick={handleConfirmAllOrders}
              className="flex-1 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-2 rounded-full shadow-sm hover:brightness-105 active:scale-95 transition-transform"
            >
              Confirm All Orders
            </button>
          </div>
        </>
      )}
      <div className="pb-1" />
    </div>
  );

  const PreOrderBubble = () => (
    <div className="w-80 max-w-[85vw]">
      <p className="px-4 pt-4 pb-2 text-sm font-bold text-gray-800">Pre-Orders</p>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {MOCK_PREORDERS.map((order) => (
          <div key={order.id} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">{order.id}</p>
              <p className="text-xs text-gray-500 truncate">{order.items}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{order.when}</p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${order.statusColor}`}>
              {order.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const FavoritesBubble = () => (
    <div className="w-80 max-w-[85vw]">
      <p className="px-4 pt-4 pb-2 text-sm font-bold text-gray-800">Your Favorites</p>
      {favorites.length === 0 ? (
        <p className="px-4 pb-4 text-xs text-gray-400">No favorites yet. Tap the heart on any menu item to save it here.</p>
      ) : (
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {favorites.map((item) => (
            <div key={item.name} className="px-4 py-3 flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                {item.desc && <p className="text-xs text-gray-500 truncate">{item.desc}</p>}
                <p className="text-xs font-bold text-gray-700 mt-0.5">${item.price.toFixed(2)}</p>
              </div>
              <Heart size={16} className="text-secondary fill-secondary shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const NotificationsBubble = () => (
    <div className="w-80 max-w-[85vw]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-sm font-bold text-gray-800">Notifications</p>
        {unreadCount > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
            {unreadCount} new
          </span>
        )}
      </div>
      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
        {notifications.map(({ id, Icon, iconClass, title, desc, time, unread }) => (
          <div
            key={id}
            className={`px-4 py-3 flex items-start gap-3 ${unread ? 'bg-primary/[0.03]' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
              <Icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs leading-snug ${unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                {title}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{desc}</p>
              <p className="text-[11px] text-gray-400 mt-1">{time}</p>
            </div>
            {unread && (
              <div className="w-2 h-2 rounded-full bg-secondary mt-1 shrink-0" />
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="px-4 py-6 text-xs text-center text-gray-400">No notifications yet.</p>
        )}
      </div>
      <div className="pb-1" />
    </div>
  );

  const bubbleContentClass = 'p-0 w-auto rounded-3xl border border-gray-100 shadow-2xl overflow-hidden';

  /* Dropdown menu items — each can have an onClick or an href */
  const profileMenuItems = [
    { label: 'My Profile',      icon: UserCircle, onClick: () => window.open('https://account.univer.uk', '_blank') },
    { label: 'Order History',   icon: History,    onClick: () => { setProfileOpen(false); setIsOrderHistoryOpen(true);   } },
    { label: 'Payment History', icon: Receipt,    onClick: () => { setProfileOpen(false); setIsPaymentHistoryOpen(true); } },
    { label: 'Payment Methods', icon: CreditCard, onClick: () => { setProfileOpen(false); setIsPaymentMethodsOpen(true); } },
    { label: 'Settings',        icon: Settings,   onClick: () => window.open('https://account.univer.us', '_blank') },
    { label: 'Help & Support',  icon: HelpCircle, onClick: () => window.open('https://support.univer.uk', '_blank') },
  ];

  /* ── Authenticated action icons ── */
  const AuthActions = ({ mobile = false }: { mobile?: boolean }) => {
    const scope = mobile ? 'mobile' : 'desktop';
    return (
      <div className={`flex items-center ${mobile ? 'gap-6 justify-center' : 'gap-3'}`}>

        {/* Orders */}
        <Popover open={isPopupOpen(scope, 'orders')} onOpenChange={togglePopup(scope, 'orders')}>
          <PopoverTrigger asChild>
            <button
              aria-label="Orders"
              className={`relative flex items-center justify-center rounded-full transition-colors
                ${mobile ? 'w-14 h-14 bg-white/10 hover:bg-white/20 text-white'
                         : 'w-10 h-10 bg-white/15 hover:bg-white/25 text-white'}`}
            >
              <ClipboardList size={mobile ? 22 : 18} />
              <motion.span
                key={badgePulse}
                initial={{ scale: badgePulse === 0 ? 1 : 1.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 700, damping: 14 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary text-[9px] font-bold text-secondary-foreground flex items-center justify-center leading-none"
              >
                {unpaidOrders.length}
              </motion.span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" sideOffset={14} className={bubbleContentClass}>
            <OrdersBubble />
          </PopoverContent>
        </Popover>

        {/* Pre-order */}
        <Popover open={isPopupOpen(scope, 'preorder')} onOpenChange={togglePopup(scope, 'preorder')}>
          <PopoverTrigger asChild>
            <button
              aria-label="Pre-order"
              className={`flex items-center justify-center rounded-full transition-colors
                ${mobile ? 'w-14 h-14 bg-white/10 hover:bg-white/20 text-white'
                         : 'w-10 h-10 bg-white/15 hover:bg-white/25 text-white'}`}
            >
              <CalendarClock size={mobile ? 22 : 18} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" sideOffset={14} className={bubbleContentClass}>
            <PreOrderBubble />
          </PopoverContent>
        </Popover>

        {/* Favorites */}
        <Popover open={isPopupOpen(scope, 'favorites')} onOpenChange={togglePopup(scope, 'favorites')}>
          <PopoverTrigger asChild>
            <button
              aria-label="Favorites"
              className={`flex items-center justify-center rounded-full transition-colors
                ${mobile ? 'w-14 h-14 bg-white/10 hover:bg-white/20 text-white'
                         : 'w-10 h-10 bg-white/15 hover:bg-white/25 text-white'}`}
            >
              <Heart size={mobile ? 22 : 18} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" sideOffset={14} className={bubbleContentClass}>
            <FavoritesBubble />
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover open={isPopupOpen(scope, 'notifications')} onOpenChange={togglePopup(scope, 'notifications')}>
          <PopoverTrigger asChild>
            <button
              aria-label="Notifications"
              className={`relative flex items-center justify-center rounded-full transition-colors
                ${mobile ? 'w-14 h-14 bg-white/10 hover:bg-white/20 text-white'
                         : 'w-10 h-10 bg-white/15 hover:bg-white/25 text-white'}`}
            >
              <Bell size={mobile ? 22 : 18} />
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
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" sideOffset={14} className={bubbleContentClass}>
            <NotificationsBubble />
          </PopoverContent>
        </Popover>

        {/* Profile avatar — desktop only */}
        {user && !mobile && (
          <DropdownMenu open={profileOpen} onOpenChange={setProfileOpen}>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Profile menu"
                className="flex items-center justify-center rounded-full overflow-hidden font-bold tracking-wide transition-all ring-2 ring-secondary/60 hover:ring-secondary w-10 h-10 text-xs"
                style={{ background: user.avatar ? undefined : 'linear-gradient(135deg,#FB923C,#F97316)' }}
              >
                {user.avatar
                  ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-white select-none">{getInitials(user)}</span>}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={12} className="w-56 rounded-2xl p-0 overflow-hidden">
              <DropdownMenuLabel className="px-4 py-3 font-normal">
                <p className="text-xs font-semibold text-gray-700 truncate">@{user.username}</p>
                {user.firstName && (
                  <p className="text-xs text-gray-400 truncate font-normal">{user.firstName} {user.lastName}</p>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-0" />

              {profileMenuItems.map(({ label, icon: Icon, onClick }) => (
                <DropdownMenuItem
                  key={label}
                  onClick={onClick}
                  className="px-4 py-2.5 rounded-none text-gray-600 focus:text-gray-900 cursor-pointer"
                >
                  <Icon size={15} />
                  {label}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator className="my-0" />
              <DropdownMenuItem
                onClick={logout}
                className="px-4 py-3 rounded-none text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <LogOut size={15} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Profile avatar — mobile */}
        {user && mobile && (
          <div
            aria-label="Profile"
            className="flex items-center justify-center rounded-full overflow-hidden font-bold tracking-wide ring-2 ring-secondary/60 w-14 h-14 text-base"
            style={{ background: user.avatar ? undefined : 'linear-gradient(135deg,#FB923C,#F97316)' }}
          >
            {user.avatar
              ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              : <span className="text-white select-none">{getInitials(user)}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary/20 shadow-lg"
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <button
            className="text-white font-display text-3xl tracking-wider cursor-pointer bg-transparent border-0 p-0"
            onClick={() => scrollTo('home')}
            aria-label="BunBite — scroll to top"
            data-testid="link-logo"
          >
            BUNBITE
          </button>

          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Menu', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase() === 'home' ? 'home' : item.toLowerCase())}
                className="text-white hover:text-secondary font-medium transition-colors"
                data-testid={`link-${item.toLowerCase()}`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center">
            {user ? (
              <AuthActions />
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center justify-center bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95"
                data-testid="button-nav-login"
              >
                Login
              </button>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            data-testid="button-mobile-menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-primary pt-24 px-4 flex flex-col items-center gap-8 md:hidden"
          >
            {['Home', 'Menu', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase() === 'home' ? 'home' : item.toLowerCase())}
                className="text-white font-display text-3xl hover:text-secondary transition-colors"
              >
                {item}
              </button>
            ))}

            {user ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                <AuthActions mobile />
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors mt-2"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }}
                className="bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-bold text-xl mt-4 w-full max-w-xs shadow-lg"
              >
                Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSignupClick={openSignup}
        onLogin={handleLogin}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onLoginClick={openLogin}
        onLogin={handleSignupComplete}
      />

      {/* Account modals */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />
      <PaymentHistoryModal
        isOpen={isPaymentHistoryOpen}
        onClose={() => setIsPaymentHistoryOpen(false)}
      />
      <PaymentMethodsModal
        isOpen={isPaymentMethodsOpen}
        onClose={() => setIsPaymentMethodsOpen(false)}
      />

      {/* Order checkout flow: method -> confirm -> processing */}
      {checkoutOrders && (
        <>
          <PaymentMethodModal
            isOpen={checkoutStage === 'method'}
            onClose={closeCheckout}
            onContinue={handlePaymentContinue}
            totalAmount={checkoutOrders.reduce((s, o) => s + o.total, 0)}
            orderCount={checkoutOrders.length}
          />
          {user && (
            <OrderConfirmationModal
              isOpen={checkoutStage === 'confirm'}
              onClose={closeCheckout}
              onBack={() => setCheckoutStage('method')}
              onConfirm={handleOrderConfirm}
              user={user}
              orders={checkoutOrders}
              payment={checkoutPayment}
            />
          )}
          <PaymentProcessingModal
            isOpen={checkoutStage === 'processing'}
            onComplete={handleProcessingComplete}
          />
        </>
      )}
    </>
  );
}
