// TWENDE Kazi v2 — Earnings Dashboard
// Sprint 08: Gig Worker Platform SDK

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign, PiggyBank, Shield } from 'lucide-react';
import { weeklyEarnings, monthlyEarnings } from '../../kazi/mockData';
import { calculateGigPayment } from '../../kazi/algorithm';

export default function EarningsDashboard() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const earnings = period === 'weekly' ? weeklyEarnings : monthlyEarnings;

  const chartData = earnings.data.map((d) => ({
    label: d.label,
    earnings: d.earnings,
    gigs: d.gigs,
  }));

  const paymentExample = calculateGigPayment(10000, 'medium');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <Wallet className="w-5 h-5 text-kazi" />
          Earnings
        </h2>
        <p className="text-xs text-text3">Track your income and withdrawals</p>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2">
        {(['weekly', 'monthly'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? 'bg-kazi text-white shadow-sm'
                : 'bg-surface text-text2 border border-border hover:text-text'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-kazi" />
            <span className="text-xs text-text3">Total</span>
          </div>
          <p className="text-xl font-bold text-text">KES {earnings.total.toLocaleString()}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <PiggyBank className="w-4 h-4 text-sunrise" />
            <span className="text-xs text-text3">Platform Fee</span>
          </div>
          <p className="text-xl font-bold text-text">KES {earnings.platformFees.toLocaleString()}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-linda" />
            <span className="text-xs text-text3">Insurance</span>
          </div>
          <p className="text-xl font-bold text-text">KES {earnings.insurancePremiums.toLocaleString()}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-fresh" />
            <span className="text-xs text-text3">Net Earnings</span>
          </div>
          <p className="text-xl font-bold text-fresh">KES {earnings.netEarnings.toLocaleString()}</p>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text mb-4">Earnings Trend</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Earnings']}
              />
              <Bar dataKey="earnings" fill="#1ABC9C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Breakdown Example */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text mb-3">Payment Breakdown Example</h3>
        <p className="text-xs text-text3 mb-3">For a KES 10,000 gig (medium risk):</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text2">Gig Amount</span>
            <span className="font-medium text-text">KES {paymentExample.gigAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sunrise">
            <span className="text-text2">Platform Fee (5%)</span>
            <span className="font-medium">-KES {paymentExample.platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-linda">
            <span className="text-text2">Insurance Premium</span>
            <span className="font-medium">-KES {paymentExample.insurancePremium.toLocaleString()}</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between text-base font-bold text-fresh">
            <span>Net Payment</span>
            <span>KES {paymentExample.netPayment.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button className="w-full py-3 bg-kazi text-white rounded-xl text-sm font-medium hover:bg-kazi/80 transition-colors flex items-center justify-center gap-2">
        <Wallet className="w-4 h-4" />
        Withdraw to M-Pesa
      </button>
    </div>
  );
}
