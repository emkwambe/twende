import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Home, Users, Wallet, Briefcase, Shield, ShoppingBag,
  Menu, X, Bell, ChevronDown, TrendingUp
} from 'lucide-react';
import { currentUser } from '../data/mockData';

const navItems = [
  { path: '/', label: 'Overview', icon: Home, color: 'text-ocean' },
  { path: '/chama', label: 'Chama', icon: Users, color: 'text-ocean' },
  { path: '/biashara', label: 'Biashara', icon: Wallet, color: 'text-sunrise' },
  { path: '/kazi', label: 'Kazi', icon: Briefcase, color: 'text-kazi' },
  { path: '/linda', label: 'Linda', icon: Shield, color: 'text-linda' },
  { path: '/soko', label: 'Soko', icon: ShoppingBag, color: 'text-soko' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-ocean flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ocean leading-tight">TWENDE</h1>
            <p className="text-[10px] text-text3 tracking-wider">FINANCIAL WELLNESS</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden">
            <X className="w-5 h-5 text-text2" />
          </button>
        </div>

        {/* Credit Score Card */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-br from-ocean to-ocean-light">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/70 uppercase tracking-wider">Credit Score</span>
            <span className="text-xs font-bold text-fresh">{currentUser.creditTier}</span>
          </div>
          <div className="text-2xl font-bold text-white">{currentUser.creditScore}</div>
          <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-fresh rounded-full transition-all duration-500"
              style={{ width: `${((currentUser.creditScore - 300) / 550) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-ocean/10 text-ocean shadow-sm'
                    : 'text-text2 hover:bg-bg hover:text-text'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sunrise flex items-center justify-center text-white text-sm font-bold">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{currentUser.name}</p>
              <p className="text-xs text-text3">KYC Tier {currentUser.kycTier}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text3" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3 bg-surface border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-bg"
          >
            <Menu className="w-5 h-5 text-text2" />
          </button>
          <div className="flex-1" />
          <button className="relative p-2 rounded-lg hover:bg-bg transition-colors">
            <Bell className="w-5 h-5 text-text2" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-sunrise flex items-center justify-center text-white text-xs font-bold">
            {currentUser.avatar}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
