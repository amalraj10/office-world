import { AccessoryType, CharacterConfig, HairStyle, OutfitStyle } from '@/types';

export const SKIN_TONES = [
  { id: 'skin-1', hex: '#FFDBB4' },
  { id: 'skin-2', hex: '#F1C27D' },
  { id: 'skin-3', hex: '#E0AC69' },
  { id: 'skin-4', hex: '#C68642' },
  { id: 'skin-5', hex: '#8D5524' },
  { id: 'skin-6', hex: '#5C3A21' },
];

export const HAIR_COLORS = [
  { id: 'hair-black', hex: '#1E293B' },
  { id: 'hair-brown', hex: '#6B4226' },
  { id: 'hair-blonde', hex: '#D9A441' },
  { id: 'hair-red', hex: '#B5471B' },
  { id: 'hair-gray', hex: '#94A3B8' },
  { id: 'hair-blue', hex: '#3B82F6' },
  { id: 'hair-pink', hex: '#EC4899' },
  { id: 'hair-green', hex: '#22C55E' },
];

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'short-crop', label: 'Short Crop' },
  { id: 'buzz', label: 'Buzz Cut' },
  { id: 'spiky', label: 'Spiky' },
  { id: 'long-curly', label: 'Long Curly' },
  { id: 'bun', label: 'Bun' },
  { id: 'bob-cut', label: 'Bob Cut' },
  { id: 'mohawk', label: 'Mohawk' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'bald', label: 'Bald' },
];

export const OUTFIT_STYLES: { id: OutfitStyle; label: string }[] = [
  { id: 'tshirt', label: 'T-Shirt' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'shirt', label: 'Shirt' },
  { id: 'blazer', label: 'Blazer' },
  { id: 'dress', label: 'Dress' },
];

export const OUTFIT_COLORS = [
  { id: 'outfit-blue', hex: '#2563EB' },
  { id: 'outfit-pink', hex: '#DB2777' },
  { id: 'outfit-green', hex: '#059669' },
  { id: 'outfit-purple', hex: '#7C3AED' },
  { id: 'outfit-orange', hex: '#EA580C' },
  { id: 'outfit-cyan', hex: '#0891B2' },
  { id: 'outfit-black', hex: '#1E293B' },
  { id: 'outfit-red', hex: '#DC2626' },
];

export const ACCESSORIES: { id: AccessoryType; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'glasses', label: 'Glasses' },
  { id: 'headphones', label: 'Headphones' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'cap', label: 'Cap' },
];

export const DEFAULT_CHARACTER: CharacterConfig = {
  skinTone: SKIN_TONES[0].hex,
  hairStyle: 'short-crop',
  hairColor: HAIR_COLORS[0].hex,
  outfitStyle: 'tshirt',
  outfitColor: OUTFIT_COLORS[0].hex,
  accessory: 'none',
};

// Preset character configs used by the coworkers (character1..character6) matching the reference image
export const AVATAR_PRESETS: Record<string, CharacterConfig> = {
  character1: {
    skinTone: '#8D5524',
    hairStyle: 'short-crop',
    hairColor: '#1C1917',
    outfitStyle: 'shirt',
    outfitColor: '#38BDF8',
    accessory: 'none',
  },
  character2: {
    skinTone: '#FFDBB4',
    hairStyle: 'bob-cut',
    hairColor: '#18181B',
    outfitStyle: 'tshirt',
    outfitColor: '#FACC15',
    accessory: 'none',
  },
  character3: {
    skinTone: '#8D5524',
    hairStyle: 'spiky',
    hairColor: '#18181B',
    outfitStyle: 'shirt',
    outfitColor: '#A855F7',
    accessory: 'none',
  },
  character4: {
    skinTone: '#5C3A21',
    hairStyle: 'long-curly',
    hairColor: '#18181B',
    outfitStyle: 'shirt',
    outfitColor: '#EC4899',
    accessory: 'none',
  },
  character5: {
    skinTone: '#8D5524',
    hairStyle: 'short-crop',
    hairColor: '#18181B',
    outfitStyle: 'shirt',
    outfitColor: '#16A34A',
    accessory: 'none',
  },
  character6: {
    skinTone: '#FFDBB4',
    hairStyle: 'short-crop',
    hairColor: '#D9A441',
    outfitStyle: 'hoodie',
    outfitColor: '#2563EB',
    accessory: 'none',
  },
};

export function getCharacterConfig(
  avatarId?: string | null,
  override?: CharacterConfig | null
): CharacterConfig {
  if (override) return override;
  if (avatarId && AVATAR_PRESETS[avatarId]) return AVATAR_PRESETS[avatarId];
  return DEFAULT_CHARACTER;
}

export function randomCharacterConfig(): CharacterConfig {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return {
    skinTone: pick(SKIN_TONES).hex,
    hairStyle: pick(HAIR_STYLES).id,
    hairColor: pick(HAIR_COLORS).hex,
    outfitStyle: pick(OUTFIT_STYLES).id,
    outfitColor: pick(OUTFIT_COLORS).hex,
    accessory: pick(ACCESSORIES).id,
  };
}
