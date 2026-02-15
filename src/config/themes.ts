/**
 * Theme configuration for Hextris
 * Curated palette system with playful, stylish, and high-contrast options.
 */

import type { HexColor } from './colors';

export enum ThemeName {
  CLASSIC = 'classic',
  NEON = 'neon',
  DARK = 'dark',
  LIGHT = 'light',
  WEB_HERO = 'web-hero',
  FASHION_PINK = 'fashion-pink',
  ARENA_NEON = 'arena-neon',
  RETRO_ARCADE = 'retro-arcade',
  STARBLOOM = 'starbloom',
  TURBO_FORGE = 'turbo-forge',
}

export interface ThemeUI {
  surface: HexColor;
  surfaceMuted: HexColor;
  border: HexColor;
  accent: HexColor;
}

export interface Theme {
  id: ThemeName;
  name: string;
  description: string;
  previewShape?: 'circle' | 'diamond' | 'pill' | 'hex' | 'spark';
  colors: {
    background: HexColor;
    hex: HexColor;
    hexStroke: HexColor;
    blocks: [HexColor, HexColor, HexColor, HexColor]; // 4 block colors
    text: HexColor;
    textSecondary: HexColor;
  };
  ui: ThemeUI;
}

export const themes: Record<ThemeName, Theme> = {
  [ThemeName.CLASSIC]: {
    id: ThemeName.CLASSIC,
    name: 'Aurora Classic',
    description: 'Balanced evergreen base with bright arcade contrast.',
    previewShape: 'circle',
    colors: {
      background: '#10231d',
      hex: '#1f4c3f',
      hexStroke: '#44a082',
      blocks: ['#ff6b8a', '#ffa552', '#ffe06a', '#58c9a3'],
      text: '#f5fffb',
      textSecondary: '#b8dbce',
    },
    ui: {
      surface: '#1a3a31',
      surfaceMuted: '#142e27',
      border: '#3f7a66',
      accent: '#ffa552',
    },
  },
  [ThemeName.NEON]: {
    id: ThemeName.NEON,
    name: 'Neon Circuit',
    description: 'Electric nightlife energy for high-focus sessions.',
    previewShape: 'diamond',
    colors: {
      background: '#070b1f',
      hex: '#150f35',
      hexStroke: '#7d35ff',
      blocks: ['#00f5ff', '#ff4fd8', '#7d35ff', '#2a7bff'],
      text: '#f5f8ff',
      textSecondary: '#b6c3ff',
    },
    ui: {
      surface: '#120d2e',
      surfaceMuted: '#0b0822',
      border: '#4a35a5',
      accent: '#00f5ff',
    },
  },
  [ThemeName.DARK]: {
    id: ThemeName.DARK,
    name: 'Obsidian',
    description: 'Low-glare dark mode with sharp crimson clarity.',
    previewShape: 'hex',
    colors: {
      background: '#000000',
      hex: '#171717',
      hexStroke: '#3a3a3a',
      blocks: ['#2c2c2c', '#585858', '#a60f2d', '#ff5d73'],
      text: '#f8f8f8',
      textSecondary: '#c9c9c9',
    },
    ui: {
      surface: '#171717',
      surfaceMuted: '#101010',
      border: '#313131',
      accent: '#ff5d73',
    },
  },
  [ThemeName.LIGHT]: {
    id: ThemeName.LIGHT,
    name: 'Sky Pop',
    description: 'Bright daytime palette with clear playful contrast.',
    previewShape: 'pill',
    colors: {
      background: '#ecf8ff',
      hex: '#cfeeff',
      hexStroke: '#4cb5ff',
      blocks: ['#ffd93d', '#ff8fa3', '#60a5fa', '#7ee081'],
      text: '#0a2a4f',
      textSecondary: '#38618c',
    },
    ui: {
      surface: '#f4fbff',
      surfaceMuted: '#dcefff',
      border: '#9cccf4',
      accent: '#4cb5ff',
    },
  },
  [ThemeName.WEB_HERO]: {
    id: ThemeName.WEB_HERO,
    name: 'Ocean Hero',
    description: 'Deep aquatic gradients for a clean competitive look.',
    previewShape: 'diamond',
    colors: {
      background: '#06142e',
      hex: '#0f2a57',
      hexStroke: '#2c6fbe',
      blocks: ['#1c4c8f', '#36a2eb', '#00d4ff', '#8de0ff'],
      text: '#eef7ff',
      textSecondary: '#b4cce8',
    },
    ui: {
      surface: '#0c2147',
      surfaceMuted: '#081934',
      border: '#2d5f9f',
      accent: '#36a2eb',
    },
  },
  [ThemeName.FASHION_PINK]: {
    id: ThemeName.FASHION_PINK,
    name: 'Princess Bloom',
    description: 'Girls-favorite pink and rose palette with rich depth.',
    previewShape: 'spark',
    colors: {
      background: '#2b0c23',
      hex: '#4a1740',
      hexStroke: '#d14db8',
      blocks: ['#ff7ac8', '#ff9de2', '#d36bff', '#ffd4ef'],
      text: '#fff4fb',
      textSecondary: '#f1cbe6',
    },
    ui: {
      surface: '#4a1740',
      surfaceMuted: '#35102f',
      border: '#9d4e87',
      accent: '#ff7ac8',
    },
  },
  [ThemeName.ARENA_NEON]: {
    id: ThemeName.ARENA_NEON,
    name: 'Candy Party',
    description: 'Kids-favorite candy tones with soft pastel contrast.',
    previewShape: 'hex',
    colors: {
      background: '#fff7fd',
      hex: '#ffe6fa',
      hexStroke: '#ff9ad8',
      blocks: ['#ff9ecf', '#ffd166', '#7bdff2', '#b8f2a6'],
      text: '#5f2a56',
      textSecondary: '#8b5782',
    },
    ui: {
      surface: '#fff4fb',
      surfaceMuted: '#ffe8f6',
      border: '#f6c1e6',
      accent: '#ff9ecf',
    },
  },
  [ThemeName.RETRO_ARCADE]: {
    id: ThemeName.RETRO_ARCADE,
    name: 'Sunset Ember',
    description: 'Warm dusk oranges and violets with dramatic contrast.',
    previewShape: 'diamond',
    colors: {
      background: '#221036',
      hex: '#3b1b5e',
      hexStroke: '#ff8a3d',
      blocks: ['#ff6a3d', '#ffd166', '#b388ff', '#7f4fd6'],
      text: '#fff6ea',
      textSecondary: '#f1c6a3',
    },
    ui: {
      surface: '#341a52',
      surfaceMuted: '#25123d',
      border: '#8657b6',
      accent: '#ff8a3d',
    },
  },
  [ThemeName.STARBLOOM]: {
    id: ThemeName.STARBLOOM,
    name: 'Mint Garden',
    description: 'Fresh greens and botanicals for calm tactical play.',
    previewShape: 'spark',
    colors: {
      background: '#edf7ef',
      hex: '#d9f0de',
      hexStroke: '#7fc28d',
      blocks: ['#8ad7a0', '#6cbf84', '#f4d35e', '#5aa9e6'],
      text: '#203629',
      textSecondary: '#4e7159',
    },
    ui: {
      surface: '#e5f5e9',
      surfaceMuted: '#d3eadb',
      border: '#9ccfa9',
      accent: '#6cbf84',
    },
  },
  [ThemeName.TURBO_FORGE]: {
    id: ThemeName.TURBO_FORGE,
    name: 'Galaxy Dream',
    description: 'Cosmic violet-blue fantasy with clear neon accents.',
    previewShape: 'hex',
    colors: {
      background: '#09051f',
      hex: '#1a1140',
      hexStroke: '#5f49d9',
      blocks: ['#5f49d9', '#a06bff', '#46c2ff', '#8cf7ff'],
      text: '#f5f2ff',
      textSecondary: '#c5bef5',
    },
    ui: {
      surface: '#19113b',
      surfaceMuted: '#120c2e',
      border: '#4d3f9e',
      accent: '#a06bff',
    },
  },
};

