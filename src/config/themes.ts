/**
 * Theme configuration for Hextris
 * Data-driven runtime-switchable theme system.
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

export interface ThemeVisuals {
  comboFx: HexColor;
  scoreFx: HexColor;
  powerFx: HexColor;
  hudFont: 'Inter' | 'Rajdhani' | 'Exo 2' | 'Orbitron' | 'Poppins';
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
    blocks: [HexColor, HexColor, HexColor, HexColor];
    text: HexColor;
    textSecondary: HexColor;
  };
  ui: ThemeUI;
  visuals: ThemeVisuals;
  accessibility: {
    highContrast: boolean;
    colorBlindSafe: boolean;
  };
}

export const themes: Record<ThemeName, Theme> = {
  [ThemeName.CLASSIC]: {
    id: ThemeName.CLASSIC,
    name: 'Kids Pop Blast',
    description: 'Bright candy primaries with playful contrast for quick readability.',
    previewShape: 'circle',
    colors: {
      background: '#091833',
      hex: '#10305f',
      hexStroke: '#4cc9ff',
      blocks: ['#ff4d6d', '#ffd60a', '#43f26e', '#4f7cff'],
      text: '#f8fbff',
      textSecondary: '#c8dcff',
    },
    ui: {
      surface: '#10284d',
      surfaceMuted: '#0a1f3c',
      border: '#3b73b8',
      accent: '#ffd60a',
    },
    visuals: {
      comboFx: '#ffe066',
      scoreFx: '#7bf1ff',
      powerFx: '#ff9e00',
      hudFont: 'Poppins',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
    },
  },
  [ThemeName.NEON]: {
    id: ThemeName.NEON,
    name: 'Candy Sparkle',
    description: 'Kid-friendly bubblegum neon with high-energy arcade shine.',
    previewShape: 'diamond',
    colors: {
      background: '#1a0f34',
      hex: '#281856',
      hexStroke: '#7f7dff',
      blocks: ['#ff7ac8', '#6ef7ff', '#ffe66d', '#8dff6f'],
      text: '#fef7ff',
      textSecondary: '#e1cbff',
    },
    ui: {
      surface: '#23134a',
      surfaceMuted: '#170d34',
      border: '#5f58b8',
      accent: '#ff7ac8',
    },
    visuals: {
      comboFx: '#ffe66d',
      scoreFx: '#6ef7ff',
      powerFx: '#ff9ad5',
      hudFont: 'Poppins',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: false,
    },
  },
  [ThemeName.DARK]: {
    id: ThemeName.DARK,
    name: 'Esports Midnight',
    description: 'Competitive dark palette tuned for clear lane and FX readability.',
    previewShape: 'hex',
    colors: {
      background: '#05070e',
      hex: '#0b1528',
      hexStroke: '#35b7ff',
      blocks: ['#2a3f5f', '#2dd4ff', '#00ffa3', '#ff4d67'],
      text: '#ecf4ff',
      textSecondary: '#9db4d8',
    },
    ui: {
      surface: '#0f1e34',
      surfaceMuted: '#081426',
      border: '#2e4f7a',
      accent: '#2dd4ff',
    },
    visuals: {
      comboFx: '#00ffa3',
      scoreFx: '#35b7ff',
      powerFx: '#ff4d67',
      hudFont: 'Rajdhani',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
    },
  },
  [ThemeName.LIGHT]: {
    id: ThemeName.LIGHT,
    name: 'Pastel Bloom',
    description: 'Soft pastel gradient look designed for elegant, cozy sessions.',
    previewShape: 'pill',
    colors: {
      background: '#fff4fb',
      hex: '#ffe7f7',
      hexStroke: '#ffa9dc',
      blocks: ['#ffc2e2', '#ffd6a5', '#bde0fe', '#caffbf'],
      text: '#532543',
      textSecondary: '#875e78',
    },
    ui: {
      surface: '#fff7fd',
      surfaceMuted: '#ffeef9',
      border: '#f5bfdc',
      accent: '#ff8ccf',
    },
    visuals: {
      comboFx: '#ff9fd8',
      scoreFx: '#9ad1ff',
      powerFx: '#caa2ff',
      hudFont: 'Poppins',
    },
    accessibility: {
      highContrast: false,
      colorBlindSafe: true,
    },
  },
  [ThemeName.WEB_HERO]: {
    id: ThemeName.WEB_HERO,
    name: 'Rose Quartz',
    description: 'Girls-favorite rose and quartz tones with polished soft neon accents.',
    previewShape: 'spark',
    colors: {
      background: '#2b1230',
      hex: '#3f1a4a',
      hexStroke: '#ff8ad8',
      blocks: ['#ff6fcf', '#ffd1f3', '#9ee7ff', '#ffc6b3'],
      text: '#fff6ff',
      textSecondary: '#dcb7e7',
    },
    ui: {
      surface: '#3a1844',
      surfaceMuted: '#2a1132',
      border: '#7d4f8b',
      accent: '#ff8ad8',
    },
    visuals: {
      comboFx: '#ffb2e8',
      scoreFx: '#9ee7ff',
      powerFx: '#ffd1f3',
      hudFont: 'Exo 2',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: false,
    },
  },
  [ThemeName.FASHION_PINK]: {
    id: ThemeName.FASHION_PINK,
    name: 'Aurora Silk',
    description: 'Elegant pink-violet gradients with luminous premium highlights.',
    previewShape: 'diamond',
    colors: {
      background: '#1f1038',
      hex: '#2d1751',
      hexStroke: '#c39bff',
      blocks: ['#ff87d6', '#d2a8ff', '#8ef4ff', '#ffc27a'],
      text: '#fdf8ff',
      textSecondary: '#ceb9e8',
    },
    ui: {
      surface: '#2d1650',
      surfaceMuted: '#22103c',
      border: '#6f5296',
      accent: '#ff87d6',
    },
    visuals: {
      comboFx: '#d2a8ff',
      scoreFx: '#8ef4ff',
      powerFx: '#ffc6f1',
      hudFont: 'Exo 2',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: false,
    },
  },
  [ThemeName.ARENA_NEON]: {
    id: ThemeName.ARENA_NEON,
    name: 'Phantom Grid',
    description: 'Tournament-ready cyber grid with crisp neon lane edges.',
    previewShape: 'hex',
    colors: {
      background: '#030711',
      hex: '#07142a',
      hexStroke: '#00d0ff',
      blocks: ['#1567ff', '#00d0ff', '#00ff9f', '#ff3f6c'],
      text: '#eaf6ff',
      textSecondary: '#95b8d9',
    },
    ui: {
      surface: '#0b1a34',
      surfaceMuted: '#061024',
      border: '#275287',
      accent: '#00d0ff',
    },
    visuals: {
      comboFx: '#00ff9f',
      scoreFx: '#75e6ff',
      powerFx: '#ff7f9a',
      hudFont: 'Rajdhani',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
    },
  },
  [ThemeName.RETRO_ARCADE]: {
    id: ThemeName.RETRO_ARCADE,
    name: 'Turbo Arcade',
    description: 'High-energy orange and cyan arcade cabinet vibe.',
    previewShape: 'spark',
    colors: {
      background: '#1a1206',
      hex: '#2f1f0c',
      hexStroke: '#ff9f1c',
      blocks: ['#ff6b35', '#ffd166', '#00c2ff', '#9ef01a'],
      text: '#fff8e8',
      textSecondary: '#e7cc96',
    },
    ui: {
      surface: '#2c1d0d',
      surfaceMuted: '#1f1509',
      border: '#8e5a2e',
      accent: '#ff9f1c',
    },
    visuals: {
      comboFx: '#ffd166',
      scoreFx: '#00c2ff',
      powerFx: '#ff6b35',
      hudFont: 'Orbitron',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
    },
  },
  [ThemeName.STARBLOOM]: {
    id: ThemeName.STARBLOOM,
    name: 'Minimal Pulse',
    description: 'Minimalist grayscale + cyan for futuristic clean focus.',
    previewShape: 'pill',
    colors: {
      background: '#0e1117',
      hex: '#171d26',
      hexStroke: '#7f8ea3',
      blocks: ['#3f4d5f', '#5f7087', '#7ea5cf', '#8ef4ff'],
      text: '#f4f8ff',
      textSecondary: '#a8b7c9',
    },
    ui: {
      surface: '#161d28',
      surfaceMuted: '#0f141d',
      border: '#4d5f76',
      accent: '#8ef4ff',
    },
    visuals: {
      comboFx: '#b9f9ff',
      scoreFx: '#8ef4ff',
      powerFx: '#c9d6ea',
      hudFont: 'Inter',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
    },
  },
  [ThemeName.TURBO_FORGE]: {
    id: ThemeName.TURBO_FORGE,
    name: 'Zen Circuit',
    description: 'Futuristic mint-silver interface with low-clutter competitive clarity.',
    previewShape: 'hex',
    colors: {
      background: '#061013',
      hex: '#0c1a1f',
      hexStroke: '#4fd1c5',
      blocks: ['#3a5a65', '#4fd1c5', '#88ffd5', '#f1ff9d'],
      text: '#ebfffb',
      textSecondary: '#a5cbc3',
    },
    ui: {
      surface: '#0f2025',
      surfaceMuted: '#09161a',
      border: '#35656c',
      accent: '#4fd1c5',
    },
    visuals: {
      comboFx: '#88ffd5',
      scoreFx: '#7be5da',
      powerFx: '#f1ff9d',
      hudFont: 'Inter',
    },
    accessibility: {
      highContrast: true,
      colorBlindSafe: true,
    },
  },
};

export const themePrices: Record<ThemeName, number> = {
  [ThemeName.CLASSIC]: 0,
  [ThemeName.NEON]: 700,
  [ThemeName.DARK]: 900,
  [ThemeName.LIGHT]: 650,
  [ThemeName.WEB_HERO]: 850,
  [ThemeName.FASHION_PINK]: 950,
  [ThemeName.ARENA_NEON]: 1200,
  [ThemeName.RETRO_ARCADE]: 1100,
  [ThemeName.STARBLOOM]: 1000,
  [ThemeName.TURBO_FORGE]: 1150,
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
  root.style.setProperty('--theme-combo-fx', theme.visuals.comboFx);
  root.style.setProperty('--theme-score-fx', theme.visuals.scoreFx);
  root.style.setProperty('--theme-power-fx', theme.visuals.powerFx);
  root.style.setProperty('--theme-hud-font', theme.visuals.hudFont);
  root.style.setProperty('--theme-hex-core', theme.colors.hex);
  root.style.setProperty('--theme-hex-core-stroke', theme.colors.hexStroke);
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
