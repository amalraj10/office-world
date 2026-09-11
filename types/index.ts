export type UserStatus = 'Working' | 'Available' | 'Break' | 'Away' | 'Offline' | 'In a meeting';

export type WeaponType = 'pistol' | 'shotgun' | 'laser' | 'rocket' | 'knife';
export type TeamColor = 'red' | 'blue';

export interface WeaponItem {
  id: WeaponType;
  name: string;
  category: 'Pistol' | 'Shotgun' | 'Heavy' | 'Energy' | 'Melee';
  icon: string;
  price: number;
  damage: number;
  fireRate: string;
  clipSize: number;
  reserveAmmo: number;
  bulletSpeed: number;
  maxBounces: number;
  description: string;
  bulletColor: string;
  badge: string;
  unlocked: boolean;
}

export type HairStyle =
  | 'short-crop'
  | 'buzz'
  | 'spiky'
  | 'long-curly'
  | 'bun'
  | 'bob-cut'
  | 'mohawk'
  | 'ponytail'
  | 'bald';

export type OutfitStyle = 'tshirt' | 'hoodie' | 'shirt' | 'blazer' | 'dress';

export type AccessoryType = 'none' | 'glasses' | 'headphones' | 'beanie' | 'cap';

export interface CharacterConfig {
  skinTone: string;
  hairStyle: HairStyle;
  hairColor: string;
  outfitStyle: OutfitStyle;
  outfitColor: string;
  accessory: AccessoryType;
}

export interface Profile {
  id: string;
  display_name: string;
  avatar: string;
  character?: CharacterConfig;
  department: string;
  job_title: string;
  status: UserStatus;
  desk_id?: string;
  team?: TeamColor;
  health?: number;
  kills?: number;
  deaths?: number;
  created_at: string;
}

export interface Office {
  id: string;
  name: string;
  created_at: string;
}

export interface Desk {
  id: string;
  office_id: string;
  x: number;
  y: number;
  label: string;
  assigned_user_id?: string | null;
}

export interface OfficeMember {
  id: string;
  office_id: string;
  user_id: string;
  desk_id?: string | null;
  role: 'admin' | 'member';
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string | null;
  office_id?: string;
  message: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface SnapReaction {
  id: string;
  snap_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}

export interface Snap {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_title: string;
  text: string;
  image_url?: string;
  image_emoji?: string;
  comments?: number | Array<{ id: string; author: string; text: string }>;
  reactions: Record<string, number>;
  user_reactions?: string[];
  created_at: string;
}

export interface PlayerPosition {
  userId: string;
  displayName: string;
  avatar: string;
  x: number;
  y: number;
  rotation: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  isSitting: boolean;
  status: UserStatus;
  team: TeamColor;
  health: number;
  maxHealth: number;
  currentWeapon: WeaponType;
  ammo: number;
  maxAmmo: number;
}

export interface CombatEventPayload {
  attackerId: string;
  attackerName: string;
  victimId: string;
  victimName: string;
  weapon: WeaponType;
}
