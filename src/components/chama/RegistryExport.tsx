import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Download, Loader2, Users, Wallet } from 'lucide-react';
import api from '../../lib/api';
import type { GroupMember, RegistryExport as RegistryExportData } from '../../types/formalization';

interface RegistryExportProps {
  groupId: string;
}

function formatTZS(value: string | number): string {
  return `TZS ${Math.round(Number(value) || 0).toLocaleString()}`;
}

export default function RegistryExport({ groupId }: RegistryExportProps) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<GroupMember[]>(`/groups/${groupId}/members`);
      setMembers(response.data);
    } catch {
      setError('Imeshindikana kupakia wanachama / Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalSavings = members.reduce((sum, m) => sum + Number(m.savings_balance || 0), 0);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setNotice(null);
    try {
      const response = await api.get<RegistryExportData>(
        `/groups/${groupId}/registry/export`,
        { params: { format: 'json' } }
      );
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${response.data.group_name.replace(/\s+/g, '_')}_registry.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setNotice('Rekodi imepakuliwa / Registry downloaded');
    } catch {
      setError('Imeshindikana kupakua rekodi / Failed to export registry');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-ocean" />
          <h3 className="text-base font-semibold text-text">Rekodi ya Wanachama / Member Registry</h3>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ocean text-white rounded-lg text-sm font-medium hover:bg-ocean-dark transition-colors disabled:opacity-60"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Pakua Rekodi / Export Registry
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-coral/10 text-coral text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="mb-4 p-3 rounded-lg bg-fresh/10 text-fresh text-sm">{notice}</div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-lg bg-bg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-ocean" />
            <span className="text-xs text-text3">Jumla ya wanachama / Total members</span>
          </div>
          <p className="text-xl font-bold text-text">{isLoading ? '—' : members.length}</p>
        </div>
        <div className="rounded-lg bg-bg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-fresh" />
            <span className="text-xs text-text3">Jumla ya akiba / Total savings</span>
          </div>
          <p className="text-xl font-bold text-text">
            {isLoading ? '—' : formatTZS(totalSavings)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 justify-center text-text2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Inapakia / Loading...
        </div>
      ) : members.length === 0 ? (
        <p className="py-8 text-center text-sm text-text2">
          Hakuna wanachama / No members registered
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-text3 border-b border-border">
                <th className="text-left p-2">Jina / Name</th>
                <th className="text-left p-2">NIDA</th>
                <th className="text-left p-2">Simu / Phone</th>
                <th className="text-left p-2">Wadhifa / Role</th>
                <th className="text-right p-2">Akiba / Savings (TZS)</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-bg/50">
                  <td className="p-2 font-medium text-text">{m.full_name}</td>
                  <td className="p-2 text-text3 font-mono text-xs">{m.national_id ?? '—'}</td>
                  <td className="p-2 text-text3">{m.phone}</td>
                  <td className="p-2">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-ocean/10 text-ocean capitalize">
                      {m.role}
                    </span>
                  </td>
                  <td className="p-2 text-right font-medium text-text">
                    {Math.round(Number(m.savings_balance) || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
