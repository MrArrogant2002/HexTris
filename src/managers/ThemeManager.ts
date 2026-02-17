/**
 * ThemeManager
 * Manages theme loading, application, and persistence
 */

import {
  applyThemeToDocument,
  DEFAULT_THEME,
  getThemeOrDefault,
  normalizeThemesUnlocked,
  ThemeName,
} from '@config/themes';
import { preferenceCache } from '@services/PreferenceCache';

const STORAGE_KEYS = {
  selectedTheme: 'hextris:selectedTheme',
  unlockedThemes: 'hextris:unlockedThemes',
};

export class ThemeManager {
  private currentTheme: ThemeName = DEFAULT_THEME;
  private unlockedThemes: ThemeName[] = [DEFAULT_THEME];
  private userId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.restoreFromLocalStorage();
    }
  }

  public setUser(userId: string | null): void {
    this.userId = userId;
  }

  public applyTheme(themeName: ThemeName | string): ThemeName {
    const theme = getThemeOrDefault(themeName);
    this.currentTheme = theme.id;
    applyThemeToDocument(theme);
    this.persistSelectedTheme();
    preferenceCache.setSelectedTheme(this.currentTheme);
    return this.currentTheme;
  }

  public getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }

  public getUnlockedThemes(): ThemeName[] {
    return [...this.unlockedThemes];
  }

  public setUnlockedThemes(themes: Array<ThemeName | string>): void {
    const normalized = normalizeThemesUnlocked(themes as string[]);
    this.unlockedThemes = normalized;
    this.persistUnlockedThemes();
  }

  public unlockTheme(themeName: ThemeName): void {
    if (!this.unlockedThemes.includes(themeName)) {
      this.unlockedThemes = [...this.unlockedThemes, themeName];
      this.persistUnlockedThemes();
    }
  }

  public async loadFromAppwrite(userId: string): Promise<void> {
    try {
      this.userId = userId;
      // Dynamically import to avoid circular dependency
      const { appwriteClient } = await import('../network/AppwriteClient');
      const user = await appwriteClient.getUserById(userId);

      if (!user) return;

      if (user.themesUnlocked && Array.isArray(user.themesUnlocked)) {
        this.setUnlockedThemes(user.themesUnlocked);
      }

      if (user.selectedTheme) {
        this.applyTheme(user.selectedTheme);
      }
    } catch (err) {
      console.warn('Failed to load themes from Appwrite:', err);
    }
  }

  /**
   * Save current theme selection to Appwrite
   */
  async saveToAppwrite(): Promise<void> {
    return this.syncToAppwrite();
  }

  /**
   * Sync theme data to Appwrite
   */
  async syncToAppwrite(): Promise<void> {
    if (!this.userId || !this.currentTheme) {
      return;
    }

    try {
      // Dynamically import to avoid circular dependency
      const { appwriteClient } = await import('../network/AppwriteClient');
      await appwriteClient.updateThemes(
        this.userId,
        this.unlockedThemes,
        this.currentTheme
      );
    } catch (err) {
      console.warn('Failed to sync theme to Appwrite:', err);
    }
  }

  private restoreFromLocalStorage(): void {
    try {
      const storedUnlocked = localStorage.getItem(STORAGE_KEYS.unlockedThemes);
      if (storedUnlocked) {
        const parsed = JSON.parse(storedUnlocked);
        if (Array.isArray(parsed)) {
          this.unlockedThemes = normalizeThemesUnlocked(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to restore unlocked themes from storage:', err);
    }

    try {
      const storedTheme = localStorage.getItem(STORAGE_KEYS.selectedTheme);
      const themeToApply = storedTheme ?? this.currentTheme;
      this.applyTheme(themeToApply);
    } catch (err) {
      console.warn('Failed to restore theme selection from storage:', err);
      this.applyTheme(DEFAULT_THEME);
    }
  }

  private persistSelectedTheme(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.selectedTheme, this.currentTheme);
    } catch (err) {
      console.warn('Failed to persist selected theme:', err);
    }
  }

  private persistUnlockedThemes(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.unlockedThemes, JSON.stringify(this.unlockedThemes));
    } catch (err) {
      console.warn('Failed to persist unlocked themes:', err);
    }
  }
}

export const themeManager = new ThemeManager();

if (typeof window !== 'undefined') {
  (window as any).ThemeManager = ThemeManager;
  (window as any).themeManager = themeManager;
}
