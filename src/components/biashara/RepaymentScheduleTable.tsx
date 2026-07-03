import { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Download, CreditCard } from 'lucide-react';
import type { Installment } from '../../biashara/types';

interface RepaymentScheduleTableProps {
  schedule: Installment[];
  loanName: string;
}

export default function RepaymentScheduleTable({ schedule, loanName }: RepaymentScheduleTableProps) {
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filtered = schedule.filter((inst) => {
    if (filter === 'all') return true;
    return inst.status === filter;
  });

  const statusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-fresh" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-coral" />;
      default: return <Clock className="w-4 h-4 text-ocean" />;
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-fresh/10 text-fresh';
      case 'overdue': return 'bg-coral/10 text-coral';
      default: return 'bg-ocean/10 text-ocean';
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text">Repayment Schedule</h2>
          <p className="text-xs text-text3">{loanName}</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-text2 hover:bg-bg transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'paid', 'pending', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-sunrise text-white' : 'bg-bg text-text3 hover:text-text'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-text3 border-b border-border">
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Due Date</th>
              <th className="text-right p-2">Installment</th>
              <th className="text-right p-2">Principal</th>
              <th className="text-right p-2">Interest</th>
              <th className="text-right p-2">Balance</th>
              <th className="text-center p-2">Status</th>
              <th className="text-center p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inst) => (
              <tr key={inst.week} className="border-b border-border last:border-0 hover:bg-bg/50">
                <td className="p-2 text-text">{inst.week}</td>
                <td className="p-2 text-text3">{inst.dueDate}</td>
                <td className="p-2 text-right font-medium text-text">KES {Math.round(inst.installment).toLocaleString()}</td>
                <td className="p-2 text-right text-fresh">KES {Math.round(inst.principal).toLocaleString()}</td>
                <td className="p-2 text-right text-sunrise">KES {Math.round(inst.interest).toLocaleString()}</td>
                <td className="p-2 text-right text-text">KES {Math.round(inst.balance).toLocaleString()}</td>
                <td className="p-2 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusClass(inst.status || 'pending')}`}>
                    {statusIcon(inst.status || 'pending')}
                    {inst.status || 'pending'}
                  </span>
                </td>
                <td className="p-2 text-center">
                  {inst.status !== 'paid' && (
                    <button className="px-2 py-1 bg-sunrise text-white rounded text-xs hover:bg-sunrise-dark transition-colors">
                      <CreditCard className="w-3 h-3 inline mr-1" />
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
