import { useState } from 'react';
import {
  Wallet, Package, AlertTriangle, CheckCircle, ChevronRight,
  Calculator, FileText, TrendingUp
} from 'lucide-react';
import type { LoanProduct } from '../../biashara/types';
import { calculateSchedule, getTierInterestRate, getTierMaxAmount } from '../../biashara/calculations';
import { calculateTrustScore } from '../../trust/algorithm';
import { trustScoreFactors } from '../../data/mockData';

interface LoanApplicationFlowProps {
  onComplete?: () => void;
}

export default function LoanApplicationFlow({ onComplete }: LoanApplicationFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [amount, setAmount] = useState(50000);
  const [tenure, setTenure] = useState(12);
  const [purpose, setPurpose] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Get trust score for pre-qualification
  const trustResult = calculateTrustScore(trustScoreFactors);
  const tierRate = getTierInterestRate(trustResult.tier);
  const tierMax = getTierMaxAmount(trustResult.tier);

  const products: LoanProduct[] = [
    {
      id: 'working_capital',
      name: 'Working Capital Loan',
      type: 'working_capital',
      minScore: 300, minTier: 1, minAmount: 5000, maxAmount: 500000,
      baseInterestRate: tierRate, interestType: 'reducing_balance',
      processingFee: 0.025, lateFee: 0.005,
      minTenure: 1, maxTenure: 104, repaymentFrequency: 'weekly',
      allowsTopUp: true, allowsEarlyRepayment: true, earlyRepaymentRebate: 0.02,
      requiresGuarantor: false,
      features: ['Reducing balance interest', 'Top-up eligible', 'Early repayment rebate 2%', 'Weekly repayments'],
    },
    {
      id: 'inventory_finance',
      name: 'Inventory Finance',
      type: 'inventory',
      minScore: 500, minTier: 2, minAmount: 10000, maxAmount: 200000,
      baseInterestRate: Math.max(tierRate - 0.06, 0.10), interestType: 'reducing_balance',
      processingFee: 0.015, lateFee: 0.005,
      minTenure: 4, maxTenure: 52, repaymentFrequency: 'monthly',
      allowsTopUp: false, allowsEarlyRepayment: true, earlyRepaymentRebate: 0.02,
      requiresGuarantor: false,
      features: ['Reducing balance interest', 'Monthly repayments', '30-day interest-free for suppliers', 'Early repayment rebate 2%'],
    },
    {
      id: 'emergency_micro',
      name: 'Emergency Micro-Loan',
      type: 'emergency',
      minScore: 300, minTier: 1, minAmount: 1000, maxAmount: 5000,
      baseInterestRate: 0.24, interestType: 'flat',
      processingFee: 0.05, lateFee: 0.01,
      minTenure: 1, maxTenure: 4, repaymentFrequency: 'weekly',
      allowsTopUp: false, allowsEarlyRepayment: false, earlyRepaymentRebate: 0,
      requiresGuarantor: false,
      features: ['Flat interest rate', 'Fast approval', 'Emergency only', 'No early repayment'],
    },
  ];

  const schedule = selectedProduct
    ? calculateSchedule(amount, selectedProduct.baseInterestRate, tenure, selectedProduct.interestType, selectedProduct.repaymentFrequency)
    : null;

  const productIcons: Record<string, React.ReactNode> = {
    working_capital: <Wallet className="w-6 h-6" />,
    inventory: <Package className="w-6 h-6" />,
    emergency: <AlertTriangle className="w-6 h-6" />,
  };

  const handleSubmit = () => {
    setStep(5);
    setTimeout(() => onComplete?.(), 2000);
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-sunrise' : 'bg-border'}`} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-text mb-1">Select Loan Product</h2>
          <p className="text-xs text-text3 mb-4">Your Trust Score: {trustResult.score} ({trustResult.tierName} Tier) · Max: KES {tierMax.toLocaleString()}</p>
          <div className="grid grid-cols-1 gap-3">
            {products.map((product) => {
              const isEligible = trustResult.score >= product.minScore && trustResult.tier >= product.minTier;
              const maxForUser = Math.min(product.maxAmount, tierMax);
              return (
                <button
                  key={product.id}
                  onClick={() => { setSelectedProduct(product); setAmount(Math.min(amount, maxForUser)); setStep(2); }}
                  disabled={!isEligible}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isEligible
                      ? 'border-border hover:border-sunrise hover:bg-sunrise/5'
                      : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sunrise/10 flex items-center justify-center text-sunrise">
                      {productIcons[product.type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-text">{product.name}</h3>
                        {!isEligible && <span className="text-[10px] text-coral">Score too low</span>}
                      </div>
                      <p className="text-xs text-text3 mt-0.5">{(product.baseInterestRate * 100).toFixed(0)}% APR · Up to KES {maxForUser.toLocaleString()}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.features.slice(0, 2).map((f) => (
                          <span key={f} className="text-[10px] px-2 py-0.5 bg-bg rounded-full text-text3">{f}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && selectedProduct && (
        <div>
          <h2 className="text-lg font-semibold text-text mb-4">Enter Amount & Tenure</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text3">Loan Amount</span>
                <span className="font-bold text-sunrise">KES {amount.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={selectedProduct.minAmount}
                max={Math.min(selectedProduct.maxAmount, tierMax)}
                step="1000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-sunrise"
              />
              <div className="flex justify-between text-xs text-text3 mt-1">
                <span>KES {selectedProduct.minAmount.toLocaleString()}</span>
                <span>KES {Math.min(selectedProduct.maxAmount, tierMax).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text3">Tenure ({selectedProduct.repaymentFrequency})</span>
                <span className="font-bold text-text">{tenure} {selectedProduct.repaymentFrequency === 'monthly' ? 'months' : 'weeks'}</span>
              </div>
              <input
                type="range"
                min={selectedProduct.minTenure}
                max={selectedProduct.maxTenure}
                step="1"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full accent-sunrise"
              />
              <div className="flex justify-between text-xs text-text3 mt-1">
                <span>{selectedProduct.minTenure}</span>
                <span>{selectedProduct.maxTenure}</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-text3 mb-1 block">Purpose</label>
              <input
                type="text"
                placeholder="e.g. Restock inventory for festive season"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-sunrise/50"
              />
            </div>
          </div>
          <div className="mt-5 p-4 bg-bg rounded-lg">
            <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sunrise" />
              Live Calculator
            </h3>
            {schedule && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-text3">{selectedProduct.repaymentFrequency === 'weekly' ? 'Weekly' : 'Monthly'} Payment</p>
                  <p className="font-bold text-text">KES {Math.round(schedule.installments[0].installment).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text3">Total Interest</p>
                  <p className="font-bold text-text">KES {Math.round(schedule.totalInterest).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text3">Total Repayment</p>
                  <p className="font-bold text-text">KES {Math.round(schedule.totalRepayment).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text3">APR</p>
                  <p className="font-bold text-sunrise">{(schedule.apr).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-text3">Processing Fee</p>
                  <p className="font-bold text-text">KES {Math.round(schedule.processingFee).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-text3">You Receive</p>
                  <p className="font-bold text-fresh">KES {Math.round(schedule.disbursedAmount).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text2 hover:bg-bg transition-colors">Back</button>
            <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-sunrise text-white rounded-lg text-sm font-medium hover:bg-sunrise-dark transition-colors">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && selectedProduct && schedule && (
        <div>
          <h2 className="text-lg font-semibold text-text mb-4">Review Repayment Schedule</h2>
          <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-bg sticky top-0">
                <tr className="text-xs text-text3">
                  <th className="text-left p-2">Week</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-right p-2">Payment</th>
                  <th className="text-right p-2">Principal</th>
                  <th className="text-right p-2">Interest</th>
                  <th className="text-right p-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.installments.map((inst) => (
                  <tr key={inst.week} className="border-t border-border">
                    <td className="p-2">{inst.week}</td>
                    <td className="p-2 text-text3">{inst.dueDate}</td>
                    <td className="p-2 text-right font-medium">KES {Math.round(inst.installment).toLocaleString()}</td>
                    <td className="p-2 text-right text-fresh">KES {Math.round(inst.principal).toLocaleString()}</td>
                    <td className="p-2 text-right text-sunrise">KES {Math.round(inst.interest).toLocaleString()}</td>
                    <td className="p-2 text-right">KES {Math.round(inst.balance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(2)} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text2 hover:bg-bg transition-colors">Back</button>
            <button onClick={() => setStep(4)} className="flex-1 py-2.5 bg-sunrise text-white rounded-lg text-sm font-medium hover:bg-sunrise-dark transition-colors">Continue</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-lg font-semibold text-text mb-4">Confirm & Submit</h2>
          <div className="p-4 bg-bg rounded-lg space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-text3">Product</span><span className="font-medium text-text">{selectedProduct?.name}</span></div>
            <div className="flex justify-between"><span className="text-text3">Amount</span><span className="font-medium text-text">KES {amount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text3">Tenure</span><span className="font-medium text-text">{tenure} {selectedProduct?.repaymentFrequency === 'monthly' ? 'months' : 'weeks'}</span></div>
            <div className="flex justify-between"><span className="text-text3">APR</span><span className="font-medium text-sunrise">{schedule?.apr.toFixed(1)}%</span></div>
            <div className="flex justify-between"><span className="text-text3">Total Repayment</span><span className="font-medium text-text">KES {Math.round(schedule?.totalRepayment || 0).toLocaleString()}</span></div>
          </div>
          <label className="flex items-start gap-2 mb-5">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-sunrise" />
            <span className="text-sm text-text2">I agree to the terms and conditions. I understand that late payments incur a fee and may affect my credit score.</span>
          </label>
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text2 hover:bg-bg transition-colors">Back</button>
            <button
              onClick={handleSubmit}
              disabled={!agreed}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                agreed ? 'bg-sunrise text-white hover:bg-sunrise-dark' : 'bg-border text-text3 cursor-not-allowed'
              }`}
            >
              Submit Application
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-fresh/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-fresh" />
          </div>
          <h2 className="text-lg font-semibold text-text mb-1">Application Submitted!</h2>
          <p className="text-sm text-text2">Your loan application is under review. You will receive an SMS within 5 minutes.</p>
          <div className="mt-4 p-3 bg-bg rounded-lg text-left text-sm">
            <p className="text-text3">Application ID: <span className="font-medium text-text">APP-2026-78432</span></p>
            <p className="text-text3">Status: <span className="font-medium text-sunrise">Under Review</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
