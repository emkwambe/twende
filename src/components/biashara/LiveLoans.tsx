import { useState } from 'react';
import { AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { loanService } from '../../services/loanService';
import { useApiData, formatTZS } from '../../hooks/useApiData';

const STATUS_TONE: Record<string, string> = {
  approved: 'bg-fresh/10 text-fresh',
  repaid: 'bg-ocean/10 text-ocean',
  flagged: 'bg-sunrise/10 text-sunrise',
  rejected: 'bg-coral/10 text-coral',
  defaulted: 'bg-coral/10 text-coral',
  pending: 'bg-bg text-text2',
};

export default function LiveLoans() {
  const loans = useApiData(loanService.getMyLoans, []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const repay = async (loanId: string, weekly: string | null, weekNumber: number) => {
    setBusyId(loanId);
    setMessage(null);
    try {
      const res = await loanService.repay(loanId, {
        amount: Number(weekly ?? 0),
        week_number: weekNumber,
        payment_method: 'mpesa',
      });
      setMessage(`${res.message} — remaining ${formatTZS(res.remaining_balance)}`);
      loans.reload();
    } catch {
      setMessage('Repayment failed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  if (loans.loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 flex items-center justify-center gap-2 text-text3">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your loans...
      </div>
    );
  }

  if (loans.usingMock) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          <strong>Demo Mode:</strong> backend unavailable, so your loan list cannot be
          loaded.
        </span>
      </div>
    );
  }

  const list = loans.data ?? [];
  if (list.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 text-center">
        <FileText className="w-8 h-8 text-text3 mx-auto mb-2" />
        <p className="text-sm text-text2">No loans yet</p>
        <p className="text-xs text-text3 mt-1">
          Apply for your first loan to start building repayment history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-fresh/10 border border-fresh/30 text-fresh px-4 py-2 rounded-lg text-sm">
          {message}
        </div>
      )}
      {list.map((loan) => {
        const outstanding = Number(loan.loan_balance);
        const total = Number(loan.total_repayment ?? loan.amount);
        const paid = Math.max(0, total - outstanding);
        const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
        const weeksPaid = loan.weekly_payment
          ? Math.round(paid / Number(loan.weekly_payment))
          : 0;

        return (
          <div key={loan.id} className="bg-surface rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-base font-semibold text-text">{formatTZS(loan.amount)}</p>
                <p className="text-xs text-text3 capitalize">
                  {loan.purpose} · {loan.repayment_weeks} weeks · {Number(loan.interest_rate)}% APR
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                    STATUS_TONE[loan.status] ?? 'bg-bg text-text2'
                  }`}
                >
                  {loan.status}
                </span>
                {loan.underwriting_score != null && (
                  <p className="text-[10px] text-text3 mt-1">
                    Score {loan.underwriting_score}/100
                  </p>
                )}
              </div>
            </div>

            {outstanding > 0 && (
              <>
                <div className="flex justify-between text-xs text-text3 mb-1">
                  <span>Repaid {formatTZS(paid)}</span>
                  <span>Outstanding {formatTZS(outstanding)}</span>
                </div>
                <div className="h-2 bg-bg rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-fresh rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </>
            )}

            {loan.status === 'approved' && outstanding > 0 && (
              <button
                onClick={() => repay(loan.id, loan.weekly_payment, weeksPaid + 1)}
                disabled={busyId === loan.id}
                className="w-full py-2 rounded-lg bg-ocean text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busyId === loan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Pay {formatTZS(loan.weekly_payment)} (week {weeksPaid + 1})
              </button>
            )}

            {loan.rejection_reasons && loan.rejection_reasons.length > 0 && (
              <ul className="mt-2 space-y-1">
                {loan.rejection_reasons.map((r, i) => (
                  <li key={i} className="text-xs text-coral">• {r}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
