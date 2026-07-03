import { useState } from 'react';
import {
  Wallet, Building2, FileText, Calculator, Truck, Target, ChevronRight
} from 'lucide-react';
import { calculateTrustScore } from '../trust/algorithm';
import { trustScoreFactors, activeLoans } from '../data/mockData';
import BusinessDashboard from '../components/biashara/BusinessDashboard';
import LoanApplicationFlow from '../components/biashara/LoanApplicationFlow';
import RepaymentScheduleTable from '../components/biashara/RepaymentScheduleTable';
import LoanCalculator from '../components/biashara/LoanCalculator';
import SupplierPaymentForm from '../components/biashara/SupplierPaymentForm';
import SavingsGoalTracker from '../components/biashara/SavingsGoalTracker';

type TabId = 'dashboard' | 'apply' | 'loans' | 'calculator' | 'suppliers' | 'goals';

export default function Biashara() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const trustResult = calculateTrustScore(trustScoreFactors);

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'apply', label: 'Apply for Loan', icon: Wallet },
    { id: 'loans', label: 'My Loans', icon: FileText },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'goals', label: 'Savings Goals', icon: Target },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <BusinessDashboard
            onApplyLoan={() => setActiveTab('apply')}
            onPaySupplier={() => setActiveTab('suppliers')}
            onSetGoal={() => setActiveTab('goals')}
          />
        );
      case 'apply':
        return <LoanApplicationFlow onComplete={() => setActiveTab('loans')} />;
      case 'loans':
        return (
          <div className="space-y-6">
            {activeLoans.map((loan) => (
              <RepaymentScheduleTable
                key={loan.id}
                schedule={loan.repaymentSchedule}
                loanName={loan.productName}
              />
            ))}
          </div>
        );
      case 'calculator':
        return <LoanCalculator />;
      case 'suppliers':
        return <SupplierPaymentForm />;
      case 'goals':
        return <SavingsGoalTracker />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Wallet className="w-6 h-6 text-sunrise" />
          Twende Biashara
        </h1>
        <p className="text-text2 text-sm mt-1">Merchant Super-App — Working capital, inventory finance, and business tools</p>
      </div>

      {/* Trust Score Banner */}
      <div className="p-4 bg-gradient-to-r from-sunrise to-sunrise-light rounded-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80">Your Trust Score</p>
            <p className="text-2xl font-bold">{trustResult.score} <span className="text-sm font-normal">({trustResult.tierName})</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">Pre-qualified for</p>
            <p className="text-xl font-bold">KES {trustResult.maxLoanAmount.toLocaleString()}</p>
            <p className="text-xs text-white/70">at {trustResult.interestRate}% APR</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-sunrise text-white shadow-sm'
                  : 'bg-surface text-text2 border border-border hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {renderTab()}
    </div>
  );
}
