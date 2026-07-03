import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ScoreHistoryPoint } from '../../trust/types';
import { getTierColor } from '../../trust/algorithm';

interface ScoreHistoryProps {
  history: ScoreHistoryPoint[];
  currentScore: number;
}

export default function ScoreHistory({ history, currentScore }: ScoreHistoryProps) {
  const color = getTierColor(currentScore);

  const tierLabels: Record<number, string> = {
    1: 'Bronze (300-499)',
    2: 'Silver (500-649)',
    3: 'Gold (650-749)',
    4: 'Platinum (750-850)',
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const tier = payload[0].payload.tier;
      return (
        <div className="bg-surface border border-border rounded-lg p-2 shadow-lg">
          <p className="text-xs font-medium text-text">{label}</p>
          <p className="text-sm font-bold" style={{ color }}>{score} points</p>
          <p className="text-[10px] text-text3">{tierLabels[tier]}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-text">Score History</h2>
        <p className="text-xs text-text3">6-month trend across all products</p>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              domain={[300, 850]}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={{ stroke: '#E5E7EB' }}
              ticks={[300, 500, 650, 750, 850]}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Tier boundary lines */}
            <ReferenceLine y={500} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={650} stroke="#2ECC71" strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={750} stroke="#FFD700" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Line
              type="monotone"
              dataKey="score"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tier legend */}
      <div className="mt-3 flex items-center gap-4 flex-wrap">
        {Object.entries(tierLabels).map(([tier, label]) => (
          <div key={tier} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  tier === '1' ? '#E74C3C' :
                  tier === '2' ? '#F59E0B' :
                  tier === '3' ? '#2ECC71' :
                  '#FFD700'
              }}
            />
            <span className="text-[10px] text-text3">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
