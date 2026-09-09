'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopNav, { OfficeTab } from '@/components/office/TopNav';
import Sidebar from '@/components/office/Sidebar';
import ChatModal from '@/components/chat/ChatModal';
import ExecutiveDashboardModal from '@/components/office/ExecutiveDashboardModal';
import CharacterEditorModal from '@/components/avatar/CharacterEditorModal';
import CharacterAvatar from '@/components/avatar/CharacterAvatar';
import { MOCK_PROFILES, INITIAL_SNAPS, INITIAL_MESSAGES } from '@/lib/mockData';
import { getCharacterConfig } from '@/lib/characterPresets';
import { timeAgo } from '@/lib/status';
import { CharacterConfig, Profile, Snap, Message, UserStatus } from '@/types';
import { Sparkles, User, Briefcase, Building } from 'lucide-react';

// Dynamic import Phaser Office Canvas with ssr: false
const OfficeCanvas = dynamic(() => import('@/components/office/OfficeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[550px] bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 text-xs">
      Loading 2D Office World...
    </div>
  ),
});

interface CurrentUser {
  id: string;
  name: string;
  avatar: string;
  character: CharacterConfig;
  jobTitle: string;
  department: string;
  status: UserStatus;
}

export default function OfficePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: 'user-amal',
    name: 'Amalraj',
    avatar: 'character1',
    character: getCharacterConfig('character1'),
    jobTitle: 'Tech Lead',
    department: 'Engineering',
    status: 'Working',
  });

  const [coworkers, setCoworkers] = useState<Profile[]>(MOCK_PROFILES);
  const [snaps, setSnaps] = useState<Snap[]>(INITIAL_SNAPS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeTab, setActiveTab] = useState<OfficeTab>('office');
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [showCharacterEditor, setShowCharacterEditor] = useState(false);

  const [activeChatRecipient, setActiveChatRecipient] = useState<{
    userId: string;
    name: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('officeworld_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser((prev) => ({
          ...prev,
          name: parsed.displayName || prev.name,
          avatar: parsed.avatar || prev.avatar,
          character: parsed.character || getCharacterConfig(parsed.avatar || prev.avatar),
          jobTitle: parsed.jobTitle || prev.jobTitle,
          department: parsed.department || prev.department,
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const persistUser = (next: CurrentUser) => {
    localStorage.setItem(
      'officeworld_user',
      JSON.stringify({
        displayName: next.name,
        department: next.department,
        jobTitle: next.jobTitle,
        avatar: next.avatar,
        character: next.character,
        status: next.status,
      })
    );
  };

  const handleStatusChange = (newStatus: UserStatus) => {
    setCurrentUser((prev) => {
      const next = { ...prev, status: newStatus };
      persistUser(next);
      return next;
    });
    setCoworkers((prev) =>
      prev.map((c) => (c.id === currentUser.id ? { ...c, status: newStatus } : c))
    );
  };

  const handleSaveCharacter = (config: CharacterConfig) => {
    setCurrentUser((prev) => {
      const next = { ...prev, character: config };
      persistUser(next);
      return next;
    });
    setShowCharacterEditor(false);
  };

  const handleOpenChat = (coworker: { userId: string; name: string; avatar: string }) => {
    setActiveChatRecipient(coworker);
  };

  const handleSendMessage = (receiverId: string, text: string) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      message: text,
      created_at: new Date().toISOString(),
      sender_name: currentUser.name,
      sender_avatar: currentUser.avatar,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleCreateSnap = (text: string, emoji?: string) => {
    const newSnap: Snap = {
      id: `snap-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar,
      user_title: currentUser.jobTitle,
      text,
      image_emoji: emoji,
      reactions: { '❤️': 1 },
      comments: 0,
      created_at: new Date().toISOString(),
    };
    setSnaps((prev) => [newSnap, ...prev]);
  };

  const handleReactSnap = (snapId: string, emoji: string) => {
    setSnaps((prev) =>
      prev.map((s) => {
        if (s.id === snapId) {
          const currentCount = s.reactions[emoji] || 0;
          return {
            ...s,
            reactions: {
              ...s.reactions,
              [emoji]: currentCount + 1,
            },
          };
        }
        return s;
      })
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('officeworld_auth');
    localStorage.removeItem('officeworld_user');
    router.push('/login');
  };

  const handleTabChange = (tab: OfficeTab) => {
    if (tab === 'people') {
      setShowExecutiveModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header Navigation */}
      <TopNav
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onStatusChange={handleStatusChange}
        onOpenCustomizer={() => setShowCharacterEditor(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Center Workspace View */}
        <main className="flex-1 flex flex-col p-4 overflow-hidden relative">
          {/* Tab View Switcher */}
          {activeTab === 'office' && (
            <div className="flex-1 w-full h-full relative">
              <OfficeCanvas
                currentUser={currentUser}
                onOpenChat={handleOpenChat}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {activeTab === 'snap' && (
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto max-w-2xl mx-auto w-full space-y-4">
              <h2 className="text-xl font-bold text-white">Office Snap Feed</h2>
              <div className="space-y-4">
                {snaps.map((snap) => {
                  const config = getCharacterConfig(snap.user_avatar);
                  const likeTotal = Object.values(snap.reactions).reduce((a, b) => a + b, 0);
                  return (
                    <div key={snap.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center space-x-3">
                        <CharacterAvatar config={config} size={36} variant="face" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{snap.user_name}</h4>
                          <p className="text-[10px] text-slate-400">{snap.user_title} · {timeAgo(snap.created_at)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-200">{snap.text}</p>
                      {snap.image_emoji && (
                        <div className="w-full h-32 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-5xl">
                          {snap.image_emoji}
                        </div>
                      )}
                      <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>❤️ {likeTotal}</span>
                        <span>💬 {snap.comments}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto max-w-2xl mx-auto w-full space-y-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>

              {/* Character card */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4">
                <CharacterAvatar config={currentUser.character} size={72} variant="full" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white">{currentUser.name}</h3>
                  <p className="text-xs text-slate-400">{currentUser.jobTitle} · {currentUser.department}</p>
                </div>
                <button
                  onClick={() => setShowCharacterEditor(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Customize Character
                </button>
              </div>

              {/* Profile fields */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300">Profile Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400">Display Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={currentUser.name}
                        onChange={(e) => {
                          const next = { ...currentUser, name: e.target.value };
                          setCurrentUser(next);
                          persistUser(next);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Department</label>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={currentUser.department}
                        onChange={(e) => {
                          const next = { ...currentUser, department: e.target.value };
                          setCurrentUser(next);
                          persistUser(next);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Job Title</label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        value={currentUser.jobTitle}
                        onChange={(e) => {
                          const next = { ...currentUser, jobTitle: e.target.value };
                          setCurrentUser(next);
                          persistUser(next);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <Sidebar
          coworkers={coworkers}
          snaps={snaps}
          currentUser={currentUser}
          onOpenChat={handleOpenChat}
          onCreateSnap={handleCreateSnap}
          onReactSnap={handleReactSnap}
          onStatusChange={handleStatusChange}
          onSeeAllPeople={() => setShowExecutiveModal(true)}
        />
      </div>

      {/* CEO Executive Floor Overview Modal */}
      {showExecutiveModal && (
        <ExecutiveDashboardModal
          coworkers={coworkers}
          onClose={() => setShowExecutiveModal(false)}
        />
      )}

      {/* Character Customizer */}
      {showCharacterEditor && (
        <CharacterEditorModal
          initialConfig={currentUser.character}
          displayName={currentUser.name}
          onSave={handleSaveCharacter}
          onClose={() => setShowCharacterEditor(false)}
        />
      )}

      {/* Floating Proximity Chat Modal */}
      {activeChatRecipient && (
        <ChatModal
          recipient={activeChatRecipient}
          currentUser={{ id: currentUser.id, name: currentUser.name }}
          messages={messages.filter(
            (m) =>
              (m.sender_id === currentUser.id && m.receiver_id === activeChatRecipient.userId) ||
              (m.sender_id === activeChatRecipient.userId && m.receiver_id === currentUser.id) ||
              !m.receiver_id
          )}
          onSendMessage={handleSendMessage}
          onClose={() => setActiveChatRecipient(null)}
        />
      )}
    </div>
  );
}
