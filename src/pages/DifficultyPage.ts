/**
 * Difficulty Page - Difficulty selection screen
 * Allows players to choose game difficulty before starting
 */

import { BasePage } from './BasePage';
import { Router } from '@/router';
import { stateManager } from '@core/StateManager';
import { ROUTES } from '@core/constants';
import { DifficultyLevel, difficultyConfigs } from '@config/difficulty';
import { Button } from '@ui/components/Button';

export class DifficultyPage extends BasePage {
  private selectedDifficulty: DifficultyLevel = DifficultyLevel.MEDIUM;
  private difficultyCards: HTMLElement[] = [];
  private buttons: Button[] = [];

  public render(): void {
  this.element.className = 'page theme-page min-h-screen w-full p-3 sm:p-4 md:p-6 overflow-y-auto';

  const aurora = document.createElement('div');
  aurora.className = 'theme-aurora';
  this.element.appendChild(aurora);

  const grid = document.createElement('div');
  grid.className = 'theme-grid-overlay';
  this.element.appendChild(grid);

    // Clear previous content
    this.element.innerHTML = '';

    // Back button
    const backBtn = this.createBackButton('<- Back', () => {
      Router.getInstance().navigate(ROUTES.MENU);
    });
    backBtn.style.marginBottom = '1rem';
    this.element.appendChild(backBtn);

    // Content container
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-start min-h-screen max-w-4xl mx-auto space-y-6 sm:space-y-8 relative z-10';

  // Reset cards array
  this.difficultyCards = [];

  // Header
    const header = this.createHeader('SELECT DIFFICULTY', 'Choose your challenge');
    container.appendChild(header);

    // Difficulty cards grid with better spacing
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full px-0 sm:px-2';

    // Create cards for each difficulty
    const difficulties = [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD];
    
    difficulties.forEach((level) => {
      const config = difficultyConfigs[level];
      const cardElement = this.createDifficultyCard(level, config);
      cardsGrid.appendChild(cardElement);
      this.difficultyCards.push(cardElement);
    });

    container.appendChild(cardsGrid);

    // Start button with more spacing
    const startButtonContainer = document.createElement('div');
    startButtonContainer.className = 'mt-4 sm:mt-6 w-full max-w-sm px-0 sm:px-2 mb-6';

    const startButton = new Button('START GAME', {
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => this.startGame(),
    });
    this.buttons.push(startButton);
    startButtonContainer.appendChild(startButton.element);
    container.appendChild(startButtonContainer);

    this.element.appendChild(container);
    this.mount();
  }

  /**
   * Create difficulty card
   */
  private createDifficultyCard(level: DifficultyLevel, config: typeof difficultyConfigs[DifficultyLevel]): HTMLElement {
    const isSelected = level === this.selectedDifficulty;
    const card = document.createElement('div');
    card.className = `
      difficulty-card theme-card rounded-2xl p-5 border border-transparent
      cursor-pointer transition-all duration-300 hover:-translate-y-1
    `.trim().replace(/\s+/g, ' ');
    card.dataset.level = level;

    const badge = document.createElement('div');
    badge.className = 'text-[10px] font-bold uppercase tracking-[0.4em] theme-text-secondary text-center mb-3';
    badge.textContent = level;
    card.appendChild(badge);

    // Title
    const title = document.createElement('h3');
    title.className = 'text-2xl font-black mb-1 text-center tracking-tight theme-text';
    title.textContent = config.name.toUpperCase();
    card.appendChild(title);

    // Description
    const description = document.createElement('p');
    description.className = 'text-xs mb-3 text-center font-medium theme-text-secondary';
    description.textContent = config.description;
    card.appendChild(description);

    const statsContainer = document.createElement('div');
    statsContainer.className = 'rounded-xl p-3 mb-3 theme-card-muted';
    
    const stats = document.createElement('div');
    stats.className = 'space-y-2 text-xs';
    
    const statItems = [
      { label: 'Block Speed', value: `${config.blockSpeed}px/s` },
      { label: 'Spawn Delay', value: `${config.spawnDelay}ms` },
      { label: 'Score Bonus', value: `x${config.scoreMultiplier}` },
    ];

    statItems.forEach(({ label, value }) => {
      const statDiv = document.createElement('div');
      statDiv.className = 'flex justify-between font-semibold';

      const labelSpan = document.createElement('span');
      labelSpan.className = 'theme-text-secondary';
      labelSpan.textContent = label;

      const valueSpan = document.createElement('span');
      valueSpan.className = 'font-bold theme-text';
      valueSpan.textContent = value;

      statDiv.appendChild(labelSpan);
      statDiv.appendChild(valueSpan);
      stats.appendChild(statDiv);
    });

    statsContainer.appendChild(stats);
    card.appendChild(statsContainer);

    const footer = document.createElement('div');
    footer.className = 'difficulty-card-footer';
    card.appendChild(footer);

    this.updateCardSelection(card, level, isSelected);

    // Click handler with logging
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.selectDifficulty(level);
    });

    return card;
  }

  /**
   * Select difficulty
   */
  private selectDifficulty(level: DifficultyLevel): void {
    this.selectedDifficulty = level;
    this.difficultyCards.forEach((card) => {
      const cardLevel = card.dataset.level as DifficultyLevel | undefined;
      if (cardLevel) {
        this.updateCardSelection(card, cardLevel, cardLevel === level);
      }
    });
  }

  private updateCardSelection(
    card: HTMLElement,
    level: DifficultyLevel,
    isSelected: boolean
  ): void {
    card.classList.toggle('selected', isSelected);

    const footer = card.querySelector('.difficulty-card-footer');
    if (!footer) return;

    footer.innerHTML = '';

    if (isSelected) {
      const indicator = document.createElement('div');
      indicator.className = 'text-center mt-3 font-bold text-sm flex items-center justify-center gap-2 theme-text';
      indicator.innerHTML = `<span class="text-xl">★</span> EQUIPPED`;
      footer.appendChild(indicator);
    } else {
      const hint = document.createElement('div');
      hint.className = 'text-center mt-3 text-xs font-semibold opacity-80 theme-text-secondary';
      hint.textContent = 'Tap to compare stats';
      footer.appendChild(hint);
    }
  }

  /**
   * Start game with selected difficulty
   */
  private startGame(): void {
    // Update game state with selected difficulty
    stateManager.updateGame({ difficulty: this.selectedDifficulty });
    
    // Navigate to game page
    Router.getInstance().navigate(ROUTES.GAME, { difficulty: this.selectedDifficulty });
  }

  public onMount(): void {
    this.element.classList.add('animate-fade-in');
  }

  public onUnmount(): void {
    this.difficultyCards = [];
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons = [];
  }
}

