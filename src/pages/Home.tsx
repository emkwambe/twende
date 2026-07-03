import {
  Users, Wallet, Briefcase, Shield, ShoppingBag,
  TrendingUp, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import {
  currentUser, platformStats, recentActivity, myChamas,
  biasharaProfile, lindaPolicies, sokoStore
} from '../data/mockData';

const statCards = [
  { label: 'Chama Balance', value: `KES ${(myChamas[0].myBalance + myChamas[1].myBalance).toLocaleString()}`, icon: Users, color: 'bg-ocean', change: '+12%' },
  { label: 'Available Credit', value: `KES ${biasharaProfile.availableCredit.toLocaleString()}`, icon: Wallet, color: 'bg-sunrise', change: '+8%' },
  { label: 'Insurance Coverage', value: `KES ${(lindaPolicies.reduce((a, p) => a + p.coverage, 0)).toLocaleString()}`, icon: Shield, color: 'bg-linda', change: 'Active' },
  { label: 'Soko Revenue', value: `KES ${sokoStore.monthlyRevenue.toLocaleString()}`, icon: ShoppingBag, color: 'bg-soko', change: '+23%' },
];

const products = [
  { name: 'Chama', desc: 'Community savings', status: 'Active', color: 'ocean', enrolled: currentUser.hasChama },
  { name: 'Biashara', desc: 'Business credit', status: 'KES 25K loan active', color: 'sunrise', enrolled: currentUser.hasBiashara },
  { name: 'Kazi', desc: 'Gig worker services', status: 'Not enrolled', color: 'kazi', enrolled: currentUser.hasKazi },
  { name: 'Linda', desc: 'Insurance cover', status: '3 policies active', color: 'linda', enrolled: currentUser.hasLinda },
  { name: 'Soko', desc: 'Commerce', status: '127 orders', color: 'soko', enrolled: currentUser.hasSoko },
];

export default function Home() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text">Welcome back, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-text2 text-sm mt-1">Here's your financial wellness overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.change.startsWith('+') ? 'text-fresh' : 'text-text3'}`}>
                {stat.change.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : null}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
            <p className="text-xs text-text3 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Score Chart */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text">Credit Score History</h2>
              <p className="text-xs text-text3">6-month trend across all products</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fresh" />Score</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sunrise" />Target</span>
            </div>
          </div>
          <div className="h-48 flex items-end gap-3">
            {biasharaProfile.creditHistory.map((item, i) => {
              const height = ((item.score - 300) / 550) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <span className="text-[10px] font-medium text-text">{item.score}</span>
                    <div className="w-full bg-bg rounded-t-md relative" style={{ height: '140px' }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-fresh to-fresh-light transition-all duration-700"
                        style={{ height: `${height}%` }}
                      />
                      <div
                        className="absolute w-full border-t-2 border-dashed border-sunrise/50"
                        style={{ bottom: `${((700 - 300) / 550) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-text3">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-fresh/10 rounded-lg flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-fresh" />
            <div>
              <p className="text-sm font-medium text-text">Score improved by 70 points</p>
              <p className="text-xs text-text2">Consistent chama contributions and Soko sales boosted your rating</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-text mb-4">Your Products</h2>
          <div className="space-y-3">
            {products.map((prod) => (
              <div key={prod.name} className="flex items-center gap-3 p-3 rounded-lg bg-bg">
                <div className={`w-9 h-9 rounded-lg bg-${prod.color} flex items-center justify-center`}>
                  {prod.name === 'Chama' && <Users className="w-4 h-4 text-white" />}
                  {prod.name === 'Biashara' && <Wallet className="w-4 h-4 text-white" />}
                  {prod.name === 'Kazi' && <Briefcase className="w-4 h-4 text-white" />}
                  {prod.name === 'Linda' && <Shield className="w-4 h-4 text-white" />}
                  {prod.name === 'Soko' && <ShoppingBag className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{prod.name}</p>
                  <p className="text-xs text-text3">{prod.desc}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prod.enrolled ? 'bg-fresh/10 text-fresh' : 'bg-border text-text3'}`}>
                  {prod.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text">Recent Activity</h2>
          <Activity className="w-4 h-4 text-text3" />
        </div>
        <div className="space-y-3">
          {recentActivity.map((act, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                act.product.includes('Chama') ? 'bg-ocean/10 text-ocean' :
                act.product.includes('Biashara') ? 'bg-sunrise/10 text-sunrise' :
                act.product.includes('Kazi') ? 'bg-kazi/10 text-kazi' :
                act.product.includes('Linda') ? 'bg-linda/10 text-linda' :
                'bg-soko/10 text-soko'
              }`}>
                {act.product.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text">
                  <span className="font-medium">{act.user}</span> {act.action} via <span className="font-medium">{act.product}</span>
                </p>
                <p className="text-xs text-text3">{act.time}</p>
              </div>
              <span className="text-sm font-semibold text-text">{act.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-gradient-to-r from-ocean to-ocean-light rounded-xl p-5 text-white">
        <h2 className="text-lg font-bold mb-4">TWENDE Platform</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(platformStats).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-white/70 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
