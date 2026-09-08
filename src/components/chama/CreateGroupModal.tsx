import { useState } from 'react';
import { X, MapPin, Calendar, Percent, Loader2, AlertCircle } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { getCountryConfig, type CountryCode } from '../../lib/country';

interface Props {
  country: CountryCode;
  onClose: () => void;
  onCreated: () => void;
}

const MEETING_FREQUENCIES = ['weekly', 'biweekly', 'monthly'];

export default function CreateGroupModal({ country, onClose, onCreated }: Props) {
  const cfg = getCountryConfig(country);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [groupType, setGroupType] = useState(cfg.groupTypeDefault);
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [meetingFrequency, setMeetingFrequency] = useState('weekly');
  const [interestRate, setInterestRate] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceed = name.trim().length >= 2 && location.trim().length >= 2;

  const handleSubmit = async () => {
    if (!canProceed) return;
    setSubmitting(true);
    setError(null);
    try {
      await groupService.create({
        name: name.trim(),
        country,
        group_type: groupType,
        location: location.trim(),
        region: region.trim() || undefined,
        meeting_frequency: meetingFrequency,
        interest_rate: interestRate,
      });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Imeshindikana kuunda kikundi / Failed to create group');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-bold text-text">Unda Kikundi / Create Group</h2>
            <p className="text-xs text-text3">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg text-text2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-coral/10 text-coral text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Jina la Kikundi / Group Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nyota VICOBA"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Aina / Group Type
                </label>
                <select
                  value={groupType}
                  onChange={(e) => setGroupType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
                >
                  {cfg.groupTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    <MapPin className="w-3.5 h-3.5 inline mr-1" />
                    Eneo / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kariakoo"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Mkoa / Region
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Dar es Salaam"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Mzunguko wa Mikutano / Meeting Frequency
                </label>
                <select
                  value={meetingFrequency}
                  onChange={(e) => setMeetingFrequency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
                >
                  {MEETING_FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f.replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  <Percent className="w-3.5 h-3.5 inline mr-1" />
                  Riba / Interest Rate (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
                />
                <p className="text-xs text-text3 mt-1">
                  Default interest rate for internal group loans.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text2 hover:bg-bg"
              >
                Ghairi / Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed}
                className="px-4 py-2.5 rounded-lg bg-ocean text-white text-sm font-medium hover:bg-ocean-dark disabled:opacity-50"
              >
                Endelea / Continue
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text2 hover:bg-bg"
              >
                Rudi / Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2.5 rounded-lg bg-fresh text-white text-sm font-medium hover:bg-fresh-dark disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Unda Kikundi / Create Group
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
