// TWENDE Kazi v2 — TypeScript Types
// Sprint 08: Gig Worker Platform SDK

export type GigStatus =
  | 'draft'
  | 'published'
  | 'applications_open'
  | 'worker_selected'
  | 'confirmed'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'disputed'
  | 'paid'
  | 'reviewed'
  | 'closed'
  | 'cancelled'
  | 'expired';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type BudgetType = 'fixed' | 'hourly';
export type RiskCategory = 'low' | 'medium' | 'high';

export interface WorkerSkill {
  category: string;
  subcategory?: string;
  isVerified: boolean;
  yearsExperience?: number;
}

export interface WorkerAvailability {
  day: string;
  slots: string[]; // ["08:00-12:00", "14:00-18:00"]
}

export interface WorkerProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  bio: string;
  yearsExperience: number;
  hourlyRate?: number;
  dailyRate?: number;
  languages: string[];
  skills: WorkerSkill[];
  serviceAreas: string[];
  availability: WorkerAvailability[];
  isVerified: boolean;
  idVerified: boolean;
  skillsTested: boolean;
  totalGigsCompleted: number;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
  portfolioPhotos: string[];
  location: {
    lat: number;
    lng: number;
    ward: string;
  };
}

export interface Gig {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  description: string;
  requiredSkills: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
  };
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  budgetType: BudgetType;
  budgetAmount: number;
  status: GigStatus;
  selectedWorkerId?: string;
  requiresVerifiedWorker: boolean;
  isUrgent: boolean;
  riskCategory: RiskCategory;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
}

export interface GigApplication {
  id: string;
  gigId: string;
  workerId: string;
  workerName: string;
  coverNote: string;
  proposedRate?: number;
  status: ApplicationStatus;
  matchScore: number;
  createdAt: string;
}

export interface GigMatchScore {
  gigId: string;
  workerId: string;
  overallScore: number;
  breakdown: {
    skillMatch: number;
    proximity: number;
    availability: number;
    rating: number;
  };
}

export interface GigPayment {
  id: string;
  gigId: string;
  workerId: string;
  gigAmount: number;
  platformFee: number;
  insurancePremium: number;
  netPayment: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  paidAt?: string;
}

export interface GigReview {
  id: string;
  gigId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  overallRating: number;
  punctualityRating?: number;
  qualityRating?: number;
  communicationRating?: number;
  reviewText?: string;
  isDisputed: boolean;
  disputeReason?: string;
  createdAt: string;
}

export interface EarningsSummary {
  period: 'daily' | 'weekly' | 'monthly';
  total: number;
  platformFees: number;
  insurancePremiums: number;
  netEarnings: number;
  gigCount: number;
  data: Array<{
    label: string;
    earnings: number;
    gigs: number;
  }>;
}
