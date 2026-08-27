import { useState } from 'react';
import {
  Users, Plus, ArrowUpRight, Clock, CheckCircle,
  Wallet, TrendingUp, ChevronRight, CircleDollarSign, Loader2
} from 'lucide-react';
import { myChamas, chamaTransactions, chamaLoans, currentUser } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { useMyGroups } from '../hooks/useGroups';
import { formatCurrency, getCountryConfig } from '../lib/country';

export default function Chama() {
  const { user } = useAuth();
  const { data: apiGroups, isLoading, error } = useMyGroups();

  const countryCode = (user?.country as 'KE' | 'TZ') || 'TZ';
  const countryCfg = getCountryConfig(countryCode);

  const [activeChama, setActiveChama] = useState(0);
  const chama = myChamas[activeChama];
  const [showContribute, setShowContribute] = useState(false);
  const [contributeAmount, setContributeAmount] = useState(chama.contributionAmount);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Users className="w-6 h-6 text-ocean" />
            Twende {countryCfg.groupTypeDefault === 'chama' ? 'Chama' : 'VICOBA'}
          </h1>
          <p className="text-text2 text-sm mt-1">Community savings, transparent and digital</p>
        </div>
        <button
          onClick={() => setShowContribute(!showContribute)}
          className="flex items-center gap-2 px-4 py-2.5 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Contribute
        </button>
      </div>

      {/* Real groups from API */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text mb-3">Your groups ({countryCfg.name})</h3>
        {isLoading ? (
          <div className="flex items-center gap-2 text-text2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading groups...
          </div>
        ) : error ? (
          <p className="text-sm text-coral">Failed to load groups.</p>
        ) : apiGroups && apiGroups.length > 0 ? (
          <div className="space-y-2">
            {apiGroups.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-bg">
                <div>
                  <p className="text-sm font-medium text-text">{g.name}</p>
                  <p className="text-xs text-text3">
                    {g.group_type} · {g.member_count} members · {formatCurrency(Number(g.total_savings), countryCode)}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-fresh/10 text-fresh">{g.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text2">You are not a member of any group yet.</p>
        )}
      </div>

      {/* Chama Selector (mock data) */}
      <div className="flex gap-2">
        {myChamas.map((c, i) => (
          <button
            key={c.id}
            onClick={() => { setActiveChama(i); setContributeAmount(c.contributionAmount); setShowContribute(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeChama === i
                ? 'bg-ocean text-white shadow-sm'
                : 'bg-surface text-text2 border border-border hover:text-text'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Contribute Modal */}
      {showContribute && (
        <div className="bg-surface rounded-xl border border-fresh/30 shadow-lg p-5 animate-scale-in">
          <h3 className="text-lg font-semibold text-text mb-4">Make Contribution</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-text3 mb-1">Group Balance</p>
              <p className="text-lg font-bold text-text">{formatCurrency(chama.totalBalance, countryCode)}</p>
            </div>
            <div>
              <p className="text-xs text-text3 mb-1">Your Share</p>
              <p className="text-lg font-bold text-text">{formatCurrency(chama.myBalance, countryCode)}</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium text-text mb-2 block">Amount ({countryCfg.currency})</label>
            <input
              type="number"
              value={contributeAmount}
              onChange={(e) => setContributeAmount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-border text-lg font-bold text-text focus:outline-none focus:ring-2 focus:ring-fresh/50"
            />
            <div className="flex gap-2 mt-2">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setContributeAmount(amt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    contributeAmount === amt ? 'bg-fresh text-white' : 'bg-bg text-text2 hover:text-text'
                  }`}
                >
                  {countryCfg.currencySymbol} {amt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowContribute(false)}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowContribute(false)}
              className="flex-1 px-4 py-2.5 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors animate-pulse-green"
            >
              Pay via M-Pesa
            </button>
          </div>
          <p className="text-xs text-text3 mt-3 text-center">
            You will receive an STK Push on {currentUser.phone}. Enter your M-Pesa PIN to confirm.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-ocean" />
            <span className="text-xs text-text3">Total Savings</span>
          </div>
          <p className="text-xl font-bold text-text">{formatCurrency(chama.totalBalance, countryCode)}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-ocean" />
            <span className="text-xs text-text3">Members</span>
          </div>
          <p className="text-xl font-bold text-text">{chama.memberCount}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-fresh" />
            <span className="text-xs text-text3">Monthly Progress</span>
          </div>
          <p className="text-xl font-bold text-text">{chama.progress}%</p>
        </div>
        <div className="bg-surface rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-fresh" />
            <span className="text-xs text-text3">Verified Orders</span>
          </div>
          <p className="text-xl font-bold text-text">{chama.completedOrders}</p>
        </div>
      </div>

      {/* Progress + Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-base font-semibold text-text mb-4">Monthly Target</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="#0A2463"
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${chama.progress * 2.64} 264`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-ocean">{chama.progress}%</span>
                <span className="text-xs text-text3">of {formatCurrency(chama.monthlyTarget, countryCode)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text3">Collected</span>
              <span className="font-medium text-text">{formatCurrency(chama.monthlyTarget * chama.progress / 100, countryCode)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text3">Remaining</span>
              <span className="font-medium text-text">{formatCurrency(chama.monthlyTarget * (100 - chama.progress) / 100, countryCode)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text3">Next due</span>
              <span className="font-medium text-sunrise">{chama.nextDue}</span>
            </div>
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-text">Group Loans</h3>
            <span className="text-xs text-text3">{chamaLoans.filter(l => l.status === 'active').length} active</span>
          </div>
          <div className="space-y-3">
            {chamaLoans.map((loan) => (
              <div key={loan.id} className="p-3 rounded-lg bg-bg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4 text-ocean" />
                    <span className="text-sm font-medium text-text">{loan.borrower}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    loan.status === 'active' ? 'bg-sunrise/10 text-sunrise' : 'bg-fresh/10 text-fresh'
                  }`}>
                    {loan.status === 'active' ? 'Active' : 'Repaid'}
                  </span>
                </div>
                <p className="text-xs text-text3 mb-2">{loan.purpose}</p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ocean rounded-full transition-all"
                        style={{ width: `${(loan.repaid / loan.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-text">
                    {formatCurrency(loan.repaid, countryCode)} / {formatCurrency(loan.total, countryCode)}
                  </span>
                </div>
                {loan.status === 'active' && (
                  <p className="text-xs text-text3 mt-1">Due: {loan.dueDate}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-base font-semibold text-text mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {chamaTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                tx.type === 'contribution' ? 'bg-fresh/10' :
                tx.type === 'loan_repayment' ? 'bg-ocean/10' :
                tx.type === 'loan_disbursement' ? 'bg-sunrise/10' :
                'bg-coral/10'
              }`}>
                {tx.type === 'contribution' && <ArrowUpRight className="w-4 h-4 text-fresh" />}
                {tx.type === 'loan_repayment' && <CheckCircle className="w-4 h-4 text-ocean" />}
                {tx.type === 'loan_disbursement' && <Wallet className="w-4 h-4 text-sunrise" />}
                {tx.type === 'penalty' && <Clock className="w-4 h-4 text-coral" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text capitalize">{tx.type.replace('_', ' ')}</p>
                <p className="text-xs text-text3">{tx.member} · {tx.date}</p>
              </div>
              <span className={`text-sm font-semibold ${
                tx.type === 'contribution' || tx.type === 'loan_repayment' ? 'text-fresh' :
                tx.type === 'penalty' ? 'text-coral' : 'text-text'
              }`}>
                {tx.type === 'contribution' || tx.type === 'loan_repayment' ? '+' : ''}
                {formatCurrency(tx.amount, countryCode)}
              </span>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 py-2 text-sm text-ocean font-medium hover:bg-ocean/5 rounded-lg transition-colors">
          View All Transactions <ChevronRight className="w-4 h-4 inline" />
        </button>
      </div>
    </div>
  );
}
