import { useState } from 'react';
import {
  AlertTriangle, CheckCircle, Loader2, ShieldAlert, Users, Wallet, XCircle,
} from 'lucide-react';
import { loanService } from '../../services/loanService';
import { useApiData, formatTZS } from '../../hooks/useApiData';
import type { LoanApplication } from '../../types/api';

const PURPOSES = ['business', 'agriculture', 'education', 'medical', 'other'];

/** Presentation for each underwriting outcome. */
const OUTCOME = {
  approved: {
    icon: CheckCircle,
    title: 'Approved',
    tone: 'text-fresh',
    box: 'bg-fresh/10 border-fresh/30',
  },
  flagged: {
    icon: ShieldAlert,
    title: 'Manual review required',
    tone: 'text-sunrise',
    box: 'bg-sunrise/10 border-sunrise/30',
  },
  rejected: {
    icon: XCircle,
    title: 'Unable to approve at this time',
    tone: 'text-coral',
    box: 'bg-coral/10 border-coral/30',
  },
} as const;

const FACTOR_LABELS: Record<string, string> = {
  mm_flow_points: 'Mobile money flow',
  dsr_points: 'Debt service',
  guarantee_points: 'Group guarantee',
  formalization_points: 'Formalization',
  seasonality_points: 'Seasonality',
};

const BANDS: Record<string, number> = {
  mm_flow_points: 30,
  dsr_points: 25,
  guarantee_points: 20,
  formalization_points: 15,
  seasonality_points: 10,
};

interface Props {
  onComplete?: () => void;
}

export default function LiveLoanApplication({ onComplete }: Props) {
  const eligibility = useApiData(loanService.getEligibility);

  const [amount, setAmount] = useState(300_000);
  const [purpose, setPurpose] = useState('business');
  const [weeks, setWeeks] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<LoanApplication | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const el = eligibility.data;

  const submit = async () => {
    if (!el) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const loan = await loanService.apply({
        member_id: el.member_id,
        amount,
        purpose,
        repayment_weeks: weeks,
      });
      setDecision(loan);
      eligibility.reload();
    } catch {
      setSubmitError('Could not reach the underwriting service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (eligibility.loading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 flex items-center justify-center gap-2 text-text3">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking your eligibility...
      </div>
    );
  }

  // A 404 here is the server answering: this account is not in a group yet.
  // Borrowing is group-guaranteed, so there is nothing to underwrite against.
  if (eligibility.status === 404) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 text-center">
        <Users className="w-8 h-8 text-text3 mx-auto mb-2" />
        <p className="text-sm text-text2">You're not in a savings group yet</p>
        <p className="text-xs text-text3 mt-1 max-w-md mx-auto">
          Biashara loans are guaranteed by your chama's collective savings, so you need
          to join or form a group before you can borrow.
        </p>
      </div>
    );
  }

  if (eligibility.usingMock || !el) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>
          <strong>Demo Mode:</strong> the loan service is unavailable, so applications
          cannot be underwritten right now. Start the backend to apply for a real loan.
        </span>
      </div>
    );
  }

  const outcome = OUTCOME[decision?.status as keyof typeof OUTCOME] ?? OUTCOME.flagged;
  const OutcomeIcon = outcome.icon;
  const overLimit = amount > Number(el.available_headroom);

  return (
    <div className="space-y-6">
      {/* ─── Eligibility (live) ─────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-ocean" />
          <div>
            <h2 className="text-base font-semibold text-text">Your Eligibility</h2>
            <p className="text-xs text-text3">
              {el.tier_name} tier · {el.group_name}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Tier" value={`${el.tier_name} (${el.tier})`} />
          <Stat label="Max Amount" value={formatTZS(el.max_amount)} />
          <Stat label="Interest Rate" value={`${el.interest_rate}% APR`} accent />
          <Stat label="Available Now" value={formatTZS(el.available_headroom)} />
        </div>
        {el.reasons.length > 0 && (
          <ul className="mt-4 space-y-1">
            {el.reasons.map((r, i) => (
              <li key={i} className="text-xs text-text2">• {r}</li>
            ))}
          </ul>
        )}
      </div>

      {/* ─── Application form ───────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-text">Apply for a Loan</h2>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text3">Amount</span>
            <span className="font-medium text-text">{formatTZS(amount)}</span>
          </div>
          <input
            type="range"
            min={50_000}
            max={Math.max(50_000, Number(el.available_headroom))}
            step={50_000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-ocean"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs text-text3">Purpose</span>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-text3">Repayment weeks</span>
            <input
              type="number"
              min={1}
              max={104}
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text"
            />
          </label>
        </div>

        {purpose === 'agriculture' && weeks < 12 && (
          <p className="text-xs text-sunrise">
            Agricultural loans under 12 weeks are penalised — they fall due before harvest.
          </p>
        )}
        {overLimit && (
          <p className="text-xs text-coral">
            Above your available headroom of {formatTZS(el.available_headroom)}.
          </p>
        )}

        <button
          onClick={submit}
          disabled={submitting || !el.eligible}
          className="w-full py-2.5 rounded-lg bg-ocean text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Underwriting...' : 'Submit Application'}
        </button>
        {submitError && <p className="text-xs text-coral">{submitError}</p>}
      </div>

      {/* ─── The live underwriting decision ─────────────────────────────── */}
      {decision && (
        <div className={`rounded-xl border p-5 shadow-sm ${outcome.box}`}>
          <div className="flex items-center gap-2 mb-4">
            <OutcomeIcon className={`w-5 h-5 ${outcome.tone}`} />
            <div>
              <h2 className={`text-base font-semibold ${outcome.tone}`}>{outcome.title}</h2>
              <p className="text-xs text-text3">
                Underwriting score {decision.underwriting_score ?? 0}/100
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Stat label="Amount" value={formatTZS(decision.amount)} />
            <Stat label="Interest Rate" value={`${Number(decision.interest_rate)}% APR`} accent />
            <Stat label="Weekly Payment" value={formatTZS(decision.weekly_payment)} />
            <Stat label="Total Repayment" value={formatTZS(decision.total_repayment)} />
          </div>

          {decision.underwriting_factors && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-text2">Score breakdown</p>
              {Object.entries(FACTOR_LABELS).map(([key, label]) => {
                const pts = Number(decision.underwriting_factors?.[key] ?? 0);
                const band = BANDS[key];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-text3 w-36 shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ocean rounded-full"
                        style={{ width: `${(pts / band) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text w-16 text-right">
                      {pts.toFixed(1)}/{band}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {decision.rejection_reasons && decision.rejection_reasons.length > 0 && (
            <ul className="space-y-1 mb-4">
              {decision.rejection_reasons.map((r, i) => (
                <li key={i} className="text-xs text-coral">• {r}</li>
              ))}
            </ul>
          )}

          {decision.status === 'rejected' && !decision.rejection_reasons?.length && (
            <p className="text-xs text-text2 mb-4">
              To improve: keep contributions on time, reduce outstanding debt, and add
              your NIDA, TIN and BRELA details to raise your formalization score.
            </p>
          )}

          <button
            onClick={() => { setDecision(null); onComplete?.(); }}
            className="text-xs text-ocean font-medium"
          >
            View my loans →
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-3 bg-bg rounded-lg">
      <p className="text-xs text-text3 mb-1">{label}</p>
      <p className={`text-lg font-bold ${accent ? 'text-sunrise' : 'text-text'}`}>{value}</p>
    </div>
  );
}
