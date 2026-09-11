'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createOfficeGame } from '@/game/OfficeGame';
import { OfficeScene } from '@/game/scenes/OfficeScene';
import { CharacterConfig, UserStatus, WeaponItem, WeaponType } from '@/types';
import { MessageSquare, Armchair, ChevronRight, ShoppingBag } from 'lucide-react';
import GunShopModal from '@/components/office/GunShopModal';

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
  const [nearGunShop, setNearGunShop] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [now, setNow] = useState(new Date());

  const [isGunShopOpen, setIsGunShopOpen] = useState(false);
  const [playerCash, setPlayerCash] = useState(1250);
  const [unlockedWeapons, setUnlockedWeapons] = useState<WeaponType[]>(['pistol', 'knife']);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const [ammo, setAmmo] = useState(12);
  const [totalAmmo, setTotalAmmo] = useState(240);
  const [isReloading, setIsReloading] = useState(false);
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('pistol');

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
      game.events.on('near-gunshop', (near: boolean) => setNearGunShop(near));
      game.events.on('status-changed', (status: UserStatus) => {
        onStatusChange(status);
      });
      game.events.on('cash-updated', (data: { cash: number }) => {
        setPlayerCash(data.cash);
      });
      game.events.on('ammo-updated', (data: { ammo: number; totalAmmo: number; isReloading: boolean; weapon: WeaponType }) => {
        setAmmo(data.ammo);
        setTotalAmmo(data.totalAmmo);
        setIsReloading(data.isReloading);
        setCurrentWeapon(data.weapon);
      });

      // Ensure scene ammo & cash state syncs with React HUD after scene boot
      setTimeout(() => {
        const scene = game.scene.getScene('OfficeScene') as OfficeScene;
        if (scene) {
          scene.emitAmmoUpdate();
          scene.emitCashUpdate();
        }
      }, 300);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!gameRef.current) return;
      const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene;
      if (!scene) return;

      if (e.key === 'r' || e.key === 'R') {
        scene.reloadPistol();
      } else if (e.key === 'q' || e.key === 'Q') {
        scene.switchWeapon();
      } else if (e.key === 'b' || e.key === 'B') {
        setIsGunShopOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
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

  const handleBuyWeapon = (weapon: WeaponItem) => {
    if (playerCash >= weapon.price && !unlockedWeapons.includes(weapon.id)) {
      setPlayerCash((prev) => prev - weapon.price);
      setUnlockedWeapons((prev) => [...prev, weapon.id]);
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene;
        if (scene) scene.equipWeapon(weapon.id);
      }
    }
  };

  const handleEquipWeapon = (weaponType: WeaponType) => {
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene;
      if (scene) scene.equipWeapon(weaponType);
    }
  };

  const weaponIcon = currentWeapon === 'shotgun' ? '💥 Shotgun' : currentWeapon === 'laser' ? '⚡ Laser' : currentWeapon === 'rocket' ? '🚀 Rocket' : currentWeapon === 'knife' ? '🗡️ Katana' : '🔫 Pistol';

  return (
    <div className="relative w-full h-full min-h-[550px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Phaser Canvas Container */}
      <div id="phaser-container" ref={containerRef} className="w-full h-full" />

      {/* Welcome / greeting floating card & Combat HUD (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        {showWelcome && (
          <div className="bg-[#0d131f]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800/80 shadow-xl flex items-center space-x-3">
            <span className="text-xl">☀️</span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white tracking-tight">
                Good morning, {currentUser.name.split(' ')[0]} 👋
              </p>
              <p className="text-[10px] text-amber-400 font-bold">
                🔫 ARENA ARMORY • Click: Fire • R: Reload • B: Black Market Gun Store 🛒
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Combat Weapon & Ricochet Shooter HUD (Top Right overlay inside canvas) */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-4 z-10 bg-[#0d131f]/95 border border-slate-800 p-3 rounded-2xl shadow-2xl flex items-center space-x-3"
      >
        {/* Cash Balance Display */}
        <div className="flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-xl border-r border-slate-800 pr-3">
          <span className="text-sm">💵</span>
          <span className="text-xs font-black text-emerald-400 font-mono tracking-wide">
            ${playerCash.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center space-x-2 border-r border-slate-800 pr-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (gameRef.current) {
                const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene;
                if (scene) scene.switchWeapon();
              }
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
          >
            <span>{weaponIcon}</span>
            <kbd className="bg-blue-900 text-blue-200 px-1.5 py-0.5 rounded text-[10px]">Q</kbd>
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[9px]">MAGAZINE</span>
            <div className="flex items-center space-x-1">
              <span className={`font-extrabold text-sm ${isReloading ? 'text-amber-400 animate-pulse' : ammo > 3 ? 'text-emerald-400' : 'text-red-400'}`}>
                {isReloading ? '⏳ RELOADING...' : `${ammo} / ${totalAmmo}`}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (gameRef.current) {
                const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene;
                if (scene) scene.reloadPistol();
              }
            }}
            disabled={isReloading}
            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-[10px] font-bold shadow transition cursor-pointer"
          >
            {isReloading ? '⏳...' : 'RELOAD (R)'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsGunShopOpen(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-950/50 transition cursor-pointer flex items-center space-x-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>GUN STORE (B)</span>
          </button>
        </div>
      </div>

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

        <div className="flex flex-col space-y-1 text-[10px]">
          <div className="flex items-center space-x-2">
            <kbd className="px-1.5 py-0.5 bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">B</kbd>
            <span className="text-slate-300 font-medium">Gun Store Modal</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-1.5 py-0.5 bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">R</kbd>
            <span className="text-slate-300 font-medium">Reload</span>
          </div>
          <div className="flex items-center space-x-2">
            <kbd className="px-1.5 py-0.5 bg-slate-800/90 border border-slate-700/80 rounded text-[9px] font-bold text-white shadow-sm">Q</kbd>
            <span className="text-slate-300 font-medium">Switch Weapon</span>
          </div>
        </div>
      </div>

      {/* Near Black Market Gun Store Prompt */}
      {nearGunShop && !nearDesk && !nearCoworker && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <button
            onClick={() => setIsGunShopOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-full shadow-2xl shadow-amber-950/60 border border-amber-400/50 transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open Black Market Gun Store (B)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* Interactive Black Market Gun Shop Modal */}
      <GunShopModal
        isOpen={isGunShopOpen}
        onClose={() => setIsGunShopOpen(false)}
        currentWeapon={currentWeapon}
        playerCash={playerCash}
        unlockedWeapons={unlockedWeapons}
        onBuyWeapon={handleBuyWeapon}
        onEquipWeapon={handleEquipWeapon}
      />
    </div>
  );
}

