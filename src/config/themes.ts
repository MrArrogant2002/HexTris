/**
 * Theme configuration for Hextris
 * Defines visual themes with different color schemes
 * NO PURPLE THEME - replaced with modern alternatives
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
    name: 'Retro',
    description: 'Warm arcade nostalgia with balanced contrast',
    previewShape: 'circle',
    colors: {
      background: '#1f2a26',
      hex: '#2a5647',
      hexStroke: '#458b73',
      blocks: ['#f26076', '#ff9760', '#ffd150', '#458b73'],
      text: '#fff9ef',
      textSecondary: '#f1d9c0',
    },
    ui: {
      surface: '#27443a',
      surfaceMuted: '#20392f',
      border: '#4e7d6d',
      accent: '#ff9760',
    },
  },
  [ThemeName.NEON]: {
    id: ThemeName.NEON,
    name: 'Neon',
    description: 'High-energy magenta neon over deep midnight blue',
    previewShape: 'diamond',
    colors: {
      background: '#090b1d',
      hex: '#1a1030',
      hexStroke: '#5d0e41',
      blocks: ['#ff204e', '#a0153e', '#5d0e41', '#00224d'],
      text: '#fef3ff',
      textSecondary: '#d2b8df',
    },
    ui: {
      surface: '#160e29',
      surfaceMuted: '#0f0a1f',
      border: '#4d265f',
      accent: '#ff204e',
    },
  },
  [ThemeName.DARK]: {
    id: ThemeName.DARK,
    name: 'Dark',
    description: 'Pure dark theme with aggressive crimson contrast',
    previewShape: 'hex',
    colors: {
      background: '#000000',
      hex: '#220000',
      hexStroke: '#3d0000',
      blocks: ['#000000', '#3d0000', '#950101', '#ff0000'],
      text: '#fff5f5',
      textSecondary: '#f5b1b1',
    },
    ui: {
      surface: '#1b0000',
      surfaceMuted: '#120000',
      border: '#5c0a0a',
      accent: '#ff0000',
    },
  },
  [ThemeName.LIGHT]: {
    id: ThemeName.LIGHT,
    name: 'Sky',
    description: 'Sun-bright accents with clear open-sky blues',
    previewShape: 'pill',
    colors: {
      background: '#e9fdff',
      hex: '#bcf2f6',
      hexStroke: '#08c2ff',
      blocks: ['#fff100', '#006bff', '#08c2ff', '#bcf2f6'],
      text: '#072447',
      textSecondary: '#2b5380',
    },
    ui: {
      surface: '#f3feff',
      surfaceMuted: '#ddf7fb',
      border: '#9ad5e8',
      accent: '#006bff',
    },
  },
  [ThemeName.WEB_HERO]: {
    id: ThemeName.WEB_HERO,
    name: 'Sea',
    description: 'Ocean-depth gradients with crisp aquatic highlights',
    previewShape: 'diamond',
    colors: {
      background: '#071833',
      hex: '#0f2854',
      hexStroke: '#1c4d8d',
      blocks: ['#0f2854', '#1c4d8d', '#4988c4', '#bde8f5'],
      text: '#f1fcff',
      textSecondary: '#b5d9f2',
    },
    ui: {
      surface: '#0e2347',
      surfaceMuted: '#091a34',
      border: '#2c5d95',
      accent: '#4988c4',
    },
  },
  [ThemeName.FASHION_PINK]: {
    id: ThemeName.FASHION_PINK,
    name: 'Pink',
    description: 'Deep berry pinks with vivid romantic highlights',
    previewShape: 'spark',
    colors: {
      background: '#2d0415',
      hex: '#3a0519',
      hexStroke: '#670d2f',
      blocks: ['#3a0519', '#670d2f', '#a53860', '#ef88ad'],
      text: '#fff2f8',
      textSecondary: '#ebb8ca',
    },
    ui: {
      surface: '#420822',
      surfaceMuted: '#320618',
      border: '#7f2c4c',
      accent: '#ef88ad',
    },
  },
  [ThemeName.ARENA_NEON]: {
    id: ThemeName.ARENA_NEON,
    name: 'Wow-Pink',
    description: 'Pastel blush layers with candy-pop accent contrast',
    previewShape: 'hex',
    colors: {
      background: '#fff6fc',
      hex: '#ffedfa',
      hexStroke: '#ffb8e0',
      blocks: ['#ffedfa', '#ffb8e0', '#ec7fa9', '#be5985'],
      text: '#5f2948',
      textSecondary: '#8f4a6a',
    },
    ui: {
      surface: '#fff7fd',
      surfaceMuted: '#ffeaf6',
      border: '#f8c4e2',
      accent: '#ec7fa9',
    },
  },
  [ThemeName.RETRO_ARCADE]: {
    id: ThemeName.RETRO_ARCADE,
    name: 'Halloween',
    description: 'Spooky violet-orange blend with punchy ember glow',
    previewShape: 'diamond',
    colors: {
      background: '#17002c',
      hex: '#2a004e',
      hexStroke: '#500073',
      blocks: ['#2a004e', '#500073', '#c62300', '#f14a00'],
      text: '#fff3e6',
      textSecondary: '#f3b68c',
    },
    ui: {
      surface: '#28043d',
      surfaceMuted: '#1f0330',
      border: '#6f2b77',
      accent: '#f14a00',
    },
  },
  [ThemeName.STARBLOOM]: {
    id: ThemeName.STARBLOOM,
    name: 'Nature',
    description: 'Organic earth tones with soft mossy balance',
    previewShape: 'spark',
    colors: {
      background: '#f2ecd1',
      hex: '#f6f0d7',
      hexStroke: '#c5d89d',
      blocks: ['#f6f0d7', '#c5d89d', '#9cab84', '#89986d'],
      text: '#2e3926',
      textSecondary: '#5d6a4e',
    },
    ui: {
      surface: '#faf5e1',
      surfaceMuted: '#e9e3c7',
      border: '#bfcc98',
      accent: '#89986d',
    },
  },
  [ThemeName.TURBO_FORGE]: {
    id: ThemeName.TURBO_FORGE,
    name: 'Forest',
    description: 'Dense woodland tones with deep evergreen shadows',
    previewShape: 'hex',
    colors: {
      background: '#02090c',
      hex: '#040d12',
      hexStroke: '#183d3d',
      blocks: ['#040d12', '#183d3d', '#5c8374', '#93b1a6'],
      text: '#eef9f4',
      textSecondary: '#b7cec5',
    },
    ui: {
      surface: '#0a1d22',
      surfaceMuted: '#07161a',
      border: '#2a5755',
      accent: '#93b1a6',
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
