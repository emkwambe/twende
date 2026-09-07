// TWENDE Trust Engine — React Hook for Score Data
// Fetches the factor vector from the backend and computes the score from it.
// Pillars the backend has no records for, and the whole vector when the API is
// unreachable, fall back to demo values — reported via `usingMock`/`liveFactors`
// so the UI can say which parts of a displayed score are real.

import { useEffect, useMemo, useState } from 'react';
import { userService } from '../services/userService';
import type {
  TrustScoreFactors,
  TrustScoreResult,
  ScoreHistoryPoint,
  TrustScoreEvent,
  ScoreDispute,
  LoanEligibility,
} from '../trust/types';
import {
  calculateTrustScore,
  generateScoreHistory,
  generateScoreExplanation,
  calculateLoanEligibility,
} from '../trust/algorithm';
import {
  trustScoreFactors,
  trustScoreEvents,
  trustScoreHistory,
  scoreDisputes,
} from '../data/mockData';

export interface UseTrustScoreReturn {
  result: TrustScoreResult;
  factors: TrustScoreFactors;
  history: ScoreHistoryPoint[];
  events: TrustScoreEvent[];
  disputes: ScoreDispute[];
  explanations: string[];
  eligibility: LoanEligibility;
  loading: boolean;
  error: string | null;
  /** True when no live factor could be fetched and everything shown is demo data. */
  usingMock: boolean;
  /** Which pillars came from the backend this render. */
  liveFactors: (keyof TrustScoreFactors)[];
}

export function useTrustScore(): UseTrustScoreReturn {
  const [factors, setFactors] = useState<TrustScoreFactors>(trustScoreFactors);
  const [liveFactors, setLiveFactors] = useState<(keyof TrustScoreFactors)[]>([]);
  const [usingMock, setUsingMock] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    userService
      .getTrustFactors()
      .then((res) => {
        if (cancelled) return;
        // Overlay the pillars the backend can vouch for onto the demo vector;
        // a null pillar has no server-side records yet and keeps its demo value.
        const merged = { ...trustScoreFactors } as TrustScoreFactors;
        (Object.keys(res.factors) as (keyof TrustScoreFactors)[]).forEach((key) => {
          const live = res.factors[key];
          if (live) {
            (merged[key] as TrustScoreFactors[typeof key]) =
              live as TrustScoreFactors[typeof key];
          }
        });
        setFactors(merged);
        setLiveFactors(res.live_factors ?? []);
        setUsingMock(false);
      })
      .catch(() => {
        if (cancelled) return;
        console.warn('Trust factors unavailable — falling back to demo data');
        setFactors(trustScoreFactors);
        setLiveFactors([]);
        setUsingMock(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const result = useMemo(() => {
    return calculateTrustScore(factors);
  }, [factors]);

  const history = useMemo(() => {
    // Use the mock history if available, otherwise generate
    return trustScoreHistory.length > 0
      ? trustScoreHistory
      : generateScoreHistory(result.score, 6);
  }, [result.score]);

  const events = useMemo(() => {
    return trustScoreEvents.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      factor: e.factor,
      oldScore: e.oldScore,
      newScore: e.newScore,
      delta: e.delta,
      reason: e.reason,
      createdAt: e.createdAt,
    }));
  }, []);

  const disputes = useMemo(() => {
    return scoreDisputes.map((d) => ({
      id: d.id,
      factor: d.factor,
      reason: d.reason,
      status: d.status,
      createdAt: d.createdAt,
      resolvedAt: d.resolvedAt,
      resolution: d.resolution,
    }));
  }, []);

  const explanations = useMemo(() => {
    return generateScoreExplanation(result, factors);
  }, [result, factors]);

  const eligibility = useMemo(() => {
    return calculateLoanEligibility(result, factors, 'biashara');
  }, [result, factors]);

  return {
    result,
    factors,
    history,
    events,
    disputes,
    explanations,
    eligibility,
    loading,
    error,
    usingMock,
    liveFactors,
  };
}
