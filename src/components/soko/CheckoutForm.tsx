// TWENDE Soko Commerce v2 — Checkout Form with M-Pesa Payment
// Sprint 10: Marketplace

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, CreditCard, Truck, MapPin, CheckCircle, Smartphone, AlertTriangle
} from 'lucide-react';
import {
  sokoProducts,
  vendorStorefronts,
  sokoCart as initialCart,
  currentUser,
} from '../../data/mockData';

export default function CheckoutForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'address' | 'delivery' | 'payment' | 'processing' | 'success'>('address');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'vendor_delivery' | 'courier'>('courier');
  const [address, setAddress] = useState({
    name: currentUser.name,
    phone: currentUser.phone,
    address: 'Kawangware, House 12',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState(currentUser.phone);

  const cartItems = initialCart.items;
  const cartProducts = cartItems.map((item) => ({
    item,
    product: sokoProducts.find((p) => p.id === item.productId),
  })).filter((cp): cp is { item: typeof cp.item; product: NonNullable<typeof cp.product> } => cp.product !== undefined);

  const subtotal = cartProducts.reduce((sum, { item, product }) => {
    const variantAdj = item.variant
      ? (product.variants?.find((v) => v.name === item.variant.name)?.options.find((o) => o.value === item.variant?.value)?.priceAdjustment || 0)
      : 0;
    return sum + (product.price + variantAdj) * item.quantity;
  }, 0);

  const deliveryFee = deliveryMethod === 'pickup' ? 0 : subtotal > 2000 ? 0 : 150;
  const total = subtotal + deliveryFee;

  const handlePayment = () => {
    setStep('processing');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
    }, 3000);
  };

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-fresh/10 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-fresh" />
        </div>
        <h2 className="text-2xl font-bold text-text">Order Confirmed!</h2>
        <p className="text-sm text-text2 mt-2 text-center max-w-md">
          Your order has been placed successfully. M-Pesa payment confirmed.
        </p>
        <div className="bg-surface rounded-xl border border-border p-5 mt-6 w-full max-w-md">
          <p className="text-sm text-text3 mb-1">Order Number</p>
          <p className="text-lg font-bold text-text">#TWENDE-7829</p>
          <p className="text-sm text-text3 mt-3 mb-1">Total Paid</p>
          <p className="text-lg font-bold text-text">KES {total.toLocaleString()}</p>
          <p className="text-xs text-text3 mt-3">A confirmation SMS has been sent to {currentUser.phone}</p>
        </div>
        <div className="flex gap-3 mt-6">
          <Link to="/soko/orders" className="px-4 py-2 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors">
            Track Order
          </Link>
          <Link to="/soko" className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-bg transition-colors">
          <ChevronLeft className="w-5 h-5 text-text2" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text">Checkout</h1>
          <p className="text-text2 text-sm mt-0.5">Complete your purchase</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {['Address', 'Delivery', 'Payment'].map((s, i) => {
          const steps = ['address', 'delivery', 'payment'] as const;
          const currentStep = steps.indexOf(step === 'processing' ? 'payment' : step);
          const isActive = i <= currentStep;
          return (
            <div key={s} className="flex items-center gap-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                isActive ? 'bg-soko text-white' : 'bg-border text-text3'
              }`}>
                {i + 1}. {s}
              </span>
              {i < 2 && <div className="w-4 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {step === 'address' && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-soko" /> Delivery Address
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-text mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={address.name}
                    onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-soko/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-soko/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text mb-1 block">Delivery Address</label>
                  <textarea
                    value={address.address}
                    onChange={(e) => setAddress((a) => ({ ...a, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-soko/50 resize-none"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep('delivery')}
                className="w-full mt-4 py-2.5 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors"
              >
                Continue to Delivery
              </button>
            </div>
          )}

          {step === 'delivery' && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-soko" /> Delivery Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'pickup' as const, label: 'Pickup from Vendor', desc: 'Collect from store location', price: 0 },
                  { id: 'vendor_delivery' as const, label: 'Vendor Delivery', desc: 'Delivered by the seller', price: 150 },
                  { id: 'courier' as const, label: 'Courier Delivery', desc: 'Fast delivery via courier', price: 200 },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setDeliveryMethod(method.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      deliveryMethod === method.id
                        ? 'border-soko bg-soko/5'
                        : 'border-border hover:bg-bg'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      deliveryMethod === method.id ? 'border-soko' : 'border-border'
                    }`}>
                      {deliveryMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-soko" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">{method.label}</p>
                      <p className="text-xs text-text3">{method.desc}</p>
                    </div>
                    <span className="text-sm font-medium text-text">
                      {method.price === 0 ? 'FREE' : `KES ${method.price}`}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep('address')}
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('payment')}
                  className="flex-1 py-2.5 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <h2 className="text-base font-semibold text-text mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-soko" /> Payment
              </h2>

              <div className="bg-fresh/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-fresh" />
                  <span className="text-sm font-medium text-text">M-Pesa Payment</span>
                </div>
                <p className="text-xs text-text2">
                  You will receive an STK Push on your phone to complete payment.
                </p>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-text mb-1 block">M-Pesa Number</label>
                <input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-soko/50"
                />
              </div>

              <div className="bg-sunrise/10 rounded-xl p-4 flex items-start gap-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-sunrise shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text">DEMO MODE</p>
                  <p className="text-xs text-text2">This is a simulation. No real payment will be processed.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('delivery')}
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-1 py-2.5 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors"
                >
                  Pay KES {total.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="bg-surface rounded-xl border border-border p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-soko/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Smartphone className="w-8 h-8 text-soko" />
              </div>
              <h2 className="text-lg font-bold text-text">Processing Payment...</h2>
              <p className="text-sm text-text2 mt-2">
                STK Push sent to {mpesaPhone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 XXX $3')}
              </p>
              <p className="text-xs text-text3 mt-4">Please check your phone and enter your M-Pesa PIN</p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-surface rounded-xl border border-border p-5 h-fit">
          <h2 className="text-base font-semibold text-text mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cartProducts.map(({ item, product }) => {
              const store = vendorStorefronts.find((s) => s.id === product.storefrontId);
              return (
                <div key={item.productId} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-bg to-border flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-soko/40">{product.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text truncate">{product.name}</p>
                    <p className="text-[10px] text-text3">{store?.name} · Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-medium text-text">
                    KES {(product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-text2">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-text2">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee.toLocaleString()}`}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between text-base font-bold text-text">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
