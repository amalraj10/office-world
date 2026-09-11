'use client';

import { useState } from 'react';
import { WEAPONS_CATALOG } from '@/lib/weaponsCatalog';
import { WeaponItem, WeaponType } from '@/types';
import { X, ShoppingBag, ShieldCheck, Zap, Crosshair, Award, DollarSign, CheckCircle2 } from 'lucide-react';

interface GunShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeapon: WeaponType;
  playerCash: number;
  unlockedWeapons: WeaponType[];
  onBuyWeapon: (weapon: WeaponItem) => void;
  onEquipWeapon: (weaponType: WeaponType) => void;
}

export default function GunShopModal({
  isOpen,
  onClose,
  currentWeapon,
  playerCash,
  unlockedWeapons,
  onBuyWeapon,
  onEquipWeapon,
}: GunShopModalProps) {
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponItem>(
    WEAPONS_CATALOG.find((w) => w.id === currentWeapon) || WEAPONS_CATALOG[0]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0b0f19] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#121827] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl">
              🛒
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center space-x-2">
                <span>BLACK MARKET ARMORY</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full">
                  GUN STORE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Purchase, preview & equip special tactical weapons</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Player Cash Balance */}
            <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/50 px-3.5 py-1.5 rounded-full">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-black text-emerald-300 font-mono tracking-wider">
                ${playerCash.toLocaleString()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body Grid: Left Catalog List | Right Detail & Preview Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1 overflow-hidden">
          {/* Left Column: Weapon List */}
          <div className="md:col-span-5 p-4 border-r border-slate-800/80 overflow-y-auto space-y-2.5 bg-[#0e1320]/80">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Select Weapon to Inspect</p>

            {WEAPONS_CATALOG.map((weapon) => {
              const isUnlocked = unlockedWeapons.includes(weapon.id);
              const isEquipped = currentWeapon === weapon.id;
              const isSelected = selectedWeapon.id === weapon.id;

              return (
                <div
                  key={weapon.id}
                  onClick={() => setSelectedWeapon(weapon)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-950/50'
                      : 'bg-[#141b2d]/60 border-slate-800/80 hover:bg-[#1a233a]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{weapon.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-bold text-white">{weapon.name}</h3>
                        {isEquipped && (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">
                            EQUIPPED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {weapon.category} • {weapon.damage} DMG
                      </p>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/50">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-800/50">
                        ${weapon.price}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Weapon Preview Card */}
          <div className="md:col-span-7 p-6 overflow-y-auto bg-[#090d16] flex flex-col justify-between">
            <div>
              {/* Gun Header Banner */}
              <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[#161f36] to-[#0f172a] border border-slate-700/80 shadow-xl overflow-hidden mb-6">
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    {selectedWeapon.badge}
                  </span>
                </div>

                <div className="flex items-center space-x-5">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner">
                    {selectedWeapon.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-wide">{selectedWeapon.name}</h3>
                    <p className="text-xs text-amber-400 font-bold mt-0.5">{selectedWeapon.category} Class Weapon</p>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedWeapon.description}</p>
                  </div>
                </div>
              </div>

              {/* Weapon Performance Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 bg-[#12192c] border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fire Damage</span>
                    </span>
                    <span className="font-bold text-white font-mono">{selectedWeapon.damage} HP</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (selectedWeapon.damage / 90) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-[#12192c] border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ricochet Bounces</span>
                    </span>
                    <span className="font-bold text-white font-mono">{selectedWeapon.maxBounces}x Bounces</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (selectedWeapon.maxBounces / 8) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-[#12192c] border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Magazine Clip</span>
                    </span>
                    <span className="font-bold text-white font-mono">
                      {selectedWeapon.clipSize === 999 ? '∞ Infinite' : `${selectedWeapon.clipSize} Bullets`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (selectedWeapon.clipSize / 30) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-[#12192c] border border-slate-800 rounded-2xl">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      <span>Firing Speed</span>
                    </span>
                    <span className="font-bold text-white font-mono">{selectedWeapon.fireRate}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full rounded-full transition-all duration-300" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Purchase Price</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {selectedWeapon.price === 0 ? 'FREE' : `$${selectedWeapon.price}`}
                </span>
              </div>

              <div>
                {unlockedWeapons.includes(selectedWeapon.id) ? (
                  currentWeapon === selectedWeapon.id ? (
                    <div className="flex items-center space-x-2 px-6 py-3 bg-emerald-600/30 text-emerald-400 font-bold rounded-2xl border border-emerald-500/50">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>EQUIPPED IN COMBAT</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onEquipWeapon(selectedWeapon.id)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-950/50 transition cursor-pointer flex items-center space-x-2"
                    >
                      <span>EQUIP WEAPON</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => onBuyWeapon(selectedWeapon)}
                    disabled={playerCash < selectedWeapon.price}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-950/50 transition cursor-pointer flex items-center space-x-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>BUY FOR ${selectedWeapon.price}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
