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
    id: 'relay-drift',
    name: 'Relay Drift',
    description: 'Chain calm openings into a high-tempo finish.',
    difficulty: DifficultyLevel.STANDARD,
    mutators: [],
    rewardBonus: 180,
    phases: [
      { name: 'Signal Start', startsAt: 0, speedMultiplier: 0.95, spawnMultiplier: 0.95, musicIntensity: 0.25 },
      { name: 'Flux Rise', startsAt: 60, speedMultiplier: 1.05, spawnMultiplier: 1.08, musicIntensity: 0.55 },
      { name: 'Nova Edge', startsAt: 150, speedMultiplier: 1.15, spawnMultiplier: 1.18, musicIntensity: 0.78 },
      { name: 'Final Orbit', startsAt: 240, speedMultiplier: 1.25, spawnMultiplier: 1.25, musicIntensity: 0.92 },
    ],
  },
  {
    id: 'aegis-blackout',
    name: 'Aegis Blackout',
    description: 'Survive without protective fields while tempo spikes.',
    difficulty: DifficultyLevel.FIERCE,
    mutators: ['noShield'],
    rewardBonus: 220,
    phases: [
      { name: 'Pressure Prep', startsAt: 0, speedMultiplier: 1.05, spawnMultiplier: 1.02, musicIntensity: 0.45 },
      { name: 'Echo Rush', startsAt: 75, speedMultiplier: 1.18, spawnMultiplier: 1.14, musicIntensity: 0.72 },
      { name: 'Blackout', startsAt: 170, speedMultiplier: 1.28, spawnMultiplier: 1.22, musicIntensity: 0.96 },
    ],
  },
  {
    id: 'raw-signal',
    name: 'Raw Signal',
    description: 'No power-ups. Master pure positioning.',
    difficulty: DifficultyLevel.STANDARD,
    mutators: ['noPowerUps'],
    rewardBonus: 200,
    phases: [
      { name: 'Precision Start', startsAt: 0, speedMultiplier: 0.98, spawnMultiplier: 0.96, musicIntensity: 0.32 },
      { name: 'Edge Control', startsAt: 80, speedMultiplier: 1.1, spawnMultiplier: 1.06, musicIntensity: 0.58 },
      { name: 'Hold the Line', startsAt: 190, speedMultiplier: 1.22, spawnMultiplier: 1.14, musicIntensity: 0.84 },
    ],
  },
];

export function getChallengeScriptForDate(date: string): ChallengeScript {
  const seed = Array.from(date).reduce((total, char) => total + char.charCodeAt(0), 0);
  return challengeScripts[seed % challengeScripts.length];
}
