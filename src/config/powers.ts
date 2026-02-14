/**
 * Power definitions for the redesigned Hextris powers system.
 */

export const POWER_UP_IDS = ['pulse', 'tempo', 'aegis', 'shift', 'nova'] as const;
export type PowerUpType = typeof POWER_UP_IDS[number];

export interface PowerDefinition {
  id: PowerUpType;
  name: string;
  icon: string;
  color: string;
  description: string;
  cooldownMs: number;
  durationMs?: number;
}

export const POWER_DEFINITIONS: Record<PowerUpType, PowerDefinition> = {
  pulse: {
    id: 'pulse',
    name: 'Pulse Wave',
    icon: 'PULSE',
    color: '#7cdeff',
    description: 'Clears the outermost ring of blocks across every lane.',
    cooldownMs: 8000,
  },
  tempo: {
    id: 'tempo',
    name: 'Tempo Break',
    icon: 'TEMPO',
    color: '#6ee7b7',
    description: 'Slows block fall and spawn rhythm for a short burst.',
    cooldownMs: 10000,
    durationMs: 6000,
  },
  aegis: {
    id: 'aegis',
    name: 'Aegis Field',
    icon: 'AEGIS',
    color: '#fbcfe8',
    description: 'Grants brief invulnerability while the field is active.',
    cooldownMs: 12000,
    durationMs: 8000,
  },
  shift: {
    id: 'shift',
    name: 'Orbit Shift',
    icon: 'SHIFT',
    color: '#fbbf24',
    description: 'Rotates all settled stacks one lane clockwise to realign colors.',
    cooldownMs: 11000,
  },
  nova: {
    id: 'nova',
    name: 'Nova Spark',
    icon: 'NOVA',
    color: '#a78bfa',
    description: 'Boosts scoring output for the next few matches.',
    cooldownMs: 14000,
    durationMs: 10000,
  },
};

export const POWER_SPAWN_POOL: PowerUpType[] = [
  'pulse',
  'tempo',
  'pulse',
  'aegis',
  'shift',
  'nova',
  'tempo',
];

export const POWER_LABELS: Record<PowerUpType, string> = Object.values(POWER_DEFINITIONS).reduce(
  (acc, power) => {
    acc[power.id] = power.name;
    return acc;
  },
  {} as Record<PowerUpType, string>
);

export function getPowerDefinition(type: PowerUpType): PowerDefinition {
  return POWER_DEFINITIONS[type];
}
