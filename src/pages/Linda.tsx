import {
  Shield, CheckCircle, Clock, Heart, Users,
  Store, TrendingUp, AlertTriangle, ChevronRight
} from 'lucide-react';
import { lindaPolicies } from '../data/mockData';

const claimHistory = [
  { id: 'cl1', policy: 'Seller Shield', type: 'Inventory damage', amount: 12000, status: 'approved', date: '2026-05-15', paidAt: '2026-05-16' },
  { id: 'cl2', policy: 'Gig Accident Cover', type: 'Hospitalization', amount: 15000, status: 'approved', date: '2026-03-22', paidAt: '2026-03-23' },
];

export default function Linda() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Shield className="w-6 h-6 text-linda" />
          Twende Linda
        </h1>
        <p className="text-text2 text-sm mt-1">Protection for every part of your life</p>
      </div>

      {/* Coverage Summary */}
      <div className="bg-gradient-to-r from-linda to-linda/70 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">Total Coverage</h2>
            <p className="text-sm text-white/70">Across {lindaPolicies.length} active policies</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              KES {(lindaPolicies.reduce((a, p) => a + p.coverage, 0)).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {lindaPolicies.map((p) => (
            <div key={p.id} className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-white/60">{p.type}</p>
              <p className="text-lg font-bold">KES {p.coverage.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Policies */}
      <div>
        <h3 className="text-base font-semibold text-text mb-3">Your Policies</h3>
        <div className="space-y-3">
          {lindaPolicies.map((policy) => (
            <div key={policy.id} className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    policy.color === 'ocean' ? 'bg-ocean/10' :
                    policy.color === 'kazi' ? 'bg-kazi/10' :
                    'bg-soko/10'
                  }`}>
                    {policy.icon === 'shield' && <Shield className={`w-5 h-5 text-${policy.color}`} />}
                    {policy.icon === 'users' && <Users className={`w-5 h-5 text-${policy.color}`} />}
                    {policy.icon === 'store' && <Store className={`w-5 h-5 text-${policy.color}`} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{policy.type}</p>
                    <p className="text-xs text-text3">Via {policy.product}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-fresh/10 text-fresh text-xs font-medium rounded-full">
                  {policy.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-2 bg-bg rounded-lg text-center">
                  <p className="text-xs text-text3">Premium</p>
                  <p className="text-sm font-semibold text-text">KES {policy.premium}</p>
                  <p className="text-[10px] text-text3">{policy.frequency}</p>
                </div>
                <div className="p-2 bg-bg rounded-lg text-center">
                  <p className="text-xs text-text3">Coverage</p>
                  <p className="text-sm font-semibold text-text">KES {policy.coverage.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-bg rounded-lg text-center">
                  <p className="text-xs text-text3">Claims</p>
                  <p className="text-sm font-semibold text-text">{policy.claims}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-linda text-white rounded-lg text-xs font-medium hover:bg-linda/80 transition-colors">
                  File Claim
                </button>
                <button className="flex-1 py-2 border border-border text-text rounded-lg text-xs font-medium hover:bg-bg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim History */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-base font-semibold text-text mb-4">Claim History</h3>
        <div className="space-y-3">
          {claimHistory.map((claim) => (
            <div key={claim.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className="w-10 h-10 rounded-full bg-fresh/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-fresh" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">{claim.type}</p>
                <p className="text-xs text-text3">{claim.policy} · Filed {claim.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-fresh">KES {claim.amount.toLocaleString()}</p>
                <p className="text-xs text-text3 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Paid in 24hrs
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Score */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text">Your Risk Profile</h3>
          <TrendingUp className="w-4 h-4 text-fresh" />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-fresh/10 flex items-center justify-center">
            <Heart className="w-7 h-7 text-fresh" />
          </div>
          <div>
            <p className="text-lg font-bold text-text">Low Risk</p>
            <p className="text-sm text-text2">Your consistent payments and zero fraud history keep premiums low</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Payment History', score: 95 },
            { label: 'Claim History', score: 90 },
            { label: 'Platform Activity', score: 88 },
            { label: 'KYC Verification', score: 100 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-text3 w-28">{item.label}</span>
              <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                <div className="h-full bg-fresh rounded-full" style={{ width: `${item.score}%` }} />
              </div>
              <span className="text-xs font-medium text-text w-8">{item.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Available Policies */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-base font-semibold text-text mb-3">Available for You</h3>
        <div className="p-4 bg-bg rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-sunrise mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text">Crop Insurance</p>
            <p className="text-xs text-text2 mt-1">
              Parametric crop cover for smallholder farmers. Automatic payout when satellite data confirms drought or flood.
            </p>
            <p className="text-xs text-text3 mt-1">From KES 200/season · Coverage up to KES 50,000</p>
          </div>
          <ChevronRight className="w-4 h-4 text-text3" />
        </div>
      </div>
    </div>
  );
}
