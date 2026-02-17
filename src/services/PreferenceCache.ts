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
  session?: {
    value: Session;
    expiresAt: number;
  };
};

const KEY = 'hextris:preferences-cache';
// Keep cached session short-lived to avoid trusting stale identities for too long.
const SESSION_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

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
    const sessionEntry = this.read().session;
    if (!sessionEntry) return null;
    if (Date.now() > sessionEntry.expiresAt) {
      this.clearSession();
      return null;
    }
    return sessionEntry.value;
  }

  public setSession(session: Session): void {
    this.write({
      ...this.read(),
      session: {
        value: session,
        expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
      },
    });
  }

  public clearSession(): void {
    const cached = this.read();
    delete cached.session;
    this.write(cached);
  }
}

export const preferenceCache = new PreferenceCache();
