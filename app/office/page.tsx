'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import TopNav from '@/components/office/TopNav';
import Sidebar from '@/components/office/Sidebar';
import ChatModal from '@/components/chat/ChatModal';
import ExecutiveDashboardModal from '@/components/office/ExecutiveDashboardModal';
import { MOCK_PROFILES, INITIAL_SNAPS, INITIAL_MESSAGES } from '@/lib/mockData';
import { Profile, Snap, Message, UserStatus } from '@/types';
import { Sparkles, X } from 'lucide-react';

// Dynamic import Phaser Office Canvas with ssr: false
const OfficeCanvas = dynamic(() => import('@/components/office/OfficeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[550px] bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-400 text-xs">
      Loading 2D Office World...
    </div>
  ),
});

export default function OfficePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatar: string;
    jobTitle: string;
    status: UserStatus;
  }>({
    id: 'user-amal',
    name: 'Amal',
    avatar: 'character1',
    jobTitle: 'Tech Lead',
    status: 'Working',
  });

  const [coworkers, setCoworkers] = useState<Profile[]>(MOCK_PROFILES);
  const [snaps, setSnaps] = useState<Snap[]>(INITIAL_SNAPS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeTab, setActiveTab] = useState<'office' | 'snap' | 'people'>('office');
  const [welcomeBanner, setWelcomeBanner] = useState(true);
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);

  // Active chat modal target
  const [activeChatRecipient, setActiveChatRecipient] = useState<{
    userId: string;
    name: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    // Check saved user profile in localStorage
    const savedUser = localStorage.getItem('officeworld_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser((prev) => ({
          ...prev,
          name: parsed.displayName || 'Amal',
          avatar: parsed.avatar || 'character1',
          jobTitle: parsed.jobTitle || 'Tech Lead',
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleStatusChange = (newStatus: UserStatus) => {
    setCurrentUser((prev) => ({ ...prev, status: newStatus }));
    setCoworkers((prev) =>
      prev.map((c) => (c.id === currentUser.id ? { ...c, status: newStatus } : c))
    );
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

  const handleCreateSnap = (text: string, imageUrl?: string) => {
    const newSnap: Snap = {
      id: `snap-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar,
      user_title: currentUser.jobTitle,
      text,
      image_url: imageUrl,
      reactions: { '❤️': 1 },
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

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header Navigation */}
      <TopNav
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'people') {
            setShowExecutiveModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onStatusChange={handleStatusChange}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Center Workspace View */}
        <main className="flex-1 flex flex-col p-4 overflow-hidden relative">
          {/* Welcome Banner */}
          {welcomeBanner && (
            <div className="mb-3 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 border border-blue-800/40 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-blue-200 shadow-md">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>
                  Good morning, <strong className="text-white font-bold">{currentUser.name.split(' ')[0]}</strong> 👋 Welcome to OfficeWorld!
                </span>
              </div>
              <button
                onClick={() => setWelcomeBanner(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                {snaps.map((snap) => (
                  <div key={snap.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                        {snap.user_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{snap.user_name}</h4>
                        <p className="text-[10px] text-slate-400">{snap.user_title}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200">{snap.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'people' && (
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-y-auto max-w-3xl mx-auto w-full space-y-4">
              <h2 className="text-xl font-bold text-white">Employee Directory</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coworkers.map((cw) => (
                  <div key={cw.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{cw.display_name}</h4>
                      <p className="text-xs text-slate-400">{cw.job_title} • {cw.department}</p>
                      <span className="text-[10px] text-emerald-400 font-medium">🟢 {cw.status}</span>
                    </div>
                    <button
                      onClick={() => handleOpenChat({ userId: cw.id, name: cw.display_name, avatar: cw.avatar })}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
                    >
                      Chat
                    </button>
                  </div>
                ))}
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
        />
      </div>

      {/* CEO Executive Floor Overview Modal */}
      {showExecutiveModal && (
        <ExecutiveDashboardModal
          coworkers={coworkers}
          onClose={() => setShowExecutiveModal(false)}
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
