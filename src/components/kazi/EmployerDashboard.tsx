// TWENDE Kazi v2 — Employer Dashboard
// Sprint 08: Gig Worker Platform SDK

import { useState } from 'react';
import {
  Plus, FileText, Users, Clock, CheckCircle, XCircle, Eye
} from 'lucide-react';
import type { Gig } from '../../kazi/types';
import { gigs, gigApplications, workerProfiles } from '../../kazi/mockData';
import WorkerProfileCard from './WorkerProfileCard';

export default function EmployerDashboard() {
  const [activeTab, setActiveTab] = useState<'posted' | 'applicants' | 'hired'>('posted');
  const [showPostForm, setShowPostForm] = useState(false);

  const myGigs = gigs.filter((g) => g.employerId === 'emp-001');
  const postedGigs = myGigs.filter((g) => ['published', 'applications_open'].includes(g.status));
  const hiredGigs = myGigs.filter((g) => ['confirmed', 'started', 'in_progress', 'completed'].includes(g.status));

  const myApplications = gigApplications.filter((app) =>
    myGigs.some((g) => g.id === app.gigId)
  );

  const getStatusBadge = (status: Gig['status']) => {
    const config: Record<string, { color: string; label: string }> = {
      published: { color: 'bg-kazi/10 text-kazi', label: 'Open' },
      applications_open: { color: 'bg-kazi/10 text-kazi', label: 'Applications' },
      worker_selected: { color: 'bg-sunrise/10 text-sunrise', label: 'Selected' },
      confirmed: { color: 'bg-fresh/10 text-fresh', label: 'Confirmed' },
      completed: { color: 'bg-ocean/10 text-ocean', label: 'Completed' },
      cancelled: { color: 'bg-border text-text3', label: 'Cancelled' },
    };
    const c = config[status] || { color: 'bg-border text-text3', label: status };
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text">My Gigs</h2>
          <p className="text-xs text-text3">Manage your posted gigs and applicants</p>
        </div>
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          className="flex items-center gap-2 px-4 py-2 bg-kazi text-white rounded-lg text-sm font-medium hover:bg-kazi/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post Gig
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl border border-border p-3 text-center">
          <p className="text-xl font-bold text-text">{postedGigs.length}</p>
          <p className="text-[10px] text-text3">Active</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3 text-center">
          <p className="text-xl font-bold text-text">{myApplications.length}</p>
          <p className="text-[10px] text-text3">Applicants</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-3 text-center">
          <p className="text-xl font-bold text-text">{hiredGigs.length}</p>
          <p className="text-[10px] text-text3">Hired</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['posted', 'applicants', 'hired'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-kazi text-white shadow-sm'
                : 'bg-surface text-text2 border border-border hover:text-text'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Posted Gigs */}
      {activeTab === 'posted' && (
        <div className="space-y-3">
          {postedGigs.length === 0 ? (
            <div className="text-center py-8 text-text3 text-sm">No active gigs posted</div>
          ) : (
            postedGigs.map((gig) => (
              <div key={gig.id} className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-text">{gig.title}</h4>
                      {getStatusBadge(gig.status)}
                    </div>
                    <p className="text-xs text-text3 mt-1">{gig.location.ward} · KES {gig.budgetAmount.toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-text3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {gig.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {gig.applicationCount} applicants
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Applicants */}
      {activeTab === 'applicants' && (
        <div className="space-y-3">
          {myApplications.length === 0 ? (
            <div className="text-center py-8 text-text3 text-sm">No applicants yet</div>
          ) : (
            myApplications.map((app) => {
              const worker = workerProfiles.find((w) => w.id === app.workerId);
              const gig = gigs.find((g) => g.id === app.gigId);
              return (
                <div key={app.id} className="bg-surface rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text3">{gig?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded-lg bg-kazi/10 flex items-center justify-center text-xs font-bold text-kazi">
                          {worker?.avatar || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{app.workerName}</p>
                          <p className="text-xs text-kazi font-medium">{app.matchScore}% match</p>
                        </div>
                      </div>
                      <p className="text-xs text-text2 mt-2 line-clamp-2">{app.coverNote}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="p-1.5 rounded-lg bg-fresh/10 text-fresh hover:bg-fresh/20 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Hired */}
      {activeTab === 'hired' && (
        <div className="space-y-3">
          {hiredGigs.length === 0 ? (
            <div className="text-center py-8 text-text3 text-sm">No hired workers yet</div>
          ) : (
            hiredGigs.map((gig) => (
              <div key={gig.id} className="bg-surface rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-text">{gig.title}</h4>
                    <p className="text-xs text-text3 mt-1">
                      {new Date(gig.scheduledDate).toLocaleDateString()} · {getStatusBadge(gig.status)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
