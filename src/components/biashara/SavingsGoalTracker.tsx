import { useState } from 'react';
import { Target, Plus, Minus, PiggyBank, TrendingUp } from 'lucide-react';
import { savingsGoals } from '../../data/mockData';

export default function SavingsGoalTracker() {
  const [goals, setGoals] = useState(savingsGoals);
  const [showForm, setShowForm] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(100000);
  const [newGoalDate, setNewGoalDate] = useState('');
  const [newGoalAutoDeduct, setNewGoalAutoDeduct] = useState(5);

  const handleAddGoal = () => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      name: newGoalName,
      targetAmount: newGoalTarget,
      targetDate: newGoalDate,
      currentAmount: 0,
      autoDeductPercentage: newGoalAutoDeduct,
      status: 'active' as const,
    };
    setGoals([...goals, newGoal]);
    setShowForm(false);
    setNewGoalName('');
    setNewGoalTarget(100000);
    setNewGoalDate('');
    setNewGoalAutoDeduct(5);
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-fresh" />
          <h2 className="text-base font-semibold text-text">Savings Goals</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-fresh text-white rounded-lg text-xs font-medium hover:bg-fresh-dark transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="p-4 bg-bg rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text3">Total Saved</p>
            <p className="text-xl font-bold text-fresh">KES {totalSaved.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text3">Total Target</p>
            <p className="text-xl font-bold text-text">KES {totalTarget.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-fresh rounded-full transition-all"
            style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return (
            <div key={goal.id} className="p-4 bg-bg rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-fresh" />
                  <span className="text-sm font-medium text-text">{goal.name}</span>
                </div>
                <span className="text-xs text-text3">{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden mb-2">
                <div className="h-full bg-fresh rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text3">KES {goal.currentAmount.toLocaleString()} of KES {goal.targetAmount.toLocaleString()}</span>
                <span className="text-fresh font-medium">{progress.toFixed(0)}%</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-text3">
                <TrendingUp className="w-3 h-3" />
                Auto-save: {goal.autoDeductPercentage}% of daily sales
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="mt-4 p-4 bg-bg rounded-lg animate-scale-in">
          <h3 className="text-sm font-semibold text-text mb-3">Create New Goal</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text3 mb-1 block">Goal Name</label>
              <input
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="e.g. Expand Shop"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-fresh/50"
              />
            </div>
            <div>
              <label className="text-xs text-text3 mb-1 block">Target Amount (KES)</label>
              <input
                type="number"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-fresh/50"
              />
            </div>
            <div>
              <label className="text-xs text-text3 mb-1 block">Target Date</label>
              <input
                type="date"
                value={newGoalDate}
                onChange={(e) => setNewGoalDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-fresh/50"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text3">Auto-deduct % of daily sales</span>
                <span className="font-medium text-text">{newGoalAutoDeduct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewGoalAutoDeduct(Math.max(1, newGoalAutoDeduct - 1))}
                  className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={newGoalAutoDeduct}
                  onChange={(e) => setNewGoalAutoDeduct(Number(e.target.value))}
                  className="flex-1 accent-fresh"
                />
                <button
                  onClick={() => setNewGoalAutoDeduct(Math.min(20, newGoalAutoDeduct + 1))}
                  className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 border border-border rounded-lg text-sm text-text2 hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddGoal}
              disabled={!newGoalName || !newGoalDate}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                newGoalName && newGoalDate
                  ? 'bg-fresh text-white hover:bg-fresh-dark'
                  : 'bg-border text-text3 cursor-not-allowed'
              }`}
            >
              Create Goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
