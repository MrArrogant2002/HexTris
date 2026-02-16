/**
 * Power definitions for the redesigned Hextris powers system.
 */

export const POWER_UP_IDS = ['pulse', 'tempo', 'aegis', 'nova'] as const;
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
    icon: '💫',
    color: '#7cdeff',
    description: 'Clears the outermost ring of blocks across every lane.',
    cooldownMs: 8000,
  },
  tempo: {
    id: 'tempo',
    name: 'Tempo Break',
    icon: '🌀',
    color: '#6ee7b7',
    description: 'Slows block fall and spawn rhythm for a short burst.',
    cooldownMs: 10000,
    durationMs: 6000,
  },
  aegis: {
    id: 'aegis',
    name: 'Aegis Field',
    icon: '🛡️',
    color: '#fbcfe8',
    description: 'Grants brief invulnerability while the field is active.',
    cooldownMs: 12000,
    durationMs: 8000,
  },
  nova: {
    id: 'nova',
    name: 'Nova Spark',
    icon: '✨',
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
  'nova',
  'tempo',
];

export function getPowerDefinition(type: PowerUpType): PowerDefinition {
  return POWER_DEFINITIONS[type];
}
