import { Shield, AlertTriangle, HelpCircle, FileText } from 'lucide-react';
import { useTrustScore } from '../trust/useTrustScore';
import TrustScoreCard from '../components/trust/TrustScoreCard';
import ScoreBreakdown from '../components/trust/ScoreBreakdown';
import ScoreHistory from '../components/trust/ScoreHistory';
import WhatIfSimulator from '../components/trust/WhatIfSimulator';
import ScoreEvents from '../components/trust/ScoreEvents';

export default function TrustScore() {
  const { result, factors, history, events, explanations, eligibility, loading, error } = useTrustScore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-text3">Loading Trust Score...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-coral">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Shield className="w-6 h-6 text-ocean" />
          Trust Score
        </h1>
        <p className="text-text2 text-sm mt-1">Your alternative credit profile across all TWENDE products</p>
      </div>

      {/* Score card + Breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrustScoreCard result={result} />
        <ScoreBreakdown result={result} />
      </div>

      {/* History + Simulator row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreHistory history={history} currentScore={result.score} />
        <WhatIfSimulator factors={factors} currentResult={result} />
      </div>

      {/* Events + Explanations row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreEvents events={events} />

        {/* Why is my score X? */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-ocean" />
            <div>
              <h2 className="text-base font-semibold text-text">Why is my score {result.score}?</h2>
              <p className="text-xs text-text3">Explanation of your score factors</p>
            </div>
          </div>
          <div className="space-y-3">
            {explanations.map((exp, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-bg rounded-lg">
                <div className="w-5 h-5 rounded-full bg-ocean/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-ocean">{i + 1}</span>
                </div>
                <p className="text-sm text-text">{exp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loan Eligibility */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-sunrise" />
          <div>
            <h2 className="text-base font-semibold text-text">Loan Eligibility</h2>
            <p className="text-xs text-text3">Pre-qualified offers based on your Trust Score</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-bg rounded-lg">
            <p className="text-xs text-text3 mb-1">Max Amount</p>
            <p className="text-xl font-bold text-text">KES {eligibility.maxAmount.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-bg rounded-lg">
            <p className="text-xs text-text3 mb-1">Interest Rate</p>
            <p className="text-xl font-bold text-sunrise">{eligibility.interestRate}% APR</p>
          </div>
          <div className="p-4 bg-bg rounded-lg">
            <p className="text-xs text-text3 mb-1">Tenure Options</p>
            <p className="text-xl font-bold text-text">{eligibility.tenureOptions.join(', ')} months</p>
          </div>
          <div className="p-4 bg-bg rounded-lg">
            <p className="text-xs text-text3 mb-1">Monthly Payment</p>
            <p className="text-xl font-bold text-text">KES {eligibility.monthlyRepayment.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4">
          {eligibility.approved ? (
            <div className="p-3 bg-fresh/10 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-fresh rounded-full" />
              <span className="text-sm text-fresh font-medium">{eligibility.reasons[0]}</span>
            </div>
          ) : (
            <div className="p-3 bg-coral/10 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-coral mt-0.5" />
              <div>
                <span className="text-sm text-coral font-medium">Not currently eligible</span>
                <ul className="mt-1 space-y-1">
                  {eligibility.reasons.map((r, i) => (
                    <li key={i} className="text-xs text-text2">• {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
