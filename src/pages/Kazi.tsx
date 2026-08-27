// TWENDE Kazi v2 — Gig Worker Marketplace Page
// Sprint 08: Replaces basic gig worker page with two-sided marketplace

import { useState } from 'react';
import {
  Briefcase, User, Search, Building2, Wallet, Star, Plus
} from 'lucide-react';
import GigDiscoveryFeed from '../components/kazi/GigDiscoveryFeed';
import WorkerProfileView from '../components/kazi/WorkerProfileView';
import EmployerDashboard from '../components/kazi/EmployerDashboard';
import EarningsDashboard from '../components/kazi/EarningsDashboard';
import GigPostingForm from '../components/kazi/GigPostingForm';
import { currentWorkerProfile } from '../kazi/mockData';

type TabId = 'find' | 'profile' | 'employer' | 'earnings' | 'post';

export default function Kazi() {
  const [activeTab, setActiveTab] = useState<TabId>('find');
  const [showPostForm, setShowPostForm] = useState(false);

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'find', label: 'Find Gigs', icon: Search },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'employer', label: 'Employer', icon: Building2 },
    { id: 'earnings', label: 'Earnings', icon: Wallet },
  ];

  const renderContent = () => {
    if (showPostForm) {
      return (
        <GigPostingForm
          onSubmit={() => setShowPostForm(false)}
          onCancel={() => setShowPostForm(false)}
        />
      );
    }

    switch (activeTab) {
      case 'find':
        return <GigDiscoveryFeed />;
      case 'profile':
        return <WorkerProfileView worker={currentWorkerProfile} />;
      case 'employer':
        return (
          <div className="space-y-4">
            <EmployerDashboard />
            <button
              onClick={() => setShowPostForm(true)}
              className="w-full py-3 bg-kazi text-white rounded-xl text-sm font-medium hover:bg-kazi/80 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post a New Gig
            </button>
          </div>
        );
      case 'earnings':
        return <EarningsDashboard />;
      default:
        return <GigDiscoveryFeed />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-kazi" />
          Twende Kazi
        </h1>
        <p className="text-text2 text-sm mt-1">Gig worker marketplace</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setShowPostForm(false);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id && !showPostForm
                ? 'bg-kazi text-white shadow-sm'
                : 'bg-surface text-text2 border border-border hover:text-text'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
