'use client';

import { UserStatus } from '@/types';
import { LogOut, Bell, User, Settings, Sparkles, Building2, Image as ImageIcon, Users } from 'lucide-react';
import Link from 'next/link';

interface TopNavProps {
  currentUser: {
    name: string;
    avatar: string;
    jobTitle: string;
    status: UserStatus;
  };
  activeTab: 'office' | 'snap' | 'people';
  onTabChange: (tab: 'office' | 'snap' | 'people') => void;
  onStatusChange: (status: UserStatus) => void;
  onLogout: () => void;
}

export default function TopNav({
  currentUser,
  activeTab,
  onTabChange,
  onStatusChange,
  onLogout,
}: TopNavProps) {
  const statusColors: Record<UserStatus, string> = {
    Working: 'bg-emerald-500',
    Away: 'bg-amber-500',
    Break: 'bg-blue-500',
    Offline: 'bg-slate-500',
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo */}
      <div className="flex items-center space-x-8">
        <Link href="/office" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            Office<span className="text-blue-400">World</span>
          </span>
        </Link>

        {/* Center Tabs Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onTabChange('office')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'office'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>2D Office</span>
          </button>
          <button
            onClick={() => onTabChange('snap')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'snap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Office Snap</span>
          </button>
          <button
            onClick={() => onTabChange('people')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'people'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People</span>
          </button>
        </nav>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-4">
        {/* Status Dropdown Pill */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-full px-3 py-1 space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColors[currentUser.status]}`} />
          <select
            value={currentUser.status}
            onChange={(e) => onStatusChange(e.target.value as UserStatus)}
            className="bg-transparent text-xs text-slate-200 font-medium border-none outline-none cursor-pointer pr-1"
          >
            <option value="Working" className="bg-slate-900 text-white">🟢 Working</option>
            <option value="Away" className="bg-slate-900 text-white">🟡 Away</option>
            <option value="Break" className="bg-slate-900 text-white">🔵 Break</option>
            <option value="Offline" className="bg-slate-900 text-white">⚫ Offline</option>
          </select>
        </div>

        {/* User Card Info */}
        <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-xs text-blue-300">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left max-w-[120px] truncate">
            <p className="text-xs font-semibold text-white leading-tight truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight truncate">{currentUser.jobTitle}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onTabChange('people')}
            title="CEO Executive Dashboard"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-white rounded-xl text-xs font-bold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">CEO Live View</span>
          </button>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
