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
    name: 'Batman',
    description: 'Noir shadows with high-contrast tactical highlights',
    previewShape: 'circle',
    colors: {
      background: '#e9eef2',
      hex: '#233447',
      hexStroke: '#2c3e50',
      blocks: ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71'],
      text: '#1f2d3a',
      textSecondary: '#5b6b7a',
    },
    ui: {
      surface: '#f8fafc',
      surfaceMuted: '#eef2f7',
      border: '#cbd5e1',
      accent: '#1f2d3a',
    },
  },
  [ThemeName.NEON]: {
    id: ThemeName.NEON,
    name: 'Galaxy',
    description: 'Cosmic neon glow across a deep-space backdrop',
    previewShape: 'diamond',
    colors: {
      background: '#05070f',
      hex: '#0f172a',
      hexStroke: '#1f2937',
      blocks: ['#ff0080', '#00ff9f', '#00b8ff', '#ffea00'],
      text: '#f8fafc',
      textSecondary: '#94a3b8',
    },
    ui: {
      surface: '#0f172a',
      surfaceMuted: '#0b1220',
      border: '#1e293b',
      accent: '#00ff9f',
    },
  },
  [ThemeName.DARK]: {
    id: ThemeName.DARK,
    name: 'Cyberpunk',
    description: 'Urban night palette with electric edge lighting',
    previewShape: 'hex',
    colors: {
      background: '#111827',
      hex: '#1f2937',
      hexStroke: '#334155',
      blocks: ['#c0392b', '#d35400', '#2980b9', '#27ae60'],
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
    },
    ui: {
      surface: '#1e293b',
      surfaceMuted: '#0f172a',
      border: '#334155',
      accent: '#93c5fd',
    },
  },
  [ThemeName.LIGHT]: {
    id: ThemeName.LIGHT,
    name: 'Cinderella',
    description: 'Soft royal pastels with bright glass accents',
    previewShape: 'pill',
    colors: {
      background: '#f8fafc',
      hex: '#f1f5f9',
      hexStroke: '#d1d5db',
      blocks: ['#e57373', '#ffb74d', '#64b5f6', '#81c784'],
      text: '#111827',
      textSecondary: '#4b5563',
    },
    ui: {
      surface: '#ffffff',
      surfaceMuted: '#f1f5f9',
      border: '#e2e8f0',
      accent: '#1f2937',
    },
  },
  [ThemeName.WEB_HERO]: {
    id: ThemeName.WEB_HERO,
    name: 'Spiderman',
    description: 'Bold red and blue webs with heroic contrast',
    previewShape: 'diamond',
    colors: {
      background: '#050a1a',
      hex: '#111c34',
      hexStroke: '#f43f5e',
      blocks: ['#f43f5e', '#1d4ed8', '#f8fafc', '#38bdf8'],
      text: '#f8fafc',
      textSecondary: '#dbe3f5',
    },
    ui: {
      surface: '#0f172a',
      surfaceMuted: '#0b1224',
      border: '#1e2a44',
      accent: '#f43f5e',
    },
  },
  [ThemeName.FASHION_PINK]: {
    id: ThemeName.FASHION_PINK,
    name: 'Barbie',
    description: 'Playful pink glamour with a glossy finish',
    previewShape: 'spark',
    colors: {
      background: '#fff3f8',
      hex: '#fbe3ef',
      hexStroke: '#f472b6',
      blocks: ['#ff4d8d', '#f472b6', '#fee2e2', '#facc15'],
      text: '#6b1238',
      textSecondary: '#9f3658',
    },
    ui: {
      surface: '#fff9fb',
      surfaceMuted: '#ffe6f2',
      border: '#f7b0d7',
      accent: '#f472b6',
    },
  },
  [ThemeName.ARENA_NEON]: {
    id: ThemeName.ARENA_NEON,
    name: 'Avengers',
    description: 'Heroic neon energy on a deep tactical slate',
    previewShape: 'hex',
    colors: {
      background: '#03040f',
      hex: '#0c1733',
      hexStroke: '#0ef9ff',
      blocks: ['#0ef9ff', '#ff2d95', '#b1ff1a', '#ff8b1f'],
      text: '#f8fafc',
      textSecondary: '#a7b6d8',
    },
    ui: {
      surface: '#091225',
      surfaceMuted: '#050b18',
      border: '#1f2d4b',
      accent: '#0ef9ff',
    },
  },
  [ThemeName.RETRO_ARCADE]: {
    id: ThemeName.RETRO_ARCADE,
    name: 'Retro',
    description: 'Arcade glow with punchy old-school contrast',
    previewShape: 'diamond',
    colors: {
      background: '#070a1b',
      hex: '#101a34',
      hexStroke: '#ff7a18',
      blocks: ['#ff7a18', '#3eead6', '#fde047', '#22d3ee'],
      text: '#fefcfb',
      textSecondary: '#c7d2fe',
    },
    ui: {
      surface: '#10162f',
      surfaceMuted: '#0a0f24',
      border: '#24314d',
      accent: '#ff7a18',
    },
  },
  [ThemeName.STARBLOOM]: {
    id: ThemeName.STARBLOOM,
    name: 'Jungle',
    description: 'Leafy saturation with warm tropical highlights',
    previewShape: 'spark',
    colors: {
      background: '#fff5fa',
      hex: '#fde5f2',
      hexStroke: '#ff7bbd',
      blocks: ['#ff9ac8', '#ffd166', '#c1f6ff', '#ff7ab8'],
      text: '#5b1534',
      textSecondary: '#98506e',
    },
    ui: {
      surface: '#fff9fc',
      surfaceMuted: '#ffe8f4',
      border: '#fbc0d5',
      accent: '#ff7ab8',
    },
  },
  [ThemeName.TURBO_FORGE]: {
    id: ThemeName.TURBO_FORGE,
    name: 'Ocean',
    description: 'Cool tides and marine blues with bright crest accents',
    previewShape: 'hex',
    colors: {
      background: '#070e1b',
      hex: '#122136',
      hexStroke: '#f97316',
      blocks: ['#38bdf8', '#f97316', '#facc15', '#22d3ee'],
      text: '#f8fafc',
      textSecondary: '#b6c4d6',
    },
    ui: {
      surface: '#101d33',
      surfaceMuted: '#0a1427',
      border: '#23314a',
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
