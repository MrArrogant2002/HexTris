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
    name: 'Aurora Core',
    description: 'Balanced flagship palette with crisp contrast and modern depth.',
    previewShape: 'circle',
    colors: {
      background: '#f3f7ff',
      hex: '#183153',
      hexStroke: '#29507f',
      blocks: ['#ff6b6b', '#ffd166', '#4dabf7', '#51cf66'],
      text: '#10243d',
      textSecondary: '#46607f',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#eaf0fa',
      border: '#c3d2e6',
      accent: '#29507f',
    },
  },
  [ThemeName.NEON]: {
    id: ThemeName.NEON,
    name: 'Neon Pulse',
    description: 'Cyber glow contrast for high-focus competitive runs.',
    previewShape: 'diamond',
    colors: {
      background: '#04040a',
      hex: '#0f1220',
      hexStroke: '#23e9ff',
      blocks: ['#ff2fa0', '#00ffbf', '#5a8dff', '#ffe760'],
      text: '#f4f7ff',
      textSecondary: '#9ab1d5',
    },
    ui: {
      surface: '#0f172a',
      surfaceMuted: '#020617',
      border: '#1e293b',
      accent: '#23e9ff',
    },
  },
  [ThemeName.DARK]: {
    id: ThemeName.DARK,
    name: 'Midnight Ops',
    description: 'Stealth-inspired low-light theme with premium readability.',
    previewShape: 'hex',
    colors: {
      background: '#0b1020',
      hex: '#151f36',
      hexStroke: '#2b3f62',
      blocks: ['#f25f5c', '#f7b267', '#247ba0', '#70c1b3'],
      text: '#f8fbff',
      textSecondary: '#9fb3d1',
    },
    ui: {
      surface: '#131d33',
      surfaceMuted: '#0b1328',
      border: '#314a73',
      accent: '#6ea8fe',
    },
  },
  [ThemeName.LIGHT]: {
    id: ThemeName.LIGHT,
    name: 'Cloud Day',
    description: 'Soft daylight UI with airy, low-fatigue tones.',
    previewShape: 'pill',
    colors: {
      background: '#fdfefe',
      hex: '#eef2f8',
      hexStroke: '#c9d6ea',
      blocks: ['#ff8787', '#ffd8a8', '#74c0fc', '#8ce99a'],
      text: '#1f2d3d',
      textSecondary: '#6c7d91',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#f5f8fc',
      border: '#d6e0ee',
      accent: '#29507f',
    },
  },
  [ThemeName.WEB_HERO]: {
    id: ThemeName.WEB_HERO,
    name: 'Hero Clash',
    description: 'Comic-action contrast with energetic red and electric blue.',
    previewShape: 'diamond',
    colors: {
      background: '#090d1a',
      hex: '#111f3b',
      hexStroke: '#ff4f70',
      blocks: ['#ff4f70', '#3a86ff', '#ffd166', '#6ef9f5'],
      text: '#f8fbff',
      textSecondary: '#bed0f2',
    },
    ui: {
      surface: '#0d1830',
      surfaceMuted: '#090f1f',
      border: '#273b63',
      accent: '#ff4f70',
    },
  },
  [ThemeName.FASHION_PINK]: {
    id: ThemeName.FASHION_PINK,
    name: 'Princess Pop',
    description: 'Girl-favorite pink and lavender candy glow.',
    previewShape: 'spark',
    colors: {
      background: '#fff1fb',
      hex: '#fde2f6',
      hexStroke: '#ff7bc7',
      blocks: ['#ff66c4', '#c084fc', '#ffd6f6', '#ffd166'],
      text: '#6d1d52',
      textSecondary: '#9a3a73',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#ffe9f7',
      border: '#fcb8df',
      accent: '#ff7bc7',
    },
  },
  [ThemeName.ARENA_NEON]: {
    id: ThemeName.ARENA_NEON,
    name: 'Kids Party',
    description: 'Kids-favorite rainbow pop colors with playful contrast.',
    previewShape: 'hex',
    colors: {
      background: '#fff8e7',
      hex: '#fff0c9',
      hexStroke: '#ffb703',
      blocks: ['#ff595e', '#ffca3a', '#1982c4', '#8ac926'],
      text: '#4b3700',
      textSecondary: '#7a5b00',
    },
    ui: {
      surface: '#fff9ef',
      surfaceMuted: '#fff2d9',
      border: '#ffd994',
      accent: '#ff8f00',
    },
  },
  [ThemeName.RETRO_ARCADE]: {
    id: ThemeName.RETRO_ARCADE,
    name: 'Retro Arcade',
    description: 'Nostalgic arcade cabinet tones with punchy highlights.',
    previewShape: 'diamond',
    colors: {
      background: '#150925',
      hex: '#2a1240',
      hexStroke: '#ff9f1c',
      blocks: ['#ff9f1c', '#2ec4b6', '#e71d36', '#fdfffc'],
      text: '#fff8f0',
      textSecondary: '#d8c8f3',
    },
    ui: {
      surface: '#1c1133',
      surfaceMuted: '#120a26',
      border: '#4f2f7a',
      accent: '#ff9f1c',
    },
  },
  [ThemeName.STARBLOOM]: {
    id: ThemeName.STARBLOOM,
    name: 'Cotton Candy',
    description: 'Pastel candyland mood with sweet, calming contrasts.',
    previewShape: 'spark',
    colors: {
      background: '#fff6fb',
      hex: '#ffe3f3',
      hexStroke: '#ff89b5',
      blocks: ['#ffa3d7', '#ffd6a5', '#a5d8ff', '#b2f2bb'],
      text: '#6a2145',
      textSecondary: '#9b5675',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#ffeef8',
      border: '#ffcde2',
      accent: '#ff89b5',
    },
  },
  [ThemeName.TURBO_FORGE]: {
    id: ThemeName.TURBO_FORGE,
    name: 'Ocean Quest',
    description: 'Cool marine palette with bright tropical accents.',
    previewShape: 'hex',
    colors: {
      background: '#041c32',
      hex: '#083356',
      hexStroke: '#12b8ff',
      blocks: ['#00b4d8', '#90e0ef', '#48cae4', '#ffd166'],
      text: '#f2fbff',
      textSecondary: '#9acbe6',
    },
    ui: {
      surface: '#062947',
      surfaceMuted: '#041d33',
      border: '#0d4f80',
      accent: '#12b8ff',
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
  root.style.setProperty('--theme-surface', theme.ui.surface);
  root.style.setProperty('--theme-surface-muted', theme.ui.surfaceMuted);
  root.style.setProperty('--theme-border', theme.ui.border);
  root.style.setProperty('--theme-text', theme.colors.text);
  root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--theme-accent', theme.ui.accent);
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
