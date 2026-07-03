import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { TrustScoreResult } from '../../trust/types';
import { getTierColor } from '../../trust/algorithm';

interface ScoreBreakdownProps {
  result: TrustScoreResult;
}

export default function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  const data = [
    { factor: 'Chama', score: result.factors.chama, fullMark: 100 },
    { factor: 'M-Pesa', score: result.factors.mpesa, fullMark: 100 },
    { factor: 'Soko', score: result.factors.soko, fullMark: 100 },
    { factor: 'Loans', score: result.factors.loans, fullMark: 100 },
    { factor: 'Kazi', score: result.factors.kazi, fullMark: 100 },
    { factor: 'Linda', score: result.factors.linda, fullMark: 100 },
    { factor: 'KYC', score: result.factors.kyc, fullMark: 100 },
  ];

  const color = getTierColor(result.score);

  const factorDetails = [
    { key: 'chama', label: 'Chama Savings', weight: '20%', icon: '👥', desc: 'Savings behavior & group participation' },
    { key: 'mpesa', label: 'M-Pesa History', weight: '15%', icon: '📱', desc: 'Transaction volume & consistency' },
    { key: 'soko', label: 'Soko Sales', weight: '20%', icon: '🛒', desc: 'GMV, ratings & fulfillment' },
    { key: 'loans', label: 'Loan Repayment', weight: '25%', icon: '💰', desc: 'On-time repayment & utilization' },
    { key: 'kazi', label: 'Gig Work', weight: '10%', icon: '🛵', desc: 'Completed gigs & employer ratings' },
    { key: 'linda', label: 'Insurance', weight: '5%', icon: '🛡️', desc: 'Premium consistency & claims' },
    { key: 'kyc', label: 'KYC Depth', weight: '5%', icon: '🆔', desc: 'Verification tier & documents' },
  ];

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-text">7-Factor Breakdown</h2>
        <p className="text-xs text-text3">Weighted sub-scores (0-100 each)</p>
      </div>

      {/* Radar Chart */}
      <div className="h-64 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="factor"
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Factor list */}
      <div className="space-y-3">
        {factorDetails.map((detail) => {
          const score = result.factors[detail.key as keyof typeof result.factors];
          const barColor = score >= 80 ? '#2ECC71' : score >= 50 ? '#FF6B35' : '#E74C3C';
          return (
            <div key={detail.key} className="flex items-center gap-3">
              <span className="text-lg w-6 text-center">{detail.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text">{detail.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text3">{detail.weight}</span>
                    <span className="text-sm font-bold text-text">{score}</span>
                  </div>
                </div>
                <div className="h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${score}%`, backgroundColor: barColor }}
                  />
                </div>
                <p className="text-[10px] text-text3 mt-0.5">{detail.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
