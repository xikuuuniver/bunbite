// Shared sample data for the Restaurant Management Dashboard.
// This is in-memory, session-local data (mirrors the pattern used by OrdersContext)
// used to make every section feel real and interactive without a backend admin API.

// @ts-ignore
import midnightBiteImg from '@assets/generated_images/midnight-bite.jpg';
// @ts-ignore
import cheesyBoomImg from '@assets/generated_images/cheesy-boom.jpg';
// @ts-ignore
import smokyBurstImg from '@assets/generated_images/smoky-burst.jpg';
// @ts-ignore
import crispyChickenImg from '@assets/generated_images/crispy-chicken.jpg';
// @ts-ignore
import firePizzaImg from '@assets/generated_images/fire-pizza.jpg';
// @ts-ignore
import clubSandwichImg from '@assets/generated_images/club-sandwich.jpg';
// @ts-ignore
import goldenFriesImg from '@assets/generated_images/golden-fries.jpg';
// @ts-ignore
import icedDrinkImg from '@assets/generated_images/iced-drink.jpg';
// @ts-ignore
import chocolateLavaCakeImg from '@assets/generated_images/chocolate-lava-cake.jpg';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  image: string;
  status: 'Available' | '86\'d' | 'Seasonal';
  sold: number;
}

export const menuItems: MenuItem[] = [
  { id: 'MI-01', name: 'Midnight Bite',   category: 'Burgers',  price: 12.00, cost: 4.10, image: midnightBiteImg,  status: 'Available', sold: 412 },
  { id: 'MI-02', name: 'Cheesy Boom',     category: 'Burgers',  price: 14.00, cost: 4.80, image: cheesyBoomImg,    status: 'Available', sold: 588 },
  { id: 'MI-03', name: 'Smoky Burst',     category: 'Burgers',  price: 13.00, cost: 4.40, image: smokyBurstImg,    status: 'Available', sold: 340 },
  { id: 'MI-04', name: 'Spicy Bird',      category: 'Chicken',  price: 13.50, cost: 4.60, image: crispyChickenImg, status: 'Available', sold: 275 },
  { id: 'MI-05', name: 'Pepperoni Classic', category: 'Pizza',  price: 17.00, cost: 5.90, image: firePizzaImg,     status: 'Seasonal',  sold: 190 },
  { id: 'MI-06', name: 'Club Sandwich',   category: 'Sandwich', price: 11.50, cost: 3.90, image: clubSandwichImg,  status: 'Available', sold: 210 },
  { id: 'MI-07', name: 'Golden Fries',    category: 'Sides',    price: 5.00,  cost: 1.20, image: goldenFriesImg,   status: 'Available', sold: 640 },
  { id: 'MI-08', name: 'Iced Berry Cooler', category: 'Drinks', price: 4.50,  cost: 1.00, image: icedDrinkImg,     status: "86'd",      sold: 96  },
  { id: 'MI-09', name: 'Chocolate Lava Cake', category: 'Desserts', price: 7.00, cost: 2.10, image: chocolateLavaCakeImg, status: 'Available', sold: 158 },
];

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  par: number;
  supplier: string;
  updated: string;
}

export const inventoryItems: InventoryItem[] = [
  { id: 'INV-101', name: 'Angus Beef Patties',   category: 'Meat',     unit: 'kg',  stock: 18,  par: 40, supplier: 'GreenFields Meats',   updated: '2h ago' },
  { id: 'INV-102', name: 'Brioche Buns',         category: 'Bakery',   unit: 'pcs', stock: 220, par: 200,supplier: 'Village Bakery',       updated: '5h ago' },
  { id: 'INV-103', name: 'Cheddar Cheese Slices',category: 'Dairy',    unit: 'pcs', stock: 64,  par: 150,supplier: 'DairyCo',              updated: '1h ago' },
  { id: 'INV-104', name: 'Chicken Breast',       category: 'Poultry',  unit: 'kg',  stock: 32,  par: 35, supplier: 'GreenFields Meats',   updated: '3h ago' },
  { id: 'INV-105', name: 'Mozzarella Block',     category: 'Dairy',    unit: 'kg',  stock: 9,   par: 25, supplier: 'DairyCo',              updated: '30m ago' },
  { id: 'INV-106', name: 'Idaho Potatoes',       category: 'Produce',  unit: 'kg',  stock: 140, par: 120,supplier: 'Fresh Farms Co-op',    updated: '6h ago' },
  { id: 'INV-107', name: 'Cola Syrup (5L)',      category: 'Beverage', unit: 'box', stock: 4,   par: 10, supplier: 'BevSupply',            updated: '1d ago' },
  { id: 'INV-108', name: 'Cocoa Lava Mix',       category: 'Dessert',  unit: 'kg',  stock: 6,   par: 15, supplier: 'Sweet Source',         updated: '4h ago' },
];

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  orders: number;
  spent: number;
  lastVisit: string;
  tier: 'New' | 'Regular' | 'VIP';
}