export const themePrices: Record<ThemeName, number> = {
  [ThemeName.CLASSIC]: 0,
  [ThemeName.NEON]: 800,
  [ThemeName.DARK]: 600,
  [ThemeName.LIGHT]: 400,
  [ThemeName.WEB_HERO]: 1200,
  [ThemeName.FASHION_PINK]: 900,
  [ThemeName.ARENA_NEON]: 1500,
  [ThemeName.RETRO_ARCADE]: 1000,
  [ThemeName.STARBLOOM]: 950,
  [ThemeName.TURBO_FORGE]: 1300,
};

/**
 * Get theme by name
 */
export function getTheme(name: ThemeName): Theme {
  return themes[name];
}

/**
 * Get theme price
 */
export function getThemePrice(name: ThemeName): number {
  return themePrices[name] ?? 0;
}

/**
 * Check if a string is a valid theme name
 */
export function isThemeName(value: string): value is ThemeName {
  return Object.values(ThemeName).includes(value as ThemeName);
}

/**
 * Normalize unlocked themes list
 */
export function normalizeThemesUnlocked(unlocked?: string[] | null): ThemeName[] {
  const resolved: ThemeName[] = [];
  const list = unlocked ?? [];
  list.forEach((entry) => {
    if (isThemeName(entry) && !resolved.includes(entry)) {
      resolved.push(entry);
    }
  });

  if (!resolved.includes(DEFAULT_THEME)) {
    resolved.unshift(DEFAULT_THEME);
  }

  return resolved;
}

