/**
 * Daily Challenge System
 * Builds fresh daily objectives with new mechanics and tracking.
 */

export interface DailyChallenge {
  id: string;
  date: string;
  type: string;
  name: string;
  icon: string;
  description: string;
  params: Record<string, number>;
  baseReward: number;
  streakBonus: number;
  totalReward: number;
  completed: boolean;
}

interface TrackingData {
  startTime: number;
  highestScore: number;
  rotations: number;
  largestClear: number;
  colorsCleared: Set<string>;
  powerUses: number;
}

interface ChallengeType {
  id: string;
  name: string;
  icon: string;
  description: string;
  generateParams: () => Record<string, number>;
}

class DailyChallengeSystem {
  private currentChallenge: DailyChallenge | null = null;
  private challengeDate: string | null = null;
  private isActive = false;
  private completionStatus: Record<string, boolean>;
  private streakDays: number;
  private lastCompletionDate: string | null;
  private challengeTypes: ChallengeType[];
  private trackingData: TrackingData | null = null;
  private randomSeed: number = 0;

  constructor() {
    this.completionStatus = this.loadCompletionStatus();
    this.streakDays = this.loadStreak();
    this.lastCompletionDate = this.loadLastCompletion();

    this.challengeTypes = [
      {
        id: 'rotation_rally',
        name: 'Rotation Rally',
        icon: '🧭',
        description: 'Rotate the hexagon {rotations} times.',
        generateParams: () => ({ rotations: this.randomRange(24, 72, 6) }),
      },
      {
        id: 'color_forge',
        name: 'Color Forge',
        icon: '🎨',
        description: 'Clear matches in {colors} distinct colors.',
        generateParams: () => ({ colors: this.randomRange(3, 5, 1) }),
      },
      {
        id: 'burst_chain',
        name: 'Burst Chain',
        icon: '💥',
        description: 'Land a clear of {blocks}+ blocks.',
        generateParams: () => ({ blocks: this.randomRange(6, 10, 1) }),
      },
      {
        id: 'power_weave',
        name: 'Power Weave',
        icon: '✨',
        description: 'Trigger {powers} powers in one run.',
        generateParams: () => ({ powers: this.randomRange(3, 6, 1) }),
      },
      {
        id: 'endurance_drift',
        name: 'Endurance Drift',
        icon: '⏳',
        description: 'Survive {duration}s and reach {score} points.',
        generateParams: () => ({
          duration: this.randomRange(90, 180, 15),
          score: this.randomRange(4000, 9000, 500),
        }),
      },
    ];

    this.init();
  }

  init() {
    this.generateTodaysChallenge();

    window.addEventListener('activateDailyChallenge', () => {
      this.activate();
    });

    window.addEventListener('gameStart', () => {
      if (this.isActive) {
        this.startTracking();
      }
    });

    window.addEventListener('gameOver', () => {
      if (this.isActive) {
        this.checkCompletion();
      }
    });

    this.checkDailyLogin();
  }

  generateTodaysChallenge() {
    const today = this.getTodayString();

    if (this.challengeDate === today && this.currentChallenge) {
      return this.currentChallenge;
    }

    const seed = this.dateToSeed(today);
    this.seedRandom(seed);

    const typeIndex = Math.floor(this.seededRandom() * this.challengeTypes.length);
    const challengeType = this.challengeTypes[typeIndex];

    const params = challengeType.generateParams();

    const baseReward = 600;
    const streakBonus = this.streakDays >= 5 ? 300 : 0;

    this.currentChallenge = {
      id: `${today}_${challengeType.id}`,
      date: today,
      type: challengeType.id,
      name: challengeType.name,
      icon: challengeType.icon,
      description: this.formatDescription(challengeType.description, params),
      params,
      baseReward,
      streakBonus,
      totalReward: baseReward + streakBonus,
      completed: this.isCompletedToday(),
    };

    this.challengeDate = today;
    return this.currentChallenge;
  }

  formatDescription(template: string, params: Record<string, number>): string {
    let result = template;
    Object.keys(params).forEach((key) => {
      result = result.replace(`{${key}}`, String(params[key]));
    });
    return result;
  }

  activate() {
    this.isActive = true;
    this.trackingData = this.initTrackingData();
  }

  deactivate() {
    this.isActive = false;
    this.trackingData = null;
  }

  startTracking(): void {
    this.trackingData = this.initTrackingData();

    window.addEventListener('scoreUpdate', ((e: CustomEvent) => this.onScoreUpdate(e)) as EventListener);
    window.addEventListener('matchResolved', ((e: CustomEvent) => this.onMatchResolved(e)) as EventListener);
    window.addEventListener('hexRotated', (() => this.onHexRotated()) as EventListener);
    window.addEventListener('powerUpUsed', (() => this.onPowerUsed()) as EventListener);
  }

  initTrackingData(): TrackingData {
    return {
      startTime: Date.now(),
      highestScore: 0,
      rotations: 0,
      largestClear: 0,
      colorsCleared: new Set(),
      powerUses: 0,
    };
  }