export const customers: Customer[] = [
  { id: 'C-001', name: 'Ava Thompson',   email: 'ava.t@example.com',     avatarColor: 'bg-rose-500',    orders: 34, spent: 812.40, lastVisit: 'Today',        tier: 'VIP' },
  { id: 'C-002', name: 'Liam Rodriguez', email: 'liam.r@example.com',    avatarColor: 'bg-blue-500',    orders: 21, spent: 486.10, lastVisit: 'Yesterday',    tier: 'Regular' },
  { id: 'C-003', name: 'Noah Kim',       email: 'noah.kim@example.com',  avatarColor: 'bg-amber-500',   orders: 3,  spent: 58.50,  lastVisit: '3 days ago',   tier: 'New' },
  { id: 'C-004', name: 'Emma Davis',     email: 'emma.d@example.com',    avatarColor: 'bg-emerald-500', orders: 47, spent: 1204.75,lastVisit: 'Today',        tier: 'VIP' },
  { id: 'C-005', name: 'Oliver Chen',    email: 'oliver.c@example.com',  avatarColor: 'bg-purple-500',  orders: 12, spent: 268.90, lastVisit: '1 week ago',   tier: 'Regular' },
  { id: 'C-006', name: 'Sophia Martinez',email: 'sophia.m@example.com',  avatarColor: 'bg-pink-500',    orders: 2,  spent: 31.00,  lastVisit: '2 weeks ago',  tier: 'New' },
];

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: 'On Shift' | 'Off Shift' | 'On Leave';
  avatarColor: string;
  phone: string;
}

export const staff: StaffMember[] = [
  { id: 'S-01', name: 'Marcus Bell',   role: 'Head Chef',        shift: '8:00 AM – 4:00 PM', status: 'On Shift', avatarColor: 'bg-primary',    phone: '(555) 010-2231' },
  { id: 'S-02', name: 'Priya Anand',   role: 'Sous Chef',        shift: '8:00 AM – 4:00 PM', status: 'On Shift', avatarColor: 'bg-secondary',  phone: '(555) 010-9081' },
  { id: 'S-03', name: 'Jamal Carter',  role: 'Front of House',   shift: '11:00 AM – 7:00 PM',status: 'On Shift', avatarColor: 'bg-blue-500',   phone: '(555) 010-4471' },
  { id: 'S-04', name: 'Lucy Grant',    role: 'Server',           shift: '4:00 PM – 12:00 AM',status: 'Off Shift',avatarColor: 'bg-rose-500',   phone: '(555) 010-3345' },
  { id: 'S-05', name: 'Daniel Osei',   role: 'Delivery Rider',   shift: '12:00 PM – 8:00 PM',status: 'On Shift', avatarColor: 'bg-amber-500',  phone: '(555) 010-7723' },
  { id: 'S-06', name: 'Hana Suzuki',   role: 'Cashier',          shift: 'On Leave',          status: 'On Leave', avatarColor: 'bg-purple-500', phone: '(555) 010-5567' },
];

export interface Promotion {
  id: string;
  title: string;
  code: string;
  discount: string;
  channel: 'App' | 'Website' | 'In-Store';
  status: 'Active' | 'Scheduled' | 'Ended';
  redemptions: number;
  ends: string;
}

export const promotions: Promotion[] = [
  { id: 'P-01', title: 'Weekend Burger Fest',    code: 'BUNBITE20',  discount: '20% off',      channel: 'App',      status: 'Active',    redemptions: 214, ends: 'Jul 20, 2026' },
  { id: 'P-02', title: 'Happy Hour Combo',       code: 'HAPPY5',     discount: '$5 off combos',channel: 'In-Store', status: 'Active',    redemptions: 128, ends: 'Ongoing' },
  { id: 'P-03', title: 'Back-to-School Bundle',  code: 'SCHOOL15',   discount: '15% off',      channel: 'Website',  status: 'Scheduled', redemptions: 0,   ends: 'Aug 15, 2026' },
  { id: 'P-04', title: 'Midnight Bite Launch',   code: 'MIDNIGHT10', discount: '10% off',      channel: 'App',      status: 'Ended',     redemptions: 502, ends: 'Jun 01, 2026' },
];

export interface Review {
  id: string;
  customer: string;
  avatarColor: string;
  rating: number;
  comment: string;
  item: string;
  date: string;
  replied: boolean;
}