/**
 * Get theme or fallback to default
 */
export function getThemeOrDefault(name?: string | ThemeName): Theme {
  if (name && isThemeName(name)) {
    return themes[name];
  }
  return themes[DEFAULT_THEME];
}

/**
 * Default theme
 */
export const DEFAULT_THEME = ThemeName.CLASSIC;

/**
 * All available theme names
 */
export const availableThemes = Object.values(ThemeName);

/**
 * Apply theme values to the document
 */
export function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--theme-bg', theme.colors.background);
  root.style.setProperty('--theme-background', theme.colors.background);
  root.style.setProperty('--theme-surface', theme.ui.surface);
  root.style.setProperty('--theme-surface-muted', theme.ui.surfaceMuted);
  root.style.setProperty('--theme-border', theme.ui.border);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--theme-accent', theme.ui.accent);
  root.style.setProperty('--theme-ui-primary', theme.ui.accent);
  root.style.setProperty('--theme-accent-contrast', getContrastColor(theme.ui.accent));
  root.style.setProperty('--theme-surface-contrast', getContrastColor(theme.ui.surface));
  root.style.setProperty('--theme-surface-glass', hexToRgba(theme.ui.surface, 0.78));
  root.style.setProperty('--theme-surface-muted-glass', hexToRgba(theme.ui.surfaceMuted, 0.65));
  root.style.setProperty('--theme-border-glass', hexToRgba(theme.ui.border, 0.45));
  root.style.setProperty('--theme-glass-shadow', `0 25px 60px ${hexToRgba(theme.ui.border, 0.35)}`);
  root.style.setProperty('--theme-glow', hexToRgba(theme.ui.accent, 0.35));
  root.style.setProperty('--theme-glow-strong', hexToRgba(theme.ui.accent, 0.55));
  root.style.setProperty('--theme-accent-strong', adjustColor(theme.ui.accent, 0.15));
  root.style.setProperty('--theme-accent-soft', adjustColor(theme.ui.accent, -0.12));
  root.style.setProperty('--theme-bg-muted', adjustColor(theme.colors.background, 0.08));
  root.style.setProperty('--theme-block-1', theme.colors.blocks[0]);
  root.style.setProperty('--theme-block-2', theme.colors.blocks[1]);
  root.style.setProperty('--theme-block-3', theme.colors.blocks[2]);
  root.style.setProperty('--theme-block-4', theme.colors.blocks[3]);
  theme.colors.blocks.forEach((color, index) => {
    const id = index + 1;
    root.style.setProperty(`--theme-block-${id}-tint`, adjustColor(color, 0.2));
    root.style.setProperty(`--theme-block-${id}-soft`, adjustColor(color, 0.1));
    root.style.setProperty(`--theme-block-${id}-shade`, adjustColor(color, -0.18));
  });
  root.dataset.theme = theme.id;

  document.body.style.background = theme.colors.background;
  document.body.style.color = theme.colors.text;
}

function normalizeHex(hex: string): string {
  if (!hex) return '#000000';
  const value = hex.replace('#', '');
  if (value.length === 3) {
    return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`;
  }
  return `#${value.padEnd(6, '0').slice(0, 6)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex).replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clampedAlpha = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

function adjustColor(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const adjust = (channel: number) => {
    if (amount >= 0) {
      return clamp(channel + (255 - channel) * amount);
    }
    return clamp(channel + channel * amount);
  };

  const nr = adjust(r).toString(16).padStart(2, '0');
  const ng = adjust(g).toString(16).padStart(2, '0');
  const nb = adjust(b).toString(16).padStart(2, '0');
  return `#${nr}${ng}${nb}`;
}

function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return luminance > 0.55 ? '#0b1120' : '#f8fafc';
}
