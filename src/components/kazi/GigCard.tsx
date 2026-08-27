// TWENDE Kazi v2 — Gig Card Component
// Sprint 08: Gig Worker Platform SDK

import { MapPin, Clock, DollarSign, Zap, CheckCircle, Star, Calendar } from 'lucide-react';
import type { Gig } from '../../kazi/types';

interface GigCardProps {
  gig: Gig;
  matchScore?: number;
  onApply?: (gigId: string) => void;
  onView?: (gigId: string) => void;
  variant?: 'default' | 'compact';
}

export default function GigCard({ gig, matchScore, onApply, onView, variant = 'default' }: GigCardProps) {
  const isUrgent = gig.isUrgent;
  const isVerifiedRequired = gig.requiresVerifiedWorker;

  if (variant === 'compact') {
    return (
      <button
        onClick={() => onView?.(gig.id)}
        className="w-full text-left bg-surface rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text truncate">{gig.title}</h4>
            <p className="text-xs text-text3 mt-0.5">{gig.employerName}</p>
          </div>
          {matchScore !== undefined && (
            <span className="shrink-0 text-xs font-bold text-kazi bg-kazi/10 px-2 py-0.5 rounded-full">
              {matchScore}% match
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-text3">
          <span className="flex items-center gap-0.5">
            <DollarSign className="w-3 h-3" />
            KES {gig.budgetAmount.toLocaleString()} {gig.budgetType === 'hourly' && '/hr'}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {gig.location.ward}
          </span>
          <span className="flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {new Date(gig.scheduledDate).toLocaleDateString()}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-text">{gig.title}</h4>
              {isUrgent && (
                <span className="shrink-0 bg-coral text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Urgent
                </span>
              )}
            </div>
            <p className="text-xs text-text3 mt-0.5">{gig.employerName}</p>
          </div>
          {matchScore !== undefined && (
            <span className="shrink-0 text-xs font-bold text-kazi bg-kazi/10 px-2.5 py-1 rounded-full">
              {matchScore}% match
            </span>
          )}
        </div>

        <p className="text-xs text-text2 mt-2 line-clamp-2">{gig.description}</p>

        <div className="flex flex-wrap gap-2 mt-3">
          {gig.requiredSkills.map((skill) => (
            <span key={skill} className="text-[10px] px-2 py-0.5 bg-bg text-text3 rounded-full">
              {skill}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-text3">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-kazi" />
            <span className="text-text font-medium">KES {gig.budgetAmount.toLocaleString()}</span>
            {gig.budgetType === 'hourly' && '/hr'}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {gig.location.ward}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(gig.scheduledDate).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {gig.durationHours}h
          </span>
        </div>

        {isVerifiedRequired && (
          <div className="mt-3 flex items-center gap-1 text-[10px] text-fresh">
            <CheckCircle className="w-3 h-3" />
            Verified workers only
          </div>
        )}
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onView?.(gig.id)}
          className="flex-1 py-2 border border-border rounded-lg text-xs font-medium text-text2 hover:bg-bg transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onApply?.(gig.id)}
          className="flex-1 py-2 bg-kazi text-white rounded-lg text-xs font-medium hover:bg-kazi/80 transition-colors"
        >
          Quick Apply
        </button>
      </div>
    </div>
  );
}
