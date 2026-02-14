/**
 * Timer Attack Mode
 * Pulse Relay: build relay nodes to extend the clock and raise intensity.
 */

const BASE_RELAY_BONUS_SECONDS = 6;
const RELAY_STAGE_BONUS_SECONDS = 2;
const RELAY_STAGE_SCORE_BONUS = 750;
const ENDURANCE_SCORE_RATE = 60;
const COMPLETION_SCORE_BONUS = 4000;

class TimerAttackMode {
  private isActive = false;
  private timeLimit: number;
  private timeRemaining: number;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private startTime: number | null = null;
  private isPaused = false;
  private bestTime: number | null;
  private bestScore: number;
  private relayGoal = 4;
  private relayCount = 0;
  private relayStage = 0;
  private relayBonusSeconds = 0;

  constructor(timeLimit: number = 75) {
    this.timeLimit = timeLimit;
    this.timeRemaining = this.timeLimit;
    this.bestTime = this.loadBestTime();
    this.bestScore = this.loadBestScore();
    this.init();
  }

  init() {
    window.addEventListener('activateTimerMode', () => {
      this.activate();
    });

    window.addEventListener('gameStart', () => {
      if (this.isActive) {
        this.start();
      }
    });

    window.addEventListener('gameOver', () => {
      if (this.isActive) {
        this.end();
      }
    });

    window.addEventListener('pauseGame', () => {
      this.pause();
    });

    window.addEventListener('resumeGame', () => {
      this.resume();
    });

    console.log('Timer Relay Mode initialized');
  }

  activate() {
    this.isActive = true;
    this.timeRemaining = this.timeLimit;
    this.relayCount = 0;
    this.relayStage = 0;
    this.relayBonusSeconds = 0;
    console.log('Timer Relay Mode ACTIVATED');

    this.showModeIndicator();
  }

  deactivate() {
    this.isActive = false;
    this.stop();
    this.hideModeIndicator();
  }

  start() {
    if (!this.isActive || this.timerId) return;

    this.startTime = Date.now();
    this.timeRemaining = this.timeLimit;
    this.relayCount = 0;
    this.relayStage = 0;
    this.relayBonusSeconds = 0;
    this.isPaused = false;

    this.timerId = setInterval(() => {
      if (!this.isPaused) {
        this.tick();
      }
    }, 100);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  pause() {
    if (this.isActive && !this.isPaused) {
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isActive && this.isPaused) {
      this.isPaused = false;
    }
  }

  tick(): void {
    if (this.startTime === null) return;

    const elapsed = (Date.now() - this.startTime) / 1000;
    this.timeRemaining = Math.max(0, this.timeLimit + this.relayBonusSeconds - elapsed);

    this.updateTimerDisplay();

    if (this.timeRemaining <= 0) {
      this.onTimeUp();
    }
  }

  onTimeUp() {
    this.stop();

    const finalScore = this.calculateFinalScore(0);
    this.checkNewBest(finalScore);

    window.dispatchEvent(new CustomEvent('timerModeTimeUp', {
      detail: { score: finalScore, survived: true }
    }));
  }

  end(): void {
    const timeElapsed = this.timeLimit + this.relayBonusSeconds - this.timeRemaining;
    const finalScore = this.calculateFinalScore(0);

    this.stop();

    window.dispatchEvent(new CustomEvent('timerModeEnded', {
      detail: {
        score: finalScore,
        timeElapsed,
        survived: false
      }
    }));
  }

  calculateFinalScore(currentScore: number = 0): number {
    const relayBonus = this.relayStage * RELAY_STAGE_SCORE_BONUS;
    const enduranceBonus = Math.floor(
      (this.timeLimit + this.relayBonusSeconds - this.timeRemaining) * ENDURANCE_SCORE_RATE
    );
    const completionBonus = this.timeRemaining <= 0 ? COMPLETION_SCORE_BONUS : 0;

    return currentScore + relayBonus + enduranceBonus + completionBonus;
  }

  addRelayCharge(): void {
    if (!this.isActive) return;
    this.relayCount += 1;

    if (this.relayCount >= this.relayGoal) {
      this.completeRelay();
    }
    this.updateTimerDisplay();
  }

  private completeRelay(): void {
    this.relayCount = 0;
    this.relayStage += 1;
    const bonusSeconds = BASE_RELAY_BONUS_SECONDS + this.relayStage * RELAY_STAGE_BONUS_SECONDS;
    this.relayBonusSeconds += bonusSeconds;
    this.updateTimerDisplay();
    window.dispatchEvent(new CustomEvent('timerRelayComplete', {
      detail: { stage: this.relayStage, bonusSeconds }
    }));
  }

  checkNewBest(finalScore: number): void {
    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;
      this.saveBestScore(finalScore);
    }

    if (this.timeRemaining <= 0) {
      const currentTime = this.timeLimit;
      if (!this.bestTime || currentTime < this.bestTime) {
        this.bestTime = currentTime;
        this.saveBestTime(currentTime);
      }
    }
  }

