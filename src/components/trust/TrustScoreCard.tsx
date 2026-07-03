import { useEffect, useState } from 'react';
import { TrendingUp, Shield, Award } from 'lucide-react';
import type { TrustScoreResult } from '../../trust/types';
import { getTierColor } from '../../trust/algorithm';

interface TrustScoreCardProps {
  result: TrustScoreResult;
  size?: number;
  showDetails?: boolean;
}

export default function TrustScoreCard({ result, size = 200, showDetails = true }: TrustScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(300);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((animatedScore - 300) / 550) * circumference;
  const color = getTierColor(result.score);

  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const from = 300;
    const to = result.score;

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [result.score]);

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text">Trust Score</h2>
          <p className="text-xs text-text3">7-factor alternative credit scoring</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg">
          <Award className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-xs font-medium" style={{ color }}>
            {result.tierName}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Circular Gauge */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              className="transition-all duration-1000"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-text">{animatedScore}</span>
            <span className="text-xs text-text3 mt-0.5">of 850</span>
          </div>
        </div>

        {/* Tier badge */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {result.tierName} Tier
          </div>
          <span className="text-xs text-text3">{result.tier}/4</span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-5 space-y-3">
          {/* Loan eligibility summary */}
          <div className="p-3 bg-bg rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text3">Max Loan</span>
              <span className="text-sm font-bold text-text">
                KES {result.maxLoanAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text3">Interest Rate</span>
              <span className="text-sm font-bold text-sunrise">{result.interestRate}% APR</span>
            </div>
          </div>

          {/* Unlocked features */}
          <div>
            <p className="text-xs text-text3 mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Unlocked Features
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.unlockedFeatures.slice(0, 4).map((feature) => (
                <span
                  key={feature}
                  className="px-2 py-0.5 bg-fresh/10 text-fresh text-[10px] rounded-full"
                >
                  {feature}
                </span>
              ))}
              {result.unlockedFeatures.length > 4 && (
                <span className="px-2 py-0.5 bg-bg text-text3 text-[10px] rounded-full">
                  +{result.unlockedFeatures.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Score trend */}
          <div className="flex items-center gap-2 p-2 bg-fresh/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-fresh" />
            <span className="text-xs text-text">
              Score improved by {result.score - 580} points in 6 months
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
