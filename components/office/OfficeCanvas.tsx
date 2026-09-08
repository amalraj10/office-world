'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createOfficeGame } from '@/game/OfficeGame';
import { OfficeScene } from '@/game/scenes/OfficeScene';
import { UserStatus } from '@/types';
import { MessageSquare, Armchair, ChevronRight } from 'lucide-react';

interface OfficeCanvasProps {
  currentUser: {
    id: string;
    name: string;
    avatar: string;
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

  useEffect(() => {
    if (!containerRef.current) return;

    // Prevent duplicate Phaser instances in strict mode
    if (!gameRef.current) {
      const game = createOfficeGame(containerRef.current.id);
      gameRef.current = game;

      // Event Listeners
      game.events.on('near-desk', (desk: any) => setNearDesk(desk));
      game.events.on('near-coworker', (coworker: any) => setNearCoworker(coworker));
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
  }, []);

  const handleSitAtDesk = () => {
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene;
    if (scene) {
      const nextSitting = !isSitting;
      setIsSitting(nextSitting);
      scene.setSittingState(nextSitting);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Phaser Canvas Container */}
      <div id="phaser-container" ref={containerRef} className="w-full h-full" />

      {/* Floating Instructions & Mini Legend */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center space-x-3 shadow-lg">
        <div className="flex items-center space-x-1.5 font-semibold text-blue-400">
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-white">W</kbd>
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-white">A</kbd>
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-white">S</kbd>
          <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-white">D</kbd>
          <span className="text-slate-400 font-normal">to Walk</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Approach desks or coworkers to interact</span>
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
