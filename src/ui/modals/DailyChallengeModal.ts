/**
 * Daily Challenge Modal - Show challenge preview and completion rewards
 */

import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import type { DailyChallenge } from '@modes/DailyChallengeMode';

export class DailyChallengeModal {
  private modal: Modal | null = null;

  /**
   * Show challenge preview modal
   */
  public showPreview(challenge: DailyChallenge, streak: number): void {
    this.modal = new Modal({
      title: 'HEXFORGE TRIAL',
      closeOnBackdrop: true,
      closeOnEscape: true,
      maxWidth: 'lg',
    });

    const content = document.createElement('div');
    content.className = 'space-y-5 py-4';

    // Challenge icon and name
    const header = document.createElement('div');
    header.className = 'text-center mb-4';
    header.innerHTML = `
      <div class="text-6xl mb-3">${challenge.icon}</div>
      <h2 class="text-3xl font-bold theme-text mb-2">${challenge.name}</h2>
      <p class="theme-text-secondary text-sm font-medium">${challenge.description}</p>
    `;
    content.appendChild(header);

    // Difficulty indicator (based on reward)
    const difficulty = document.createElement('div');
    difficulty.className = 'theme-card rounded-lg p-3 text-center border border-transparent';
    difficulty.innerHTML = `
      <div class="text-xs font-semibold theme-text-secondary uppercase tracking-wider">Difficulty</div>
      <div class="text-lg font-bold theme-text mt-1">
        ${challenge.baseReward <= 250 ? 'Easy' : challenge.baseReward <= 500 ? 'Medium' : 'Hard'}
      </div>
    `;
    content.appendChild(difficulty);

    // Rewards section
    const rewardsSection = document.createElement('div');
    rewardsSection.className = 'space-y-2';

    // Base reward
    const baseReward = document.createElement('div');
    baseReward.className = 'flex justify-between items-center theme-card-muted rounded-lg p-3 border border-transparent';
    baseReward.innerHTML = `
      <span class="text-sm font-semibold theme-text-secondary">Base Reward</span>
      <span class="text-lg font-bold theme-text">${challenge.baseReward} DIAMOND</span>
    `;
    rewardsSection.appendChild(baseReward);

    // Streak bonus (if applicable)
    if (streak >= 7) {
      const bonusReward = document.createElement('div');
      bonusReward.className = 'flex justify-between items-center theme-card rounded-lg p-3 border-2';
      bonusReward.style.borderColor = 'var(--theme-accent)';
      bonusReward.innerHTML = `
        <span class="text-sm font-semibold theme-text">Streak Bonus (${streak} days)</span>
        <span class="text-lg font-bold theme-text">+${challenge.streakBonus} DIAMOND</span>
      `;
      rewardsSection.appendChild(bonusReward);
    }

    // Total reward
    const totalReward = document.createElement('div');
    totalReward.className = 'flex justify-between items-center theme-card rounded-lg p-4 border-2';
    totalReward.style.borderColor = 'var(--theme-accent-soft)';
    totalReward.innerHTML = `
      <span class="text-sm font-bold theme-text uppercase tracking-wide">Total Reward</span>
      <span class="text-2xl font-black theme-text">${challenge.totalReward} DIAMOND</span>
    `;
    rewardsSection.appendChild(totalReward);

    content.appendChild(rewardsSection);

    // Current streak display
    if (streak > 0) {
      const streakDisplay = document.createElement('div');
      streakDisplay.className = 'text-center theme-card rounded-lg p-3 border border-transparent';
      streakDisplay.innerHTML = `
        <div class="text-xs font-semibold theme-text-secondary uppercase">Current Streak</div>
        <div class="text-3xl font-black theme-text mt-1">STREAK ${streak}</div>
        <div class="text-xs theme-text-secondary mt-1">Keep it going!</div>
      `;
      content.appendChild(streakDisplay);
    }

    // Motivational message
    const motivationMessages = [
      'Make every second count!',
      'Challenge yourself to greatness!',
      'You got this!',
      'Time to shine!',
      'Today\'s your day!',
    ];
    const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

    const motivation = document.createElement('div');
    motivation.className = 'text-center italic theme-text-secondary text-sm pt-2';
    motivation.textContent = randomMessage;
    content.appendChild(motivation);

    // Start button
    const startBtn = new Button('Start Challenge', {
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => this.modal?.close(),
    });
    content.appendChild(startBtn.element);

    this.modal.setContent(content);
    this.modal.open();
  }

