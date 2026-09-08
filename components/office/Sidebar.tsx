'use client';

import { useState } from 'react';
import { Profile, Snap, UserStatus } from '@/types';
import { MessageSquare, Heart, Plus, Send, Sparkles, Image as ImageIcon, MapPin } from 'lucide-react';

interface SidebarProps {
  coworkers: Profile[];
  snaps: Snap[];
  currentUser: {
    id: string;
    name: string;
    avatar: string;
    jobTitle: string;
    status: UserStatus;
  };
  onOpenChat: (coworker: { userId: string; name: string; avatar: string }) => void;
  onCreateSnap: (text: string, imageUrl?: string) => void;
  onReactSnap: (snapId: string, emoji: string) => void;
}

export default function Sidebar({
  coworkers,
  snaps,
  currentUser,
  onOpenChat,
  onCreateSnap,
  onReactSnap,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'people' | 'snap'>('people');
  const [newSnapText, setNewSnapText] = useState('');
  const [newSnapImage, setNewSnapImage] = useState('');
  const [isPostingSnap, setIsPostingSnap] = useState(false);

  const statusColors: Record<UserStatus, string> = {
    Working: 'bg-emerald-500',
    Away: 'bg-amber-500',
    Break: 'bg-blue-500',
    Offline: 'bg-slate-500',
  };

  const handlePostSnap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapText.trim()) return;
    onCreateSnap(newSnapText.trim(), newSnapImage.trim() || undefined);
    setNewSnapText('');
    setNewSnapImage('');
    setIsPostingSnap(false);
  };

  return (
    <aside className="w-80 h-full bg-slate-900/95 border-l border-slate-800 flex flex-col shadow-2xl">
      {/* Sidebar Tabs */}
      <div className="p-3 border-b border-slate-800 flex items-center space-x-2 bg-slate-950/40">
        <button
          onClick={() => setActiveTab('people')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'people'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>PEOPLE</span>
          <span className="bg-slate-900/60 px-1.5 py-0.5 rounded-full text-[10px] text-blue-200">
            {coworkers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('snap')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'snap'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <span>OFFICE SNAP</span>
          <span className="bg-slate-900/60 px-1.5 py-0.5 rounded-full text-[10px] text-blue-200">
            {snaps.length}
          </span>
        </button>
      </div>

      {/* Tab 1: People List */}
      {activeTab === 'people' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {coworkers.map((cw) => (
            <div
              key={cw.id}
              className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                    {cw.display_name.charAt(0)}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                      statusColors[cw.status]
                    }`}
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight flex items-center space-x-1.5">
                    <span>{cw.display_name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-tight">{cw.job_title}</p>
                </div>
              </div>

              <button
                onClick={() =>
                  onOpenChat({ userId: cw.id, name: cw.display_name, avatar: cw.avatar })
                }
                className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition"
                title={`Chat with ${cw.display_name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Office Snap Feed */}
      {activeTab === 'snap' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Create Snap Button */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/30">
            {!isPostingSnap ? (
              <button
                onClick={() => setIsPostingSnap(true)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Office Snap</span>
              </button>
            ) : (
              <form onSubmit={handlePostSnap} className="space-y-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <textarea
                  value={newSnapText}
                  onChange={(e) => setNewSnapText(e.target.value)}
                  placeholder="Share coffee thoughts or office updates..."
                  rows={2}
                  className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="url"
                  value={newSnapImage}
                  onChange={(e) => setNewSnapImage(e.target.value)}
                  placeholder="Optional image URL..."
                  className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-500 p-2 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center space-x-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPostingSnap(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Snaps Feed List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {snaps.map((snap) => (
              <div key={snap.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-500/40">
                    {snap.user_name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">{snap.user_name}</h5>
                    <p className="text-[10px] text-slate-400">{snap.user_title}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{snap.text}</p>

                {snap.image_url && (
                  <img
                    src={snap.image_url}
                    alt="Snap attachment"
                    className="w-full h-32 object-cover rounded-xl border border-slate-800"
                  />
                )}

                {/* Reactions */}
                <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60">
                  {Object.entries(snap.reactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => onReactSnap(snap.id, emoji)}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[11px] flex items-center space-x-1 transition"
                    >
                      <span>{emoji}</span>
                      <span className="font-semibold text-slate-400">{count}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => onReactSnap(snap.id, '❤️')}
                    className="p-1 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded-lg transition"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
