'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { getCharacterConfig } from '@/lib/characterPresets';
import CharacterAvatar from '@/components/avatar/CharacterAvatar';
import { X, Send } from 'lucide-react';

interface ChatModalProps {
  recipient: {
    userId: string;
    name: string;
    avatar: string;
  };
  currentUser: {
    id: string;
    name: string;
  };
  messages: Message[];
  onSendMessage: (receiverId: string, text: string) => void;
  onClose: () => void;
}

export default function ChatModal({
  recipient,
  currentUser,
  messages,
  onSendMessage,
  onClose,
}: ChatModalProps) {
  const [text, setText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(recipient.userId, text.trim());
    setText('');
  };

  return (
    <div className="fixed bottom-6 right-84 z-50 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-slate-950 p-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <CharacterAvatar config={getCharacterConfig(recipient.avatar)} size={28} variant="face" />
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">{recipient.name}</h4>
            <span className="text-[10px] text-emerald-400 font-medium">💬 Proximity Chat</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-3 space-y-2.5 bg-slate-950/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center p-4">
            <p className="text-xs text-slate-500">
              Start proximity text conversation with <span className="text-slate-300 font-medium">{recipient.name}</span>
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                  }`}
                >
                  <p>{msg.message}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${recipient.name}...`}
          className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
