/**
 * Difficulty configuration for Hextris
 * Defines speed, spawn rates, and game behavior for each difficulty level
 */

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface DifficultyConfig {
  level: DifficultyLevel;
  name: string;
  description: string;
  blockSpeed: number; // Blocks per second
  rotationSpeed:number; // Degrees per second when holding rotation
  startingSpeed: number; // Initial speed multiplier
  speedIncrement: number; // Speed increase per level
  spawnDelay: number; // Milliseconds between block spawns
  comboTimeWindow: number; // Milliseconds to maintain combo
  scoreMultiplier: number; // Score multiplier for this difficulty
  speedMultiplier: number; // Global modifier applied to falling blocks & spawns
  spawnRateModifier: number; // Controls how aggressively new blocks spawn
}

export const difficultyConfigs: Record<DifficultyLevel, DifficultyConfig> = {
  [DifficultyLevel.EASY]: {
    level: DifficultyLevel.EASY,
    name: 'Easy',
    description: 'Relaxed pace for beginners',
    blockSpeed: 50,
    rotationSpeed: 7,
    startingSpeed: 1.15,
    speedIncrement: 0.045,
    spawnDelay: 1650,
    comboTimeWindow: 2550,
    scoreMultiplier: 1.15,
    speedMultiplier: 1.6,
    spawnRateModifier: 0.85,
  },
  [DifficultyLevel.MEDIUM]: {
    level: DifficultyLevel.MEDIUM,
    name: 'Medium',
    description: 'Balanced challenge',
    blockSpeed: 95,
    rotationSpeed: 9,
    startingSpeed: 1.5,
    speedIncrement: 0.08,
    spawnDelay: 1100,
    comboTimeWindow: 2100,
    scoreMultiplier: 2.0,
    speedMultiplier: 2.0,
    spawnRateModifier: 1.05,
  },
  [DifficultyLevel.HARD]: {
    level: DifficultyLevel.HARD,
    name: 'Hard',
    description: 'For expert players',
    blockSpeed: 135,
    rotationSpeed: 11,
    startingSpeed: 1.9,
    speedIncrement: 0.12,
    spawnDelay: 850,
    comboTimeWindow: 1700,
    scoreMultiplier: 2.6,
    speedMultiplier: 2.4,
    spawnRateModifier: 1.25,
  },
};

/**
 * Get difficulty configuration by level
 */
export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return difficultyConfigs[level];
}

/**
 * Default difficulty level
 */
export const DEFAULT_DIFFICULTY = DifficultyLevel.MEDIUM;

