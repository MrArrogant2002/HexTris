import type { ThemeName } from '@config/themes';
import type { Session } from './AuthService';

type AudioPreferences = {
  isMusicMuted?: boolean;
  isSfxMuted?: boolean;
  musicVolume?: number;
  sfxVolume?: number;
};

type CachedPreferences = AudioPreferences & {
  selectedTheme?: ThemeName;
  session?: Session;
};

const KEY = 'hextris:preferences-cache';

class PreferenceCache {
  private read(): CachedPreferences {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}') as CachedPreferences;
    } catch {
      return {};
    }
  }

  private write(next: CachedPreferences): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  public getAudioPreferences(): AudioPreferences {
    const cached = this.read();
    return {
      isMusicMuted: cached.isMusicMuted,
      isSfxMuted: cached.isSfxMuted,
      musicVolume: cached.musicVolume,
      sfxVolume: cached.sfxVolume,
    };
  }

  public setAudioPreferences(preferences: AudioPreferences): void {
    this.write({
      ...this.read(),
      ...preferences,
    });
  }

  public getSelectedTheme(): ThemeName | undefined {
    return this.read().selectedTheme;
  }

  public setSelectedTheme(selectedTheme: ThemeName): void {
    this.write({
      ...this.read(),
      selectedTheme,
    });
  }

  public getSession(): Session | null {
    return this.read().session || null;
  }

  public setSession(session: Session): void {
    this.write({
      ...this.read(),
      session,
    });
  }

  public clearSession(): void {
    const cached = this.read();
    delete cached.session;
    this.write(cached);
  }
}

export const preferenceCache = new PreferenceCache();
