import { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import type { TrustScoreFactors, TrustScoreResult } from '../../trust/types';
import { calculateTrustScore, simulateScenario, SIMULATOR_SCENARIOS } from '../../trust/algorithm';
import { getTierColor } from '../../trust/algorithm';

interface WhatIfSimulatorProps {
  factors: TrustScoreFactors;
  currentResult: TrustScoreResult;
}

export default function WhatIfSimulator({ factors, currentResult }: WhatIfSimulatorProps) {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [customSavings, setCustomSavings] = useState(5000);
  const [customRepayment, setCustomRepayment] = useState(10);

  const simulation = selectedScenario !== null
    ? simulateScenario(factors, SIMULATOR_SCENARIOS[selectedScenario])
    : null;

  const color = getTierColor(currentResult.score);
  const projectedColor = simulation ? getTierColor(simulation.projectedScore) : color;

  const runCustomSimulation = () => {
    const modified: TrustScoreFactors = {
      ...factors,
      chama: { ...factors.chama, savingsVolume: Math.min(100, factors.chama.savingsVolume + customSavings / 500) },
      loans: { ...factors.loans, repaymentRate: Math.min(100, factors.loans.repaymentRate + customRepayment) },
    };
    const projected = calculateTrustScore(modified);
    return {
      currentScore: currentResult.score,
      projectedScore: projected.score,
      delta: projected.score - currentResult.score,
      projectedTier: projected.tier,
    };
  };

  const customSim = runCustomSimulation();

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-sunrise" />
        <div>
          <h2 className="text-base font-semibold text-text">What-If Simulator</h2>
          <p className="text-xs text-text3">See how actions could improve your score</p>
        </div>
      </div>

      {/* Scenario buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
        {SIMULATOR_SCENARIOS.map((scenario, i) => (
          <button
            key={scenario.name}
            onClick={() => setSelectedScenario(i)}
            className={`p-3 rounded-lg text-left text-sm transition-all ${
              selectedScenario === i
                ? 'bg-ocean/10 border border-ocean/30 text-ocean'
                : 'bg-bg border border-border text-text hover:border-ocean/30'
            }`}
          >
            <span className="font-medium">{scenario.name}</span>
            <p className="text-xs text-text3 mt-0.5">{scenario.description}</p>
          </button>
        ))}
      </div>

      {/* Custom sliders */}
      <div className="bg-bg rounded-lg p-4 mb-5">
        <p className="text-sm font-medium text-text mb-3">Custom Adjustments</p>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text3">Extra monthly chama savings</span>
              <span className="font-medium text-text">KES {customSavings.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20000"
              step="500"
              value={customSavings}
              onChange={(e) => setCustomSavings(Number(e.target.value))}
              className="w-full accent-ocean"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text3">Improve loan repayment rate</span>
              <span className="font-medium text-text">+{customRepayment}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={customRepayment}
              onChange={(e) => setCustomRepayment(Number(e.target.value))}
              className="w-full accent-ocean"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-bg rounded-lg p-4">
        <p className="text-sm font-medium text-text mb-3">Projected Outcome</p>
        <div className="flex items-center gap-4">
          {/* Current */}
          <div className="text-center flex-1">
            <p className="text-xs text-text3 mb-1">Current</p>
            <p className="text-2xl font-bold" style={{ color }}>{currentResult.score}</p>
            <p className="text-xs" style={{ color }}>{currentResult.tierName}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-text3" />
          {/* Projected */}
          <div className="text-center flex-1">
            <p className="text-xs text-text3 mb-1">Projected</p>
            <p className="text-2xl font-bold" style={{ color: projectedColor }}>
              {selectedScenario !== null ? simulation?.projectedScore : customSim.projectedScore}
            </p>
            <p className="text-xs" style={{ color: projectedColor }}>
              {selectedScenario !== null
                ? simulation?.projectedTier === currentResult.tier ? currentResult.tierName : `Tier ${simulation?.projectedTier}`
                : customSim.projectedTier === currentResult.tier ? currentResult.tierName : `Tier ${customSim.projectedTier}`}
            </p>
          </div>
        </div>
        <div className="mt-3 text-center">
          <span className="text-sm font-medium text-fresh">
            +{selectedScenario !== null ? simulation?.delta : customSim.delta} points
          </span>
          <p className="text-xs text-text3 mt-0.5">
            {selectedScenario !== null
              ? SIMULATOR_SCENARIOS[selectedScenario].description
              : `With KES ${customSavings.toLocaleString()} extra savings + ${customRepayment}% better repayment`}
          </p>
        </div>
      </div>

      <button
        onClick={() => setSelectedScenario(null)}
        className="w-full mt-3 py-2 text-xs text-text3 hover:text-text flex items-center justify-center gap-1 transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Reset to custom
      </button>
    </div>
  );
}
