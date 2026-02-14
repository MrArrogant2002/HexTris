/**
 * Control mapping configuration for Hextris.
 */

export type ControlCommand =
  | 'rotateLeft'
  | 'rotateRight'
  | 'speedUp'
  | 'pause'
  | 'restart'
  | 'powerSlot1'
  | 'powerSlot2'
  | 'powerSlot3';

export type ControlMapping = Record<ControlCommand, string[]>;

export interface ControlDefinition {
  command: ControlCommand;
  label: string;
  description: string;
  remappable: boolean;
  fixedKeys?: string[];
}

const STORAGE_KEY = 'hextris.controls.v2';

export const DEFAULT_CONTROL_MAPPING: ControlMapping = {
  rotateLeft: ['arrowleft', 'arrowup', 'q'],
  rotateRight: ['arrowright', 'arrowdown', 'e'],
  speedUp: ['shift', 's'],
  pause: ['p', 'space', 'escape'],
  restart: ['enter'],
  powerSlot1: ['1'],
  powerSlot2: ['2'],
  powerSlot3: ['3'],
};

export const CONTROL_DEFINITIONS: ControlDefinition[] = [
  {
    command: 'rotateLeft',
    label: 'Rotate Left',
    description: 'Turn the hexagon counter-clockwise.',
    remappable: true,
    fixedKeys: ['arrowleft', 'arrowup'],
  },
  {
    command: 'rotateRight',
    label: 'Rotate Right',
    description: 'Turn the hexagon clockwise.',
    remappable: true,
    fixedKeys: ['arrowright', 'arrowdown'],
  },
  {
    command: 'speedUp',
    label: 'Glide Boost',
    description: 'Speed up block descent.',
    remappable: true,
  },
  {
    command: 'pause',
    label: 'Pause / Resume',
    description: 'Toggle the pause menu.',
    remappable: true,
  },
  {
    command: 'restart',
    label: 'Restart Run',
    description: 'Restart after a game over.',
    remappable: true,
  },
  {
    command: 'powerSlot1',
    label: 'Power Slot 1',
    description: 'Trigger the first stored power.',
    remappable: true,
  },
  {
    command: 'powerSlot2',
    label: 'Power Slot 2',
    description: 'Trigger the second stored power.',
    remappable: true,
  },
  {
    command: 'powerSlot3',
    label: 'Power Slot 3',
    description: 'Trigger the third stored power.',
    remappable: true,
  },
];

export function normalizeKey(input: string): string {
  if (input === ' ') return 'space';
  return input.toLowerCase();
}

export function formatKeyLabel(key: string): string {
  switch (key) {
    case 'arrowleft':
      return '←';
    case 'arrowright':
      return '→';
    case 'arrowup':
      return '↑';
    case 'arrowdown':
      return '↓';
    case 'space':
      return 'Space';
    case 'escape':
      return 'Esc';
    case 'shift':
      return 'Shift';
    case 'enter':
      return 'Enter';
    default:
      return key.toUpperCase();
  }
}

export function loadControlMapping(): ControlMapping {
  const base = structuredClone(DEFAULT_CONTROL_MAPPING);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return base;
    const parsed = JSON.parse(stored) as Partial<ControlMapping>;
    const merged: ControlMapping = { ...base };
    (Object.keys(base) as ControlCommand[]).forEach((command) => {
      if (parsed[command]?.length) {
        merged[command] = parsed[command]!.map(normalizeKey);
      }
    });
    return ensureArrowKeys(merged);
  } catch (error) {
    console.warn('Failed to load control mapping:', error);
    return base;
  }
}

export function saveControlMapping(mapping: ControlMapping): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapping));
  } catch (error) {
    console.warn('Failed to save control mapping:', error);
  }
}

export function updateControlMapping(
  mapping: ControlMapping,
  command: ControlCommand,
  key: string
): ControlMapping {
  const normalizedKey = normalizeKey(key);
  const next: ControlMapping = { ...mapping, [command]: [normalizedKey] };
  return ensureArrowKeys(next);
}

function ensureArrowKeys(mapping: ControlMapping): ControlMapping {
  const next = { ...mapping };
  const leftKeys = new Set(next.rotateLeft);
  ['arrowleft', 'arrowup'].forEach((key) => leftKeys.add(key));
  next.rotateLeft = Array.from(leftKeys);

  const rightKeys = new Set(next.rotateRight);
  ['arrowright', 'arrowdown'].forEach((key) => rightKeys.add(key));
  next.rotateRight = Array.from(rightKeys);
  return next;
}