export const reviews: Review[] = [
  { id: 'R-01', customer: 'Ava Thompson',    avatarColor: 'bg-rose-500',    rating: 5, comment: 'Cheesy Boom is unreal — best burger in town, hands down!', item: 'Cheesy Boom',   date: '2h ago',   replied: false },
  { id: 'R-02', customer: 'Noah Kim',        avatarColor: 'bg-amber-500',   rating: 4, comment: 'Great food but delivery took a bit longer than expected.', item: 'Spicy Bird',    date: '1d ago',   replied: true  },
  { id: 'R-03', customer: 'Emma Davis',      avatarColor: 'bg-emerald-500', rating: 5, comment: 'The new Midnight Bite is a masterpiece. Loved the charcoal bun.', item: 'Midnight Bite', date: '2d ago', replied: false },
  { id: 'R-04', customer: 'Oliver Chen',     avatarColor: 'bg-purple-500',  rating: 3, comment: 'Good but the fries were a little soggy this time.', item: 'Golden Fries',  date: '3d ago',   replied: false },
  { id: 'R-05', customer: 'Sophia Martinez', avatarColor: 'bg-pink-500',    rating: 5, comment: 'Cozy vibe, super friendly staff, and the lava cake is to die for.', item: 'Chocolate Lava Cake', date: '5d ago', replied: true },
];

export interface PaymentTxn {
  id: string;
  customer: string;
  method: 'Card' | 'Cash' | 'Wallet';
  amount: number;
  status: 'Paid' | 'Refunded' | 'Pending';
  date: string;
}

export const payments: PaymentTxn[] = [
  { id: 'TXN-8841', customer: 'Ava Thompson',    method: 'Card',   amount: 32.50, status: 'Paid',     date: 'Jul 15, 10:22 AM' },
  { id: 'TXN-8840', customer: 'Liam Rodriguez',  method: 'Wallet', amount: 18.00, status: 'Paid',     date: 'Jul 15, 09:58 AM' },
  { id: 'TXN-8839', customer: 'Noah Kim',        method: 'Cash',   amount: 12.00, status: 'Paid',     date: 'Jul 14, 08:41 PM' },
  { id: 'TXN-8838', customer: 'Emma Davis',      method: 'Card',   amount: 46.25, status: 'Refunded', date: 'Jul 14, 06:15 PM' },
  { id: 'TXN-8837', customer: 'Oliver Chen',     method: 'Card',   amount: 21.75, status: 'Pending',  date: 'Jul 14, 01:03 PM' },
  { id: 'TXN-8836', customer: 'Sophia Martinez', method: 'Wallet', amount: 9.50,  status: 'Paid',     date: 'Jul 13, 07:47 PM' },
];

export const revenueSeries = [
  { day: 'Mon', revenue: 1840, orders: 132 },
  { day: 'Tue', revenue: 2010, orders: 145 },
  { day: 'Wed', revenue: 1720, orders: 121 },
  { day: 'Thu', revenue: 2380, orders: 168 },
  { day: 'Fri', revenue: 3120, orders: 214 },
  { day: 'Sat', revenue: 3640, orders: 251 },
  { day: 'Sun', revenue: 2960, orders: 203 },
];

export const categorySales = [
  { name: 'Burgers',  value: 3820, color: '#2C4A1E' },
  { name: 'Chicken',  value: 1640, color: '#C8A415' },
  { name: 'Pizza',    value: 1210, color: '#6B8E4E' },
  { name: 'Sides',    value: 980,  color: '#E3B23C' },
  { name: 'Drinks',   value: 640,  color: '#8FA97F' },
  { name: 'Desserts', value: 720,  color: '#D9C27E' },
];

export const todaysRevenue = 2140;
export const todaysExpenses = 1260;

export const weeklyFinance = [
  { day: 'Mon', revenue: 1840, expenses: 1120 },
  { day: 'Tue', revenue: 2010, expenses: 1190 },
  { day: 'Wed', revenue: 1720, expenses: 1080 },
  { day: 'Thu', revenue: 2380, expenses: 1340 },
  { day: 'Fri', revenue: 3120, expenses: 1680 },
  { day: 'Sat', revenue: 3640, expenses: 1920 },
  { day: 'Sun', revenue: 2960, expenses: 1610 },
];

export const monthlyFinance = [
  { month: 'Feb', revenue: 58200, expenses: 34900 },
  { month: 'Mar', revenue: 62400, expenses: 37100 },
  { month: 'Apr', revenue: 60800, expenses: 36200 },
  { month: 'May', revenue: 65900, expenses: 38700 },
  { month: 'Jun', revenue: 71200, expenses: 41500 },
  { month: 'Jul', revenue: 43850, expenses: 25600 },
];

export const resourceLinks = [
  { title: 'Staff Onboarding Guide', type: 'PDF', size: '1.2 MB', updated: 'Jun 2, 2026' },
  { title: 'Food Safety & Hygiene Checklist', type: 'PDF', size: '480 KB', updated: 'May 18, 2026' },
  { title: 'POS Terminal Manual', type: 'PDF', size: '2.4 MB', updated: 'Apr 30, 2026' },
  { title: 'Brand Style Guide', type: 'PDF', size: '3.1 MB', updated: 'Mar 11, 2026' },
  { title: 'Supplier Contact Sheet', type: 'XLSX', size: '96 KB', updated: 'Jul 1, 2026' },
  { title: 'Emergency Evacuation Plan', type: 'PDF', size: '640 KB', updated: 'Feb 8, 2026' },
];
