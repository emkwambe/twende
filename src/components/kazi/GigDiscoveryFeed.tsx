// TWENDE Kazi v2 — Gig Discovery Feed
// Sprint 08: Gig Worker Platform SDK

import { useState, useMemo } from 'react';
import {
  Search, Filter, MapPin, SlidersHorizontal, X
} from 'lucide-react';
import GigCard from './GigCard';
import {
  gigs,
  currentWorkerProfile,
  skillCategories,
} from '../../kazi/mockData';
import { calculateMatchScore } from '../../kazi/algorithm';

export default function GigDiscoveryFeed() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'newest' | 'pay' | 'distance'>('match');
  const [appliedGigs, setAppliedGigs] = useState<Set<string>>(new Set());

  const filteredGigs = useMemo(() => {
    let result = gigs.filter((g) => g.status === 'published');

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.requiredSkills.some((s) => s.toLowerCase().includes(q)) ||
          g.location.ward.toLowerCase().includes(q)
      );
    }

    if (selectedSkill) {
      result = result.filter((g) => g.requiredSkills.includes(selectedSkill));
    }

    // Calculate match scores and sort
    const withScores = result.map((gig) => ({
      gig,
      matchScore: calculateMatchScore(gig, currentWorkerProfile).overallScore,
    }));

    switch (sortBy) {
      case 'match':
        return withScores.sort((a, b) => b.matchScore - a.matchScore);
      case 'newest':
        return withScores.sort((a, b) => new Date(b.gig.createdAt).getTime() - new Date(a.gig.createdAt).getTime());
      case 'pay':
        return withScores.sort((a, b) => b.gig.budgetAmount - a.gig.budgetAmount);
      case 'distance':
        return withScores.sort((a, b) => a.matchScore - b.matchScore); // Proxy via match score
      default:
        return withScores;
    }
  }, [searchQuery, selectedSkill, sortBy]);

  const handleApply = (gigId: string) => {
    setAppliedGigs((prev) => new Set(prev).add(gigId));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gigs, skills, locations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-kazi/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-colors ${
            showFilters ? 'bg-kazi/10 border-kazi text-kazi' : 'border-border text-text2 hover:bg-bg'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Skill Filters */}
      {showFilters && (
        <div className="bg-surface rounded-xl border border-border p-4 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text">Filter by Skill</h3>
            <button onClick={() => setSelectedSkill(null)} className="text-xs text-kazi hover:underline">
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillCategories.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedSkill === skill.id
                    ? 'bg-kazi text-white'
                    : 'bg-bg text-text2 border border-border hover:text-text'
                }`}
              >
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort & Stats */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-text3">{filteredGigs.length} gigs found</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text3">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs bg-surface border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-kazi/50"
          >
            <option value="match">Best Match</option>
            <option value="newest">Newest</option>
            <option value="pay">Highest Pay</option>
            <option value="distance">Nearest</option>
          </select>
        </div>
      </div>

      {/* Gig Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGigs.map(({ gig, matchScore }) => (
          <GigCard
            key={gig.id}
            gig={gig}
            matchScore={matchScore}
            onApply={handleApply}
          />
        ))}
      </div>

      {filteredGigs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-border">
          <Search className="w-12 h-12 text-text3 mb-3" />
          <p className="text-sm text-text3">No gigs match your criteria</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSkill(null);
            }}
            className="mt-3 text-sm text-kazi font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
