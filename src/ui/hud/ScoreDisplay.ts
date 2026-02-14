/**
 * Score Display HUD Component
 * Shows current score in large text at top-center
 */

export class ScoreDisplay {
  private element: HTMLDivElement;
  private scoreText!: HTMLDivElement;
  private currentScore: number = 0;
  private targetScore: number = 0;
  private animationFrame: number | null = null;

  constructor(initialScore: number = 0) {
    this.currentScore = initialScore;
    this.targetScore = initialScore;
    this.element = this.createElements();
  }

  private createElements(): HTMLDivElement {
    // Container
    const container = document.createElement('div');
    container.className = `
      fixed top-14 sm:top-4 left-1/2 transform -translate-x-1/2 z-30
      flex flex-col items-center
    `;

    const panel = document.createElement('div');
    panel.className = `
      theme-card-muted px-4 py-2 rounded-2xl
      shadow-lg flex flex-col items-center
    `.trim().replace(/\s+/g, ' ');

    // Score text
    this.scoreText = document.createElement('div');
    this.scoreText.className = `
      text-3xl sm:text-4xl lg:text-5xl font-black
      theme-text
      drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]
      transition-all duration-300
    `;
    this.scoreText.textContent = '0';

    // Score label
    const label = document.createElement('div');
    label.className = `
      text-[10px] sm:text-xs theme-text-secondary uppercase tracking-wider
      mt-1
    `;
    label.textContent = 'Score';

    panel.appendChild(this.scoreText);
    panel.appendChild(label);
    container.appendChild(panel);

    return container;
  }

  /**
   * Set score with smooth counting animation
   */
  public setScore(score: number, animate: boolean = true): void {
    this.targetScore = score;

    if (!animate) {
      this.currentScore = score;
      this.updateDisplay();
      return;
    }

    // Cancel existing animation
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    // Smooth count up animation
    this.animateScore();
  }

  private animateScore(): void {
    const diff = this.targetScore - this.currentScore;
    const increment = Math.ceil(Math.abs(diff) / 10);

    if (Math.abs(diff) < 1) {
      this.currentScore = this.targetScore;
      this.updateDisplay();
      return;
    }

    this.currentScore += diff > 0 ? increment : -increment;
    this.updateDisplay();

    this.animationFrame = requestAnimationFrame(() => this.animateScore());
  }

  private updateDisplay(): void {
    this.scoreText.textContent = Math.floor(this.currentScore).toLocaleString();
  }

  /**
   * Add to score
   */
  public addScore(amount: number): void {
    this.setScore(this.targetScore + amount);
    
    // Scale pulse effect
    this.scoreText.classList.add('scale-110');
    setTimeout(() => {
      this.scoreText.classList.remove('scale-110');
    }, 200);
  }

  /**
   * Get current score
   */
  public getScore(): number {
    return this.targetScore;
  }

  /**
   * Reset score
   */
  public reset(): void {
    this.setScore(0, false);
  }

  /**
   * Flash effect for combos
   */
  public flashCombo(): void {
    this.scoreText.classList.add('animate-pulse', 'text-yellow-400');
    setTimeout(() => {
      this.scoreText.classList.remove('animate-pulse', 'text-yellow-400');
    }, 500);
  }

  /**
   * Mount to parent element
   */
  public mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }

  /**
   * Unmount from DOM
   */
  public unmount(): void {
    this.element.remove();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  /**
   * Get DOM element
   */
  public getElement(): HTMLDivElement {
    return this.element;
  }
}
