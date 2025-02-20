import { HolobotStats } from './holobot';

export interface UserHolobot extends HolobotStats {
  id: string;
  userId: string;
  wins: number;
  losses: number;
  experience: number;
  lastBattleTimestamp?: number;
}

export interface UserData {
  id: string;
  username: string;
  holos: number;
  dailyEnergy: number;
  maxEnergy: number;
  lastEnergyRefresh: number;
  holobots: UserHolobot[];
  wins: number;
  losses: number;
  walletAddress?: string; // For future Web3 integration
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: UserData }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<UserData> }
  | { type: 'UPDATE_HOLOBOT'; payload: UserHolobot }
  | { type: 'UPDATE_ENERGY'; payload: number }
  | { type: 'ADD_HOLOS'; payload: number }
  | { type: 'SUBTRACT_HOLOS'; payload: number };

// Constants
export const ENERGY_REFRESH_RATE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const MAX_ENERGY = 100;
export const INITIAL_HOLOS = 1000;
export const BATTLE_ENERGY_COST = 10; 