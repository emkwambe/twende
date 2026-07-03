import { useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Wallet,
  ArrowUpRight, ArrowDownRight, Activity, Target, PiggyBank, Truck, FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { businessMetrics, activeLoans, savingsGoals, suppliers } from '../../data/mockData';
import { calculateTrustScore } from '../../trust/algorithm';
import { trustScoreFactors } from '../../data/mockData';

interface BusinessDashboardProps {
  onApplyLoan: () => void;
  onPaySupplier: () => void;
  onSetGoal: () => void;
}

export default function BusinessDashboard({ onApplyLoan, onPaySupplier, onSetGoal }: BusinessDashboardProps) {
  const [chartPeriod, setChartPeriod] = useState<'revenue' | 'profit'>('revenue');
  const trustResult = calculateTrustScore(trustScoreFactors);

  const totalRevenue = businessMetrics.daily.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = businessMetrics.daily.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const chartData = businessMetrics.daily.map((d, i) => ({
    day: `${i + 1}`,
    revenue: d.revenue,
    expenses: d.expenses,
    profit: d.profit,
  }));

  const healthColor = businessMetrics.healthScore >= 70 ? 'text-fresh' : businessMetrics.healthScore >= 50 ? 'text-sunrise' : 'text-coral';
  const healthBg = businessMetrics.healthScore >= 70 ? 'bg-fresh/10' : businessMetrics.healthScore >= 50 ? 'bg-sunrise/10' : 'bg-coral/10';

  return (
    <div className="space-y-6">
      {/* Health Score Banner */}
      <div className={`p-4 rounded-xl ${healthBg} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Activity className={`w-5 h-5 ${healthColor}`} />
          <div>
            <p className="text-sm font-semibold text-text">Business Health Score: {businessMetrics.healthScore}/100</p>
            <p className="text-xs text-text2">
              {businessMetrics.healthScore >= 70 ? 'Your business is performing well!' : 'Room for improvement in profitability'}
            </p>
          </div>
        </div>
        <div className={`text-2xl font-bold ${healthColor}`}>{businessMetrics.healthScore}</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text3">30-Day Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-fresh/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-fresh" />
            </div>
          </div>
          <p className="text-xl font-bold text-text">KES {totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-fresh" />
            <span className="text-xs text-fresh">+{(businessMetrics.revenueGrowth * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text3">30-Day Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-coral" />
            </div>
          </div>
          <p className="text-xl font-bold text-text">KES {totalExpenses.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-coral" />
            <span className="text-xs text-coral">+{(businessMetrics.expenseGrowth * 100).toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text3">Profit Margin</span>
            <div className="w-8 h-8 rounded-lg bg-ocean/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-ocean" />
            </div>
          </div>
          <p className="text-xl font-bold text-text">{(businessMetrics.profitMargin * 100).toFixed(1)}%</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-fresh" />
            <span className="text-xs text-fresh">+{(businessMetrics.marginGrowth * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text">Revenue & Expenses (30 Days)</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartPeriod('revenue')}
              className={`px-3 py-1 rounded-lg text-xs ${chartPeriod === 'revenue' ? 'bg-sunrise text-white' : 'bg-bg text-text3'}`}
            >
              Revenue
            </button>
            <button
              onClick={() => setChartPeriod('profit')}
              className={`px-3 py-1 rounded-lg text-xs ${chartPeriod === 'profit' ? 'bg-fresh text-white' : 'bg-bg text-text3'}`}
            >
              Profit
            </button>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={{ stroke: '#E5E7EB' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              />
              {chartPeriod === 'revenue' ? (
                <>
                  <Area type="monotone" dataKey="revenue" stroke="#2ECC71" fill="#2ECC71" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" stroke="#E74C3C" fill="#E74C3C" fillOpacity={0.1} strokeWidth={2} />
                </>
              ) : (
                <Area type="monotone" dataKey="profit" stroke="#0A2463" fill="#0A2463" fillOpacity={0.1} strokeWidth={2} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={onApplyLoan} className="p-4 bg-sunrise/10 rounded-xl text-left hover:bg-sunrise/20 transition-colors">
          <Wallet className="w-5 h-5 text-sunrise mb-2" />
          <p className="text-sm font-medium text-text">Apply Loan</p>
          <p className="text-xs text-text3">Up to KES {trustResult.maxLoanAmount.toLocaleString()}</p>
        </button>
        <button onClick={onPaySupplier} className="p-4 bg-ocean/10 rounded-xl text-left hover:bg-ocean/20 transition-colors">
          <Truck className="w-5 h-5 text-ocean mb-2" />
          <p className="text-sm font-medium text-text">Pay Supplier</p>
          <p className="text-xs text-text3">{suppliers.length} saved</p>
        </button>
        <button onClick={onSetGoal} className="p-4 bg-fresh/10 rounded-xl text-left hover:bg-fresh/20 transition-colors">
          <Target className="w-5 h-5 text-fresh mb-2" />
          <p className="text-sm font-medium text-text">Set Goal</p>
          <p className="text-xs text-text3">{savingsGoals.length} active</p>
        </button>
        <button className="p-4 bg-linda/10 rounded-xl text-left hover:bg-linda/20 transition-colors">
          <FileText className="w-5 h-5 text-linda mb-2" />
          <p className="text-sm font-medium text-text">Reports</p>
          <p className="text-xs text-text3">Monthly PDF</p>
        </button>
      </div>

      {/* Active Loans */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-4">Active Loans</h3>
        <div className="space-y-3">
          {activeLoans.map((loan) => (
            <div key={loan.id} className="p-4 bg-bg rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-text">{loan.productName}</p>
                  <p className="text-xs text-text3">KES {loan.principal.toLocaleString()} · {loan.tenureWeeks} weeks</p>
                </div>
                <span className="px-2 py-0.5 bg-fresh/10 text-fresh text-xs rounded-full">{loan.status}</span>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text3">Repayment Progress</span>
                  <span className="text-text">{loan.progress}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-sunrise rounded-full transition-all" style={{ width: `${loan.progress}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-text3">
                  Balance: <span className="font-medium text-text">KES {loan.remainingBalance.toLocaleString()}</span>
                </div>
                <div className="text-xs text-text3">
                  Next: <span className="font-medium text-sunrise">KES {loan.nextDueAmount.toLocaleString()}</span> · {loan.nextDueDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Goals */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <h3 className="text-base font-semibold text-text mb-4">Savings Goals</h3>
        <div className="space-y-3">
          {savingsGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id} className="p-4 bg-bg rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-fresh" />
                    <span className="text-sm font-medium text-text">{goal.name}</span>
                  </div>
                  <span className="text-xs text-text3">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-fresh rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text3">KES {goal.currentAmount.toLocaleString()} of KES {goal.targetAmount.toLocaleString()}</span>
                  <span className="text-text3">Auto-save: {goal.autoDeductPercentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
