/**
 * Main Menu Page - Menu selection screen
 * Shows game mode options and player stats
 */

import { BasePage } from './BasePage';
import { Button } from '@ui/components/Button';
import { Modal } from '@ui/components/Modal';
import { Router } from '@/router';
import { stateManager } from '@core/StateManager';
import { ROUTES, GameStatus } from '@core/constants';
import { appwriteClient } from '@network/AppwriteClient';
import { GroupManager } from '@network/GroupManager';
import { LeaderboardModal } from '@ui/modals/LeaderboardModal';
import { ShopModal } from '@ui/modals/ShopModal';
import { authService } from '@services/AuthService';
import { GroupLeaderboardModal } from '@ui/modals/GroupLeaderboardModal';
import type { Group } from '@/types/game';

export class MenuPage extends BasePage {
  private buttons: Button[] = [];
  private diamondCountEl: HTMLDivElement | null = null;
  private unsubscribeSpecialPoints: (() => void) | null = null;
  private shopModal: ShopModal | null = null;
  private groupManager = new GroupManager();

  public render(): void {
    const container = this.initPageLayout({
      align: 'top',
      maxWidthClass: 'max-w-2xl',
      paddingClass: 'px-2 sm:px-4 py-8 sm:py-12',
    });

    const bgDecor1 = document.createElement('div');
    bgDecor1.className = 'absolute top-6 right-4 w-48 sm:w-72 h-48 sm:h-72 bg-white/5 rounded-full blur-3xl z-0';
    const bgDecor2 = document.createElement('div');
    bgDecor2.className = 'absolute bottom-4 left-4 w-40 sm:w-64 h-40 sm:h-64 bg-black/5 rounded-full blur-3xl z-0';
    this.element.insertBefore(bgDecor1, container);
    this.element.insertBefore(bgDecor2, container);

    // Top section - greeting + title
    const topSection = document.createElement('div');
    topSection.className = 'text-center mb-6 sm:mb-8 animate-fade-in pt-2 sm:pt-4';

    const state = stateManager.getState();
    const greeting = document.createElement('p');
    greeting.className = 'theme-text-secondary text-xs font-semibold tracking-widest uppercase mb-2 sm:mb-4 letter-spacing-wide';
    greeting.textContent = `Welcome Back, ${state.player.name}!`;
    topSection.appendChild(greeting);

    const title = document.createElement('h1');
    title.className = 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black theme-text mb-2 sm:mb-3 tracking-tighter drop-shadow-lg';
    title.textContent = 'HEXTRIS';
    topSection.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'theme-text-secondary text-sm sm:text-base font-medium';
    subtitle.textContent = 'Sync with the flow. Shape the resonance.';
    topSection.appendChild(subtitle);

    container.appendChild(topSection);

    // Stats section - Compressed cards
    const statsSection = document.createElement('div');
    statsSection.className = 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 px-0 sm:px-2 mb-6 sm:mb-8';

    // High Score Card
    const scoreCard = document.createElement('div');
    scoreCard.className = 'theme-card rounded-lg p-3 sm:p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-sm';
    scoreCard.innerHTML = `
      <div class="text-3xl sm:text-4xl font-bold theme-text mb-1">${state.player.highScore.toLocaleString()}</div>
      <div class="text-xs font-semibold theme-text-secondary uppercase tracking-wide">High Score</div>
      <div class="text-xs theme-text-secondary mt-2">Keep pushing</div>
    `;
    statsSection.appendChild(scoreCard);

    // Diamonds Card
    const diamondsCard = document.createElement('div');
    diamondsCard.className = 'theme-card rounded-lg p-3 sm:p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-sm';
    const diamondsIcon = document.createElement('div');
    diamondsIcon.className = 'text-2xl sm:text-3xl mb-1';
    diamondsIcon.textContent = '💎';

    this.diamondCountEl = document.createElement('div');
    this.diamondCountEl.className = 'text-3xl sm:text-4xl font-bold theme-text mb-1';
    this.diamondCountEl.textContent = state.player.specialPoints.toString();

    const diamondsLabel = document.createElement('div');
    diamondsLabel.className = 'text-xs font-semibold theme-text-secondary uppercase tracking-wide';
    diamondsLabel.textContent = 'Diamonds';

    const diamondsHint = document.createElement('div');
    diamondsHint.className = 'text-xs theme-text-secondary mt-2';
    diamondsHint.textContent = 'Earn by playing';

    diamondsCard.appendChild(diamondsIcon);
    diamondsCard.appendChild(this.diamondCountEl);
    diamondsCard.appendChild(diamondsLabel);
    diamondsCard.appendChild(diamondsHint);
    statsSection.appendChild(diamondsCard);

    // Games Played Card
    const gamesCard = document.createElement('div');
    gamesCard.className = 'theme-card rounded-lg p-3 sm:p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-sm';
    gamesCard.innerHTML = `
      <div class="text-3xl sm:text-4xl font-bold theme-text mb-1">${state.player.gamesPlayed}</div>
      <div class="text-xs font-semibold theme-text-secondary uppercase tracking-wide">Games Played</div>
      <div class="text-xs theme-text-secondary mt-2">On the grind</div>
    `;
    statsSection.appendChild(gamesCard);

    container.appendChild(statsSection);

    // Game modes section
    const modesSection = document.createElement('div');
    modesSection.className = 'mb-6 sm:mb-8';

    const modesTitle = document.createElement('h2');
    modesTitle.className = 'text-lg sm:text-xl font-bold theme-text mb-3 sm:mb-4 text-center';
    modesTitle.textContent = 'Choose Your Flow';
    modesSection.appendChild(modesTitle);

    const modesGrid = document.createElement('div');
    modesGrid.className = 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 px-0 sm:px-2';

    const createModeCard = (button: Button, description: string): HTMLDivElement => {
      const card = document.createElement('div');
      card.className = 'theme-card-muted rounded-xl p-3 space-y-2';
      const desc = document.createElement('p');
      desc.className = 'text-xs theme-text-secondary';
      desc.textContent = description;
      card.appendChild(button.element);
      card.appendChild(desc);
      return card;
    };

    // Single Player
    const singlePlayerBtn = new Button('SINGLE PLAYER', {
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => Router.getInstance().navigate(ROUTES.DIFFICULTY),
    });
    this.buttons.push(singlePlayerBtn);
    modesGrid.appendChild(createModeCard(singlePlayerBtn, 'Pick a difficulty and climb the leaderboard.'));

    // Multiplayer
    const multiplayerBtn = new Button('CREW PLAYER', {
      variant: 'secondary',
      size: 'large',
      fullWidth: true,
      onClick: () => Router.getInstance().navigate(ROUTES.MULTIPLAYER),
    });
    this.buttons.push(multiplayerBtn);
    modesGrid.appendChild(createModeCard(multiplayerBtn, 'Join your crew and start synced matches.'));

    modesSection.appendChild(modesGrid);
    container.appendChild(modesSection);

    // Bottom action buttons
    const actionSection = document.createElement('div');
    actionSection.className = 'flex gap-2 sm:gap-3 justify-center flex-wrap px-0 sm:px-2 pb-2 sm:pb-4';

    const settingsBtn = new Button('Settings', {
      variant: 'outline',
      size: 'medium',
      onClick: () => Router.getInstance().navigate(ROUTES.SETTINGS),
    });
    this.buttons.push(settingsBtn);
    actionSection.appendChild(settingsBtn.element);

    const shopBtn = new Button('🛒 Shop', {
      variant: 'outline',
      size: 'medium',
      onClick: () => this.openShop(),
    });
    this.buttons.push(shopBtn);
    actionSection.appendChild(shopBtn.element);

    const leaderboardBtn = new Button('Leaderboard', {
      variant: 'outline',
      size: 'medium',
      onClick: () => this.showLeaderboard(),
    });
    this.buttons.push(leaderboardBtn);
    actionSection.appendChild(leaderboardBtn.element);

    const logoutBtn = new Button('Logout', {
      variant: 'ghost',
      size: 'small',
      onClick: () => this.logout(),
    });
    this.buttons.push(logoutBtn);
    actionSection.appendChild(logoutBtn.element);

    container.appendChild(actionSection);

    this.element.appendChild(container);
    this.mount();

    this.unsubscribeSpecialPoints = stateManager.subscribe('specialPointsChanged', (points) => {
      if (this.diamondCountEl) {
        this.diamondCountEl.textContent = points.toString();
      }
    });
  }

