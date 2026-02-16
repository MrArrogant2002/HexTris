/**
 * Mode guide content for the in-game playbook.
 */

export interface ModeGuide {
  id: string;
  name: string;
  tagline: string;
  rules: string[];
  strategy: string[];
}

export const MODE_GUIDES: ModeGuide[] = [
  {
    id: 'single',
    name: 'Resonance Drift (Single)',
    tagline: 'Build resonance with varied clears to unlock flow surges.',
    rules: [
      'Clearing 4+ blocks adds Resonance.',
      'Swapping colors during clears fills Resonance faster.',
      'A full Resonance meter triggers a slowdown + score boost window.',
    ],
    strategy: [
      'Rotate often to mix colors before every clear.',
      'Save big clears to ignite Resonance surges.',
      'Use Pulse Wave to reset crowded outer lanes.',
    ],
  },
  {
    id: 'multiplayer',
    name: 'Sync Link (Multiplayer)',
    tagline: 'Charge Sync by clearing quickly to stabilize the field.',
    rules: [
      'Every clear builds Sync Link charge.',
      'Reaching 100% triggers a Sync Burst that calms incoming waves.',
      'Sync drains if you slow down between clears.',
    ],
    strategy: [
      'Keep clears frequent to avoid decay.',
      'Coordinate with power timing for shared relief windows.',
      'Push for Harmonic status before relay spikes.',
    ],
  },
  {
    id: 'timer',
    name: 'Pulse Relay (Timer)',
    tagline: 'Collect relay nodes to extend time and raise tempo.',
    rules: [
      'Relay nodes spawn after strong clears.',
      'Four nodes complete a Relay and add bonus seconds.',
      'Each Relay increases overall speed and scoring bonuses.',
    ],
    strategy: [
      'Prioritize 4+ clears to spawn relay nodes.',
      'Chain Tempo Break with Relay completions for safety.',
      'Use Nova Spark right before Relay bonuses.',
    ],
  },
  {
    id: 'challenge',
    name: 'Hexforge Trials (Challenge)',
    tagline: 'Daily objectives remix the flow every run.',
    rules: [
      'New objectives rotate daily for all players.',
      'Trials track rotations, clears, and power usage.',
      'Complete the objective to earn bonus diamonds.',
    ],
    strategy: [
      'Read the objective before you start.',
      'Use Tempo Break to stabilize difficult objective spikes.',
      'Secure your streaks for bonus rewards.',
    ],
  },
];

export const UI_GUIDELINES: string[] = [
  'Glassmorphism cards with soft blur and radiant accents.',
  'High-contrast typography using bold, geometric fonts.',
  'Layered gradients for depth and motion without clutter.',
  'Responsive stacks: vertical on mobile, split grids on desktop.',
  'Subtle motion cues on buttons, meters, and power activations.',
];
