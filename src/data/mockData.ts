import type { User } from '../types/auth';

// TWENDE Mock Data Store
// Shaped to match the API's User contract (snake_case) so that the common
// `user || currentUser` fallback yields a single type rather than a union.
// The has* pillar flags and creditTier are demo-only extras with no API
// counterpart yet.
export const currentUser: User & {
  creditTier: string;
  memberSince: string;
  hasChama: boolean;
  hasBiashara: boolean;
  hasKazi: boolean;
  hasLinda: boolean;
  hasSoko: boolean;
} = {
  id: 'u1',
  phone: '+255712345678',
  display_name: 'Wanjiku M.',
  email: null,
  kyc_tier: 2,
  kyc_verified_at: '2025-11-20T09:00:00Z',
  national_id: null,
  date_of_birth: null,
  credit_score: 650,
  avatar: 'WM',
  role: 'user',
  country: 'TZ',
  status: 'active',
  created_at: '2025-11-15T08:00:00Z',
  updated_at: '2026-09-01T08:00:00Z',
  creditTier: 'Gold',
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
    contributionAmount: 40000,
    frequency: 'Monthly',
    myBalance: 960000,
    totalBalance: 23040000,
    monthlyTarget: 960000,
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
    contributionAmount: 100000,
    frequency: 'Monthly',
    myBalance: 1200000,
    totalBalance: 14400000,
    monthlyTarget: 1200000,
    progress: 92,
    nextDue: '2026-07-10',
    status: 'active',
    completedOrders: 89,
  },
];

export const chamaTransactions = [
  { id: 't1', type: 'contribution', member: 'Jane K.', amount: 40000, date: '2026-07-01', status: 'completed' },
  { id: 't2', type: 'loan_repayment', member: 'Mark O.', amount: 100000, date: '2026-06-30', status: 'completed' },
  { id: 't3', type: 'contribution', member: 'Fatuma A.', amount: 40000, date: '2026-06-28', status: 'completed' },
  { id: 't4', type: 'loan_disbursement', member: 'Peter N.', amount: 300000, date: '2026-06-25', status: 'completed' },
  { id: 't5', type: 'contribution', member: 'Grace W.', amount: 40000, date: '2026-06-22', status: 'completed' },
  { id: 't6', type: 'penalty', member: 'John K.', amount: 2000, date: '2026-06-20', status: 'completed' },
];

export const chamaLoans = [
  { id: 'l1', borrower: 'Peter N.', amount: 300000, purpose: 'Business restocking', status: 'active', repaid: 100000, total: 300000, dueDate: '2026-09-25' },
  { id: 'l2', borrower: 'Grace W.', amount: 160000, purpose: 'School fees', status: 'repaid', repaid: 160000, total: 160000, dueDate: '2026-06-15' },
  { id: 'l3', borrower: 'Mark O.', amount: 240000, purpose: 'Medical emergency', status: 'active', repaid: 140000, total: 240000, dueDate: '2026-08-10' },
];