  onScoreUpdate(e: CustomEvent): void {
    if (!this.trackingData) return;
    const currentScore = e.detail?.score || 0;
    this.trackingData.highestScore = Math.max(this.trackingData.highestScore, currentScore);
  }

  onMatchResolved(e: CustomEvent): void {
    if (!this.trackingData) return;
    const blocksCleared = e.detail?.blocksCleared ?? 0;
    const color = e.detail?.color;
    if (color) {
      this.trackingData.colorsCleared.add(color);
    }
    if (blocksCleared > this.trackingData.largestClear) {
      this.trackingData.largestClear = blocksCleared;
    }
  }

  onHexRotated(): void {
    if (!this.trackingData) return;
    this.trackingData.rotations += 1;
  }

  onPowerUsed(): void {
    if (!this.trackingData) return;
    this.trackingData.powerUses += 1;
  }

  checkCompletion() {
    if (!this.currentChallenge || !this.trackingData) return false;

    const challenge = this.currentChallenge;
    let completed = false;

    switch (challenge.type) {
      case 'rotation_rally':
        completed = this.trackingData.rotations >= challenge.params.rotations;
        break;
      case 'color_forge':
        completed = this.trackingData.colorsCleared.size >= challenge.params.colors;
        break;
      case 'burst_chain':
        completed = this.trackingData.largestClear >= challenge.params.blocks;
        break;
      case 'power_weave':
        completed = this.trackingData.powerUses >= challenge.params.powers;
        break;
      case 'endurance_drift': {
        const timeElapsed = (Date.now() - this.trackingData.startTime) / 1000;
        completed = timeElapsed >= challenge.params.duration
          && this.trackingData.highestScore >= challenge.params.score;
        break;
      }
      default:
        completed = false;
    }

    if (completed && !this.isCompletedToday()) {
      this.onChallengeCompleted();
    }

    return completed;
  }

  onChallengeCompleted(): void {
    if (!this.currentChallenge) return;
    this.markCompleted();
    this.updateStreak();
    this.showCompletionNotification();
  }

  showCompletionNotification(): void {
    if (!this.currentChallenge) return;
    const streakBonus = this.streakDays >= 5 ? ' (Streak Bonus!)' : '';
    console.log(`Challenge Complete! You earned ${this.currentChallenge.totalReward} diamonds.${streakBonus}`);
  }

  checkDailyLogin() {
    const today = this.getTodayString();
    const lastLogin = localStorage.getItem('lastDailyLogin');

    if (lastLogin !== today) {
      localStorage.setItem('lastDailyLogin', today);
    }
  }

  updateStreak() {
    const today = this.getTodayString();
    const yesterday = this.getYesterdayString();

    if (this.lastCompletionDate === yesterday) {
      this.streakDays++;
    } else if (this.lastCompletionDate === today) {
      return;
    } else {
      this.streakDays = 1;
    }

    this.lastCompletionDate = today;
    this.saveStreak();
    this.saveLastCompletion();
  }

  seedRandom(seed: number): void {
    this.randomSeed = seed;
  }

  seededRandom(): number {
    const x = Math.sin(this.randomSeed++) * 10000;
    return x - Math.floor(x);
  }

  randomRange(min: number, max: number, step: number): number {
    const range = Math.floor((max - min) / step) + 1;
    const value = min + Math.floor(this.seededRandom() * range) * step;
    return Math.min(max, Math.max(min, value));
  }

  dateToSeed(date: string): number {
    return Array.from(date).reduce((total, char) => total + char.charCodeAt(0), 0);
  }

  getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  getYesterdayString(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().slice(0, 10);
  }

  getCurrentChallenge(): DailyChallenge | null {
    return this.currentChallenge;
  }

  getStreak(): number {
    return this.streakDays;
  }

  isCompletedToday(): boolean {
    if (!this.currentChallenge) return false;
    return this.completionStatus[this.currentChallenge.id] === true;
  }

  markCompleted(): void {
    if (!this.currentChallenge) return;
    this.completionStatus[this.currentChallenge.id] = true;
    this.saveCompletionStatus();
  }

  loadCompletionStatus(): Record<string, boolean> {
    try {
      const saved = localStorage.getItem('dailyChallengeCompletions');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      return {};
    }
  }

  saveCompletionStatus(): void {
    try {
      localStorage.setItem('dailyChallengeCompletions', JSON.stringify(this.completionStatus));
    } catch (error) {
      console.error('Error saving challenge completion:', error);
    }
  }

  loadStreak(): number {
    try {
      const saved = localStorage.getItem('dailyChallengeStreak');
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  saveStreak(): void {
    try {
      localStorage.setItem('dailyChallengeStreak', this.streakDays.toString());
    } catch (error) {
      console.error('Error saving streak:', error);
    }
  }

  loadLastCompletion(): string | null {
    return localStorage.getItem('lastChallengeCompletion');
  }

  saveLastCompletion(): void {
    if (this.lastCompletionDate) {
      localStorage.setItem('lastChallengeCompletion', this.lastCompletionDate);
    }
  }
}

export { DailyChallengeSystem };
