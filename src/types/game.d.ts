/**
 * Type definitions for game state
 */

import type { DifficultyLevel } from '@config/difficulty';
import type { ThemeName } from '@config/themes';
import type { ShopItemId } from '@config/shopItems';
import type { GameStatus } from '@core/constants';

export type PlayerInventory = Record<ShopItemId, number>;

export interface PlayerState {
  id: string;
  name: string;
  highScore: number;
  specialPoints: number;
  gamesPlayed: number;
  totalPlayTime: number;
  themesUnlocked: ThemeName[];
  selectedTheme: ThemeName;
  inventory: PlayerInventory;
}

export interface GamePlayState {
  score: number;
  lives: number;
  difficulty: DifficultyLevel;
  combo: number;
  comboTimer: number;
  gameTime: number;
  isInvulnerable: boolean;
  speedMultiplier: number;
}

export interface UIState {
  currentRoute: string;
  isPaused: boolean;
  isShopOpen: boolean;
  isModalOpen: boolean;
  isMusicMuted: boolean;
  isSfxMuted: boolean;
  musicVolume: number;
  sfxVolume: number;
  preGamePowerUps?: string[];
  currentGameMode?: 'standard' | 'dailyChallenge' | 'timerAttack';
  timerDuration?: number;
  currentGroupId?: string;
}

export interface Group {
  $id: string;
  roomCode: string;
  groupName: string;
  createdBy: string;
  memberIds: string[];
  memberCount: number;
  createdAt?: string;
  isActive?: boolean;
}

export interface GroupScore {
  $id: string;
  userId: string;
  groupId: string;
  userName: string;
  bestScore: number;
  gamesPlayed: number;
  lastPlayedAt?: string;
  difficulty?: string;
}

export interface GameState {
  status: GameStatus;
  player: PlayerState;
  game: GamePlayState;
  ui: UIState;
}

export type StateEvent = 
  | 'statusChanged'
  | 'scoreUpdated'
  | 'livesChanged'
  | 'comboChanged'
  | 'specialPointsChanged'
  | 'gameStarted'
  | 'gamePaused'
  | 'gameResumed'
  | 'gameOver'
  | 'lifeLost'
  | 'lifeGained'
  | 'powerUpCollected'
  | 'powerUpUsed';

export type StateListener = (data?: any) => void;

