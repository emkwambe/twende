// TWENDE Kazi v2 — Matching Algorithm
// Sprint 08: Gig Worker Platform SDK

import type { Gig, WorkerProfile, GigMatchScore } from './types';

// Haversine distance in km
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateMatchScore(gig: Gig, worker: WorkerProfile): GigMatchScore {
  // 1. Skill Match (40%)
  const requiredSkills = new Set(gig.requiredSkills);
  const workerSkills = new Set(worker.skills.map((s) => s.category));
  const intersection = [...requiredSkills].filter((s) => workerSkills.has(s));
  const skillMatch = requiredSkills.size > 0
    ? (intersection.length / requiredSkills.size) * 100
    : 100;

  // 2. Proximity (25%) — haversine distance
  const distance = haversineDistance(
    gig.location.lat,
    gig.location.lng,
    worker.location.lat,
    worker.location.lng
  );
  const proximity =
    distance < 2 ? 100 :
    distance < 5 ? 80 :
    distance < 10 ? 60 :
    distance < 20 ? 40 : 20;

  // 3. Availability (20%)
  const gigDay = new Date(gig.scheduledDate).toLocaleDateString('en-US', { weekday: 'long' });
  const isAvailable = worker.availability.some(
    (a) => a.day.toLowerCase() === gigDay.toLowerCase()
  );
  const availability = isAvailable ? 100 : 0;

  // 4. Rating (15%)
  const rating = (worker.averageRating / 5) * 100;

  // Weighted composite
  const overallScore = Math.round(
    skillMatch * 0.40 +
    proximity * 0.25 +
    availability * 0.20 +
    rating * 0.15
  );

  return {
    gigId: gig.id,
    workerId: worker.id,
    overallScore: Math.min(overallScore, 100),
    breakdown: {
      skillMatch: Math.round(skillMatch),
      proximity: Math.round(proximity),
      availability: Math.round(availability),
      rating: Math.round(rating),
    },
  };
}

export function calculateMatchScoresForWorker(
  gigs: Gig[],
  worker: WorkerProfile
): GigMatchScore[] {
  return gigs
    .map((gig) => calculateMatchScore(gig, worker))
    .filter((score) => score.overallScore > 0)
    .sort((a, b) => b.overallScore - a.overallScore);
}

export function calculateMatchScoresForGig(
  gig: Gig,
  workers: WorkerProfile[]
): GigMatchScore[] {
  return workers
    .map((worker) => calculateMatchScore(gig, worker))
    .filter((score) => score.overallScore > 0)
    .sort((a, b) => b.overallScore - a.overallScore);
}

// Payment calculation
export function calculateGigPayment(
  gigAmount: number,
  riskCategory: 'low' | 'medium' | 'high'
): {
  gigAmount: number;
  platformFee: number;
  insurancePremium: number;
  netPayment: number;
} {
  const platformFee = Math.round(gigAmount * 0.05);
  const insurancePremium =
    riskCategory === 'high' ? 100 :
    riskCategory === 'medium' ? 50 : 20;
  const netPayment = gigAmount - platformFee - insurancePremium;

  return {
    gigAmount,
    platformFee,
    insurancePremium,
    netPayment: Math.max(0, netPayment),
  };
}
