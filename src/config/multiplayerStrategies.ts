export type MultiplayerStrategyId = 'ultimateCompetition' | 'rolePlay';
export type MultiplayerRoleId = 'vanguard' | 'guardian' | 'tactician';

export interface MultiplayerStrategyModifiers {
  scoreMultiplier: number;
  speedMultiplier: number;
  spawnMultiplier: number;
  momentumGainMultiplier: number;
  momentumDecayMultiplier: number;
  comboHeatGainMultiplier: number;
}

export interface MultiplayerRole {
  id: MultiplayerRoleId;
  name: string;
  description: string;
  modifiers: Partial<MultiplayerStrategyModifiers>;
}

export interface MultiplayerStrategy {
  id: MultiplayerStrategyId;
  name: string;
  description: string;
  objective: string;
  modifiers: Partial<MultiplayerStrategyModifiers>;
  roles?: MultiplayerRole[];
  defaultRoleId?: MultiplayerRoleId;
}

export const DEFAULT_MULTIPLAYER_MODIFIERS: MultiplayerStrategyModifiers = {
  scoreMultiplier: 1,
  speedMultiplier: 1,
  spawnMultiplier: 1,
  momentumGainMultiplier: 1,
  momentumDecayMultiplier: 1,
  comboHeatGainMultiplier: 1,
};

const applyModifiers = (
  base: MultiplayerStrategyModifiers,
  modifiers?: Partial<MultiplayerStrategyModifiers>
): MultiplayerStrategyModifiers => ({
  scoreMultiplier: base.scoreMultiplier * (modifiers?.scoreMultiplier ?? 1),
  speedMultiplier: base.speedMultiplier * (modifiers?.speedMultiplier ?? 1),
  spawnMultiplier: base.spawnMultiplier * (modifiers?.spawnMultiplier ?? 1),
  momentumGainMultiplier: base.momentumGainMultiplier * (modifiers?.momentumGainMultiplier ?? 1),
  momentumDecayMultiplier: base.momentumDecayMultiplier * (modifiers?.momentumDecayMultiplier ?? 1),
  comboHeatGainMultiplier: base.comboHeatGainMultiplier * (modifiers?.comboHeatGainMultiplier ?? 1),
});

export const multiplayerStrategies: Record<MultiplayerStrategyId, MultiplayerStrategy> = {
  ultimateCompetition: {
    id: 'ultimateCompetition',
    name: 'Ultimate Competition',
    description: 'High-stakes rivalry where every clear fuels the pace.',
    objective: 'Outscore the lobby in a relentless sprint.',
    modifiers: {
      scoreMultiplier: 1.2,
      speedMultiplier: 1.1,
      spawnMultiplier: 1.1,
      momentumGainMultiplier: 1.25,
      momentumDecayMultiplier: 1.1,
      comboHeatGainMultiplier: 1.05,
    },
  },
  rolePlay: {
    id: 'rolePlay',
    name: 'Role Play Clash',
    description: 'Pick a persona to shape how you push, protect, or plan.',
    objective: 'Coordinate roles to dominate the shared leaderboard.',
    modifiers: {},
    defaultRoleId: 'vanguard',
    roles: [
      {
        id: 'vanguard',
        name: 'Vanguard',
        description: 'Aggressive scorer who turns combos into momentum spikes.',
        modifiers: {
          scoreMultiplier: 1.1,
          momentumGainMultiplier: 1.2,
          momentumDecayMultiplier: 1.1,
        },
      },
      {
        id: 'guardian',
        name: 'Guardian',
        description: 'Steady protector who stabilizes tempo and extends momentum.',
        modifiers: {
          speedMultiplier: 0.95,
          spawnMultiplier: 0.95,
          momentumDecayMultiplier: 0.85,
          comboHeatGainMultiplier: 1.1,
        },
      },
      {
        id: 'tactician',
        name: 'Tactician',
        description: 'Precision planner who amplifies combo heat and scoring.',
        modifiers: {
          scoreMultiplier: 1.05,
          comboHeatGainMultiplier: 1.2,
          momentumGainMultiplier: 1.05,
        },
      },
    ],
  },
};

export const getMultiplayerStrategy = (
  id?: MultiplayerStrategyId
): MultiplayerStrategy | undefined => {
  if (!id) return undefined;
  return multiplayerStrategies[id];
};

export const getMultiplayerRole = (
  strategyId?: MultiplayerStrategyId,
  roleId?: MultiplayerRoleId
): MultiplayerRole | undefined => {
  const strategy = getMultiplayerStrategy(strategyId);
  if (!strategy?.roles || !roleId) return undefined;
  return strategy.roles.find((role) => role.id === roleId);
};

export const resolveMultiplayerModifiers = (
  strategyId?: MultiplayerStrategyId,
  roleId?: MultiplayerRoleId
): MultiplayerStrategyModifiers => {
  const strategy = getMultiplayerStrategy(strategyId);
  let resolved = applyModifiers(DEFAULT_MULTIPLAYER_MODIFIERS, strategy?.modifiers);
  const role = getMultiplayerRole(strategyId, roleId);
  resolved = applyModifiers(resolved, role?.modifiers);
  return resolved;
};

export const formatMultiplayerLabel = (
  strategyId?: MultiplayerStrategyId,
  roleId?: MultiplayerRoleId
): string | undefined => {
  const strategy = getMultiplayerStrategy(strategyId);
  if (!strategy) return undefined;
  const role = getMultiplayerRole(strategyId, roleId);
  return role ? `${strategy.name} · ${role.name}` : strategy.name;
};
