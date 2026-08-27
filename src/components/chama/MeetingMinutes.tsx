import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Save,
  Users,
} from 'lucide-react';
import api from '../../lib/api';
import type { MeetingMinute } from '../../types/formalization';

interface MeetingMinutesProps {
  groupId: string;
}

interface MinuteDraft {
  agenda: string;
  resolutions: string;
  chair_signature: string;
  treasurer_signature: string;
}

function toDraft(minute: MeetingMinute): MinuteDraft {
  return {
    agenda: minute.agenda ?? '',
    resolutions: minute.resolutions ?? '',
    chair_signature: minute.chair_signature ?? '',
    treasurer_signature: minute.treasurer_signature ?? '',
  };
}

function isComplete(minute: MeetingMinute): boolean {
  return Boolean(minute.agenda && minute.resolutions);
}

export default function MeetingMinutes({ groupId }: MeetingMinutesProps) {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MinuteDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<MeetingMinute[]>(`/groups/${groupId}/minutes`);
      setMinutes(response.data);
    } catch {
      setError('Imeshindikana kupakia kumbukumbu / Failed to load minutes');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!newDate) return;
    setIsCreating(true);
    setError(null);
    try {
      await api.post<MeetingMinute>(`/groups/${groupId}/minutes`, { meeting_date: newDate });
      setShowModal(false);
      setNewDate('');
      await load();
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? 'Mwenyekiti au mhazini pekee / Chair or treasurer access required'
          : 'Imeshindikana kuunda mkutano / Failed to create meeting'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const toggleExpand = (minute: MeetingMinute) => {
    if (expandedId === minute.id) {
      setExpandedId(null);
      setDraft(null);
      return;
    }
    setExpandedId(minute.id);
    setDraft(toDraft(minute));
    setSavedId(null);
  };

  const handleSave = async (minuteId: string) => {
    if (!draft) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await api.put<MeetingMinute>(
        `/groups/${groupId}/minutes/${minuteId}`,
        draft
      );
      setMinutes((prev) => prev.map((m) => (m.id === minuteId ? response.data : m)));
      setSavedId(minuteId);
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? 'Mwenyekiti au mhazini pekee / Chair or treasurer access required'
          : 'Imeshindikana kuhifadhi / Failed to save minutes'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-ocean" />
          <h3 className="text-base font-semibold text-text">
            Kumbukumbu za Mikutano / Meeting Minutes
          </h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Mkutano Mpya / New Meeting
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-coral/10 text-coral text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showModal && (
        <div className="mb-4 rounded-xl border border-fresh/30 bg-bg p-4 animate-scale-in">
          <h4 className="text-sm font-semibold text-text mb-3">
            Tarehe ya mkutano / Meeting date
          </h4>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-fresh/50"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowModal(false);
                setNewDate('');
              }}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-surface transition-colors"
            >
              Ghairi / Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newDate || isCreating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors disabled:opacity-60"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              Unda / Create
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 justify-center text-text2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Inapakia / Loading...
        </div>
      ) : minutes.length === 0 ? (
        <p className="py-8 text-center text-sm text-text2">
          Hakuna kumbukumbu bado / No minutes recorded yet
        </p>
      ) : (
        <div className="space-y-2">
          {minutes.map((minute) => {
            const expanded = expandedId === minute.id;
            return (
              <div key={minute.id} className="rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => toggleExpand(minute)}
                  className="w-full flex items-center gap-3 p-3 bg-bg hover:bg-border/40 transition-colors text-left"
                >
                  {expanded ? (
                    <ChevronDown className="w-4 h-4 text-text3 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text3 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{minute.meeting_date}</p>
                    <p className="text-xs text-text3 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {minute.attendance?.length ?? 0} mahudhurio / attendance
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isComplete(minute)
                        ? 'bg-fresh/10 text-fresh'
                        : 'bg-sunrise/10 text-sunrise'
                    }`}
                  >
                    {isComplete(minute) ? 'Imekamilika / Complete' : 'Rasimu / Draft'}
                  </span>
                </button>

                {expanded && draft && (
                  <div className="p-4 space-y-4 bg-surface">
                    <div>
                      <p className="text-xs font-medium text-text3 mb-2">
                        Mahudhurio / Attendance
                      </p>
                      {minute.attendance && minute.attendance.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {minute.attendance.map((name) => (
                            <span
                              key={name}
                              className="px-2 py-1 rounded-full bg-ocean/10 text-ocean text-xs"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-text3">—</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Ajenda / Agenda
                      </label>
                      <textarea
                        rows={3}
                        value={draft.agenda}
                        onChange={(e) => setDraft({ ...draft, agenda: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Azimio / Resolutions
                      </label>
                      <textarea
                        rows={3}
                        value={draft.resolutions}
                        onChange={(e) => setDraft({ ...draft, resolutions: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Sahihi ya Mwenyekiti / Chair Signature
                        </label>
                        <input
                          type="text"
                          maxLength={100}
                          value={draft.chair_signature}
                          onChange={(e) => setDraft({ ...draft, chair_signature: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1">
                          Sahihi ya Mhazini / Treasurer Signature
                        </label>
                        <input
                          type="text"
                          maxLength={100}
                          value={draft.treasurer_signature}
                          onChange={(e) =>
                            setDraft({ ...draft, treasurer_signature: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-text text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(minute.id)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-ocean text-white rounded-lg text-sm font-medium hover:bg-ocean-dark transition-colors disabled:opacity-60"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Hifadhi / Save
                      </button>
                      {savedId === minute.id && !isSaving && (
                        <span className="text-sm text-fresh font-medium">
                          Imehifadhiwa / Saved ✓
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
