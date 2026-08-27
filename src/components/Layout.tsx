import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home, Users, Wallet, Briefcase, Shield, ShoppingBag, Star,
  Menu, X, Bell, ChevronDown, LogOut, TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { currentUser as mockUser, trustScoreFactors } from '../data/mockData';
import { calculateTrustScore } from '../trust/algorithm';
import { getCountryConfig } from '../lib/country';

const navItems = [
  { path: '/', label: 'Overview', icon: Home, color: 'text-ocean' },
  { path: '/chama', label: 'Chama', icon: Users, color: 'text-ocean' },
  { path: '/biashara', label: 'Biashara', icon: Wallet, color: 'text-sunrise' },
  { path: '/kazi', label: 'Kazi', icon: Briefcase, color: 'text-kazi' },
  { path: '/linda', label: 'Linda', icon: Shield, color: 'text-linda' },
  { path: '/soko', label: 'Soko', icon: ShoppingBag, color: 'text-soko' },
  { path: '/trust/score', label: 'Trust Score', icon: Star, color: 'text-ocean' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const displayUser = user || mockUser;
  const avatar = displayUser.avatar || displayUser.display_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const countryCfg = getCountryConfig((displayUser.country as 'KE' | 'TZ') || 'TZ');

  const trustResult = calculateTrustScore(trustScoreFactors);
  const scoreColor = trustResult.score >= 750 ? 'text-yellow-500' :
                     trustResult.score >= 650 ? 'text-fresh' :
                     trustResult.score >= 500 ? 'text-sunrise' : 'text-coral';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transition-transform duration-300 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
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
        <NavLink to="/trust/score" onClick={() => setSidebarOpen(false)}>
          <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-br from-ocean to-ocean-light cursor-pointer hover:from-ocean-dark hover:to-ocean transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/70 uppercase tracking-wider">Trust Score</span>
              <span className={`text-xs font-bold ${scoreColor}`}>{trustResult.tierName}</span>
            </div>
            <div className="text-2xl font-bold text-white">{trustResult.score}</div>
            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-fresh rounded-full transition-all duration-500"
                style={{ width: `${((trustResult.score - 300) / 550) * 100}%` }}
              />
            </div>
          </div>
        </NavLink>

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
        <div className="p-4 border-t border-border relative">
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="w-full flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-sunrise flex items-center justify-center text-white text-sm font-bold">
              {avatar}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-text truncate">
                {(displayUser as any).name || displayUser.display_name}
              </p>
              <p className="text-xs text-text3">
                KYC Tier {displayUser.kyc_tier || (displayUser as any).kycTier} · {countryCfg.name}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-text3 transition-transform ${showLogout ? 'rotate-180' : ''}`} />
          </button>

          {showLogout && (
            <button
              onClick={handleLogout}
              className="absolute bottom-full left-4 right-4 mb-2 flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg shadow-sm text-sm text-coral hover:bg-bg"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          )}
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
            {avatar}
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
