import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  CalendarClock,
  Heart,
  LogOut,
  UserCircle,
  History,
  Receipt,
  CreditCard,
  Bell,
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
import { useAuth } from '@/context/AuthContext';
import type { AuthUser } from '@/context/AuthContext';
// @ts-ignore
import midnightBiteImg from '@assets/generated_images/midnight-bite.jpg';
// @ts-ignore
import cheesyBoomImg from '@assets/generated_images/cheesy-boom.jpg';
// @ts-ignore
import smokyBurstImg from '@assets/generated_images/smoky-burst.jpg';

type PopupKey = 'orders' | 'preorder' | 'favorites';

/* Mock data (no backend yet) */
const MOCK_ORDERS = [
  { id: '#BB-4821', items: '2x Cheesy Boom, 1x Fries', status: 'Preparing', statusColor: 'bg-amber-100 text-amber-700', total: 32.5, time: '5 min ago' },
  { id: '#BB-4790', items: '1x Smoky Burst, 1x Coke', status: 'Out for delivery', statusColor: 'bg-blue-100 text-blue-700', total: 17.0, time: '38 min ago' },
  { id: '#BB-4712', items: '1x Midnight Bite', status: 'Delivered', statusColor: 'bg-green-100 text-green-700', total: 12.0, time: 'Yesterday' },
];

const MOCK_PREORDERS = [
  { id: '#PO-1042', items: '3x Cheesy Boom', when: 'Tomorrow, 12:30 PM', status: 'Confirmed', statusColor: 'bg-green-100 text-green-700' },
  { id: '#PO-1039', items: '1x Smoky Burst, 2x Fries', when: 'Fri, Jul 10 · 7:00 PM', status: 'Pending', statusColor: 'bg-amber-100 text-amber-700' },
];

const MOCK_FAVORITES = [
  { name: 'Cheesy Boom', price: 14.0, image: cheesyBoomImg },
  { name: 'Smoky Burst', price: 13.0, image: smokyBurstImg },
  { name: 'Midnight Bite', price: 12.0, image: midnightBiteImg },
];

/* Derive initials from a user object */
function getInitials(user: AuthUser): string {
  if (user.firstName && user.lastName)
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  // fallback: split username on . _ - and take first letters of first two parts
  const parts = user.username.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return user.username.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const { user, login, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen,      setIsLoginOpen]      = useState(false);
  const [isSignupOpen,     setIsSignupOpen]      = useState(false);
  const [profileOpen,      setProfileOpen]       = useState(false);

  const openSignup = () => { setIsLoginOpen(false); setIsSignupOpen(true); };
  const openLogin  = () => { setIsSignupOpen(false); setIsLoginOpen(true); };

  const handleLogin = (u: AuthUser) => { login(u); setIsLoginOpen(false); };
  const handleSignupComplete = (u: AuthUser) => { login(u); setIsSignupOpen(false); };

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  /*
   * Only one action bubble (orders / pre-order / favorites) open at a time.
   * Scoped by which AuthActions instance (desktop vs. mobile) triggered it —
   * both instances can be mounted simultaneously (mobile menu open on a
   * narrow viewport while the CSS-hidden desktop instance stays in the DOM),
   * so a plain shared key would open duplicate, mis-anchored popovers.
   */
  const [activePopup, setActivePopup] = useState<{ scope: 'desktop' | 'mobile'; key: PopupKey } | null>(null);
  const togglePopup = (scope: 'desktop' | 'mobile', key: PopupKey) => (open: boolean) =>
    setActivePopup(open ? { scope, key } : null);
  const isPopupOpen = (scope: 'desktop' | 'mobile', key: PopupKey) =>
    activePopup?.scope === scope && activePopup.key === key;

  /* ── Bubble pop-up content ── */
  const OrdersBubble = () => (
    <div className="w-80 max-w-[85vw]">
      <p className="px-4 pt-4 pb-2 text-sm font-bold text-gray-800">Your Orders</p>
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
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
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {MOCK_FAVORITES.map((item) => (
          <div key={item.name} className="px-4 py-3 flex items-center gap-3">
            <img src={item.image} alt={item.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
            </div>
            <Heart size={16} className="text-secondary fill-secondary shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );

  const bubbleContentClass =
    'p-0 w-auto rounded-3xl border border-gray-100 shadow-2xl overflow-hidden';

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
              ${mobile
                ? 'w-14 h-14 bg-white/10 hover:bg-white/20 text-white'
                : 'w-10 h-10 bg-white/15 hover:bg-white/25 text-white'}`}
          >
            <ClipboardList size={mobile ? 22 : 18} />
            {/* Badge placeholder */}
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-secondary text-[9px] font-bold text-secondary-foreground flex items-center justify-center leading-none">
              0
            </span>
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
              ${mobile
                ? 'w-14 h-14 bg-white/10 hover:bg-white/20 text-white'
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
              ${mobile
                ? 'w-14 h-14 bg-white/10 hover:bg-white/20 text-white'
                : 'w-10 h-10 bg-white/15 hover:bg-white/25 text-white'}`}
          >
            <Heart size={mobile ? 22 : 18} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" sideOffset={14} className={bubbleContentClass}>
          <FavoritesBubble />
        </PopoverContent>
      </Popover>

      {/* Profile picture / initials */}
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
            {/* User info */}
            <DropdownMenuLabel className="px-4 py-3 font-normal">
              <p className="text-xs font-semibold text-gray-700 truncate">@{user.username}</p>
              {user.firstName && (
                <p className="text-xs text-gray-400 truncate font-normal">{user.firstName} {user.lastName}</p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-0" />

            {/* Menu items */}
            {[
              { label: 'My Profile', icon: UserCircle },
              { label: 'Order History', icon: History },
              { label: 'Payment History', icon: Receipt },
              { label: 'Payment Methods', icon: CreditCard },
              { label: 'Notifications', icon: Bell },
              { label: 'Settings', icon: Settings },
              { label: 'Help & Support', icon: HelpCircle },
            ].map(({ label, icon: Icon }) => (
              <DropdownMenuItem
                key={label}
                className="px-4 py-2.5 rounded-none text-gray-600 focus:text-gray-900 cursor-pointer"
              >
                <Icon size={15} />
                {label}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="my-0" />

            {/* Logout */}
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

      {/* Profile picture / initials — mobile (no dropdown; logout button shown separately) */}
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

          {/* Hamburger — mobile */}
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

      {/* Modals */}
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
    </>
  );
}
