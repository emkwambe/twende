import { useState } from 'react';
import { Truck, Send, Phone, User, History, Plus } from 'lucide-react';
import { suppliers, supplierPayments } from '../../data/mockData';

export default function SupplierPaymentForm() {
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supplier = suppliers.find((s) => s.id === selectedSupplier);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setSelectedSupplier('');
      setAmount('');
      setDescription('');
    }, 2000);
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-ocean" />
          <h2 className="text-base font-semibold text-text">Suppliers</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 bg-ocean text-white rounded-lg text-xs font-medium hover:bg-ocean-dark transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Pay Supplier
        </button>
      </div>

      {/* Supplier List */}
      <div className="space-y-2 mb-5">
        {suppliers.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-bg rounded-lg">
            <div className="w-9 h-9 rounded-full bg-ocean/10 flex items-center justify-center">
              <User className="w-4 h-4 text-ocean" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text">{s.name}</p>
              <p className="text-xs text-text3">{s.category} · {s.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-text">KES {s.totalPaid.toLocaleString()}</p>
              <p className="text-[10px] text-text3">Last: {s.lastPayment}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text mb-2 flex items-center gap-1.5">
          <History className="w-4 h-4 text-text3" />
          Payment History
        </h3>
        <div className="space-y-2">
          {supplierPayments.map((payment) => {
            const sup = suppliers.find((s) => s.id === payment.supplierId);
            return (
              <div key={payment.id} className="flex items-center gap-3 p-2 bg-bg rounded-lg text-sm">
                <div className="w-7 h-7 rounded-full bg-fresh/10 flex items-center justify-center">
                  <Send className="w-3 h-3 text-fresh" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text">{sup?.name}</p>
                  <p className="text-xs text-text3">{payment.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text">KES {payment.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-text3">{payment.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Form */}
      {showForm && (
        <div className="p-4 bg-bg rounded-lg animate-scale-in">
          <h3 className="text-sm font-semibold text-text mb-3">Pay Supplier</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-text3 mb-1 block">Select Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50"
              >
                <option value="">Choose supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            {supplier && (
              <div className="p-2 bg-surface rounded-lg text-xs text-text3">
                <p><Phone className="w-3 h-3 inline mr-1" />{supplier.phone}</p>
                <p>Total paid: KES {supplier.totalPaid.toLocaleString()}</p>
              </div>
            )}
            <div>
              <label className="text-xs text-text3 mb-1 block">Amount (KES)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
            </div>
            <div>
              <label className="text-xs text-text3 mb-1 block">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Restock inventory"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
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
              onClick={handleSubmit}
              disabled={!selectedSupplier || !amount}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSupplier && amount
                  ? 'bg-ocean text-white hover:bg-ocean-dark'
                  : 'bg-border text-text3 cursor-not-allowed'
              }`}
            >
              {submitted ? 'Sent!' : 'Send Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
