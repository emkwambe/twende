// TWENDE Soko Commerce v2 — Order Tracker
// Sprint 10: Marketplace

import { Link } from 'react-router-dom';
import {
  Package, Truck, CheckCircle, Clock, MapPin, ChevronRight, ShoppingBag
} from 'lucide-react';
import { sokoOrders, vendorStorefronts } from '../../data/mockData';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: 'Pending', color: 'text-sunrise', icon: Clock },
  paid: { label: 'Paid', color: 'text-ocean', icon: CheckCircle },
  confirmed: { label: 'Confirmed', color: 'text-ocean', icon: CheckCircle },
  ready: { label: 'Ready for Pickup', color: 'text-fresh', icon: Package },
  picked_up: { label: 'Picked Up', color: 'text-fresh', icon: CheckCircle },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-kazi', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-fresh', icon: CheckCircle },
  completed: { label: 'Completed', color: 'text-fresh', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-coral', icon: Clock },
};

const statusSteps = [
  { key: 'pending', label: 'Placed' },
  { key: 'paid', label: 'Paid' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderTracker() {
  const orders = [...sokoOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Package className="w-6 h-6 text-soko" />
          My Orders
        </h1>
        <p className="text-text2 text-sm mt-1">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border">
          <Package className="w-16 h-16 text-text3 mb-4" />
          <h2 className="text-xl font-bold text-text">No orders yet</h2>
          <Link to="/soko" className="mt-4 px-4 py-2 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const store = vendorStorefronts.find((s) => s.id === order.storefrontId);
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            // Determine step progress
            const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
            const progress = currentStepIndex >= 0 ? currentStepIndex : 0;

            return (
              <div key={order.id} className="bg-surface rounded-xl border border-border p-5">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-text3">Order #{order.id}</p>
                    <p className="text-sm font-medium text-text">{order.storefrontName || store?.name}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-opacity-10 ${status.color.replace('text-', 'bg-')}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-bg to-border flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-soko/40">{item.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{item.name}</p>
                        <p className="text-xs text-text3">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-text">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    {statusSteps.map((step, i) => (
                      <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                          i <= progress ? 'bg-soko text-white' : 'bg-border text-text3'
                        }`}>
                          {i < progress ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span className={`text-[9px] ${i <= progress ? 'text-text font-medium' : 'text-text3'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-soko rounded-full transition-all duration-500"
                      style={{ width: `${((progress + 1) / statusSteps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-text3 pt-3 border-t border-border">
                  <div>
                    <p className="text-text2 font-medium mb-0.5">Total</p>
                    <p className="font-bold text-text">KES {order.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-text2 font-medium mb-0.5">Payment</p>
                    <p>{order.paymentMethod.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-text2 font-medium mb-0.5">Delivery</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {order.deliveryMethod.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-text2 font-medium mb-0.5">Date</p>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {order.deliveryStatus && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-text2">
                    <Truck className="w-3.5 h-3.5 text-kazi" />
                    <span>Status: {order.deliveryStatus.replace('_', ' ')}</span>
                    {order.estimatedDelivery && (
                      <span className="text-text3">· Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