  /**
   * Show coming soon modal
   */
  /**
   * Logout user
   */
  private async logout(): Promise<void> {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      stateManager.setState('status', GameStatus.ENTRY);
      Router.getInstance().navigate(ROUTES.ENTRY);
    }
  }

  private openShop(): void {
    if (this.shopModal) {
      return;
    }

    stateManager.updateUI({ isShopOpen: true });
    this.shopModal = new ShopModal({
      mode: 'menu',
      onClose: () => {
        this.shopModal = null;
        stateManager.updateUI({ isShopOpen: false });
      },
    });
    this.shopModal.open();
  }

  public onUnmount(): void {
    if (this.unsubscribeSpecialPoints) {
      this.unsubscribeSpecialPoints();
      this.unsubscribeSpecialPoints = null;
    }

    if (this.shopModal) {
      this.shopModal.close();
      this.shopModal = null;
    }

    // Clean up buttons
    this.buttons.forEach(btn => btn.destroy());
    this.buttons = [];
  }

  /**
   * Show leaderboard modal
   */
  private async showLeaderboard(): Promise<void> {
    const state = stateManager.getState();

    const groupPromise = state.player.id
      ? this.groupManager.getUserGroups(state.player.id)
      : Promise.resolve([]);

    const [globalEntries, timerEntries, groups] = await Promise.all([
      appwriteClient.getGlobalLeaderboard(100),
      appwriteClient.getTimerAttackLeaderboard(100),
      groupPromise,
    ]);

    const modal = new LeaderboardModal({
      globalEntries,
      timerEntries,
      groups,
      currentPlayerName: state.player.name,
      onOpenGroup: (group) => {
        void this.openGroupLeaderboard(group);
      },
    });

    modal.open();
  }

  private async openGroupLeaderboard(group: Group): Promise<void> {
    const scores = await this.groupManager.getGroupLeaderboard(group.$id);

    const modal = new GroupLeaderboardModal({
      group,
      scores,
      currentUserId: stateManager.getState().player.id,
      onLeave: () => this.confirmLeaveGroup(group),
    });

    modal.open();
  }

  private confirmLeaveGroup(group: Group): void {
    const modal = new Modal({
      title: 'Leave Group',
      closeOnBackdrop: true,
      closeOnEscape: true,
    });

    const content = document.createElement('div');
    content.className = 'space-y-4';

    const text = document.createElement('p');
    text.className = 'text-sm theme-text-secondary';
    text.textContent = `Leave ${group.groupName}?`;
    content.appendChild(text);

    const leaveBtn = new Button('Leave', {
      variant: 'ghost',
      size: 'small',
      fullWidth: true,
      onClick: async () => {
        const state = stateManager.getState();
        if (!state.player.id) return;

        await this.groupManager.leaveGroup(state.player.id, group.$id);
        modal.close();
      },
    });
    this.buttons.push(leaveBtn);
    content.appendChild(leaveBtn.element);

    const cancelBtn = new Button('Cancel', {
      variant: 'outline',
      size: 'small',
      fullWidth: true,
      onClick: () => modal.close(),
    });
    this.buttons.push(cancelBtn);
    content.appendChild(cancelBtn.element);

    modal.setContent(content);
    modal.open();
  }

  public onMount(): void {
    // Add animations
    this.element.classList.add('animate-fade-in');
  }

}
