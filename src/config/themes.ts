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
    name: 'Classic',
    description: 'Original Hextris color scheme',
    previewShape: 'circle',
    colors: {
      background: '#ecf0f1',
      hex: '#2c3e50',
      hexStroke: '#34495e',
      blocks: ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71'],
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#f3f4f6',
      border: '#d1d5db',
      accent: '#2c3e50',
    },
  },
  [ThemeName.NEON]: {
    id: ThemeName.NEON,
    name: 'Neon',
    description: 'Vibrant neon colors on dark background',
    previewShape: 'diamond',
    colors: {
      background: '#0a0a0a',
      hex: '#1a1a1a',
      hexStroke: '#2a2a2a',
      blocks: ['#ff0080', '#00ff9f', '#00b8ff', '#ffea00'],
      text: '#ffffff',
      textSecondary: '#888888',
    },
    ui: {
      surface: '#111827',
      surfaceMuted: '#0f172a',
      border: '#1f2937',
      accent: '#00ff9f',
    },
  },
  [ThemeName.DARK]: {
    id: ThemeName.DARK,
    name: 'Dark',
    description: 'Sleek dark mode with muted tones',
    previewShape: 'hex',
    colors: {
      background: '#1a1a1a',
      hex: '#2d2d2d',
      hexStroke: '#3d3d3d',
      blocks: ['#c0392b', '#d35400', '#2980b9', '#27ae60'],
      text: '#ecf0f1',
      textSecondary: '#95a5a6',
    },
    ui: {
      surface: '#1f2937',
      surfaceMuted: '#111827',
      border: '#374151',
      accent: '#60a5fa',
    },
  },
  [ThemeName.LIGHT]: {
    id: ThemeName.LIGHT,
    name: 'Light',
    description: 'Clean light theme with soft pastels',
    previewShape: 'pill',
    colors: {
      background: '#ffffff',
      hex: '#f0f0f0',
      hexStroke: '#d0d0d0',
      blocks: ['#e57373', '#ffb74d', '#64b5f6', '#81c784'],
      text: '#212121',
      textSecondary: '#757575',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#f9fafb',
      border: '#e5e7eb',
      accent: '#111827',
    },
  },
  [ThemeName.WEB_HERO]: {
    id: ThemeName.WEB_HERO,
    name: 'Web Hero',
    description: 'Bold red and blue with heroic contrast',
    previewShape: 'diamond',
    colors: {
      background: '#040916',
      hex: '#0f1b2f',
      hexStroke: '#f43f5e',
      blocks: ['#f43f5e', '#1d4ed8', '#f8fafc', '#38bdf8'],
      text: '#f8fafc',
      textSecondary: '#cbd5f5',
    },
    ui: {
      surface: '#0d1424',
      surfaceMuted: '#070d18',
      border: '#1f2937',
      accent: '#f43f5e',
    },
  },
  [ThemeName.FASHION_PINK]: {
    id: ThemeName.FASHION_PINK,
    name: 'Fashion Pink',
    description: 'Playful pinks with a glossy finish',
    previewShape: 'spark',
    colors: {
      background: '#fff0f7',
      hex: '#fde2ef',
      hexStroke: '#f472b6',
      blocks: ['#ff4d8d', '#f472b6', '#fee2e2', '#facc15'],
      text: '#7a0f3d',
      textSecondary: '#a61b53',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#ffe4f1',
      border: '#f9a8d4',
      accent: '#f472b6',
    },
  },
  [ThemeName.ARENA_NEON]: {
    id: ThemeName.ARENA_NEON,
    name: 'Arena Neon',
    description: 'Esports-inspired neon on deep slate',
    previewShape: 'hex',
    colors: {
      background: '#01030a',
      hex: '#07122b',
      hexStroke: '#0ef9ff',
      blocks: ['#0ef9ff', '#ff2d95', '#b1ff1a', '#ff8b1f'],
      text: '#f4f7ff',
      textSecondary: '#8ea3ce',
    },
    ui: {
      surface: '#050c1c',
      surfaceMuted: '#030712',
      border: '#15233f',
      accent: '#0ef9ff',
    },
  },
  [ThemeName.RETRO_ARCADE]: {
    id: ThemeName.RETRO_ARCADE,
    name: 'Retro Arcade',
    description: 'Arcade glow with punchy contrast',
    previewShape: 'diamond',
    colors: {
      background: '#040615',
      hex: '#0a1024',
      hexStroke: '#ff7a18',
      blocks: ['#ff7a18', '#3eead6', '#fde047', '#22d3ee'],
      text: '#fefcfb',
      textSecondary: '#d1d5ff',
    },
    ui: {
      surface: '#0b1027',
      surfaceMuted: '#080c1c',
      border: '#1f2a44',
      accent: '#ff7a18',
    },
  },
  [ThemeName.STARBLOOM]: {
    id: ThemeName.STARBLOOM,
    name: 'Starbloom',
    description: 'Candy skies with celestial sparkles',
    previewShape: 'spark',
    colors: {
      background: '#fff7fb',
      hex: '#fde6f2',
      hexStroke: '#ff7bbd',
      blocks: ['#ff9ac8', '#ffd166', '#c1f6ff', '#ff7ab8'],
      text: '#6d1b3f',
      textSecondary: '#a64a6b',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#ffeef7',
      border: '#ffc0d9',
      accent: '#ff7ab8',
    },
  },
  [ThemeName.TURBO_FORGE]: {
    id: ThemeName.TURBO_FORGE,
    name: 'Turbo Forge',
    description: 'Steel blues with molten energy for speed runners',
    previewShape: 'hex',
    colors: {
      background: '#050b16',
      hex: '#0f1c2b',
      hexStroke: '#f97316',
      blocks: ['#38bdf8', '#f97316', '#facc15', '#22d3ee'],
      text: '#f5fafc',
      textSecondary: '#95b8d6',
    },
    ui: {
      surface: '#0d1726',
      surfaceMuted: '#08101c',
      border: '#1f2d3d',
      accent: '#f97316',
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

