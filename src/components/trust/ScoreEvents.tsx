import { History, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrustScoreEvent } from '../../trust/types';

interface ScoreEventsProps {
  events: TrustScoreEvent[];
}

export default function ScoreEvents({ events }: ScoreEventsProps) {
  const factorColors: Record<string, string> = {
    chama: '#0A2463',
    mpesa: '#FF6B35',
    soko: '#FF6B6B',
    loans: '#2ECC71',
    kazi: '#1ABC9C',
    linda: '#9B59B6',
    kyc: '#F59E0B',
  };

  const factorNames: Record<string, string> = {
    chama: 'Chama',
    mpesa: 'M-Pesa',
    soko: 'Soko',
    loans: 'Loans',
    kazi: 'Kazi',
    linda: 'Linda',
    kyc: 'KYC',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-ocean" />
        <div>
          <h2 className="text-base font-semibold text-text">Score Events</h2>
          <p className="text-xs text-text3">Audit trail of all score changes</p>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.map((event) => {
          const isPositive = event.delta > 0;
          const isNeutral = event.delta === 0;
          const color = factorColors[event.factor] || '#6B7280';

          return (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-bg hover:bg-surface transition-colors"
            >
              {/* Delta indicator */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isPositive ? 'bg-fresh/10' : isNeutral ? 'bg-border' : 'bg-coral/10'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-fresh" />
                ) : isNeutral ? (
                  <Minus className="w-4 h-4 text-text3" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-coral" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: color }}
                  >
                    {factorNames[event.factor] || event.factor}
                  </span>
                  <span className={`text-xs font-bold ${
                    isPositive ? 'text-fresh' : isNeutral ? 'text-text3' : 'text-coral'
                  }`}>
                    {isPositive ? '+' : ''}{event.delta}
                  </span>
                </div>
                <p className="text-sm text-text">{event.reason}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-text3">
                    {event.oldScore} → {event.newScore}
                  </span>
                  <span className="text-[10px] text-text3">
                    {formatDate(event.createdAt)} · {formatTime(event.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8">
          <History className="w-8 h-8 text-text3 mx-auto mb-2" />
          <p className="text-sm text-text3">No score events yet</p>
        </div>
      )}
    </div>
  );
}
