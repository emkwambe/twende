// TWENDE Kazi v2 — Worker Profile View
// Sprint 08: Gig Worker Platform SDK

import { Star, MapPin, CheckCircle, Briefcase, Clock, Award, Languages, DollarSign } from 'lucide-react';
import type { WorkerProfile } from '../../kazi/types';

interface WorkerProfileViewProps {
  worker: WorkerProfile;
}

export default function WorkerProfileView({ worker }: WorkerProfileViewProps) {
  const profileCompleteness = Math.round(
    ((worker.bio ? 1 : 0) +
      (worker.skills.length > 0 ? 1 : 0) +
      (worker.portfolioPhotos.length > 0 ? 1 : 0) +
      (worker.isVerified ? 1 : 0) +
      (worker.availability.length > 0 ? 1 : 0)) /
      5 *
      100
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-kazi to-kazi/70 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl bg-white/20 flex items-center justify-center text-3xl font-bold">
            {worker.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{worker.name}</h1>
              {worker.isVerified && <CheckCircle className="w-5 h-5 text-white/80" />}
            </div>
            <p className="text-sm text-white/80 mt-1">{worker.bio}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {worker.averageRating} ({worker.totalGigsCompleted} gigs)
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {worker.location.ward}
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {worker.yearsExperience} years
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{worker.totalGigsCompleted}</p>
            <p className="text-[10px] text-white/60">Gigs Done</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">KES {(worker.totalEarnings / 1000).toFixed(0)}K</p>
            <p className="text-[10px] text-white/60">Earned</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{worker.responseRate}%</p>
            <p className="text-[10px] text-white/60">Response</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{worker.averageRating}</p>
            <p className="text-[10px] text-white/60">Rating</p>
          </div>
        </div>
      </div>

      {/* Profile Completeness */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-text">Profile Completeness</h3>
          <span className="text-sm font-bold text-kazi">{profileCompleteness}%</span>
        </div>
        <div className="h-2 bg-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-kazi rounded-full transition-all"
            style={{ width: `${profileCompleteness}%` }}
          />
        </div>
        <p className="text-xs text-text3 mt-2">
          Complete your profile to rank higher in search results and get more gig offers.
        </p>
      </div>

      {/* Skills */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text mb-3">Skills</h3>
        <div className="space-y-2">
          {worker.skills.map((skill) => (
            <div key={skill.category} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-text capitalize">{skill.category}</p>
                {skill.subcategory && (
                  <p className="text-xs text-text3">{skill.subcategory}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {skill.yearsExperience && (
                  <span className="text-xs text-text3">{skill.yearsExperience} yrs</span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  skill.isVerified ? 'bg-fresh/10 text-fresh' : 'bg-bg text-text3'
                }`}>
                  {skill.isVerified ? 'Verified' : 'Self-reported'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rates & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-kazi" /> Rates
          </h3>
          <div className="space-y-2">
            {worker.hourlyRate && (
              <div className="flex justify-between text-sm">
                <span className="text-text2">Hourly</span>
                <span className="font-medium text-text">KES {worker.hourlyRate}</span>
              </div>
            )}
            {worker.dailyRate && (
              <div className="flex justify-between text-sm">
                <span className="text-text2">Daily</span>
                <span className="font-medium text-text">KES {worker.dailyRate}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-kazi" /> Availability
          </h3>
          <div className="space-y-1">
            {worker.availability.map((avail) => (
              <div key={avail.day} className="flex justify-between text-sm">
                <span className="text-text2">{avail.day}</span>
                <span className="text-text3 text-xs">{avail.slots.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Areas & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-kazi" /> Service Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {worker.serviceAreas.map((area) => (
              <span key={area} className="text-xs bg-bg text-text3 px-2.5 py-1 rounded-full">
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Languages className="w-4 h-4 text-kazi" /> Languages
          </h3>
          <div className="flex flex-wrap gap-2">
            {worker.languages.map((lang) => (
              <span key={lang} className="text-xs bg-bg text-text3 px-2.5 py-1 rounded-full">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
