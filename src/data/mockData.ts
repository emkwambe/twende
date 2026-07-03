// TWENDE Mock Data Store
export const currentUser = {
  id: 'u1',
  name: 'Wanjiku M.',
  phone: '+254712345678',
  kycTier: 2,
  creditScore: 650,
  creditTier: 'Gold',
  avatar: 'WM',
  memberSince: '2025-11-15',
  hasChama: true,
  hasBiashara: true,
  hasKazi: false,
  hasLinda: true,
  hasSoko: true,
};

// CHAMA DATA
export const myChamas = [
  {
    id: 'c1',
    name: 'Nyota Chama',
    role: 'Member',
    memberCount: 24,
    contributionAmount: 2000,
    frequency: 'Monthly',
    myBalance: 48000,
    totalBalance: 1152000,
    monthlyTarget: 48000,
    progress: 78,
    nextDue: '2026-07-15',
    status: 'active',
    completedOrders: 156,
  },
  {
    id: 'c2',
    name: 'Mbele Savings',
    role: 'Treasurer',
    memberCount: 12,
    contributionAmount: 5000,
    frequency: 'Monthly',
    myBalance: 60000,
    totalBalance: 720000,
    monthlyTarget: 60000,
    progress: 92,
    nextDue: '2026-07-10',
    status: 'active',
    completedOrders: 89,
  },
];

export const chamaTransactions = [
  { id: 't1', type: 'contribution', member: 'Jane K.', amount: 2000, date: '2026-07-01', status: 'completed' },
  { id: 't2', type: 'loan_repayment', member: 'Mark O.', amount: 5000, date: '2026-06-30', status: 'completed' },
  { id: 't3', type: 'contribution', member: 'Fatuma A.', amount: 2000, date: '2026-06-28', status: 'completed' },
  { id: 't4', type: 'loan_disbursement', member: 'Peter N.', amount: 15000, date: '2026-06-25', status: 'completed' },
  { id: 't5', type: 'contribution', member: 'Grace W.', amount: 2000, date: '2026-06-22', status: 'completed' },
  { id: 't6', type: 'penalty', member: 'John K.', amount: 100, date: '2026-06-20', status: 'completed' },
];

export const chamaLoans = [
  { id: 'l1', borrower: 'Peter N.', amount: 15000, purpose: 'Business restocking', status: 'active', repaid: 5000, total: 15000, dueDate: '2026-09-25' },
  { id: 'l2', borrower: 'Grace W.', amount: 8000, purpose: 'School fees', status: 'repaid', repaid: 8000, total: 8000, dueDate: '2026-06-15' },
  { id: 'l3', borrower: 'Mark O.', amount: 12000, purpose: 'Medical emergency', status: 'active', repaid: 7000, total: 12000, dueDate: '2026-08-10' },
];

// BIASHARA DATA
export const biasharaProfile = {
  businessName: "Wanjiku's Fabrics",
  category: 'Textiles & Clothing',
  monthlyRevenue: 85000,
  loanLimit: 50000,
  availableCredit: 35000,
  activeLoan: {
    amount: 25000,
    repaid: 10000,
    remaining: 15000,
    interestRate: 24,
    nextPayment: 3750,
    dueDate: '2026-07-20',
    progress: 40,
  },
  creditHistory: [
    { month: 'Jan', score: 580 },
    { month: 'Feb', score: 595 },
    { month: 'Mar', score: 610 },
    { month: 'Apr', score: 625 },
    { month: 'May', score: 640 },
    { month: 'Jun', score: 650 },
  ],
};

export const biasharaTransactions = [
  { id: 'bt1', type: 'loan_disbursement', amount: 25000, date: '2026-05-15', description: 'Inventory loan' },
  { id: 'bt2', type: 'repayment', amount: 3750, date: '2026-06-15', description: 'Monthly repayment' },
  { id: 'bt3', type: 'repayment', amount: 3750, date: '2026-05-20', description: 'Monthly repayment' },
  { id: 'bt4', type: 'repayment', amount: 2500, date: '2026-05-18', description: 'Early partial payment' },
];

// KAZI DATA
export const kaziProfile = {
  platform: 'SafeBoda',
  joinDate: '2024-03-10',
  totalRides: 12480,
  weeklyEarnings: 18500,
  autoSaveRate: 5,
  autoSaveBalance: 23400,
  insuranceActive: true,
  insurancePremium: 50,
  coverageAmount: 50000,
  ridesThisWeek: 87,
  rating: 4.8,
};

