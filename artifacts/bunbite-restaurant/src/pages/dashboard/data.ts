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

export interface IngredientLine {
  inventoryId: string;
  name: string;
  unit: string;
  qty: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  image: string;
  status: 'Available' | "86'd" | 'Seasonal';
  sold: number;
  /** Customer-facing description shown on the menu and product detail modal. */
  desc?: string;
  prepTime?: number;      // minutes
  cookTime?: number;      // minutes
  servingSize?: string;
  calories?: number;
  allergens?: string[];
  nutritionNotes?: string;
  instructions?: string;
  tags?: string[];
  priority?: number;
  featured?: boolean;
  ingredients?: IngredientLine[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'MI-01', name: 'Midnight Bite', category: 'Burgers', price: 12.00, cost: 4.10,
    image: midnightBiteImg, status: 'Available', sold: 412,
    desc: 'Dark smoky burger with activated charcoal bun, truffle mayo, aged cheddar and crispy shallots.',
    prepTime: 10, cookTime: 12, servingSize: '1 burger', calories: 720,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    nutritionNotes: 'Protein: 34g · Fat: 38g · Carbs: 48g · Sodium: 890mg',
    tags: ['house-special', 'smoky'],
    priority: 1,
  },
  {
    id: 'MI-02', name: 'Cheesy Boom', category: 'Burgers', price: 14.00, cost: 4.80,
    image: cheesyBoomImg, status: 'Available', sold: 588,
    desc: 'A devastating explosion of three melted cheeses overflowing on a double smash patty with caramelised onions.',
    prepTime: 8, cookTime: 14, servingSize: '1 burger', calories: 860,
    allergens: ['Gluten', 'Dairy'],
    nutritionNotes: 'Protein: 42g · Fat: 48g · Carbs: 44g · Sodium: 1020mg',
    tags: ['best-seller', 'cheesy'],
    featured: true, priority: 2,
  },
  {
    id: 'MI-03', name: 'Smoky Burst', category: 'Burgers', price: 13.00, cost: 4.40,
    image: smokyBurstImg, status: 'Available', sold: 340,
    desc: 'Thick-cut bacon, crispy onion rings and our signature hickory BBQ sauce on a brioche bun.',
    prepTime: 10, cookTime: 15, servingSize: '1 burger', calories: 790,
    allergens: ['Gluten', 'Dairy'],
    nutritionNotes: 'Protein: 36g · Fat: 42g · Carbs: 52g · Sodium: 960mg',
    tags: ['bbq', 'smoky'],
    priority: 3,
  },
  {
    id: 'MI-04', name: 'Spicy Bird', category: 'Chicken', price: 13.50, cost: 4.60,
    image: crispyChickenImg, status: 'Available', sold: 275,
    desc: 'Nashville hot chicken sandwich with house-brined pickles, honey drizzle and coleslaw on a toasted brioche.',
    prepTime: 12, cookTime: 16, servingSize: '1 sandwich', calories: 680,
    allergens: ['Gluten', 'Eggs'],
    nutritionNotes: 'Protein: 38g · Fat: 28g · Carbs: 58g · Sodium: 1120mg',
    tags: ['spicy', 'chicken'],
    priority: 1,
  },
  {
    id: 'MI-05', name: 'Pepperoni Classic', category: 'Pizza', price: 17.00, cost: 5.90,
    image: firePizzaImg, status: 'Seasonal', sold: 190,
    desc: 'Wood-fired crust loaded with San Marzano tomato sauce, hand-pulled mozzarella and cured pepperoni.',
    prepTime: 20, cookTime: 18, servingSize: '4 slices', calories: 920,
    allergens: ['Gluten', 'Dairy'],
    nutritionNotes: 'Protein: 38g · Fat: 36g · Carbs: 88g · Sodium: 1340mg',
    tags: ['pizza', 'seasonal'],
    priority: 1,
  },
  {
    id: 'MI-06', name: 'Club Sandwich', category: 'Sandwich', price: 11.50, cost: 3.90,
    image: clubSandwichImg, status: 'Available', sold: 210,
    desc: 'Triple-decker with smoked turkey, crispy bacon, garden lettuce, vine tomato and house mayo.',
    prepTime: 8, cookTime: 5, servingSize: '1 sandwich', calories: 580,
    allergens: ['Gluten', 'Eggs'],
    nutritionNotes: 'Protein: 32g · Fat: 24g · Carbs: 42g · Sodium: 820mg',
    tags: ['classic', 'sandwich'],
    priority: 1,
  },
  {
    id: 'MI-07', name: 'Golden Fries', category: 'Sides', price: 5.00, cost: 1.20,
    image: goldenFriesImg, status: 'Available', sold: 640,
    desc: 'Double-fried Idaho potatoes with flaked sea salt — crispy outside, fluffy inside.',
    prepTime: 5, cookTime: 12, servingSize: 'Large portion', calories: 320,
    allergens: ['Gluten'],
    nutritionNotes: 'Protein: 4g · Fat: 14g · Carbs: 48g · Sodium: 380mg',
    tags: ['fries', 'sides'],
    priority: 1,
  },
  {
    id: 'MI-08', name: 'Iced Berry Cooler', category: 'Drinks', price: 4.50, cost: 1.00,
    image: icedDrinkImg, status: "86'd", sold: 96,
    desc: 'Cold-brewed black tea shaken with mixed berries and a hint of fresh mint.',
    prepTime: 3, cookTime: 0, servingSize: '16 oz', calories: 120,
    allergens: [],
    nutritionNotes: 'Protein: 0g · Fat: 0g · Carbs: 30g · Sugar: 22g',
    tags: ['drink', 'cold'],
    priority: 1,
  },
  {
    id: 'MI-09', name: 'Chocolate Lava Cake', category: 'Desserts', price: 7.00, cost: 2.10,
    image: chocolateLavaCakeImg, status: 'Available', sold: 158,
    desc: 'Warm dark chocolate cake with a molten centre, served with a scoop of Madagascar vanilla ice cream.',
    prepTime: 15, cookTime: 14, servingSize: '1 cake + scoop', calories: 580,
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    nutritionNotes: 'Protein: 8g · Fat: 28g · Carbs: 68g · Sugar: 46g',
    tags: ['dessert', 'chocolate'],
    priority: 1,
  },
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

// ---------------------------------------------------------------------------
// Category data model
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  description: string;
  image?: string;   // URL or object-URL for uploaded images
  icon?: string;    // emoji
  color?: string;   // accent color hex
  displayOrder: number;
  visible: boolean; // shown on customer-facing site
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export const categories: Category[] = [
  { id: 'CAT-01', name: 'Burgers',  description: 'Handcrafted burgers with premium toppings and freshest ingredients.', icon: '🍔', displayOrder: 1, visible: true, status: 'Active',   createdAt: 'Jun 1, 2026',  updatedAt: 'Jul 10, 2026' },
  { id: 'CAT-02', name: 'Chicken',  description: 'Crispy and grilled chicken options for every craving.',               icon: '🍗', displayOrder: 2, visible: true, status: 'Active',   createdAt: 'Jun 1, 2026',  updatedAt: 'Jul 8, 2026'  },
  { id: 'CAT-03', name: 'Pizza',    description: 'Wood-fired artisan pizzas made with seasonal toppings.',              icon: '🍕', displayOrder: 3, visible: true, status: 'Active',   createdAt: 'Jun 5, 2026',  updatedAt: 'Jul 5, 2026'  },
  { id: 'CAT-04', name: 'Sandwich', description: 'Classic and creative sandwich combinations.',                         icon: '🥪', displayOrder: 4, visible: true, status: 'Active',   createdAt: 'Jun 5, 2026',  updatedAt: 'Jul 1, 2026'  },
  { id: 'CAT-05', name: 'Sides',    description: 'Perfect companions for any main dish.',                               icon: '🍟', displayOrder: 5, visible: true, status: 'Active',   createdAt: 'Jun 1, 2026',  updatedAt: 'Jul 12, 2026' },
  { id: 'CAT-06', name: 'Drinks',   description: 'Refreshing beverages, coolers and signature mixes.',                  icon: '🥤', displayOrder: 6, visible: true, status: 'Active',   createdAt: 'Jun 1, 2026',  updatedAt: 'Jul 15, 2026' },
  { id: 'CAT-07', name: 'Desserts', description: 'Sweet endings to every great meal.',                                  icon: '🍰', displayOrder: 7, visible: true, status: 'Active',   createdAt: 'Jun 10, 2026', updatedAt: 'Jul 6, 2026'  },
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

// ---------------------------------------------------------------------------
// Financial section: unified time-period filter, expense ledger, and
// order/revenue analytics. "Today" is Jul 15, 2026 (a partial month-to-date
// July). All figures below are hand-reconciled so stat totals, the trend
// chart, and the itemized records/top-items tables agree with each other.
// ---------------------------------------------------------------------------

export type FinancePeriodId = 'today' | 'week' | 'jul2026' | 'jun2026' | 'may2026' | 'apr2026' | 'mar2026' | 'feb2026';

export interface FinancePeriod {
  id: FinancePeriodId;
  label: string;
  shortLabel: string;
  kind: 'today' | 'week' | 'month';
  monthKey?: string;
}

export const financePeriods: FinancePeriod[] = [
  { id: 'today',   label: 'Today (Jul 15, 2026)', shortLabel: 'Today',           kind: 'today' },
  { id: 'week',    label: 'This Week',            shortLabel: 'This Week',       kind: 'week' },
  { id: 'jul2026', label: 'July 2026 (This Month)', shortLabel: 'July 2026',     kind: 'month', monthKey: 'Jul' },
  { id: 'jun2026', label: 'June 2026',            shortLabel: 'June 2026',       kind: 'month', monthKey: 'Jun' },
  { id: 'may2026', label: 'May 2026',             shortLabel: 'May 2026',        kind: 'month', monthKey: 'May' },
  { id: 'apr2026', label: 'April 2026',           shortLabel: 'April 2026',      kind: 'month', monthKey: 'Apr' },
  { id: 'mar2026', label: 'March 2026',           shortLabel: 'March 2026',      kind: 'month', monthKey: 'Mar' },
  { id: 'feb2026', label: 'February 2026',        shortLabel: 'February 2026',   kind: 'month', monthKey: 'Feb' },
];

// Trend-chart data point shape shared across every period, at whatever
// granularity makes sense (hours for today, days for the week, weeks for a month).
export interface FinanceTrendPoint {
  label: string;
  revenue: number;
  expenses: number;
}

const todayTrend: FinanceTrendPoint[] = [
  { label: '8–11am',   revenue: 280, expenses: 180 },
  { label: '11am–2pm', revenue: 610, expenses: 320 },
  { label: '2–5pm',    revenue: 340, expenses: 210 },
  { label: '5–8pm',    revenue: 590, expenses: 340 },
  { label: '8–11pm',   revenue: 320, expenses: 210 },
];

const weekTrend: FinanceTrendPoint[] = weeklyFinance.map((d) => ({ label: d.day, revenue: d.revenue, expenses: d.expenses }));

// Weekly breakdown within each month, reconciled to sum exactly to that
// month's totals in `monthlyFinance`.
const monthWeeklyTrend: Record<string, FinanceTrendPoint[]> = {
  Feb: [
    { label: 'Wk 1', revenue: 13600, expenses: 8100 },
    { label: 'Wk 2', revenue: 14200, expenses: 8400 },
    { label: 'Wk 3', revenue: 14800, expenses: 8700 },
    { label: 'Wk 4', revenue: 15600, expenses: 9700 },
  ],
  Mar: [
    { label: 'Wk 1', revenue: 14500, expenses: 8500 },
    { label: 'Wk 2', revenue: 15200, expenses: 8900 },
    { label: 'Wk 3', revenue: 15900, expenses: 9300 },
    { label: 'Wk 4', revenue: 16800, expenses: 10400 },
  ],
  Apr: [
    { label: 'Wk 1', revenue: 14200, expenses: 8300 },
    { label: 'Wk 2', revenue: 14900, expenses: 8700 },
    { label: 'Wk 3', revenue: 15600, expenses: 9100 },
    { label: 'Wk 4', revenue: 16100, expenses: 10100 },
  ],
  May: [
    { label: 'Wk 1', revenue: 15200, expenses: 8800 },
    { label: 'Wk 2', revenue: 16100, expenses: 9200 },
    { label: 'Wk 3', revenue: 16800, expenses: 9600 },
    { label: 'Wk 4', revenue: 17800, expenses: 11100 },
  ],
  Jun: [
    { label: 'Wk 1', revenue: 16200, expenses: 9500 },
    { label: 'Wk 2', revenue: 17400, expenses: 10100 },
    { label: 'Wk 3', revenue: 18600, expenses: 10800 },
    { label: 'Wk 4', revenue: 19000, expenses: 11100 },
  ],
  Jul: [
    { label: 'Wk 1 (1–7)',   revenue: 19800, expenses: 11400 },
    { label: 'Wk 2 (8–14)',  revenue: 15200, expenses: 8900 },
    { label: 'Wk 3 (15)',    revenue: 8850,  expenses: 5300 },
  ],
};

export function getFinanceTrend(periodId: FinancePeriodId): FinanceTrendPoint[] {
  const period = financePeriods.find((p) => p.id === periodId)!;
  if (period.kind === 'today') return todayTrend;
  if (period.kind === 'week') return weekTrend;
  return monthWeeklyTrend[period.monthKey!] ?? [];
}

export function getFinanceTotals(periodId: FinancePeriodId): { revenue: number; expenses: number } {
  const period = financePeriods.find((p) => p.id === periodId)!;
  if (period.kind === 'today') return { revenue: todaysRevenue, expenses: todaysExpenses };
  if (period.kind === 'week') {
    return {
      revenue: weeklyFinance.reduce((s, d) => s + d.revenue, 0),
      expenses: weeklyFinance.reduce((s, d) => s + d.expenses, 0),
    };
  }
  const month = monthlyFinance.find((m) => m.month === period.monthKey)!;
  return { revenue: month.revenue, expenses: month.expenses };
}

/** Month-over-month revenue/expense change, for month periods that have a prior month in `monthlyFinance`. */
export function getFinancePreviousMonthDelta(periodId: FinancePeriodId): { revenuePct: number; expensesPct: number } | null {
  const period = financePeriods.find((p) => p.id === periodId)!;
  if (period.kind !== 'month') return null;
  const idx = monthlyFinance.findIndex((m) => m.month === period.monthKey);
  if (idx <= 0) return null;
  const current = monthlyFinance[idx];
  const previous = monthlyFinance[idx - 1];
  return {
    revenuePct: ((current.revenue - previous.revenue) / previous.revenue) * 100,
    expensesPct: ((current.expenses - previous.expenses) / previous.expenses) * 100,
  };
}

// --- Expense ledger ---------------------------------------------------------

export type ExpenseCategory = 'Ingredients & Supplies' | 'Staff Wages' | 'Rent & Utilities' | 'Marketing' | 'Equipment & Maintenance' | 'Delivery & Logistics';

export interface ExpenseRecord {
  id: string;
  dateISO: string;
  dateLabel: string;
  category: ExpenseCategory;
  description: string;
  vendor: string;
  amount: number;
  monthKey: string;
}

export const expenseRecords: ExpenseRecord[] = [
  // February
  { id: 'EXP-2001', dateISO: '2026-02-03', dateLabel: 'Feb 3, 2026',  category: 'Rent & Utilities',        description: 'Monthly rent & utilities',        vendor: 'Harbor Point Leasing',   amount: 5200, monthKey: 'Feb' },
  { id: 'EXP-2002', dateISO: '2026-02-07', dateLabel: 'Feb 7, 2026',  category: 'Staff Wages',             description: 'Payroll (Jan 28 – Feb 3)',        vendor: 'Payroll',                amount: 6100, monthKey: 'Feb' },
  { id: 'EXP-2003', dateISO: '2026-02-12', dateLabel: 'Feb 12, 2026', category: 'Ingredients & Supplies',  description: 'Meat & produce bulk order',       vendor: 'GreenFields Meats',      amount: 4300, monthKey: 'Feb' },
  { id: 'EXP-2004', dateISO: '2026-02-18', dateLabel: 'Feb 18, 2026', category: 'Staff Wages',             description: 'Payroll (Feb 11 – 17)',           vendor: 'Payroll',                amount: 6050, monthKey: 'Feb' },
  { id: 'EXP-2005', dateISO: '2026-02-22', dateLabel: 'Feb 22, 2026', category: 'Marketing',               description: "Valentine's promo campaign",     vendor: 'Local Ad Co-op',         amount: 1850, monthKey: 'Feb' },
  { id: 'EXP-2006', dateISO: '2026-02-27', dateLabel: 'Feb 27, 2026', category: 'Equipment & Maintenance', description: 'Grill hood deep cleaning',        vendor: 'Blaze Hood Services',    amount: 780,  monthKey: 'Feb' },
  // March
  { id: 'EXP-2007', dateISO: '2026-03-02', dateLabel: 'Mar 2, 2026',  category: 'Rent & Utilities',        description: 'Monthly rent & utilities',        vendor: 'Harbor Point Leasing',   amount: 5300, monthKey: 'Mar' },
  { id: 'EXP-2008', dateISO: '2026-03-06', dateLabel: 'Mar 6, 2026',  category: 'Staff Wages',             description: 'Payroll (Feb 25 – Mar 3)',        vendor: 'Payroll',                amount: 6200, monthKey: 'Mar' },
  { id: 'EXP-2009', dateISO: '2026-03-14', dateLabel: 'Mar 14, 2026', category: 'Ingredients & Supplies',  description: 'Bulk meat & dairy order',         vendor: 'DairyCo',                amount: 4700, monthKey: 'Mar' },
  { id: 'EXP-2010', dateISO: '2026-03-19', dateLabel: 'Mar 19, 2026', category: 'Staff Wages',             description: 'Payroll (Mar 11 – 17)',           vendor: 'Payroll',                amount: 6150, monthKey: 'Mar' },
  { id: 'EXP-2011', dateISO: '2026-03-23', dateLabel: 'Mar 23, 2026', category: 'Delivery & Logistics',    description: 'Delivery fleet maintenance',      vendor: 'RideWorks Garage',       amount: 590,  monthKey: 'Mar' },
  { id: 'EXP-2012', dateISO: '2026-03-28', dateLabel: 'Mar 28, 2026', category: 'Marketing',               description: 'Spring menu launch ads',          vendor: 'Local Ad Co-op',         amount: 1420, monthKey: 'Mar' },
  // April
  { id: 'EXP-2013', dateISO: '2026-04-04', dateLabel: 'Apr 4, 2026',  category: 'Rent & Utilities',        description: 'Monthly rent & utilities',        vendor: 'Harbor Point Leasing',   amount: 5250, monthKey: 'Apr' },
  { id: 'EXP-2014', dateISO: '2026-04-09', dateLabel: 'Apr 9, 2026',  category: 'Staff Wages',             description: 'Payroll (Mar 25 – 31)',           vendor: 'Payroll',                amount: 6180, monthKey: 'Apr' },
  { id: 'EXP-2015', dateISO: '2026-04-15', dateLabel: 'Apr 15, 2026', category: 'Ingredients & Supplies',  description: 'Produce & bakery order',          vendor: 'Fresh Farms Co-op',      amount: 4500, monthKey: 'Apr' },
  { id: 'EXP-2016', dateISO: '2026-04-20', dateLabel: 'Apr 20, 2026', category: 'Staff Wages',             description: 'Payroll (Apr 8 – 14)',            vendor: 'Payroll',                amount: 6100, monthKey: 'Apr' },
  { id: 'EXP-2017', dateISO: '2026-04-25', dateLabel: 'Apr 25, 2026', category: 'Equipment & Maintenance', description: 'POS terminal upgrade',            vendor: 'BunBite IT Services',    amount: 1340, monthKey: 'Apr' },
  { id: 'EXP-2018', dateISO: '2026-04-29', dateLabel: 'Apr 29, 2026', category: 'Marketing',               description: 'Loyalty app promo push',          vendor: 'AppBoost Media',         amount: 980,  monthKey: 'Apr' },
  // May
  { id: 'EXP-2019', dateISO: '2026-05-03', dateLabel: 'May 3, 2026',  category: 'Rent & Utilities',        description: 'Monthly rent & utilities',        vendor: 'Harbor Point Leasing',   amount: 5300, monthKey: 'May' },
  { id: 'EXP-2020', dateISO: '2026-05-08', dateLabel: 'May 8, 2026',  category: 'Staff Wages',             description: 'Payroll (Apr 29 – May 5)',        vendor: 'Payroll',                amount: 6350, monthKey: 'May' },
  { id: 'EXP-2021', dateISO: '2026-05-13', dateLabel: 'May 13, 2026', category: 'Ingredients & Supplies',  description: 'Bulk meat & produce order',       vendor: 'GreenFields Meats',      amount: 4900, monthKey: 'May' },
  { id: 'EXP-2022', dateISO: '2026-05-18', dateLabel: 'May 18, 2026', category: 'Staff Wages',             description: 'Payroll (May 13 – 19)',           vendor: 'Payroll',                amount: 6300, monthKey: 'May' },
  { id: 'EXP-2023', dateISO: '2026-05-24', dateLabel: 'May 24, 2026', category: 'Delivery & Logistics',    description: 'New delivery bikes (x2)',         vendor: 'RideWorks Garage',       amount: 2100, monthKey: 'May' },
  { id: 'EXP-2024', dateISO: '2026-05-29', dateLabel: 'May 29, 2026', category: 'Marketing',               description: 'Summer campaign kickoff',         vendor: 'Local Ad Co-op',         amount: 1240, monthKey: 'May' },
  // June
  { id: 'EXP-2025', dateISO: '2026-06-02', dateLabel: 'Jun 2, 2026',  category: 'Rent & Utilities',        description: 'Monthly rent & utilities',        vendor: 'Harbor Point Leasing',   amount: 5350, monthKey: 'Jun' },
  { id: 'EXP-2026', dateISO: '2026-06-06', dateLabel: 'Jun 6, 2026',  category: 'Staff Wages',             description: 'Payroll (May 27 – Jun 2)',        vendor: 'Payroll',                amount: 6500, monthKey: 'Jun' },
  { id: 'EXP-2027', dateISO: '2026-06-12', dateLabel: 'Jun 12, 2026', category: 'Ingredients & Supplies',  description: 'Bulk meat, dairy & produce order',vendor: 'DairyCo',                amount: 5200, monthKey: 'Jun' },
  { id: 'EXP-2028', dateISO: '2026-06-17', dateLabel: 'Jun 17, 2026', category: 'Staff Wages',             description: 'Payroll (Jun 10 – 16)',           vendor: 'Payroll',                amount: 6450, monthKey: 'Jun' },
  { id: 'EXP-2029', dateISO: '2026-06-21', dateLabel: 'Jun 21, 2026', category: 'Equipment & Maintenance', description: 'Walk-in freezer repair',          vendor: 'Coldline Techs',         amount: 1680, monthKey: 'Jun' },
  { id: 'EXP-2030', dateISO: '2026-06-26', dateLabel: 'Jun 26, 2026', category: 'Marketing',               description: 'Midnight Bite launch campaign',   vendor: 'AppBoost Media',         amount: 1950, monthKey: 'Jun' },
  // July (month-to-date through Jul 15)
  { id: 'EXP-2031', dateISO: '2026-07-03', dateLabel: 'Jul 3, 2026',  category: 'Rent & Utilities',        description: 'Monthly rent payment',            vendor: 'Harbor Point Leasing',   amount: 3200, monthKey: 'Jul' },
  { id: 'EXP-2032', dateISO: '2026-07-04', dateLabel: 'Jul 4, 2026',  category: 'Equipment & Maintenance', description: 'Fryer servicing',                 vendor: 'Blaze Hood Services',    amount: 950,  monthKey: 'Jul' },
  { id: 'EXP-2033', dateISO: '2026-07-06', dateLabel: 'Jul 6, 2026',  category: 'Staff Wages',             description: 'Payroll (Jun 30 – Jul 5)',        vendor: 'Payroll',                amount: 4200, monthKey: 'Jul' },
  { id: 'EXP-2034', dateISO: '2026-07-09', dateLabel: 'Jul 9, 2026',  category: 'Ingredients & Supplies',  description: 'Weekly produce & meat order',     vendor: 'Fresh Farms Co-op',      amount: 2600, monthKey: 'Jul' },
  { id: 'EXP-2035', dateISO: '2026-07-10', dateLabel: 'Jul 10, 2026', category: 'Marketing',               description: 'Local print ad placement',        vendor: 'Local Ad Co-op',         amount: 610,  monthKey: 'Jul' },
  { id: 'EXP-2036', dateISO: '2026-07-12', dateLabel: 'Jul 12, 2026', category: 'Rent & Utilities',        description: 'Water & gas utilities',           vendor: 'City Utilities Dept.',   amount: 480,  monthKey: 'Jul' },
  { id: 'EXP-2037', dateISO: '2026-07-13', dateLabel: 'Jul 13, 2026', category: 'Staff Wages',             description: 'Weekend shift payroll',           vendor: 'Payroll',                amount: 1450, monthKey: 'Jul' },
  { id: 'EXP-2038', dateISO: '2026-07-13', dateLabel: 'Jul 13, 2026', category: 'Ingredients & Supplies',  description: 'Bakery & dairy restock',          vendor: 'Village Bakery',         amount: 780,  monthKey: 'Jul' },
  { id: 'EXP-2039', dateISO: '2026-07-14', dateLabel: 'Jul 14, 2026', category: 'Delivery & Logistics',    description: 'Rider fuel & maintenance',        vendor: 'RideWorks Garage',       amount: 310,  monthKey: 'Jul' },
  { id: 'EXP-2040', dateISO: '2026-07-14', dateLabel: 'Jul 14, 2026', category: 'Marketing',               description: 'Social media ad spend',           vendor: 'AppBoost Media',         amount: 240,  monthKey: 'Jul' },
  { id: 'EXP-2041', dateISO: '2026-07-15', dateLabel: 'Jul 15, 2026', category: 'Ingredients & Supplies',  description: 'Produce & meat restock',          vendor: 'GreenFields Meats',      amount: 640,  monthKey: 'Jul' },
  { id: 'EXP-2042', dateISO: '2026-07-15', dateLabel: 'Jul 15, 2026', category: 'Staff Wages',             description: 'Day shift payroll',               vendor: 'Payroll',                amount: 420,  monthKey: 'Jul' },
  { id: 'EXP-2043', dateISO: '2026-07-15', dateLabel: 'Jul 15, 2026', category: 'Rent & Utilities',        description: 'Electricity bill',                vendor: 'City Utilities Dept.',   amount: 130,  monthKey: 'Jul' },
  { id: 'EXP-2044', dateISO: '2026-07-15', dateLabel: 'Jul 15, 2026', category: 'Delivery & Logistics',    description: 'Fuel & vehicle upkeep',           vendor: 'RideWorks Garage',       amount: 70,   monthKey: 'Jul' },
];

const TODAY_ISO = '2026-07-15';
const WEEK_START_ISO = '2026-07-13'; // Mon
const WEEK_END_ISO = '2026-07-19';   // Sun

export function getExpenseRecordsForPeriod(periodId: FinancePeriodId): ExpenseRecord[] {
  const period = financePeriods.find((p) => p.id === periodId)!;
  let records: ExpenseRecord[];
  if (period.kind === 'today') {
    records = expenseRecords.filter((r) => r.dateISO === TODAY_ISO);
  } else if (period.kind === 'week') {
    records = expenseRecords.filter((r) => r.dateISO >= WEEK_START_ISO && r.dateISO <= WEEK_END_ISO);
  } else {
    records = expenseRecords.filter((r) => r.monthKey === period.monthKey);
  }
  return [...records].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
}

// --- Order & revenue analytics (top menu items) -----------------------------

interface BaseItemStat {
  name: string;
  category: string;
  orders: number;
  price: number;
}

// Baseline is a full month at June 2026's volume; every other period scales
// this baseline by its revenue ratio to June, so item-level numbers stay
// consistent with the headline revenue figures above.
const baseMonthlyItemStats: BaseItemStat[] = [
  { name: 'Cheesy Boom',       category: 'Burgers',  orders: 620, price: 14.00 },
  { name: 'Golden Fries',      category: 'Sides',    orders: 810, price: 5.00 },
  { name: 'Midnight Bite',     category: 'Burgers',  orders: 540, price: 12.00 },
  { name: 'Spicy Bird',        category: 'Chicken',  orders: 360, price: 13.50 },
  { name: 'Smoky Burst',       category: 'Burgers',  orders: 300, price: 13.00 },
  { name: 'Pepperoni Classic', category: 'Pizza',    orders: 210, price: 17.00 },
];

const JUNE_BASELINE_REVENUE = 71200;

export interface MenuItemPeriodStat {
  rank: number;
  name: string;
  category: string;
  orders: number;
  revenue: number;
}

export function getTopMenuItemsForPeriod(periodId: FinancePeriodId): MenuItemPeriodStat[] {
  const { revenue } = getFinanceTotals(periodId);
  const factor = revenue / JUNE_BASELINE_REVENUE;
  return baseMonthlyItemStats
    .map((item) => {
      const orders = Math.max(1, Math.round(item.orders * factor));
      return { name: item.name, category: item.category, orders, revenue: Math.round(orders * item.price) };
    })
    .sort((a, b) => b.orders - a.orders)
    .map((item, i) => ({ ...item, rank: i + 1 }));
}

export const resourceLinks = [
  { title: 'Staff Onboarding Guide', type: 'PDF', size: '1.2 MB', updated: 'Jun 2, 2026' },
  { title: 'Food Safety & Hygiene Checklist', type: 'PDF', size: '480 KB', updated: 'May 18, 2026' },
  { title: 'POS Terminal Manual', type: 'PDF', size: '2.4 MB', updated: 'Apr 30, 2026' },
  { title: 'Brand Style Guide', type: 'PDF', size: '3.1 MB', updated: 'Mar 11, 2026' },
  { title: 'Supplier Contact Sheet', type: 'XLSX', size: '96 KB', updated: 'Jul 1, 2026' },
  { title: 'Emergency Evacuation Plan', type: 'PDF', size: '640 KB', updated: 'Feb 8, 2026' },
];
