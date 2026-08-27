import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, FileText, Loader2, Send, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import type { Constitution } from '../../types/formalization';

interface ConstitutionCardProps {
  groupId: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Rasimu / Draft',
  submitted: 'Imewasilishwa / Submitted ✓',
  approved: 'Imeidhinishwa / Approved ✓',
};

export default function ConstitutionCard({ groupId }: ConstitutionCardProps) {
  const [constitution, setConstitution] = useState<Constitution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Constitution>(`/groups/${groupId}/constitution`);
      setConstitution(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setConstitution(null);
      } else {
        setError('Imeshindikana kupakia katiba / Failed to load constitution');
      }
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await api.post<Constitution>(`/groups/${groupId}/constitution/generate`);
      setConstitution(response.data);
    } catch {
      setError('Imeshindikana kutengeneza katiba / Failed to generate constitution');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.put<Constitution>(`/groups/${groupId}/constitution/submit`);
      setConstitution(response.data);
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? 'Mwenyekiti au mhazini pekee / Chair or treasurer access required'
          : 'Imeshindikana kuwasilisha / Failed to submit constitution'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-ocean" />
          <h3 className="text-base font-semibold text-text">Katiba ya Kikundi / Constitution</h3>
        </div>
        {constitution && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              constitution.status === 'draft'
                ? 'bg-sunrise/10 text-sunrise'
                : 'bg-fresh/10 text-fresh'
            }`}
          >
            {STATUS_LABEL[constitution.status] ?? constitution.status}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-coral/10 text-coral text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 justify-center text-text2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Inapakia / Loading...
        </div>
      ) : !constitution ? (
        <div className="py-8 text-center">
          <p className="text-sm text-text2 mb-1">Hakuna katiba bado / No constitution yet</p>
          <p className="text-xs text-text3 mb-4">
            Katiba hutengenezwa kutoka taarifa za kikundi na wanachama.
            <br />
            The constitution is generated from your group and member records.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-ocean text-white rounded-lg text-sm font-medium hover:bg-ocean-dark transition-colors disabled:opacity-60"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Tengeneza Katiba / Generate
          </button>
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto rounded-lg bg-bg border border-border p-4">
            <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-text">
              {constitution.content}
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {constitution.status === 'draft' ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Wasilisha / Submit
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-fresh">
                <CheckCircle className="w-4 h-4" />
                Imewasilishwa / Submitted ✓
              </span>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors disabled:opacity-60"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Tengeneza Upya / Regenerate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
