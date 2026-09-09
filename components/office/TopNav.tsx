'use client';

import { useEffect, useRef, useState } from 'react';
import { CharacterConfig, UserStatus } from '@/types';
import { STATUS_META, MY_STATUS_OPTIONS } from '@/lib/status';
import CharacterAvatar from '@/components/avatar/CharacterAvatar';
import {
  LogOut,
  Bell,
  Search,
  Settings as SettingsIcon,
  LayoutGrid,
  Image as ImageIcon,
  Users,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export type OfficeTab = 'office' | 'snap' | 'people' | 'settings';

interface TopNavProps {
  currentUser: {
    name: string;
    avatar: string;
    character: CharacterConfig;
    jobTitle: string;
    status: UserStatus;
  };
  activeTab: OfficeTab;
  onTabChange: (tab: OfficeTab) => void;
  onStatusChange: (status: UserStatus) => void;
  onOpenCustomizer: () => void;
  onLogout: () => void;
}

const TABS: { key: OfficeTab; label: string; icon: typeof LayoutGrid }[] = [
  { key: 'office', label: 'Office', icon: LayoutGrid },
  { key: 'snap', label: 'Snap', icon: ImageIcon },
  { key: 'people', label: 'People', icon: Users },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function TopNav({
  currentUser,
  activeTab,
  onTabChange,
  onStatusChange,
  onOpenCustomizer,
  onLogout,
}: TopNavProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const meta = STATUS_META[currentUser.status];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-[#0d131f] border-b border-slate-800/80 px-5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo & Tabs */}
      <div className="flex items-center space-x-6">
        <Link href="/office" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-white tracking-tight">
            OfficeWorld
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden lg:flex items-center bg-[#141c2e] border border-slate-800/80 rounded-full px-3.5 py-1.5 w-64 focus-within:border-blue-500/80 transition">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 text-slate-400 hover:text-white transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0d131f]" />
        </button>

        {/* Profile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center space-x-2.5 hover:bg-slate-800/40 rounded-xl px-1.5 py-1 transition"
          >
            <div className="relative">
              <CharacterAvatar config={currentUser.character} size={32} variant="face" ring />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
              <p className="text-[10px] leading-tight text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {currentUser.status}
              </p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 flex items-center space-x-3 border-b border-slate-800 bg-slate-950/40">
                <CharacterAvatar config={currentUser.character} size={44} variant="face" ring />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.jobTitle}</p>
                </div>
              </div>

              <div className="p-3 space-y-1 border-b border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 px-2 pb-1 uppercase tracking-wide">Set Status</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {MY_STATUS_OPTIONS.map((s) => {
                    const m = STATUS_META[s];
                    const active = currentUser.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => onStatusChange(s)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                          active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onOpenCustomizer();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Customize Character
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    onTabChange('settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  Settings
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
