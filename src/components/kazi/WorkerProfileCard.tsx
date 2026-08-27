// TWENDE Kazi v2 — Worker Profile Card
// Sprint 08: Gig Worker Platform SDK

import { Star, MapPin, CheckCircle, Briefcase, Clock } from 'lucide-react';
import type { WorkerProfile } from '../../kazi/types';

interface WorkerProfileCardProps {
  worker: WorkerProfile;
  onSelect?: (workerId: string) => void;
  variant?: 'default' | 'compact' | 'horizontal';
}

export default function WorkerProfileCard({ worker, onSelect, variant = 'default' }: WorkerProfileCardProps) {
  const verifiedSkills = worker.skills.filter((s) => s.isVerified).length;
  const totalSkills = worker.skills.length;

  if (variant === 'compact') {
    return (
      <button
        onClick={() => onSelect?.(worker.id)}
        className="w-full text-left bg-surface rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kazi/20 to-kazi/5 flex items-center justify-center text-lg font-bold text-kazi">
            {worker.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-text truncate">{worker.name}</h4>
              {worker.isVerified && <CheckCircle className="w-3.5 h-3.5 text-fresh shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-text3">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {worker.averageRating}
              </span>
              <span>{worker.totalGigsCompleted} gigs</span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  if (variant === 'horizontal') {
    return (
      <button
        onClick={() => onSelect?.(worker.id)}
        className="w-full text-left bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-kazi/20 to-kazi/5 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-kazi/40">{worker.avatar}</span>
        </div>
        <div className="p-4 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-text">{worker.name}</h4>
            {worker.isVerified && <CheckCircle className="w-3.5 h-3.5 text-fresh shrink-0" />}
          </div>
          <p className="text-xs text-text3 mt-1 line-clamp-2">{worker.bio}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-text3">
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {worker.averageRating} ({worker.totalGigsCompleted} gigs)
            </span>
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {worker.location.ward}
            </span>
          </div>
        </div>
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={() => onSelect?.(worker.id)}
      className="w-full text-left bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className="relative h-24 bg-gradient-to-r from-kazi/20 to-kazi/5 flex items-center justify-center">
        <span className="text-4xl font-bold text-kazi/30">{worker.avatar}</span>
        {worker.isVerified && (
          <span className="absolute top-3 right-3 bg-fresh text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-text">{worker.name}</h4>
        <p className="text-xs text-text3 mt-1 line-clamp-2">{worker.bio}</p>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-text3">
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {worker.averageRating}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {worker.location.ward}
          </span>
          <span className="flex items-center gap-0.5">
            <Briefcase className="w-3 h-3" />
            {worker.totalGigsCompleted} gigs
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-1.5">
            {worker.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.category}
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  skill.isVerified
                    ? 'bg-fresh/10 text-fresh'
                    : 'bg-bg text-text3'
                }`}
              >
                {skill.category}
                {skill.isVerified && ' ✓'}
              </span>
            ))}
            {worker.skills.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg text-text3">
                +{worker.skills.length - 3}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-text2">
            {worker.hourlyRate ? `KES ${worker.hourlyRate}/hr` : `KES ${worker.dailyRate}/day`}
          </span>
          <span className="text-text3 flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> {worker.responseRate}% response
          </span>
        </div>
      </div>
    </button>
  );
}
