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

// TRUST ENGINE DATA (Sprint 05)
export const trustScoreFactors = {
  chama: {
    contributionConsistency: 85,   // 85% on-time contributions
    savingsVolume: 72,              // KES 108K saved across chamas
    groupTenure: 18,                // 18 months in chamas
    leadershipRole: true,           // Treasurer of Mbele Savings
  },
  mpesa: {
    transactionVolume: 65,           // Moderate monthly volume
    transactionFrequency: 70,       // ~10 transactions/week
    balanceStability: 55,           // Some variation
    airtimePurchase: 90,             // Consistent small purchases
  },
  soko: {
    gmv: 68,                         // KES 68K monthly GMV
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
  { id: 'e1', eventType: 'chama_contribution', factor: 'chama', oldScore: 645, newScore: 648, delta: 3, reason: 'Monthly contribution to Nyota Chama: KES 2,000', createdAt: '2026-07-01T10:30:00Z' },
  { id: 'e2', eventType: 'loan_repayment', factor: 'loans', oldScore: 642, newScore: 645, delta: 3, reason: 'Early loan repayment: KES 3,750', createdAt: '2026-06-15T14:20:00Z' },
  { id: 'e3', eventType: 'soko_sale', factor: 'soko', oldScore: 640, newScore: 642, delta: 2, reason: 'Completed sale: Kitenge Wrap Dress x2', createdAt: '2026-06-30T09:15:00Z' },
  { id: 'e4', eventType: 'insurance_premium', factor: 'linda', oldScore: 639, newScore: 640, delta: 1, reason: 'Linda premium paid on time: KES 50', createdAt: '2026-06-28T08:00:00Z' },
  { id: 'e5', eventType: 'chama_contribution', factor: 'chama', oldScore: 636, newScore: 639, delta: 3, reason: 'Monthly contribution to Mbele Savings: KES 5,000', createdAt: '2026-06-10T11:00:00Z' },
  { id: 'e6', eventType: 'loan_repayment', factor: 'loans', oldScore: 633, newScore: 636, delta: 3, reason: 'Monthly loan repayment: KES 3,750', createdAt: '2026-05-20T16:45:00Z' },
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
    minAmount: 5000,
    maxAmount: 500000,
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
    minAmount: 10000,
    maxAmount: 200000,
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
    minAmount: 1000,
    maxAmount: 5000,
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
    principal: 50000,
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
      { week: 1, dueDate: '2026-05-01', installment: 4617, principal: 4423, interest: 194, balance: 45577, status: 'paid' as const },
      { week: 2, dueDate: '2026-05-08', installment: 4617, principal: 4440, interest: 177, balance: 41137, status: 'paid' as const },
      { week: 3, dueDate: '2026-05-15', installment: 4617, principal: 4457, interest: 160, balance: 36680, status: 'paid' as const },
      { week: 4, dueDate: '2026-05-22', installment: 4617, principal: 4474, interest: 143, balance: 32206, status: 'paid' as const },
      { week: 5, dueDate: '2026-06-29', installment: 4617, principal: 4491, interest: 126, balance: 27715, status: 'pending' as const },
      { week: 6, dueDate: '2026-07-06', installment: 4617, principal: 4508, interest: 109, balance: 23207, status: 'pending' as const },
      { week: 7, dueDate: '2026-07-13', installment: 4617, principal: 4525, interest: 92, balance: 18682, status: 'pending' as const },
      { week: 8, dueDate: '2026-07-20', installment: 4617, principal: 4542, interest: 75, balance: 14140, status: 'pending' as const },
      { week: 9, dueDate: '2026-07-27', installment: 4617, principal: 4559, interest: 58, balance: 9581, status: 'pending' as const },
      { week: 10, dueDate: '2026-08-03', installment: 4617, principal: 4576, interest: 41, balance: 5005, status: 'pending' as const },
      { week: 11, dueDate: '2026-08-10', installment: 4617, principal: 4593, interest: 24, balance: 412, status: 'pending' as const },
      { week: 12, dueDate: '2026-08-17', installment: 414, principal: 412, interest: 2, balance: 0, status: 'pending' as const },
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
  { id: 'pay-001', supplierId: 'sup-001', amount: 35000, description: 'Kitenge fabric bulk order', date: '2026-06-15', status: 'completed' as const },
  { id: 'pay-002', supplierId: 'sup-002', amount: 22000, description: 'Ankara fabric restock', date: '2026-06-20', status: 'completed' as const },
  { id: 'pay-003', supplierId: 'sup-001', amount: 18000, description: 'Seasonal collection', date: '2026-06-25', status: 'completed' as const },
];

export const savingsGoals = [
  {
    id: 'goal-001',
    name: 'Expand Shop',
    targetAmount: 200000,
    targetDate: '2026-12-01',
    currentAmount: 80000,
    autoDeductPercentage: 5,
    status: 'active' as const,
  },
  {
    id: 'goal-002',
    name: 'New Fridge',
    targetAmount: 120000,
    targetDate: '2026-09-01',
    currentAmount: 45000,
    autoDeductPercentage: 3,
    status: 'active' as const,
  },
];

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
