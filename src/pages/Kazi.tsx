import { useState } from 'react';
import {
  Briefcase, Shield, Bike, Heart,
  Plus, Minus, Wallet, AlertCircle
} from 'lucide-react';
import { kaziProfile, kaziWeeklyData } from '../data/mockData';

export default function Kazi() {
  const [saveRate, setSaveRate] = useState(kaziProfile.autoSaveRate);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-kazi" />
          Twende Kazi
        </h1>
        <p className="text-text2 text-sm mt-1">Gig worker financial wellness</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-r from-kazi to-kazi/70 rounded-xl p-5 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <Bike className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{kaziProfile.platform} Driver</h2>
            <p className="text-sm text-white/70">Since {kaziProfile.joinDate}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-bold">{kaziProfile.rating}</p>
            <p className="text-xs text-white/70">Rating</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60">Total Rides</p>
            <p className="text-xl font-bold">{kaziProfile.totalRides.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60">Weekly Earnings</p>
            <p className="text-xl font-bold">KES {kaziProfile.weeklyEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60">Rides This Week</p>
            <p className="text-xl font-bold">{kaziProfile.ridesThisWeek}</p>
          </div>
        </div>
      </div>

      {/* AutoSave */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-fresh/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-fresh" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">AutoSave</h3>
              <p className="text-xs text-text3">Save a % of every fare automatically</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-fresh/10 text-fresh rounded-full text-sm font-bold">
            KES {kaziProfile.autoSaveBalance.toLocaleString()}
          </span>
        </div>

        <div className="bg-bg rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setSaveRate(Math.max(1, saveRate - 1))}
              className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center hover:bg-border transition-colors"
            >
              <Minus className="w-4 h-4 text-text" />
            </button>
            <div className="text-center">
              <span className="text-3xl font-bold text-text">{saveRate}%</span>
              <p className="text-xs text-text3">of every fare</p>
            </div>
            <button
              onClick={() => setSaveRate(Math.min(20, saveRate + 1))}
              className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center hover:bg-border transition-colors"
            >
              <Plus className="w-4 h-4 text-text" />
            </button>
          </div>
          <p className="text-xs text-text2 text-center">
            At {saveRate}%, you save ~KES {Math.round(kaziProfile.weeklyEarnings * saveRate / 100).toLocaleString()} per week
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-2.5 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors">
            Withdraw Savings
          </button>
          <button className="flex-1 py-2.5 border border-border text-text rounded-lg text-sm font-medium hover:bg-bg transition-colors">
            View History
          </button>
        </div>
      </div>

      {/* Weekly Earnings Chart */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-text">This Week's Earnings</h3>
          <span className="text-sm font-medium text-kazi">KES {kaziProfile.weeklyEarnings.toLocaleString()}</span>
        </div>
        <div className="flex items-end gap-2 h-44">
          {kaziWeeklyData.map((day, i) => {
            const maxEarning = Math.max(...kaziWeeklyData.map(d => d.earnings));
            const height = (day.earnings / maxEarning) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-medium text-text">KES {day.earnings}</div>
                <div className="w-full bg-bg rounded-t-md relative" style={{ height: '120px' }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-md bg-kazi/80 transition-all"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="text-[10px] text-text3">{day.day}</div>
                <div className="text-[9px] text-text3">{day.rides} rides</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insurance */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linda/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-linda" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text">Ride Insurance</h3>
              <p className="text-xs text-text3">Accident and hospitalization cover</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${kaziProfile.insuranceActive ? 'bg-fresh/10 text-fresh' : 'bg-border text-text3'}`}>
            {kaziProfile.insuranceActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-bg rounded-lg">
            <p className="text-xs text-text3 mb-1">Coverage</p>
            <p className="text-lg font-bold text-text">KES {kaziProfile.coverageAmount.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-bg rounded-lg">
            <p className="text-xs text-text3 mb-1">Premium</p>
            <p className="text-lg font-bold text-text">KES {kaziProfile.insurancePremium}/week</p>
          </div>
        </div>

        <div className="p-3 bg-fresh/10 rounded-lg flex items-start gap-2">
          <Heart className="w-4 h-4 text-fresh mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-text">You are covered</p>
            <p className="text-xs text-text2">Every ride is insured. If you have an accident, file a claim and receive payout within 24 hours.</p>
          </div>
        </div>

        <button className="w-full mt-4 py-2.5 border border-linda text-linda rounded-lg text-sm font-medium hover:bg-linda/5 transition-colors">
          File a Claim
        </button>
      </div>

      {/* Emergency Loan */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-sunrise mt-0.5 shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-text">Emergency Loan Available</h3>
            <p className="text-xs text-text2 mt-1">
              Pre-approved for KES 10,000. Available instantly for repairs, medical needs, or emergencies.
              Repay from your ride earnings.
            </p>
            <button className="mt-3 px-4 py-2 bg-sunrise text-white rounded-lg text-sm font-medium hover:bg-sunrise-dark transition-colors">
              Get Emergency Loan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