  updateTimerDisplay() {
    const timerElement = document.getElementById('timer-attack-display');
    if (!timerElement) return;

    timerElement.textContent = this.formatTimerDisplay(this.timeRemaining, this.relayStage);

    if (this.timeRemaining <= 10) {
      timerElement.className = 'timer-attack-display critical';
    } else if (this.timeRemaining <= 30) {
      timerElement.className = 'timer-attack-display warning';
    } else {
      timerElement.className = 'timer-attack-display normal';
    }
  }

  showModeIndicator() {
    let timerDisplay = document.getElementById('timer-attack-display');
    if (!timerDisplay) {
      timerDisplay = document.createElement('div');
      timerDisplay.id = 'timer-attack-display';
      timerDisplay.className = 'timer-attack-display normal';
      timerDisplay.textContent = this.formatTimerDisplay(this.timeLimit, 0);
      const hud = document.getElementById('hud-overlay');
      (hud || document.body).appendChild(timerDisplay);
    }
    timerDisplay.style.display = 'block';

    let modeBadge = document.getElementById('timer-mode-badge');
    if (!modeBadge) {
      modeBadge = document.createElement('div');
      modeBadge.id = 'timer-mode-badge';
      modeBadge.className = 'timer-mode-badge';
      modeBadge.innerHTML = 'PULSE RELAY';
      const hud = document.getElementById('hud-overlay');
      (hud || document.body).appendChild(modeBadge);
    }
    modeBadge.style.display = 'block';
  }

  hideModeIndicator() {
    const timerDisplay = document.getElementById('timer-attack-display');
    const modeBadge = document.getElementById('timer-mode-badge');

    if (timerDisplay) timerDisplay.style.display = 'none';
    if (modeBadge) modeBadge.style.display = 'none';
  }

  loadBestTime(): number | null {
    try {
      const saved = localStorage.getItem('timerAttackBestTime');
      return saved ? parseFloat(saved) : null;
    } catch (error) {
      return null;
    }
  }

  saveBestTime(time: number): void {
    try {
      localStorage.setItem('timerAttackBestTime', time.toString());
    } catch (error) {
      console.error('Error saving best time:', error);
    }
  }

  loadBestScore(): number {
    try {
      const saved = localStorage.getItem('timerAttackBestScore');
      return saved ? parseInt(saved, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  saveBestScore(score: number): void {
    try {
      localStorage.setItem('timerAttackBestScore', score.toString());
    } catch (error) {
      console.error('Error saving best score:', error);
    }
  }

  isTimerMode(): boolean {
    return this.isActive;
  }

  getTimeRemaining(): number {
    return this.timeRemaining;
  }

  getBestScore(): number {
    return this.bestScore;
  }

  getBestTime(): number | null {
    return this.bestTime;
  }

  getRelayStage(): number {
    return this.relayStage;
  }

  getRelayCount(): number {
    return this.relayCount;
  }

  getRelayGoal(): number {
    return this.relayGoal;
  }

  getPhaseLabel(): string {
    return `Relay ${this.relayStage + 1}`;
  }

  private formatTimerDisplay(timeRemaining: number, stage: number): string {
    const seconds = Math.floor(timeRemaining);
    const milliseconds = Math.floor((timeRemaining % 1) * 10);

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${minutes}:${secs.toString().padStart(2, '0')}.${milliseconds}`;
    return `${timeString} · R${stage + 1}`;
  }
}

export { TimerAttackMode };