// BIASHARA DATA
export const biasharaProfile = {
  businessName: "Wanjiku's Fabrics",
  category: 'Textiles & Clothing',
  monthlyRevenue: 1700000,
  loanLimit: 1000000,
  availableCredit: 700000,
  activeLoan: {
    amount: 500000,
    repaid: 200000,
    remaining: 300000,
    interestRate: 24,
    nextPayment: 75000,
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
  { id: 'bt1', type: 'loan_disbursement', amount: 500000, date: '2026-05-15', description: 'Inventory loan' },
  { id: 'bt2', type: 'repayment', amount: 75000, date: '2026-06-15', description: 'Monthly repayment' },
  { id: 'bt3', type: 'repayment', amount: 75000, date: '2026-05-20', description: 'Monthly repayment' },
  { id: 'bt4', type: 'repayment', amount: 50000, date: '2026-05-18', description: 'Early partial payment' },
];

// KAZI DATA
export const kaziProfile = {
  platform: 'SafeBoda',
  joinDate: '2024-03-10',
  totalRides: 12480,
  weeklyEarnings: 370000,
  autoSaveRate: 5,
  autoSaveBalance: 468000,
  insuranceActive: true,
  insurancePremium: 50,
  coverageAmount: 1000000,
  ridesThisWeek: 87,
  rating: 4.8,
};

export const kaziWeeklyData = [
  { day: 'Mon', earnings: 56000, rides: 14 },
  { day: 'Tue', earnings: 64000, rides: 16 },
  { day: 'Wed', earnings: 52000, rides: 13 },
  { day: 'Thu', earnings: 70000, rides: 18 },
  { day: 'Fri', earnings: 62000, rides: 15 },
  { day: 'Sat', earnings: 38000, rides: 9 },
  { day: 'Sun', earnings: 28000, rides: 7 },
];

// LINDA DATA
export const lindaPolicies = [
  {
    id: 'p1',
    type: 'Gig Accident Cover',
    product: 'Kazi',
    status: 'active',
    premium: 1000,
    frequency: 'per week',
    coverage: 1000000,
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
    premium: 4000,
    frequency: 'per month',
    coverage: 2000000,
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
    premium: 3000,
    frequency: 'per week',
    coverage: 1500000,
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
  totalSales: 6840,
  monthlyRevenue: 1360000,
  balance: 490000,
  location: 'Gikomba Market, Gate 4',
};

export const sokoListings = [
  { id: 'sl1', name: 'Kitenge Wrap Dress', price: 24000, sold: 45, available: true, image: 'dress' },
  { id: 'sl2', name: 'Ankara Fabric (2m)', price: 16000, sold: 78, available: true, image: 'fabric' },
  { id: 'sl3', name: 'Kitenge Head Wrap', price: 7000, sold: 32, available: true, image: 'wrap' },
  { id: 'sl4', name: 'Custom Kitenge Bag', price: 30000, sold: 12, available: true, image: 'bag' },
  { id: 'sl5', name: 'Traditional Skirt', price: 36000, sold: 28, available: false, image: 'skirt' },
];

// TRUST ENGINE DATA (Sprint 05)
export const trustScoreFactors = {
  chama: {
    contributionConsistency: 85,               // 85% on-time contributions
    contributionRelativeToChamaMedian: 100,    // contributes at the group median
    groupTenureMonths: 18,                     // 18 months in chamas
    leadershipRole: true,                      // Treasurer of Mbele Savings
    chamaMemberCount: 22,                      // Mbele Savings group size
  },
  mpesa: {
    transactionVolume: 65,           // Moderate monthly volume
    transactionFrequency: 70,       // ~10 transactions/week
    balanceStability: 55,           // Some variation
    airtimePurchase: 90,             // Consistent small purchases
  },
  soko: {
    gmv: 68,                         // TZS 1,360K monthly GMV
    customerRating: 94,              // 4.7/5 stars = 94%
    fulfillmentRate: 96,            // 96% orders fulfilled
    inventoryTurnover: 45,          // ~45 days to sell
  },
  loans: {
    repaymentRate: 80,               // 80% on-time (some delays)
    activeLoans: 1,                  // 1 active loan
    defaultHistory: false,           // No defaults
    creditUtilization: 50,          // 50% of limit used
  },
  kazi: {
    gigsCompleted: 0,                // Not enrolled in Kazi
    employerRating: 0,
    incomeStability: 0,
    skillDiversity: 0,
  },
  linda: {
    premiumConsistency: 95,          // 95% on-time payments
    claimsHistory: 1,                // 1 claim (Seller Shield)
    policyTenure: 6,                 // 6 months insured
    noClaimBonus: false,             // Has claimed
  },
  kyc: {
    tier: 2 as const,               // Tier 2 KYC
    idVerified: true,
    addressVerified: false,          // Not yet verified
    biometricEnrolled: true,
  },
};

export const trustScoreEvents = [
  { id: 'e1', eventType: 'chama_contribution', factor: 'chama', oldScore: 645, newScore: 648, delta: 3, reason: 'Monthly contribution to Nyota Chama: TZS 40,000', createdAt: '2026-07-01T10:30:00Z' },
  { id: 'e2', eventType: 'loan_repayment', factor: 'loans', oldScore: 642, newScore: 645, delta: 3, reason: 'Early loan repayment: TZS 75,000', createdAt: '2026-06-15T14:20:00Z' },
  { id: 'e3', eventType: 'soko_sale', factor: 'soko', oldScore: 640, newScore: 642, delta: 2, reason: 'Completed sale: Kitenge Wrap Dress x2', createdAt: '2026-06-30T09:15:00Z' },
  { id: 'e4', eventType: 'insurance_premium', factor: 'linda', oldScore: 639, newScore: 640, delta: 1, reason: 'Linda premium paid on time: TZS 1,000', createdAt: '2026-06-28T08:00:00Z' },
  { id: 'e5', eventType: 'chama_contribution', factor: 'chama', oldScore: 636, newScore: 639, delta: 3, reason: 'Monthly contribution to Mbele Savings: TZS 100,000', createdAt: '2026-06-10T11:00:00Z' },
  { id: 'e6', eventType: 'loan_repayment', factor: 'loans', oldScore: 633, newScore: 636, delta: 3, reason: 'Monthly loan repayment: TZS 75,000', createdAt: '2026-05-20T16:45:00Z' },
  { id: 'e7', eventType: 'soko_sale', factor: 'soko', oldScore: 630, newScore: 633, delta: 3, reason: 'High-value order: Ankara Fabric x3', createdAt: '2026-05-18T13:30:00Z' },
  { id: 'e8', eventType: 'kyc_upgrade', factor: 'kyc', oldScore: 625, newScore: 630, delta: 5, reason: 'KYC upgraded to Tier 2: ID + selfie verified', createdAt: '2026-05-01T10:00:00Z' },
];

export const trustScoreHistory = [
  { month: 'Jan', score: 580, tier: 2 },
  { month: 'Feb', score: 595, tier: 2 },
  { month: 'Mar', score: 610, tier: 2 },
  { month: 'Apr', score: 625, tier: 2 },
  { month: 'May', score: 640, tier: 2 },
  { month: 'Jun', score: 650, tier: 3 },
];

export const scoreDisputes = [
  { id: 'd1', factor: 'loans', reason: 'I repaid my loan early but my score did not reflect this', status: 'resolved' as const, createdAt: '2026-06-20T10:00:00Z', resolvedAt: '2026-06-22T14:00:00Z', resolution: 'Verified early repayment. Score corrected by +3 points.' },
];

// BIASHARA V2 DATA (Sprint 07)
export const loanProducts = [
  {
    id: 'working_capital',
    name: 'Working Capital Loan',
    type: 'working_capital' as const,
    minAmount: 100000,
    maxAmount: 10000000,
    interestRate: 0.18,
    interestType: 'reducing_balance' as const,
    processingFee: 0.025,
    minTenure: 1,
    maxTenure: 104,
    repaymentFrequency: 'weekly' as const,
    features: ['Reducing balance interest', 'Top-up eligible', 'Early repayment rebate 2%', 'Weekly repayments'],
  },
  {
    id: 'inventory_finance',
    name: 'Inventory Finance',
    type: 'inventory' as const,
    minAmount: 200000,
    maxAmount: 4000000,
    interestRate: 0.14,
    interestType: 'reducing_balance' as const,
    processingFee: 0.015,
    minTenure: 4,
    maxTenure: 52,
    repaymentFrequency: 'monthly' as const,
    features: ['Reducing balance interest', 'Monthly repayments', '30-day interest-free for suppliers', 'Early repayment rebate 2%'],
  },
  {
    id: 'emergency_micro',
    name: 'Emergency Micro-Loan',
    type: 'emergency' as const,
    minAmount: 20000,
    maxAmount: 100000,
    interestRate: 0.24,
    interestType: 'flat' as const,
    processingFee: 0.05,
    minTenure: 1,
    maxTenure: 4,
    repaymentFrequency: 'weekly' as const,
    features: ['Flat interest rate', 'Fast approval', 'Emergency only', 'No early repayment'],
  },
];

export const activeLoans = [
  {
    id: 'loan-001',
    product: 'working_capital' as const,
    productName: 'Working Capital Loan',
    principal: 1000000,
    interestRate: 0.18,
    tenureWeeks: 12,
    totalRepayable: 55400,
    totalInterest: 5400,
    disbursedAmount: 48750,
    remainingBalance: 32400,
    status: 'active' as const,
    nextDueDate: '2026-07-15',
    nextDueAmount: 4617,
    installmentsPaid: 4,
    totalInstallments: 12,
    progress: 40,
    repaymentSchedule: [
      { week: 1, dueDate: '2026-05-01', installment: 92340, principal: 88460, interest: 3880, balance: 911540, status: 'paid' as const },
      { week: 2, dueDate: '2026-05-08', installment: 92340, principal: 88800, interest: 3540, balance: 822740, status: 'paid' as const },
      { week: 3, dueDate: '2026-05-15', installment: 92340, principal: 89140, interest: 3200, balance: 733600, status: 'paid' as const },
      { week: 4, dueDate: '2026-05-22', installment: 92340, principal: 89480, interest: 2860, balance: 644120, status: 'paid' as const },
      { week: 5, dueDate: '2026-06-29', installment: 92340, principal: 89820, interest: 2520, balance: 554300, status: 'pending' as const },
      { week: 6, dueDate: '2026-07-06', installment: 92340, principal: 90160, interest: 2180, balance: 464140, status: 'pending' as const },
      { week: 7, dueDate: '2026-07-13', installment: 92340, principal: 90500, interest: 1840, balance: 373640, status: 'pending' as const },
      { week: 8, dueDate: '2026-07-20', installment: 92340, principal: 90840, interest: 1500, balance: 282800, status: 'pending' as const },
      { week: 9, dueDate: '2026-07-27', installment: 92340, principal: 91180, interest: 1160, balance: 191620, status: 'pending' as const },
      { week: 10, dueDate: '2026-08-03', installment: 92340, principal: 91520, interest: 820, balance: 100100, status: 'pending' as const },
      { week: 11, dueDate: '2026-08-10', installment: 92340, principal: 91860, interest: 480, balance: 8240, status: 'pending' as const },
      { week: 12, dueDate: '2026-08-17', installment: 8280, principal: 8240, interest: 40, balance: 0, status: 'pending' as const },
    ],
  },
];

export const businessMetrics = {
  daily: [
    { date: '2026-06-01', revenue: 2800, expenses: 1800, profit: 1000 },
    { date: '2026-06-02', revenue: 3200, expenses: 2100, profit: 1100 },
    { date: '2026-06-03', revenue: 2500, expenses: 1600, profit: 900 },
    { date: '2026-06-04', revenue: 4500, expenses: 2800, profit: 1700 },
    { date: '2026-06-05', revenue: 3800, expenses: 2400, profit: 1400 },
    { date: '2026-06-06', revenue: 5200, expenses: 3100, profit: 2100 },
    { date: '2026-06-07', revenue: 4100, expenses: 2500, profit: 1600 },
    { date: '2026-06-08', revenue: 2900, expenses: 1900, profit: 1000 },
    { date: '2026-06-09', revenue: 3400, expenses: 2200, profit: 1200 },
    { date: '2026-06-10', revenue: 4800, expenses: 2900, profit: 1900 },
    { date: '2026-06-11', revenue: 3100, expenses: 2000, profit: 1100 },
    { date: '2026-06-12', revenue: 4200, expenses: 2600, profit: 1600 },
    { date: '2026-06-13', revenue: 5500, expenses: 3300, profit: 2200 },
    { date: '2026-06-14', revenue: 3900, expenses: 2400, profit: 1500 },
    { date: '2026-06-15', revenue: 2700, expenses: 1700, profit: 1000 },
    { date: '2026-06-16', revenue: 3600, expenses: 2300, profit: 1300 },
    { date: '2026-06-17', revenue: 4400, expenses: 2700, profit: 1700 },
    { date: '2026-06-18', revenue: 5100, expenses: 3000, profit: 2100 },
    { date: '2026-06-19', revenue: 3300, expenses: 2100, profit: 1200 },
    { date: '2026-06-20', revenue: 4700, expenses: 2800, profit: 1900 },
    { date: '2026-06-21', revenue: 3800, expenses: 2300, profit: 1500 },
    { date: '2026-06-22', revenue: 4200, expenses: 2500, profit: 1700 },
    { date: '2026-06-23', revenue: 5000, expenses: 2900, profit: 2100 },
    { date: '2026-06-24', revenue: 3500, expenses: 2200, profit: 1300 },
    { date: '2026-06-25', revenue: 4600, expenses: 2800, profit: 1800 },
    { date: '2026-06-26', revenue: 5300, expenses: 3200, profit: 2100 },
    { date: '2026-06-27', revenue: 4100, expenses: 2500, profit: 1600 },
    { date: '2026-06-28', revenue: 3700, expenses: 2300, profit: 1400 },
    { date: '2026-06-29', revenue: 4900, expenses: 2900, profit: 2000 },
    { date: '2026-06-30', revenue: 5200, expenses: 3100, profit: 2100 },
  ],
  profitMargin: 0.386,
  cashFlow30d: 168000,
  healthScore: 78,
  revenueGrowth: 0.12,
  expenseGrowth: 0.05,
  marginGrowth: 0.032,
};

export const suppliers = [
  { id: 'sup-001', name: 'Juma Wholesale', phone: '+254712345678', totalPaid: 450000, lastPayment: '2026-06-15', category: 'Fabrics' },
  { id: 'sup-002', name: 'Nairobi Textiles', phone: '+254723456789', totalPaid: 280000, lastPayment: '2026-06-20', category: 'Kitenge' },
  { id: 'sup-003', name: 'Gikomba Direct', phone: '+254734567890', totalPaid: 120000, lastPayment: '2026-06-25', category: 'Accessories' },
];

export const supplierPayments = [
  { id: 'pay-001', supplierId: 'sup-001', amount: 700000, description: 'Kitenge fabric bulk order', date: '2026-06-15', status: 'completed' as const },
  { id: 'pay-002', supplierId: 'sup-002', amount: 440000, description: 'Ankara fabric restock', date: '2026-06-20', status: 'completed' as const },
  { id: 'pay-003', supplierId: 'sup-001', amount: 360000, description: 'Seasonal collection', date: '2026-06-25', status: 'completed' as const },
];

export const savingsGoals = [
  {
    id: 'goal-001',
    name: 'Expand Shop',
    targetAmount: 4000000,
    targetDate: '2026-12-01',
    currentAmount: 1600000,
    autoDeductPercentage: 5,
    status: 'active' as const,
  },
  {
    id: 'goal-002',
    name: 'New Fridge',
    targetAmount: 2400000,
    targetDate: '2026-09-01',
    currentAmount: 900000,
    autoDeductPercentage: 3,
    status: 'active' as const,
  },
];

export const platformStats = {
  totalUsers: '2.4M',
  activeChamas: '75,000',
  loansDisbursed: 'TZS 40.1B',
  insuredWorkers: '340K',
  sokoOrders: '1.2M',
  countries: 4,
};

export const recentActivity = [
  { action: 'contributed', product: 'Chama', amount: 'TZS 40,000', time: '2 min ago', user: 'You' },
  { action: 'sold', product: 'Soko', amount: 'TZS 24,000', time: '15 min ago', user: 'You' },
  { action: 'paid premium', product: 'Linda', amount: 'TZS 1,000', time: '1 hr ago', user: 'You' },
  { action: 'loan repaid', product: 'Biashara', amount: 'TZS 75,000', time: '3 hrs ago', user: 'You' },
  { action: 'group order', product: 'Chama+Soko', amount: 'TZS 192,000', time: '1 day ago', user: 'Nyota Chama' },
];

// SOKO COMMERCE V2 DATA (Sprint 10)
export const vendorStorefronts = [
  {
    id: 'store-001',
    userId: 'u1',
    name: "Mama Nuru's Boutique",
    slug: 'mama-nuru',
    logo: '',
    banner: '',
    description: 'Quality fashion at affordable prices. Dresses, shoes, and accessories for the modern African woman.',
    theme: 'fashion' as const,
    location: { lat: -1.2921, lng: 36.8219, address: 'Kawangware Market, Stall 45', ward: 'Kawangware' },
    businessHours: [
      { day: 'Mon', open: '08:00', close: '20:00', isOpen: true },
      { day: 'Tue', open: '08:00', close: '20:00', isOpen: true },
      { day: 'Wed', open: '08:00', close: '20:00', isOpen: true },
      { day: 'Thu', open: '08:00', close: '20:00', isOpen: true },
      { day: 'Fri', open: '08:00', close: '20:00', isOpen: true },
      { day: 'Sat', open: '09:00', close: '18:00', isOpen: true },
      { day: 'Sun', open: '10:00', close: '16:00', isOpen: false },
    ],
    deliveryAreas: ['Kawangware', 'Kibera', 'Ngong Road', 'Karen'],
    returnPolicy: 'Exchange within 7 days with receipt',
    status: 'active' as const,
    isVerified: true,
    totalOrders: 342,
    totalRevenue: 1450000,
    rating: 4.8,
    reviewCount: 127,
    followerCount: 340,
    freeDeliveryThreshold: 2000,
    deliveryFee: 3000,
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'store-002',
    userId: 'u2',
    name: 'Juma Electronics',
    slug: 'juma-electronics',
    logo: '',
    banner: '',
    description: 'Affordable electronics and phone accessories. Genuine products with warranty.',
    theme: 'electronics' as const,
    location: { lat: -1.2845, lng: 36.8234, address: 'Luthuli Avenue, Shop 12', ward: 'CBD' },
    businessHours: [
      { day: 'Mon', open: '08:30', close: '18:00', isOpen: true },
      { day: 'Tue', open: '08:30', close: '18:00', isOpen: true },
      { day: 'Wed', open: '08:30', close: '18:00', isOpen: true },
      { day: 'Thu', open: '08:30', close: '18:00', isOpen: true },
      { day: 'Fri', open: '08:30', close: '18:00', isOpen: true },
      { day: 'Sat', open: '09:00', close: '17:00', isOpen: true },
      { day: 'Sun', open: '10:00', close: '15:00', isOpen: true },
    ],
    deliveryAreas: ['CBD', 'Ngara', 'Eastleigh', 'Parklands'],
    returnPolicy: '7-day return for defective items',
    status: 'active' as const,
    isVerified: true,
    totalOrders: 189,
    totalRevenue: 890000,
    rating: 4.5,
    reviewCount: 89,
    followerCount: 210,
    freeDeliveryThreshold: 3000,
    deliveryFee: 4000,
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2026-06-20T00:00:00Z',
  },
  {
    id: 'store-003',
    userId: 'u3',
    name: 'Wanjiku\'s Fabrics',
    slug: 'wanjiku-fabrics',
    logo: '',
    banner: '',
    description: 'Authentic African fabrics, kitenge, and custom tailoring. Gikomba Market direct.',
    theme: 'fashion' as const,
    location: { lat: -1.2867, lng: 36.8421, address: 'Gikomba Market, Gate 4', ward: 'Gikomba' },
    businessHours: [
      { day: 'Mon', open: '06:00', close: '18:00', isOpen: true },
      { day: 'Tue', open: '06:00', close: '18:00', isOpen: true },
      { day: 'Wed', open: '06:00', close: '18:00', isOpen: true },
      { day: 'Thu', open: '06:00', close: '18:00', isOpen: true },
      { day: 'Fri', open: '06:00', close: '18:00', isOpen: true },
      { day: 'Sat', open: '06:00', close: '16:00', isOpen: true },
      { day: 'Sun', open: '08:00', close: '14:00', isOpen: true },
    ],
    deliveryAreas: ['Gikomba', 'Eastleigh', 'CBD', 'Ngara'],
    returnPolicy: 'No returns on cut fabric. Exchange for defects within 3 days.',
    status: 'active' as const,
    isVerified: true,
    totalOrders: 520,
    totalRevenue: 2100000,
    rating: 4.9,
    reviewCount: 203,
    followerCount: 560,
    freeDeliveryThreshold: 1500,
    deliveryFee: 2000,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-07-02T00:00:00Z',
  },
];

export const sokoProducts = [
  {
    id: 'prod-001',
    storefrontId: 'store-001',
    name: 'Floral Summer Dress',
    description: 'Beautiful floral print dress, perfect for summer. Available in sizes S-XXL. Made with breathable cotton.',
    category: 'fashion',
    subcategory: 'dresses',
    price: 30000,
    compareAtPrice: 2000,
    images: ['dress1'],
    inventory: 8,
    sku: 'MN-D001',
    tags: ['dress', 'floral', 'summer', 'women'],
    status: 'active' as const,
    isOnSale: true,
    saleEndsAt: '2026-07-10T23:59:59Z',
    variants: [{ name: 'Size', options: [{ value: 'S', priceAdjustment: 0, quantity: 3 }, { value: 'M', priceAdjustment: 0, quantity: 5 }] }],
    viewCount: 234,
    addToCartCount: 45,
    purchaseCount: 12,
  },
  {
    id: 'prod-002',
    storefrontId: 'store-001',
    name: 'Leather Crossbody Bag',
    description: 'Genuine leather crossbody bag with adjustable strap. Multiple compartments.',
    category: 'fashion',
    subcategory: 'bags',
    price: 56000,
    compareAtPrice: 3500,
    images: ['bag1'],
    inventory: 5,
    sku: 'MN-B002',
    tags: ['bag', 'leather', 'crossbody', 'accessories'],
    status: 'active' as const,
    isOnSale: true,
    saleEndsAt: '2026-07-10T23:59:59Z',
    viewCount: 189,
    addToCartCount: 32,
    purchaseCount: 8,
  },
  {
    id: 'prod-003',
    storefrontId: 'store-001',
    name: 'Running Sneakers',
    description: 'Lightweight running shoes with cushioned sole. Breathable mesh upper.',
    category: 'fashion',
    subcategory: 'shoes',
    price: 64000,
    images: ['shoe1'],
    inventory: 12,
    sku: 'MN-S003',
    tags: ['shoes', 'sneakers', 'running', 'sports'],
    status: 'active' as const,
    isOnSale: false,
    viewCount: 156,
    addToCartCount: 28,
    purchaseCount: 15,
  },
  {
    id: 'prod-004',
    storefrontId: 'store-002',
    name: 'Wireless Earbuds',
    description: 'Bluetooth 5.3 wireless earbuds with 24-hour battery life. Noise cancellation.',
    category: 'electronics',
    subcategory: 'audio',
    price: 50000,
    compareAtPrice: 3200,
    images: ['earbuds1'],
    inventory: 20,
    sku: 'JE-A004',
    tags: ['earbuds', 'wireless', 'bluetooth', 'audio'],
    status: 'active' as const,
    isOnSale: true,
    saleEndsAt: '2026-07-07T23:59:59Z',
    viewCount: 412,
    addToCartCount: 67,
    purchaseCount: 23,
  },
  {
    id: 'prod-005',
    storefrontId: 'store-002',
    name: 'Phone Charger (Fast Charge)',
    description: '65W fast charger with USB-C cable. Compatible with all smartphones.',
    category: 'electronics',
    subcategory: 'accessories',
    price: 16000,
    images: ['charger1'],
    inventory: 35,
    sku: 'JE-C005',
    tags: ['charger', 'fast-charge', 'usb-c', 'phone'],
    status: 'active' as const,
    isOnSale: false,
    viewCount: 298,
    addToCartCount: 89,
    purchaseCount: 45,
  },
  {
    id: 'prod-006',
    storefrontId: 'store-003',
    name: 'Kitenge Wrap Dress',
    description: 'Traditional African kitenge wrap dress. Handcrafted with authentic fabric.',
    category: 'fashion',
    subcategory: 'dresses',
    price: 24000,
    compareAtPrice: 1500,
    images: ['kitenge1'],
    inventory: 15,
    sku: 'WF-D006',
    tags: ['kitenge', 'dress', 'african', 'traditional'],
    status: 'active' as const,
    isOnSale: true,
    saleEndsAt: '2026-07-07T23:59:59Z',
    viewCount: 567,
    addToCartCount: 112,
    purchaseCount: 45,
  },
  {
    id: 'prod-007',
    storefrontId: 'store-003',
    name: 'Ankara Fabric (2 meters)',
    description: 'High-quality Ankara wax print fabric. 2 meters length. Perfect for custom tailoring.',
    category: 'fashion',
    subcategory: 'fabric',
    price: 16000,
    compareAtPrice: 1000,
    images: ['ankara1'],
    inventory: 3,
    sku: 'WF-F007',
    tags: ['ankara', 'fabric', 'wax-print', 'tailoring'],
    status: 'active' as const,
    isOnSale: true,
    saleEndsAt: '2026-07-07T23:59:59Z',
    viewCount: 445,
    addToCartCount: 98,
    purchaseCount: 78,
  },
  {
    id: 'prod-008',
    storefrontId: 'store-003',
    name: 'Custom Kitenge Bag',
    description: 'Handmade bag using authentic kitenge fabric. Unique design, no two alike.',
    category: 'fashion',
    subcategory: 'bags',
    price: 30000,
    images: ['bag2'],
    inventory: 7,
    sku: 'WF-B008',
    tags: ['kitenge', 'bag', 'handmade', 'unique'],
    status: 'active' as const,
    isOnSale: false,
    viewCount: 234,
    addToCartCount: 45,
    purchaseCount: 12,
  },
];

export const sokoCategories = [
  { id: 'all', name: 'All', icon: 'grid', productCount: 8 },
  { id: 'fashion', name: 'Fashion', icon: 'shirt', productCount: 6 },
  { id: 'electronics', name: 'Electronics', icon: 'smartphone', productCount: 2 },
  { id: 'food', name: 'Food', icon: 'coffee', productCount: 0 },
  { id: 'beauty', name: 'Beauty', icon: 'sparkles', productCount: 0 },
  { id: 'home', name: 'Home', icon: 'home', productCount: 0 },
];

export const sokoCart = {
  items: [
    { productId: 'prod-001', quantity: 2, variant: { name: 'Size', value: 'M' } },
    { productId: 'prod-004', quantity: 1 },
  ],
  promoCode: null,
};

export const sokoOrders = [
  {
    id: 'order-001',
    customerId: 'u1',
    storefrontId: 'store-001',
    storefrontName: "Mama Nuru's Boutique",
    items: [
      { productId: 'prod-001', name: 'Floral Summer Dress', price: 30000, quantity: 2, image: 'dress1' },
    ],
    subtotal: 60000,
    deliveryFee: 3000,
    discount: 0,
    total: 63000,
    deliveryAddress: { name: 'Wanjiku M.', phone: '0712345678', address: 'Kawangware, House 12' },
    deliveryMethod: 'courier' as const,
    deliveryStatus: 'delivered',
    estimatedDelivery: '2026-07-05',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid' as const,
    status: 'delivered' as const,
    source: 'app' as const,
    createdAt: '2026-06-15T10:30:00Z',
    updatedAt: '2026-07-01T14:00:00Z',
  },
  {
    id: 'order-002',
    customerId: 'u1',
    storefrontId: 'store-003',
    storefrontName: "Wanjiku's Fabrics",
    items: [
      { productId: 'prod-006', name: 'Kitenge Wrap Dress', price: 24000, quantity: 1, image: 'kitenge1' },
      { productId: 'prod-007', name: 'Ankara Fabric (2 meters)', price: 16000, quantity: 3, image: 'ankara1' },
    ],
    subtotal: 72000,
    deliveryFee: 2000,
    discount: 0,
    total: 74000,
    deliveryAddress: { name: 'Wanjiku M.', phone: '0712345678', address: 'Kawangware, House 12' },
    deliveryMethod: 'pickup' as const,
    deliveryStatus: 'ready',
    estimatedDelivery: '2026-07-04',
    paymentMethod: 'mpesa',
    paymentStatus: 'paid' as const,
    status: 'ready' as const,
    source: 'app' as const,
    createdAt: '2026-07-02T09:00:00Z',
    updatedAt: '2026-07-02T09:00:00Z',
  },
];

export const flashSale = {
  id: 'flash-001',
  name: 'Mid-Year Mega Sale',
  productIds: ['prod-001', 'prod-004', 'prod-006', 'prod-007'],
  discountPercentage: 30,
  startsAt: '2026-07-01T00:00:00Z',
  endsAt: '2026-07-07T23:59:59Z',
  status: 'active' as const,
  quantityLimit: 50,
};

export const productReviews = [
  {
    id: 'rev-001',
    productId: 'prod-001',
    customerName: 'Achieng O.',
    rating: 5,
    reviewText: 'Love this dress! The fabric is great quality and fits perfectly. Will definitely buy again.',
    photos: [],
    verifiedPurchase: true,
    createdAt: '2026-06-20T14:00:00Z',
  },
  {
    id: 'rev-002',
    productId: 'prod-001',
    customerName: 'Fatuma A.',
    rating: 4,
    reviewText: 'Beautiful dress but runs slightly small. Order one size up.',
    photos: [],
    verifiedPurchase: true,
    createdAt: '2026-06-18T10:00:00Z',
  },
  {
    id: 'rev-003',
    productId: 'prod-006',
    customerName: 'Jane K.',
    rating: 5,
    reviewText: 'Authentic kitenge fabric! The colors are vibrant and the tailoring is excellent.',
    photos: [],
    verifiedPurchase: true,
    createdAt: '2026-06-25T16:00:00Z',
  },
];

export const sokoFavorites = ['prod-001', 'prod-004', 'prod-006'];
