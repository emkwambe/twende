import { useState } from 'react';
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
  CreditCard, CheckCircle, Clock, AlertCircle, Building2
} from 'lucide-react';
import { biasharaProfile, biasharaTransactions } from '../data/mockData';

export default function Biashara() {
  const [showLoanApply, setShowLoanApply] = useState(false);
  const [loanAmount, setLoanAmount] = useState(10000);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Wallet className="w-6 h-6 text-sunrise" />
          Twende Biashara
        </h1>
        <p className="text-text2 text-sm mt-1">MSME credit and business tools</p>
      </div>

      {/* Business Card */}
      <div className="bg-gradient-to-r from-sunrise to-sunrise-light rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{biasharaProfile.businessName}</h2>
              <p className="text-sm text-white/70">{biasharaProfile.category}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Active Merchant</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-white/60 mb-1">Monthly Revenue</p>
            <p className="text-xl font-bold">KES {biasharaProfile.monthlyRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Credit Limit</p>
            <p className="text-xl font-bold">KES {biasharaProfile.loanLimit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Available Credit</p>
            <p className="text-xl font-bold">KES {biasharaProfile.availableCredit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Active Loan */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text">Active Loan</h3>
          <span className="px-2 py-0.5 bg-fresh/10 text-fresh text-xs font-medium rounded-full">On Track</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-text3 mb-1">Principal</p>
            <p className="text-lg font-bold text-text">KES {biasharaProfile.activeLoan.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-text3 mb-1">Repaid</p>
            <p className="text-lg font-bold text-fresh">KES {biasharaProfile.activeLoan.repaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-text3 mb-1">Remaining</p>
            <p className="text-lg font-bold text-sunrise">KES {biasharaProfile.activeLoan.remaining.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-text3 mb-1">Interest Rate</p>
            <p className="text-lg font-bold text-text">{biasharaProfile.activeLoan.interestRate}% APR</p>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text3">Repayment Progress</span>
            <span className="font-medium text-text">{biasharaProfile.activeLoan.progress}%</span>
          </div>
          <div className="h-2.5 bg-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sunrise to-sunrise-light rounded-full transition-all"
              style={{ width: `${biasharaProfile.activeLoan.progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-bg rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-text3" />
            <span className="text-sm text-text">Next payment: <span className="font-semibold">KES {biasharaProfile.activeLoan.nextPayment.toLocaleString()}</span></span>
          </div>
          <span className="text-xs text-text3">Due {biasharaProfile.activeLoan.dueDate}</span>
        </div>
      </div>

      {/* Apply for Loan */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-text">Need More Capital?</h3>
            <p className="text-xs text-text3">Pre-qualified based on your credit score and sales data</p>
          </div>
          <button
            onClick={() => setShowLoanApply(!showLoanApply)}
            className="px-4 py-2 bg-sunrise text-white rounded-lg text-sm font-medium hover:bg-sunrise-dark transition-colors"
          >
            {showLoanApply ? 'Cancel' : 'Apply Now'}
          </button>
        </div>

        {showLoanApply && (
          <div className="mt-4 p-4 bg-bg rounded-lg animate-scale-in">
            <div className="mb-4">
              <label className="text-sm font-medium text-text mb-2 block">Loan Amount (KES)</label>
              <input
                type="range"
                min="5000"
                max={biasharaProfile.loanLimit}
                step="1000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-sunrise"
              />
              <div className="flex justify-between text-xs text-text3 mt-1">
                <span>KES 5,000</span>
                <span className="text-lg font-bold text-sunrise">KES {loanAmount.toLocaleString()}</span>
                <span>KES {biasharaProfile.loanLimit.toLocaleString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="p-2 bg-surface rounded-lg">
                <p className="text-xs text-text3">Interest</p>
                <p className="text-sm font-semibold text-text">24% APR</p>
              </div>
              <div className="p-2 bg-surface rounded-lg">
                <p className="text-xs text-text3">Term</p>
                <p className="text-sm font-semibold text-text">3 months</p>
              </div>
              <div className="p-2 bg-surface rounded-lg">
                <p className="text-xs text-text3">Monthly Payment</p>
                <p className="text-sm font-semibold text-text">~KES {Math.round(loanAmount * 1.06 / 3).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLoanApply(false)}
              className="w-full py-3 bg-sunrise text-white rounded-lg text-sm font-medium hover:bg-sunrise-dark transition-colors"
            >
              Submit Application
            </button>
            <p className="text-xs text-text3 text-center mt-2">Approval in under 5 minutes. Funds sent to your M-Pesa.</p>
          </div>
        )}
      </div>

      {/* Credit History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-base font-semibold text-text mb-4">Credit Score Trend</h3>
          <div className="flex items-end gap-2 h-40">
            {biasharaProfile.creditHistory.map((item, i) => {
              const height = ((item.score - 500) / 200) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-bg rounded-t-md relative" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-sunrise/80 transition-all"
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text3">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 p-2 bg-fresh/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-fresh" />
            <span className="text-xs text-text">Score improved 70 points in 6 months</span>
          </div>
        </div>

        {/* Loan History */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-base font-semibold text-text mb-4">Loan History</h3>
          <div className="space-y-3">
            {biasharaTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  tx.type === 'loan_disbursement' ? 'bg-sunrise/10' : 'bg-fresh/10'
                }`}>
                  {tx.type === 'loan_disbursement' ? (
                    <CreditCard className="w-4 h-4 text-sunrise" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-fresh" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text">{tx.description}</p>
                  <p className="text-xs text-text3">{tx.date}</p>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'repayment' ? 'text-fresh' : 'text-text'}`}>
                  {tx.type === 'repayment' ? '-' : '+'}
                  KES {tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
