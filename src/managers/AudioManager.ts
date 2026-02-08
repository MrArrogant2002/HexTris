type MusicTrack = 'game' | 'menu';
type SfxKey =
  | 'blockLand'
  | 'matchClear'
  | 'powerUpCollect'
  | 'lifeLost'
  | 'gameOver';

type ResumeHandler = () => void;

export class AudioManager {
  private static instance: AudioManager;
  private music: HTMLAudioElement;
  private currentTrack: MusicTrack | null = null;
  private pendingPlay = false;
  private resumeHandler: ResumeHandler | null = null;
  private isSfxMuted = false;
  private sfxVolume = 0.6;

  private constructor() {
    this.music = new Audio();
    this.music.loop = true;
    this.music.preload = 'auto';
    this.music.volume = 0.35;
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public playGameMusic(): void {
    this.playMusic('game');
  }

  public playMenuMusic(): void {
    this.playMusic('menu');
  }

  public stopMusic(): void {
    this.music.pause();
    this.music.currentTime = 0;
    this.currentTrack = null;
  }

  public setMusicMuted(muted: boolean): void {
    this.music.muted = muted;
    if (!muted && this.pendingPlay) {
      this.tryPlay();
    }
  }

  public setSfxMuted(muted: boolean): void {
    this.isSfxMuted = muted;
  }

  public setMusicVolume(volume: number): void {
    this.music.volume = this.clampVolume(volume);
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = this.clampVolume(volume);
  }

  public playSfx(key: SfxKey): void {
    if (this.isSfxMuted) {
      return;
    }

    const src = this.getSfxUrl(key);
    if (!src) {
      return;
    }

    const sfx = new Audio(src);
    sfx.volume = this.sfxVolume;
    const playAttempt = sfx.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => {
        // Ignore autoplay restrictions for SFX.
      });
    }
  }

  private playMusic(track: MusicTrack): void {
    if (this.currentTrack === track) {
      this.tryPlay();
      return;
    }

    this.currentTrack = track;
    this.music.src = this.getTrackUrl(track);
    this.music.load();
    this.tryPlay();
  }

  private getTrackUrl(track: MusicTrack): string {
    if (track === 'game') {
      return '/audio/game-music.mp3';
    }
    return '/audio/menu-music.mp3';
  }

  private getSfxUrl(key: SfxKey): string {
    const map: Record<SfxKey, string> = {
      blockLand: '/audio/block-land.mp3',
      matchClear: '/audio/match-clear.mp3',
      powerUpCollect: '/audio/powerup-collect.mp3',
      lifeLost: '/audio/life-lost.mp3',
      gameOver: '/audio/game-over.mp3',
    };

    return map[key];
  }

  private clampVolume(value: number): number {
    if (Number.isNaN(value)) {
      return 0.5;
    }
    return Math.min(1, Math.max(0, value));
  }

  private tryPlay(): void {
    const playAttempt = this.music.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => this.deferPlayUntilInteraction());
    }
  }

  private deferPlayUntilInteraction(): void {
    if (this.pendingPlay) {
      return;
    }

    this.pendingPlay = true;
    this.resumeHandler = () => {
      this.pendingPlay = false;
      this.tryPlay();
      this.clearResumeListeners();
    };

    window.addEventListener('pointerdown', this.resumeHandler, { once: true });
    window.addEventListener('keydown', this.resumeHandler, { once: true });
  }

  private clearResumeListeners(): void {
    if (!this.resumeHandler) {
      return;
    }

    window.removeEventListener('pointerdown', this.resumeHandler);
    window.removeEventListener('keydown', this.resumeHandler);
    this.resumeHandler = null;
  }
}

export const audioManager = AudioManager.getInstance();
