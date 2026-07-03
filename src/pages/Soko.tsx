import { useState } from 'react';
import {
  ShoppingBag, Link2, Star, TrendingUp, Package,
  CheckCircle, Clock, Truck, Plus, ExternalLink
} from 'lucide-react';
import { sokoStore, sokoListings, sokoOrders } from '../data/mockData';

export default function Soko() {
  const [activeTab, setActiveTab] = useState<'store' | 'orders' | 'analytics'>('store');
  const [showAddProduct, setShowAddProduct] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-soko" />
            Twende Soko
          </h1>
          <p className="text-text2 text-sm mt-1">Your phone-number store</p>
        </div>
        <button
          onClick={() => setShowAddProduct(!showAddProduct)}
          className="flex items-center gap-2 px-4 py-2.5 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Store Header Card */}
      <div className="bg-gradient-to-r from-soko/90 to-soko/60 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
              {sokoStore.storeName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold">{sokoStore.storeName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{sokoStore.rating}</span>
                <span className="text-xs text-white/60">({sokoStore.verifiedOrders} verified orders)</span>
              </div>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-white/30 transition-colors">
            <Link2 className="w-3.5 h-3.5" />
            Copy Link
          </button>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-white/60">Store URL:</span>
          <code className="text-xs bg-white/10 px-2 py-1 rounded">{sokoStore.storeUrl}</code>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{sokoStore.activeListings}</p>
            <p className="text-[10px] text-white/60">Listings</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{sokoStore.totalSales}</p>
            <p className="text-[10px] text-white/60">Sales</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">KES {sokoStore.monthlyRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-white/60">This Month</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">KES {sokoStore.balance.toLocaleString()}</p>
            <p className="text-[10px] text-white/60">Balance</p>
          </div>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddProduct && (
        <div className="bg-surface rounded-xl border border-soko/30 shadow-lg p-5 animate-scale-in">
          <h3 className="text-base font-semibold text-text mb-4">Add New Product</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Product Name</label>
              <input type="text" placeholder="e.g. Kitenge Wrap Dress" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-soko/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-text mb-1 block">Price (KES)</label>
              <input type="number" placeholder="1200" className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-soko/50" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAddProduct(false)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-text2 hover:bg-bg transition-colors">
              Cancel
            </button>
            <button onClick={() => setShowAddProduct(false)} className="flex-1 py-2.5 bg-soko text-white rounded-lg text-sm font-medium hover:bg-soko/80 transition-colors">
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['store', 'orders', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-soko text-white shadow-sm'
                : 'bg-surface text-text2 border border-border hover:text-text'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Store Tab */}
      {activeTab === 'store' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sokoListings.map((item) => (
            <div key={item.id} className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-32 bg-gradient-to-br from-bg to-border flex items-center justify-center">
                <Package className="w-12 h-12 text-text3" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-text">{item.name}</h4>
                  {!item.available && (
                    <span className="px-1.5 py-0.5 bg-border text-text3 text-[10px] rounded">Out of Stock</span>
                  )}
                </div>
                <p className="text-lg font-bold text-text mb-2">KES {item.price.toLocaleString()}</p>
                <div className="flex items-center justify-between text-xs text-text3">
                  <span>{item.sold} sold</span>
                  <span className={item.available ? 'text-fresh' : 'text-coral'}>
                    {item.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 py-1.5 bg-soko/10 text-soko rounded text-xs font-medium hover:bg-soko/20 transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 py-1.5 border border-border text-text rounded text-xs font-medium hover:bg-bg transition-colors">
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-base font-semibold text-text mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {sokoOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  order.status === 'completed' ? 'bg-fresh/10' :
                  order.status === 'delivering' ? 'bg-kazi/10' :
                  'bg-sunrise/10'
                }`}>
                  {order.status === 'completed' && <CheckCircle className="w-5 h-5 text-fresh" />}
                  {order.status === 'delivering' && <Truck className="w-5 h-5 text-kazi" />}
                  {order.status === 'pending' && <Clock className="w-5 h-5 text-sunrise" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{order.item}</p>
                  <p className="text-xs text-text3">{order.buyer} · Qty: {order.qty} · {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-text">KES {order.amount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'completed' ? 'bg-fresh/10 text-fresh' :
                    order.status === 'delivering' ? 'bg-kazi/10 text-kazi' :
                    'bg-sunrise/10 text-sunrise'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-base font-semibold text-text mb-4">Sales Trend</h3>
            <div className="flex items-end gap-2 h-48">
              {[45, 62, 38, 78, 55, 89, 67, 95, 72, 110, 85, 120].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-bg rounded-t-md relative" style={{ height: '140px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md bg-soko/70 transition-all"
                      style={{ height: `${(val / 120) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-text3">W{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs text-text3 mb-1">Top Product</p>
              <p className="text-sm font-semibold text-text">Ankara Fabric (2m)</p>
              <p className="text-xs text-fresh mt-1">78 sold · KES 62,400 revenue</p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs text-text3 mb-1">Avg Order Value</p>
              <p className="text-lg font-bold text-text">KES 1,850</p>
              <p className="text-xs text-fresh mt-1">+12% vs last month</p>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Share CTA */}
      <div className="bg-fresh/10 rounded-xl p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-fresh/20 flex items-center justify-center shrink-0">
          <ExternalLink className="w-6 h-6 text-fresh" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text">Share Your Store</h3>
          <p className="text-sm text-text2 mt-1">
            Share your store link on WhatsApp Status, Facebook, or Instagram. Buyers can pay instantly via M-Pesa — no app download needed.
          </p>
          <button className="mt-3 px-4 py-2 bg-fresh text-white rounded-lg text-sm font-medium hover:bg-fresh-dark transition-colors">
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
