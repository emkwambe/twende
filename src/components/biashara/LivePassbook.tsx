import { AlertTriangle, BookOpen, Loader2 } from 'lucide-react';
import { ledgerService } from '../../services/ledgerService';
import { useApiData, formatTZS } from '../../hooks/useApiData';

const TYPE_LABELS: Record<string, string> = {
  share_purchase: 'Contribution',
  loan_disbursement: 'Loan disbursed',
  loan_repayment: 'Repayment',
  interest_earned: 'Interest earned',
  penalty: 'Penalty',
  withdrawal: 'Withdrawal',
};

const INFLOW = new Set(['share_purchase', 'loan_disbursement', 'interest_earned']);

export default function LivePassbook() {
  const passbook = useApiData(ledgerService.getMyPassbook);

  if (passbook.loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 flex items-center justify-center gap-2 text-text3">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading your passbook...
      </div>
    );
  }

  if (passbook.status === 404) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 text-center">
        <BookOpen className="w-8 h-8 text-text3 mx-auto mb-2" />
        <p className="text-sm text-text2">No passbook yet</p>
        <p className="text-xs text-text3 mt-1">
          Your passbook opens when you join a savings group.
        </p>
      </div>
    );
  }

  if (passbook.usingMock || !passbook.data) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          <strong>Demo Mode:</strong> backend unavailable, so the ledger cannot be loaded.
        </span>
      </div>
    );
  }

  const pb = passbook.data;

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-ocean" />
          <div>
            <h2 className="text-base font-semibold text-text">Digital Passbook</h2>
            <p className="text-xs text-text3">
              {pb.member_name} · {pb.group_name} · {pb.transaction_count} entries
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-bg rounded-lg">
            <p className="text-xs text-text3 mb-1">Savings Balance</p>
            <p className="text-lg font-bold text-fresh">{formatTZS(pb.savings_balance)}</p>
          </div>
          <div className="p-3 bg-bg rounded-lg">
            <p className="text-xs text-text3 mb-1">Loan Balance</p>
            <p className="text-lg font-bold text-text">{formatTZS(pb.loan_balance)}</p>
          </div>
        </div>
      </div>

      {pb.transactions.length === 0 ? (
        <p className="p-8 text-center text-sm text-text2">No transactions yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg">
              <tr className="text-left text-xs text-text3">
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium text-right">Amount</th>
                <th className="px-4 py-2 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {pb.transactions.map((t) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-2 text-text2 whitespace-nowrap">
                    {t.created_at.slice(0, 10)}
                  </td>
                  <td className="px-4 py-2 text-text">
                    {TYPE_LABELS[t.transaction_type] ?? t.transaction_type}
                  </td>
                  <td className="px-4 py-2 text-text3 max-w-xs truncate">
                    {t.description ?? '—'}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-medium whitespace-nowrap ${
                      INFLOW.has(t.transaction_type) ? 'text-fresh' : 'text-text'
                    }`}
                  >
                    {INFLOW.has(t.transaction_type) ? '+' : '−'}
                    {formatTZS(t.amount)}
                  </td>
                  <td className="px-4 py-2 text-right text-text2 whitespace-nowrap">
                    {formatTZS(t.balance_after)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
