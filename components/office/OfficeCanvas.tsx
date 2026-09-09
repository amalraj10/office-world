'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createOfficeGame } from '@/game/OfficeGame';
import { OfficeScene } from '@/game/scenes/OfficeScene';
import { CharacterConfig, UserStatus } from '@/types';
import { MessageSquare, Armchair, ChevronRight, Sun, Moon, X } from 'lucide-react';

interface OfficeCanvasProps {
  currentUser: {
    id: string;
    name: string;
    avatar: string;
    character: CharacterConfig;
    status: UserStatus;
  };
  onOpenChat: (coworker: { userId: string; name: string; avatar: string }) => void;
  onStatusChange: (status: UserStatus) => void;
}

export default function OfficeCanvas({ currentUser, onOpenChat, onStatusChange }: OfficeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const [nearDesk, setNearDesk] = useState<{ id: string; label: string; x: number; y: number } | null>(null);
  const [nearCoworker, setNearCoworker] = useState<{ userId: string; name: string; avatar: string; status: string } | null>(null);
  const [isSitting, setIsSitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!gameRef.current) {
      const game = createOfficeGame(containerRef.current.id, {
        currentUser: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          character: currentUser.character,
          status: currentUser.status,
        },
      });
      gameRef.current = game;

      game.events.on('near-desk', (desk: { id: string; label: string; x: number; y: number } | null) => setNearDesk(desk));
      game.events.on(
        'near-coworker',
        (coworker: { userId: string; name: string; avatar: string; status: string } | null) => setNearCoworker(coworker)
      );
      game.events.on('status-changed', (status: UserStatus) => {
        onStatusChange(status);
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-update the player's appearance whenever the character config changes
  useEffect(() => {
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene | undefined;
    if (scene && typeof scene.updatePlayerCharacter === 'function') {
      scene.updatePlayerCharacter(currentUser.character);
    }
  }, [currentUser.character]);

  const handleSitAtDesk = () => {
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene;
    if (scene) {
      const nextSitting = !isSitting;
      setIsSitting(nextSitting);
      scene.setSittingState(nextSitting);
    }
  };

  const hour = now.getHours();
  const isDay = hour >= 6 && hour < 18;
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="relative w-full h-full min-h-[550px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Phaser Canvas Container */}
      <div id="phaser-container" ref={containerRef} className="w-full h-full" />

      {/* Welcome / greeting floating card (Top Left) */}
      {showWelcome && (
        <div className="absolute top-4 left-4 z-10 bg-[#0d131f]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800/80 shadow-xl flex items-center space-x-3">
          <span className="text-xl">☀️</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white tracking-tight">
              Good morning, {currentUser.name.split(' ')[0]} 👋
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              8:42 AM • Tue, 9 Sep
            </p>
          </div>
        </div>
      )}

      {/* Movement controls legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#0d131f]/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800/80 shadow-xl flex items-center space-x-4 text-slate-300">
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-1">
            <span />
            <kbd className="w-5 h-5 flex items-center justify-center bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">W</kbd>
            <span />
            <kbd className="w-5 h-5 flex items-center justify-center bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">A</kbd>
            <kbd className="w-5 h-5 flex items-center justify-center bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">S</kbd>
            <kbd className="w-5 h-5 flex items-center justify-center bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">D</kbd>
          </div>
          <span className="text-[9px] text-slate-400 mt-1 font-medium">Move</span>
        </div>

        <div className="flex flex-col space-y-2 text-[10px]">
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-0.5 bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">E</kbd>
            <span className="text-slate-300 font-medium">Interact</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-2 py-0.5 bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">Shift</kbd>
            <span className="text-slate-300 font-medium">Run</span>
          </div>
        </div>
      </div>

      {/* Desk Sitting Interaction Prompt */}
      {nearDesk && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <button
            onClick={handleSitAtDesk}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-full shadow-xl shadow-emerald-950/50 border border-emerald-400/40 transition"
          >
            <Armchair className="w-4 h-4" />
            <span>{isSitting ? 'Leave Desk' : `Sit at ${nearDesk.label}`}</span>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
      )}

      {/* Proximity Coworker Chat Prompt */}
      {nearCoworker && !nearDesk && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <button
            onClick={() => onOpenChat(nearCoworker)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-full shadow-xl shadow-blue-950/50 border border-blue-400/40 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Talk with {nearCoworker.name}</span>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
      )}
    </div>
  );
}
