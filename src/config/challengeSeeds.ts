/**
 * Daily challenge scripts
 * Deterministic selection based on date.
 */

import { DifficultyLevel } from '@config/difficulty';

export interface ChallengePhase {
  name: string;
  startsAt: number;
  speedMultiplier?: number;
  spawnMultiplier?: number;
  message?: string;
  musicIntensity?: number;
}

export interface ChallengeScript {
  id: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  mutators: string[];
  phases: ChallengePhase[];
  rewardBonus: number;
}

export const challengeScripts: ChallengeScript[] = [
  {
    id: 'steady-ascent',
    name: 'Steady Ascent',
    description: 'Measured build-up with late spike and mirrored input.',
    difficulty: DifficultyLevel.STANDARD,
    mutators: ['mirroredInput'],
    rewardBonus: 150,
    phases: [
      { name: 'Warm Entry', startsAt: 0, speedMultiplier: 1, spawnMultiplier: 1, musicIntensity: 0.3 },
      { name: 'Mid Push', startsAt: 45, speedMultiplier: 1.1, spawnMultiplier: 1.05, musicIntensity: 0.55 },
      { name: 'Climb', startsAt: 120, speedMultiplier: 1.2, spawnMultiplier: 1.1, musicIntensity: 0.75 },
      { name: 'Overdrive', startsAt: 210, speedMultiplier: 1.3, spawnMultiplier: 1.15, musicIntensity: 0.9 },
    ],
  },
  {
    id: 'shieldless-surge',
    name: 'Shieldless Surge',
    description: 'No shields allowed. Surges hit harder late.',
    difficulty: DifficultyLevel.FIERCE,
    mutators: ['noShield'],
    rewardBonus: 200,
    phases: [
      { name: 'Pressure Prep', startsAt: 0, speedMultiplier: 1, spawnMultiplier: 1, musicIntensity: 0.4 },
      { name: 'Wave Rush', startsAt: 60, speedMultiplier: 1.15, spawnMultiplier: 1.1, musicIntensity: 0.7 },
      { name: 'Surge Boss', startsAt: 150, speedMultiplier: 1.25, spawnMultiplier: 1.2, musicIntensity: 0.95 },
    ],
  },
  {
    id: 'no-powerups',
    name: 'Bare Hands',
    description: 'No power-ups, just precision.',
    difficulty: DifficultyLevel.STANDARD,
    mutators: ['noPowerUps'],
    rewardBonus: 180,
    phases: [
      { name: 'Precision Start', startsAt: 0, speedMultiplier: 1, spawnMultiplier: 0.95, musicIntensity: 0.35 },
      { name: 'Edge Control', startsAt: 75, speedMultiplier: 1.1, spawnMultiplier: 1.05, musicIntensity: 0.6 },
      { name: 'Sustain', startsAt: 180, speedMultiplier: 1.2, spawnMultiplier: 1.1, musicIntensity: 0.85 },
    ],
  },
];

export function getChallengeScriptForDate(date: string): ChallengeScript {
  const seed = Array.from(date).reduce((total, char) => total + char.charCodeAt(0), 0);
  return challengeScripts[seed % challengeScripts.length];
}
