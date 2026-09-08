import { useEffect, useMemo, useState } from 'react';
import {
  Users, Plus, Loader2, FileText, CalendarDays, ClipboardList,
  UsersRound, AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMyGroups } from '../hooks/useGroups';
import { getCountryConfig } from '../lib/country';
import ConstitutionCard from '../components/chama/ConstitutionCard';
import RegistryExport from '../components/chama/RegistryExport';
import MeetingMinutes from '../components/chama/MeetingMinutes';
import CreateGroupModal from '../components/chama/CreateGroupModal';
import InviteMemberModal from '../components/chama/InviteMemberModal';
import GroupOverview from '../components/chama/GroupOverview';

type ChamaTab = 'chama' | 'constitution' | 'members' | 'minutes';

const TABS: { key: ChamaTab; label: string; icon: typeof Users }[] = [
  { key: 'chama', label: 'Chama', icon: Users },
  { key: 'constitution', label: 'Katiba / Constitution', icon: FileText },
  { key: 'members', label: 'Wanachama / Members', icon: ClipboardList },
  { key: 'minutes', label: 'Kumbukumbu / Minutes', icon: CalendarDays },
];

export default function Chama() {
  const { user } = useAuth();
  const { data: apiGroups, isLoading, error, refetch } = useMyGroups();

  const countryCode = (user?.country as 'KE' | 'TZ') || 'TZ';
  const countryCfg = getCountryConfig(countryCode);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ChamaTab>('chama');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [membersReloadKey, setMembersReloadKey] = useState(0);

  // Default to the first real group once /groups/my resolves.
  useEffect(() => {
    if (!selectedGroupId && apiGroups && apiGroups.length > 0) {
      setSelectedGroupId(apiGroups[0].id);
    }
  }, [apiGroups, selectedGroupId]);

  const selectedGroup = useMemo(
    () => apiGroups?.find((g) => g.id === selectedGroupId) ?? null,
    [apiGroups, selectedGroupId]
  );

  const handleGroupCreated = () => {
    setShowCreateModal(false);
    refetch();
  };

  const handleMemberInvited = () => {
    setShowInviteModal(false);
    setMembersReloadKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Users className="w-6 h-6 text-ocean" />
            Twende {countryCfg.groupTypeDefault === 'chama' ? 'Chama' : 'VICOBA'}
          </h1>
          <p className="text-text2 text-sm mt-1">Community savings, transparent and digital</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Unda Kikundi / Create Group
        </button>
      </div>

      {/* Real groups from API */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text mb-3">Your groups ({countryCfg.name})</h3>
        {isLoading ? (
          <div className="flex items-center gap-2 text-text2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading groups...
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 text-sm text-coral">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            Failed to load groups.
          </div>
        ) : apiGroups && apiGroups.length > 0 ? (
          <div className="space-y-2">
            {apiGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => { setSelectedGroupId(g.id); setActiveTab('chama'); }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedGroupId === g.id
                    ? 'bg-ocean/5 border border-ocean/30'
                    : 'bg-bg border border-transparent hover:border-border'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-text">{g.name}</p>
                  <p className="text-xs text-text3">
                    {g.group_type} · {g.member_count} members · {countryCfg.currencySymbol} {Math.round(Number(g.total_savings)).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-fresh/10 text-fresh">{g.status}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UsersRound className="w-10 h-10 text-text3 mx-auto mb-3" />
            <p className="text-sm text-text2 mb-1">Hujajiunga na kikundi bado</p>
            <p className="text-sm text-text2 mb-4">You are not a member of any group yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-ocean text-white rounded-lg text-sm font-medium hover:bg-ocean-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Unda Kikundi Chako / Create Your First Group
            </button>
          </div>
        )}
      </div>

      {/* Empty state when no group selected */}
      {!selectedGroupId && !isLoading && apiGroups?.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-text2">
            Create or join a group to access constitution, member registry, and meeting minutes.
          </p>
        </div>
      )}

      {/* Formalization tabs */}
      {selectedGroupId && (
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-ocean text-white shadow-sm'
                  : 'bg-surface text-text2 border border-border hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {selectedGroupId && selectedGroup && activeTab === 'chama' && (
        <GroupOverview group={selectedGroup} country={countryCode} />
      )}

      {selectedGroupId && activeTab === 'constitution' && (
        <ConstitutionCard groupId={selectedGroupId} />
      )}

      {selectedGroupId && activeTab === 'members' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Walika Mwanachama / Invite Member
            </button>
          </div>
          <RegistryExport groupId={selectedGroupId} reloadKey={membersReloadKey} />
        </>
      )}

      {selectedGroupId && activeTab === 'minutes' && (
        <MeetingMinutes groupId={selectedGroupId} />
      )}

      {showCreateModal && (
        <CreateGroupModal
          country={countryCode}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleGroupCreated}
        />
      )}

      {showInviteModal && selectedGroupId && (
        <InviteMemberModal
          groupId={selectedGroupId}
          country={countryCode}
          onClose={() => setShowInviteModal(false)}
          onInvited={handleMemberInvited}
        />
      )}
    </div>
  );
}
