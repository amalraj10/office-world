'use client';

import { useState } from 'react';
import { CharacterConfig } from '@/types';
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFIT_STYLES,
  OUTFIT_COLORS,
  ACCESSORIES,
  randomCharacterConfig,
} from '@/lib/characterPresets';
import CharacterAvatar from './CharacterAvatar';
import { X, Shuffle, Check } from 'lucide-react';

interface CharacterEditorModalProps {
  initialConfig: CharacterConfig;
  displayName?: string;
  onSave: (config: CharacterConfig) => void;
  onClose: () => void;
}

type TabKey = 'skin' | 'hairStyle' | 'hairColor' | 'outfitStyle' | 'outfitColor' | 'accessory';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'skin', label: 'Skin Tone' },
  { key: 'hairStyle', label: 'Hair Style' },
  { key: 'hairColor', label: 'Hair Color' },
  { key: 'outfitStyle', label: 'Outfit' },
  { key: 'outfitColor', label: 'Outfit Color' },
  { key: 'accessory', label: 'Accessory' },
];

export default function CharacterEditorModal({
  initialConfig,
  displayName,
  onSave,
  onClose,
}: CharacterEditorModalProps) {
  const [config, setConfig] = useState<CharacterConfig>(initialConfig);
  const [tab, setTab] = useState<TabKey>('hairStyle');

  const patch = (p: Partial<CharacterConfig>) => setConfig((prev) => ({ ...prev, ...p }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Customize Your Character</h2>
            <p className="text-xs text-slate-400">Pick a hairstyle, outfit and accessory — just like Bitmoji</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Preview */}
          <div className="sm:w-64 shrink-0 flex flex-col items-center justify-center gap-4 p-6 border-b sm:border-b-0 sm:border-r border-slate-800 bg-gradient-to-b from-slate-950/60 to-slate-900">
            <CharacterAvatar config={config} variant="full" size={180} className="shadow-xl" />
            {displayName && <p className="text-sm font-bold text-white">{displayName}</p>}
            <button
              onClick={() => setConfig(randomCharacterConfig())}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Randomize
            </button>
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 pt-4 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                    tab === t.key
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'skin' && (
                <SwatchGrid
                  items={SKIN_TONES.map((s) => ({ id: s.id, color: s.hex }))}
                  selected={config.skinTone}
                  onSelect={(hex) => patch({ skinTone: hex })}
                />
              )}

              {tab === 'hairStyle' && (
                <div className="grid grid-cols-3 gap-3">
                  {HAIR_STYLES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => patch({ hairStyle: h.id })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition ${
                        config.hairStyle === h.id
                          ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <CharacterAvatar
                        config={{ ...config, hairStyle: h.id }}
                        size={52}
                        variant="face"
                      />
                      <span className="text-[10px] font-semibold text-slate-300">{h.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === 'hairColor' && (
                <SwatchGrid
                  items={HAIR_COLORS.map((c) => ({ id: c.id, color: c.hex }))}
                  selected={config.hairColor}
                  onSelect={(hex) => patch({ hairColor: hex })}
                />
              )}

              {tab === 'outfitStyle' && (
                <div className="grid grid-cols-3 gap-3">
                  {OUTFIT_STYLES.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => patch({ outfitStyle: o.id })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition ${
                        config.outfitStyle === o.id
                          ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <CharacterAvatar
                        config={{ ...config, outfitStyle: o.id }}
                        size={60}
                        variant="full"
                      />
                      <span className="text-[10px] font-semibold text-slate-300">{o.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === 'outfitColor' && (
                <SwatchGrid
                  items={OUTFIT_COLORS.map((c) => ({ id: c.id, color: c.hex }))}
                  selected={config.outfitColor}
                  onSelect={(hex) => patch({ outfitColor: hex })}
                />
              )}

              {tab === 'accessory' && (
                <div className="grid grid-cols-3 gap-3">
                  {ACCESSORIES.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => patch({ accessory: a.id })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition ${
                        config.accessory === a.id
                          ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <CharacterAvatar
                        config={{ ...config, accessory: a.id }}
                        size={52}
                        variant="face"
                      />
                      <span className="text-[10px] font-semibold text-slate-300">{a.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(config)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition"
          >
            <Check className="w-3.5 h-3.5" />
            Save Character
          </button>
        </div>
      </div>
    </div>
  );
}

function SwatchGrid({
  items,
  selected,
  onSelect,
}: {
  items: { id: string; color: string }[];
  selected: string;
  onSelect: (hex: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.color)}
          className={`relative w-10 h-10 rounded-full border-2 transition ${
            selected === item.color ? 'border-blue-500 scale-110' : 'border-slate-700 hover:border-slate-500'
          }`}
          style={{ backgroundColor: item.color }}
        >
          {selected === item.color && (
            <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
          )}
        </button>
      ))}
    </div>
  );
}
