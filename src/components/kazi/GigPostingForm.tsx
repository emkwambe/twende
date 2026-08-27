// TWENDE Kazi v2 — Gig Posting Form
// Sprint 08: Gig Worker Platform SDK

import { useState } from 'react';
import {
  Briefcase, MapPin, Calendar, DollarSign, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import { skillCategories } from '../../kazi/mockData';

interface GigPostingFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function GigPostingForm({ onSubmit, onCancel }: GigPostingFormProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly'>('fixed');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [requiresVerified, setRequiresVerified] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = () => {
    onSubmit?.();
  };

  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Requirements' },
    { num: 3, label: 'Schedule' },
    { num: 4, label: 'Budget' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-kazi" />
          Post a Gig
        </h2>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              step >= s.num ? 'bg-kazi text-white' : 'bg-border text-text3'
            }`}>
              {s.num}. {s.label}
            </span>
            {i < steps.length - 1 && <div className="w-4 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-text mb-1 block">Gig Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Delivery Driver for Daily Runs"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kazi/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work, requirements, and what you expect..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kazi/50 resize-none"
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!title || !description}
            className="w-full py-2.5 bg-kazi text-white rounded-lg text-sm font-medium hover:bg-kazi/80 transition-colors disabled:bg-border disabled:text-text3 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Requirements */}
      {step === 2 && (
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-text mb-2 block">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {skillCategories.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedSkills.includes(skill.id)
                      ? 'bg-kazi text-white'
                      : 'bg-bg text-text2 border border-border hover:text-text'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text mb-1 block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text3" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Kawangware, Nairobi"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kazi/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={requiresVerified}
                onChange={(e) => setRequiresVerified(e.target.checked)}
                className="w-4 h-4 rounded border-border text-kazi focus:ring-kazi/50"
              />
              <CheckCircle className="w-4 h-4 text-fresh" />
              Verified workers only
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedSkills.length === 0 || !location}
              className="flex-1 py-2.5 bg-kazi text-white rounded-lg text-sm font-medium hover:bg-kazi/80 transition-colors disabled:bg-border disabled:text-text3 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-text mb-1 block">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text3" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kazi/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kazi/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Duration (hours)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text3" />
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 8"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kazi/50"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 rounded border-border text-kazi focus:ring-kazi/50"
              />
              <AlertTriangle className="w-4 h-4 text-coral" />
              Urgent — needs immediate attention
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors">
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!date || !duration}
              className="flex-1 py-2.5 bg-kazi text-white rounded-lg text-sm font-medium hover:bg-kazi/80 transition-colors disabled:bg-border disabled:text-text3 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Budget */}
      {step === 4 && (
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-text mb-1 block">Budget Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setBudgetType('fixed')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  budgetType === 'fixed'
                    ? 'bg-kazi text-white'
                    : 'border border-border text-text2 hover:bg-bg'
                }`}
              >
                Fixed Price
              </button>
              <button
                onClick={() => setBudgetType('hourly')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  budgetType === 'hourly'
                    ? 'bg-kazi text-white'
                    : 'border border-border text-text2 hover:bg-bg'
                }`}
              >
                Hourly Rate
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text mb-1 block">
              {budgetType === 'fixed' ? 'Total Budget (KES)' : 'Hourly Rate (KES)'}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text3" />
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="e.g., 1500"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-kazi/50"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-bg rounded-lg p-4 text-sm space-y-1">
            <p className="text-text2">Posting this gig will:</p>
            <ul className="text-text3 text-xs space-y-1 list-disc list-inside">
              <li>Be visible to workers with matching skills</li>
              <li>Allow up to 20 applications</li>
              <li>First 3 gigs per month are free to post</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!budgetAmount}
              className="flex-1 py-2.5 bg-kazi text-white rounded-lg text-sm font-medium hover:bg-kazi/80 transition-colors disabled:bg-border disabled:text-text3 disabled:cursor-not-allowed"
            >
              Post Gig
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
