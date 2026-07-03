// TWENDE Trust Engine — React Hook for Score Data
// Computes trust score from mock factors and provides all derived data

import { useMemo } from 'react';
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
}

export function useTrustScore(): UseTrustScoreReturn {
  const factors: TrustScoreFactors = trustScoreFactors;

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
    loading: false,
    error: null,
  };
}
