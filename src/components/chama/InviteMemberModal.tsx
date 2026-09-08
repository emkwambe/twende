import { useState } from 'react';
import { X, UserPlus, Phone, IdCard, Loader2, AlertCircle } from 'lucide-react';
import { memberService } from '../../services/memberService';
import { getCountryConfig, type CountryCode } from '../../lib/country';

interface Props {
  groupId: string;
  country: CountryCode;
  onClose: () => void;
  onInvited: () => void;
}

const ROLES = ['member', 'treasurer', 'secretary'];

export default function InviteMemberModal({ groupId, country, onClose, onInvited }: Props) {
  const cfg = getCountryConfig(country);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [role, setRole] = useState('member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = fullName.trim().length >= 2 && phone.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await memberService.create({
        group_id: groupId,
        country,
        full_name: fullName.trim(),
        phone: phone.trim(),
        national_id: nationalId.trim() || undefined,
        role,
      });
      onInvited();
    } catch (err: any) {
      setError(
        err.response?.data?.detail?.[0]?.msg
          ? err.response.data.detail.map((d: any) => d.msg).join('; ')
          : err.response?.data?.detail
          || 'Imeshindikana kuwalika mwanachama / Failed to invite member'
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-ocean" />
            <h2 className="text-lg font-bold text-text">Walika Mwanachama / Invite Member</h2>
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

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Jina Kamili / Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juma Mwandambo"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              <Phone className="w-3.5 h-3.5 inline mr-1" />
              Namba ya Simu / Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={`${cfg.phonePrefix}7XXXXXXXX`}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              <IdCard className="w-3.5 h-3.5 inline mr-1" />
              {cfg.idLabel} (Optional)
            </label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder={cfg.idPlaceholder}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Wadhifa / Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text2 hover:bg-bg"
          >
            Ghairi / Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="px-4 py-2.5 rounded-lg bg-fresh text-white text-sm font-medium hover:bg-fresh-dark disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Walika / Invite
          </button>
        </div>
      </div>
    </div>
  );
}