export const kaziWeeklyData = [
  { day: 'Mon', earnings: 2800, rides: 14 },
  { day: 'Tue', earnings: 3200, rides: 16 },
  { day: 'Wed', earnings: 2600, rides: 13 },
  { day: 'Thu', earnings: 3500, rides: 18 },
  { day: 'Fri', earnings: 3100, rides: 15 },
  { day: 'Sat', earnings: 1900, rides: 9 },
  { day: 'Sun', earnings: 1400, rides: 7 },
];

// LINDA DATA
export const lindaPolicies = [
  {
    id: 'p1',
    type: 'Gig Accident Cover',
    product: 'Kazi',
    status: 'active',
    premium: 50,
    frequency: 'per week',
    coverage: 50000,
    startDate: '2026-01-15',
    claims: 0,
    icon: 'shield',
    color: 'kazi',
  },
  {
    id: 'p2',
    type: 'Chama Group Life',
    product: 'Chama',
    status: 'active',
    premium: 200,
    frequency: 'per month',
    coverage: 100000,
    startDate: '2026-02-01',
    claims: 0,
    icon: 'users',
    color: 'ocean',
  },
  {
    id: 'p3',
    type: 'Seller Shield',
    product: 'Soko',
    status: 'active',
    premium: 150,
    frequency: 'per week',
    coverage: 75000,
    startDate: '2026-04-10',
    claims: 1,
    icon: 'store',
    color: 'soko',
  },
];

// SOKO DATA
export const sokoStore = {
  storeName: "Wanjiku's Fabrics",
  storeUrl: 'soko.twende.io/0712345678',
  verifiedOrders: 127,
  rating: 4.7,
  activeListings: 18,
  totalSales: 342,
  monthlyRevenue: 68000,
  balance: 24500,
  location: 'Gikomba Market, Gate 4',
};

export const sokoListings = [
  { id: 'sl1', name: 'Kitenge Wrap Dress', price: 1200, sold: 45, available: true, image: 'dress' },
  { id: 'sl2', name: 'Ankara Fabric (2m)', price: 800, sold: 78, available: true, image: 'fabric' },
  { id: 'sl3', name: 'Kitenge Head Wrap', price: 350, sold: 32, available: true, image: 'wrap' },
  { id: 'sl4', name: 'Custom Kitenge Bag', price: 1500, sold: 12, available: true, image: 'bag' },
  { id: 'sl5', name: 'Traditional Skirt', price: 1800, sold: 28, available: false, image: 'skirt' },
];

export const sokoOrders = [
  { id: 'o1', buyer: 'Amina K.', item: 'Kitenge Wrap Dress', qty: 2, amount: 2400, status: 'completed', date: '2026-07-01' },
  { id: 'o2', buyer: 'James O.', item: 'Ankara Fabric (2m)', qty: 3, amount: 2400, status: 'completed', date: '2026-06-30' },
  { id: 'o3', buyer: 'Sarah M.', item: 'Kitenge Head Wrap', qty: 5, amount: 1750, status: 'pending', date: '2026-07-02' },
  { id: 'o4', buyer: 'David N.', item: 'Custom Kitenge Bag', qty: 1, amount: 1500, status: 'delivering', date: '2026-07-01' },
];

// PLATFORM OVERVIEW
export const platformStats = {
  totalUsers: '2.4M',
  activeChamas: '75,000',
  loansDisbursed: 'KES 2.1B',
  insuredWorkers: '340K',
  sokoOrders: '1.2M',
  countries: 4,
};

export const recentActivity = [
  { action: 'contributed', product: 'Chama', amount: 'KES 2,000', time: '2 min ago', user: 'You' },
  { action: 'sold', product: 'Soko', amount: 'KES 1,200', time: '15 min ago', user: 'You' },
  { action: 'paid premium', product: 'Linda', amount: 'KES 50', time: '1 hr ago', user: 'You' },
  { action: 'loan repaid', product: 'Biashara', amount: 'KES 3,750', time: '3 hrs ago', user: 'You' },
  { action: 'group order', product: 'Chama+Soko', amount: 'KES 9,600', time: '1 day ago', user: 'Nyota Chama' },
];
