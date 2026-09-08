import { Users, MapPin, Calendar, Percent, Wallet, TrendingUp, CheckCircle } from 'lucide-react';
import type { Group } from '../../types/api';
import { formatCurrency, type CountryCode } from '../../lib/country';

interface Props {
  group: Group;
  country: CountryCode;
}

export default function GroupOverview({ group, country }: Props) {
  const memberCount = group.member_count || 1;
  const avgSavings = Number(group.total_savings || 0) / Math.max(memberCount, 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Group identity card */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-text">{group.name}</h2>
            <p className="text-sm text-text2 mt-1 capitalize">
              {group.group_type.replace(/_/g, ' ')} · {group.meeting_frequency} meetings
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-text3">
              {group.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {group.location}{group.region ? `, ${group.region}` : ''}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {group.created_at?.slice(0, 10)}
              </span>
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" />
                {Number(group.interest_rate).toFixed(1)}% interest
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-fresh/10 text-fresh capitalize">
            {group.status}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Jumla ya Akiba / Total Savings"
          value={formatCurrency(Number(group.total_savings), country)}
          color="text-fresh"
        />
        <StatCard
          icon={Users}
          label="Wanachama / Members"
          value={memberCount.toString()}
          color="text-ocean"
        />
        <StatCard
          icon={TrendingUp}
          label="Wastani wa Akiba / Avg Savings"
          value={formatCurrency(Math.round(avgSavings), country)}
          color="text-sunrise"
        />
        <StatCard
          icon={CheckCircle}
          label="Mzunguko / Frequency"
          value={group.meeting_frequency.replace(/\b\w/g, (l) => l.toUpperCase())}
          color="text-linda"
        />
      </div>

      {/* Quick tips */}
      <div className="bg-ocean/5 border border-ocean/20 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-ocean mb-2">Next steps / Hatua zijazo</h3>
        <ul className="space-y-1 text-sm text-text2">
          <li>• Invite members from the <strong>Wanachama / Members</strong> tab</li>
          <li>• Generate your <strong>Katiba / Constitution</strong> for ward registration</li>
          <li>• Record meeting minutes under <strong>Kumbukumbu / Minutes</strong></li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-text3">{label}</span>
      </div>
      <p className="text-lg font-bold text-text">{value}</p>
    </div>
  );
}
