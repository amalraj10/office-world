'use client';

import { useState } from 'react';
import { CharacterConfig, Profile, Snap, UserStatus } from '@/types';
import { STATUS_META, MY_STATUS_OPTIONS, timeAgo } from '@/lib/status';
import { getCharacterConfig } from '@/lib/characterPresets';
import CharacterAvatar from '@/components/avatar/CharacterAvatar';
import { MessageSquare, Heart, Plus, Send, MoreHorizontal, ChevronRight, MessageCircle } from 'lucide-react';

interface SidebarProps {
  coworkers: Profile[];
  snaps: Snap[];
  currentUser: {
    id: string;
    name: string;
    avatar: string;
    character: CharacterConfig;
    jobTitle: string;
    status: UserStatus;
  };
  onOpenChat: (coworker: { userId: string; name: string; avatar: string }) => void;
  onCreateSnap: (text: string, emoji?: string) => void;
  onReactSnap: (snapId: string, emoji: string) => void;
  onStatusChange: (status: UserStatus) => void;
  onSeeAllPeople: () => void;
}

export default function Sidebar({
  coworkers,
  snaps,
  currentUser,
  onOpenChat,
  onCreateSnap,
  onReactSnap,
  onStatusChange,
  onSeeAllPeople,
}: SidebarProps) {
  const [newSnapText, setNewSnapText] = useState('');
  const [isPostingSnap, setIsPostingSnap] = useState(false);

  const avatarConfigFor = (cw: Profile) =>
    cw.id === currentUser.id ? currentUser.character : getCharacterConfig(cw.avatar, cw.character ?? null);

  const handlePostSnap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapText.trim()) return;
    onCreateSnap(newSnapText.trim(), '✨');
    setNewSnapText('');
    setIsPostingSnap(false);
  };

  return (
    <aside className="w-80 h-full bg-[#0d131f] border-l border-slate-800/80 flex flex-col shadow-2xl overflow-hidden select-none">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* People Section */}
        <div className="p-3.5 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-bold text-white flex items-center gap-1">
              People <span className="text-slate-400 font-normal">({coworkers.length})</span>
              <span className="text-slate-500 text-[10px]">⇅</span>
            </h3>
            <button
              onClick={onSeeAllPeople}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition"
            >
              See all
            </button>
          </div>

          <div className="space-y-1">
            {coworkers.map((cw) => {
              const isMe = cw.id === currentUser.id;
              const meta = STATUS_META[isMe ? currentUser.status : cw.status];
              return (
                <div
                  key={cw.id}
                  className={`px-2.5 py-1.5 rounded-xl transition flex items-center justify-between group ${
                    isMe
                      ? 'bg-blue-600/15 border border-blue-500/30'
                      : 'hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <CharacterAvatar config={avatarConfigFor(cw)} size={28} variant="face" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white leading-tight truncate">
                        {cw.display_name}
                      </h4>
                      <p className="text-[10px] leading-tight text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        <span>{meta.label}</span>
                      </p>
                    </div>
                  </div>

                  {isMe ? (
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400 opacity-80" />
                  ) : (
                    <button
                      onClick={() => onOpenChat({ userId: cw.id, name: cw.display_name, avatar: cw.avatar })}
                      className="p-1 bg-slate-800/70 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition opacity-0 group-hover:opacity-100"
                      title={`Chat with ${cw.display_name}`}
                    >
                      <MessageSquare className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Office Snap Section */}
        <div className="p-3.5">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-bold text-white flex items-center gap-1">
              Office Snap <ChevronRight className="w-3 h-3 text-slate-400" />
            </h3>
            <div className="flex items-center space-x-2">
              <button className="text-slate-500 hover:text-white text-xs">✕</button>
              <button className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition">
                See all
              </button>
            </div>
          </div>

          {!isPostingSnap ? (
            <button
              onClick={() => setIsPostingSnap(true)}
              className="w-full flex items-center justify-center space-x-1.5 py-2 mb-3 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Snap</span>
            </button>
          ) : (
            <form onSubmit={handlePostSnap} className="space-y-2.5 bg-slate-900 p-3 rounded-xl border border-slate-800 mb-3">
              <textarea
                value={newSnapText}
                onChange={(e) => setNewSnapText(e.target.value)}
                placeholder="Share coffee thoughts or office updates..."
                rows={2}
                autoFocus
                className="w-full bg-slate-950 text-xs text-slate-200 placeholder-slate-500 p-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center space-x-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsPostingSnap(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Post</span>
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {snaps.map((snap) => {
              const author = coworkers.find((c) => c.id === snap.user_id);
              const config = author ? avatarConfigFor(author) : getCharacterConfig(snap.user_avatar);
              const likeTotal = Object.values(snap.reactions).reduce((a, b) => a + b, 0);
              return (
                <div key={snap.id} className="p-3 bg-[#131b2e] border border-slate-800/80 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CharacterAvatar config={config} size={28} variant="face" />
                      <div>
                        <h5 className="text-xs font-bold text-white leading-tight">
                          {snap.user_name} <span className="text-[10px] text-slate-400 font-normal ml-1">{timeAgo(snap.created_at)}</span>
                        </h5>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-snug">{snap.text}</p>

                  {snap.image_url ? (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-800/80 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={snap.image_url}
                        alt="Office snap"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : snap.image_emoji ? (
                    <div className="w-full h-24 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-3xl">
                      {snap.image_emoji}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between pt-1 text-slate-400 text-[11px]">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onReactSnap(snap.id, '❤️')}
                        className="flex items-center space-x-1 hover:text-red-400 transition font-medium"
                      >
                        <Heart className="w-3.5 h-3.5 fill-red-500/20 text-red-400" />
                        <span>{likeTotal}</span>
                      </button>
                      <div className="flex items-center space-x-1 font-medium">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{snap.comments}</span>
                      </div>
                    </div>
                    <button className="text-slate-500 hover:text-white">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* My Status - pinned footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0d131f]">
        <p className="text-[11px] font-bold text-white mb-2 px-1">My Status</p>
        <div className="grid grid-cols-4 gap-1.5">
          {MY_STATUS_OPTIONS.map((s) => {
            const active = currentUser.status === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#141c2e] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : s === 'Working' ? 'bg-emerald-500' : s === 'Available' ? 'bg-emerald-400' : s === 'Break' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
