export type UserStatus = 'Working' | 'Away' | 'Break' | 'Offline';

export interface Profile {
  id: string;
  display_name: string;
  avatar: string;
  department: string;
  job_title: string;
  status: UserStatus;
  desk_id?: string;
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
  reactions: Record<string, number>; // e.g. { '❤️': 12, '☕': 5 }
  user_reactions?: string[];
  created_at: string;
}

export interface PlayerPosition {
  userId: string;
  displayName: string;
  avatar: string;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  isSitting: boolean;
  status: UserStatus;
}