  /**
   * Show completion reward modal (displayed at game over)
   */
  public showCompletion(challenge: DailyChallenge, streak: number, score: number): void {
    this.modal = new Modal({
      title: '',
      closeOnBackdrop: false,
      closeOnEscape: false,
      maxWidth: 'lg',
    });

    const content = document.createElement('div');
    content.className = 'space-y-6 py-6 text-center';

    // Celebration animation
    const celebration = document.createElement('div');
    celebration.className = 'text-7xl mb-4 animate-bounce theme-text';
    celebration.textContent = 'TRIAL CLEARED';
    content.appendChild(celebration);

    // Title
    const title = document.createElement('h2');
    title.className = 'text-3xl font-black theme-text mb-2';
    title.textContent = 'TRIAL COMPLETE!';
    content.appendChild(title);

    // Challenge info
    const info = document.createElement('div');
    info.className = 'theme-card rounded-lg p-4 border-2 mb-2';
    info.innerHTML = `
      <div class="text-4xl mb-2">${challenge.icon}</div>
      <div class="text-xl font-bold theme-text">${challenge.name}</div>
      <div class="text-sm theme-text-secondary mt-1">Score: ${score.toLocaleString()}</div>
    `;
    content.appendChild(info);

    // Reward breakdown
    const rewardBreakdown = document.createElement('div');
    rewardBreakdown.className = 'space-y-2 mb-4';

    const baseRewardEl = document.createElement('div');
    baseRewardEl.className = 'flex justify-between items-center theme-card-muted rounded-lg p-3 border border-transparent';
    baseRewardEl.innerHTML = `
      <span class="font-semibold theme-text-secondary">Base Reward</span>
      <span class="font-bold theme-text">+${challenge.baseReward} DIAMOND</span>
    `;
    rewardBreakdown.appendChild(baseRewardEl);

    if (challenge.streakBonus > 0) {
      const bonusEl = document.createElement('div');
      bonusEl.className = 'flex justify-between items-center theme-card rounded-lg p-3 border-2 animate-pulse';
      bonusEl.style.borderColor = 'var(--theme-accent)';
      bonusEl.innerHTML = `
        <span class="font-semibold theme-text">Streak Bonus (${streak} days)</span>
        <span class="font-bold theme-text">+${challenge.streakBonus} DIAMOND</span>
      `;
      rewardBreakdown.appendChild(bonusEl);
    }

    // Total reward (animated)
    const totalRewardEl = document.createElement('div');
    totalRewardEl.className = 'flex justify-between items-center theme-card rounded-lg p-4 border-2 scale-105';
    totalRewardEl.style.borderColor = 'var(--theme-accent-soft)';
    totalRewardEl.innerHTML = `
      <span class="text-sm font-bold theme-text uppercase tracking-wide">Reward Earned</span>
      <span class="text-3xl font-black theme-text animate-pulse">+${challenge.totalReward} DIAMOND</span>
    `;
    rewardBreakdown.appendChild(totalRewardEl);

    content.appendChild(rewardBreakdown);

    // New streak display if streak updated
    if (streak >= 7) {
      const streakAlert = document.createElement('div');
      streakAlert.className = 'theme-card rounded-lg p-4 border-2';
      streakAlert.style.borderColor = 'var(--theme-accent-soft)';
      streakAlert.innerHTML = `
        <div class="text-2xl mb-2 theme-text">AMAZING!</div>
        <div class="text-lg font-bold theme-text mb-1">${streak}-Day Streak!</div>
        <div class="text-sm theme-text-secondary">You're on fire! Keep the streak alive!</div>
      `;
      content.appendChild(streakAlert);
    }

    // Continue button
    const continueBtn = new Button('Continue', {
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => this.modal?.close(),
    });
    content.appendChild(continueBtn.element);

    this.modal.setContent(content);
    this.modal.open();
  }

  /**
   * Close modal if open
   */
  public close(): void {
    if (this.modal) {
      this.modal.close();
      this.modal = null;
    }
  }
}
