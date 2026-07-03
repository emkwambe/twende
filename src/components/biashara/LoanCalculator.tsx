import { useState } from 'react';
import { Calculator, Share2, Copy, CheckCircle } from 'lucide-react';
import { calculateSchedule, getLoanProduct } from '../../biashara/calculations';
import type { LoanProduct } from '../../biashara/types';

export default function LoanCalculator() {
  const [amount, setAmount] = useState(50000);
  const [tenure, setTenure] = useState(12);
  const [productId, setProductId] = useState('working_capital');
  const [copied, setCopied] = useState(false);

  const product = getLoanProduct(productId);
  const schedule = product
    ? calculateSchedule(amount, product.baseInterestRate, tenure, product.interestType, product.repaymentFrequency)
    : null;

  const products: { id: string; name: string; rate: number }[] = [
    { id: 'working_capital', name: 'Working Capital', rate: 24 },
    { id: 'inventory_finance', name: 'Inventory Finance', rate: 18 },
    { id: 'emergency_micro', name: 'Emergency Micro', rate: 24 },
  ];

  const handleCopy = () => {
    if (!schedule) return;
    const text = `TWENDE Loan Calculator\nAmount: KES ${amount.toLocaleString()}\nTenure: ${tenure} weeks\nAPR: ${schedule.apr.toFixed(1)}%\nTotal Interest: KES ${Math.round(schedule.totalInterest).toLocaleString()}\nTotal Repayment: KES ${Math.round(schedule.totalRepayment).toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-sunrise" />
        <h2 className="text-base font-semibold text-text">Loan Calculator</h2>
      </div>

      <div className="space-y-4 mb-5">
        <div>
          <label className="text-sm text-text3 mb-1 block">Product</label>
          <div className="grid grid-cols-3 gap-2">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setProductId(p.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  productId === p.id ? 'bg-sunrise text-white' : 'bg-bg text-text2 hover:text-text'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text3">Amount</span>
            <span className="font-bold text-sunrise">KES {amount.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="500000"
            step="1000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-sunrise"
          />
          <div className="flex justify-between text-xs text-text3 mt-1">
            <span>KES 1,000</span>
            <span>KES 500,000</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text3">Tenure (weeks)</span>
            <span className="font-bold text-text">{tenure} weeks</span>
          </div>
          <input
            type="range"
            min="1"
            max="104"
            step="1"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full accent-sunrise"
          />
          <div className="flex justify-between text-xs text-text3 mt-1">
            <span>1 week</span>
            <span>104 weeks</span>
          </div>
        </div>
      </div>

      {schedule && (
        <div className="p-4 bg-bg rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-xs text-text3">Weekly Payment</p>
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
              <p className="font-bold text-sunrise">{schedule.apr.toFixed(1)}%</p>
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
          <button
            onClick={handleCopy}
            className="w-full py-2 border border-border rounded-lg text-sm text-text2 hover:bg-bg transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-fresh" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Result'}
          </button>
        </div>
      )}
    </div>
  );
}
