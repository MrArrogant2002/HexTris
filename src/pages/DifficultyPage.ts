/**
 * Difficulty Page - Difficulty selection screen
 * Allows players to choose game difficulty before starting
 */

import { BasePage } from './BasePage';
import { Router } from '@/router';
import { stateManager } from '@core/StateManager';
import { ROUTES } from '@core/constants';
import { DifficultyLevel, difficultyConfigs, difficultyOrder, normalizePlayableDifficulty } from '@config/difficulty';
import { Button } from '@ui/components/Button';

export class DifficultyPage extends BasePage {
  private selectedDifficulty: DifficultyLevel = DifficultyLevel.STANDARD;
  private difficultyCards: HTMLElement[] = [];
  private buttons: Button[] = [];

  public render(): void {
    const container = this.initPageLayout({
      align: 'top',
      maxWidthClass: 'max-w-4xl',
      paddingClass: 'px-2 sm:px-4 py-8 sm:py-12',
    });

    const backBtn = this.createBackButton('<- Back', () => {
      Router.getInstance().navigate(ROUTES.MENU);
    });
    backBtn.style.marginBottom = '1rem';
    container.appendChild(backBtn);

  // Reset cards array
  this.difficultyCards = [];

  // Header
    const header = this.createHeader('SELECT DIFFICULTY', 'Choose your challenge');
    container.appendChild(header);

    // Difficulty cards grid with better spacing
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full px-0 sm:px-2';

    // Create cards for each difficulty
    const difficulties = difficultyOrder;
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
      { label: 'Hazards', value: config.hazardProfile.toUpperCase() },
      { label: 'Power-Ups', value: `${Math.round(config.powerUpRate * 100)}%` },
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

    const surgeInfo = document.createElement('div');
    surgeInfo.className = 'mt-3 text-[11px] uppercase tracking-[0.2em] theme-text-secondary text-center';
    surgeInfo.textContent = `Surge every ${config.surge.cadence}s (+${Math.round(config.surge.spawnScalar * 100)}% spawn)`;
    card.appendChild(surgeInfo);

    if (config.adaptiveAssist?.enabled) {
      const assist = document.createElement('div');
      assist.className = 'mt-1 text-[11px] text-center text-emerald-400 font-semibold';
      assist.textContent = 'Adaptive Assist active';
      card.appendChild(assist);
    }

    if (config.prestige?.available) {
      const prestige = document.createElement('div');
      prestige.className = 'mt-1 text-[11px] text-center text-amber-300 font-semibold';
      prestige.textContent = `Prestige +${Math.round(config.prestige.scoreMultiplier * 100)}%`;
      card.appendChild(prestige);
    }

    if (config.unlockRequirement) {
      const unlock = document.createElement('div');
      unlock.className = 'mt-2 text-xs text-center theme-text-secondary';
      unlock.textContent = config.unlockRequirement;
      card.appendChild(unlock);
    }

    if (config.phases.length) {
      const phases = document.createElement('ul');
      phases.className = 'mt-3 text-[11px] space-y-1 theme-text-secondary';
      config.phases.forEach((phase) => {
        const li = document.createElement('li');
        const timeLabel = `${phase.startsAt}s`;
        li.textContent = `${timeLabel}: ${phase.name}`;
        phases.appendChild(li);
      });
      card.appendChild(phases);
    }

    const footer = document.createElement('div');
    footer.className = 'difficulty-card-footer';
    card.appendChild(footer);

    this.updateCardSelection(card, isSelected);

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
        this.updateCardSelection(card, cardLevel === level);
      }
    });
  }

  private updateCardSelection(
    card: HTMLElement,
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
    const difficulty = normalizePlayableDifficulty(this.selectedDifficulty);
    // Update game state with selected difficulty
    stateManager.updateGame({ difficulty });
    
    // Navigate to game page
    Router.getInstance().navigate(ROUTES.GAME, { difficulty });
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
