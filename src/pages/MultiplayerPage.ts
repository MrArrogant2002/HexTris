/**
 * MultiplayerPage - Group management (create/join/list)
 */

import { BasePage } from './BasePage';
import { Button } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import { Modal } from '@ui/components/Modal';
import { GroupLeaderboardModal } from '@ui/modals/GroupLeaderboardModal';
import { Router } from '@/router';
import { stateManager } from '@core/StateManager';
import { ROUTES } from '@core/constants';
import { GroupManager } from '@network/GroupManager';
import { syncBattleClient, type SyncInvitationPayload, type SyncMatchStartedPayload } from '@network/SyncBattleClient';
import { DifficultyLevel } from '@config/difficulty';
import type { Group } from '../types/game';

type View = 'list' | 'create' | 'join';

export class MultiplayerPage extends BasePage {
  private static readonly REMATCH_VOTE_THRESHOLD = 0.7;
  private groupManager = new GroupManager();
  private currentView: View = 'list';
  private groups: Group[] = [];
  private contentContainer!: HTMLDivElement;
  private buttons: Button[] = [];
  private invitationListener: ((event: Event) => void) | null = null;
  private matchStartedListener: ((event: Event) => void) | null = null;

  public render(): void {
    const container = this.initPageLayout({
      align: 'top',
      maxWidthClass: 'max-w-4xl',
      paddingClass: 'px-2 sm:px-4 py-8 sm:py-12',
    });

    const header = this.createHeader('SYNC LINK HUB', 'Create or join crews to share the flow');
    container.appendChild(header);

    const tabRow = document.createElement('div');
    tabRow.className = 'grid grid-cols-3 gap-2';

    tabRow.appendChild(this.createTabButton('My Crews', 'list'));
    tabRow.appendChild(this.createTabButton('Create Crew', 'create'));
    tabRow.appendChild(this.createTabButton('Join Crew', 'join'));

    container.appendChild(tabRow);

    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'space-y-4';
    container.appendChild(this.contentContainer);

    const backButton = this.createBackButton('<- Back', () => {
      Router.getInstance().navigate(ROUTES.MENU);
    });
    backButton.style.marginTop = '1rem';
    container.appendChild(backButton);

    this.renderView();
    this.mount();
  }

  private createTabButton(label: string, view: View): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = this.getTabClass(this.currentView === view);

    button.addEventListener('click', () => {
      this.currentView = view;
      this.renderView();
    });

    return button;
  }

  private getTabClass(isActive: boolean): string {
    const baseClass = 'theme-tab text-sm font-semibold';
    return isActive ? `${baseClass} theme-tab-active` : baseClass;
  }

  private renderView(): void {
    this.contentContainer.innerHTML = '';
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons = [];

    if (this.currentView === 'list') {
      this.renderGroupList();
    } else if (this.currentView === 'create') {
      this.renderCreateGroup();
    } else {
      this.renderJoinGroup();
    }
  }

  private renderGroupList(): void {
    const state = stateManager.getState();
    if (!state.player.id) {
      this.showInlineMessage('Please log in to manage groups.');
      return;
    }

    const loading = document.createElement('div');
    loading.className = 'text-sm theme-inline-message';
      loading.textContent = 'Loading crews...';
    this.contentContainer.appendChild(loading);

    void this.loadGroups();
  }

  private async loadGroups(): Promise<void> {
    const state = stateManager.getState();
    if (!state.player.id) return;

    this.groups = await this.groupManager.getUserGroups(state.player.id);
    syncBattleClient.joinBattles(this.groups.map((group) => group.$id), state.player.id, state.player.name);
    this.contentContainer.innerHTML = '';

    if (this.groups.length === 0) {
      this.showInlineMessage('No crews yet. Create or join one to get started.');
      return;
    }

    this.groups.forEach((group) => {
      const card = document.createElement('div');
      card.className = 'theme-card rounded-2xl p-4 space-y-3';

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';

      const title = document.createElement('div');
      title.className = 'text-lg font-bold theme-text';
      title.textContent = group.groupName;
      header.appendChild(title);

      const code = document.createElement('div');
      code.className = 'text-xs font-semibold theme-text-secondary tracking-[0.6em] uppercase';
      code.textContent = group.roomCode;
      header.appendChild(code);

      card.appendChild(header);

      const meta = document.createElement('div');
      meta.className = 'text-xs theme-text-secondary';
      meta.textContent = `Members: ${group.memberCount}`;
      card.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'flex flex-wrap gap-2';

      const leaderboardBtn = new Button('View Sync Board', {
        variant: 'outline',
        size: 'small',
        onClick: () => this.showGroupLeaderboard(group),
      });
      this.buttons.push(leaderboardBtn);
      actions.appendChild(leaderboardBtn.element);

      const spectatorBtn = new Button('Spectate', {
        variant: 'outline',
        size: 'small',
        onClick: () => this.spectateGroup(group),
      });
      this.buttons.push(spectatorBtn);
      actions.appendChild(spectatorBtn.element);

      const playBtn = new Button('Start Sync', {
        variant: 'primary',
        size: 'small',
        onClick: () => this.playGroup(group),
      });
      this.buttons.push(playBtn);
      actions.appendChild(playBtn.element);

      const rematchBtn = new Button('Vote Rematch', {
        variant: 'secondary',
        size: 'small',
        onClick: () => this.castRematchVote(group),
      });
      this.buttons.push(rematchBtn);
      actions.appendChild(rematchBtn.element);

      const leaveBtn = new Button('Leave', {
        variant: 'ghost',
        size: 'small',
        onClick: () => this.confirmLeaveGroup(group),
      });
      this.buttons.push(leaveBtn);
      actions.appendChild(leaveBtn.element);

      card.appendChild(actions);
      this.contentContainer.appendChild(card);
    });
  }

  private renderCreateGroup(): void {
    const state = stateManager.getState();
    if (!state.player.id) {
      this.showInlineMessage('Please log in to create groups.');
      return;
    }

    const nameInput = new Input({
      label: 'Crew Name',
      placeholder: 'Enter crew name',
      required: true,
      maxLength: 50,
    });

    this.contentContainer.appendChild(nameInput.container);

    const createBtn = new Button('Create Crew', {
      variant: 'primary',
      size: 'medium',
      fullWidth: true,
      onClick: async () => {
        if (!nameInput.validate()) return;
        const name = nameInput.getValue();

        try {
          const group = await this.groupManager.createGroup(state.player.id, name, state.player.name);
            this.showMessage('Crew Created', `Room code: ${group.roomCode}`);
          this.currentView = 'list';
          this.renderView();
        } catch (error: any) {
          this.showMessage('Error', error.message || 'Failed to create group');
        }
      },
    });

    this.buttons.push(createBtn);
    this.contentContainer.appendChild(createBtn.element);
  }

  private renderJoinGroup(): void {
    const state = stateManager.getState();
    if (!state.player.id) {
      this.showInlineMessage('Please log in to join groups.');
      return;
    }

    const codeInput = new Input({
      label: 'Crew Code',
      placeholder: 'Enter crew code',
      required: true,
      maxLength: 6,
      onChange: (value) => {
        codeInput.setValue(value.toUpperCase());
      },
    });

    this.contentContainer.appendChild(codeInput.container);

    const guardrailWrap = document.createElement('label');
    guardrailWrap.className = 'flex items-center gap-2 text-xs theme-text-secondary mt-2';
    const guardrailCheckbox = document.createElement('input');
    guardrailCheckbox.type = 'checkbox';
    guardrailCheckbox.checked = true;
    guardrailWrap.appendChild(guardrailCheckbox);
    guardrailWrap.append('Enable fair matchmaking guardrails');
    this.contentContainer.appendChild(guardrailWrap);

    const joinBtn = new Button('Join Crew', {
      variant: 'primary',
      size: 'medium',
      fullWidth: true,
      onClick: async () => {
        if (!codeInput.validate()) return;
        const code = codeInput.getValue().toUpperCase();

        try {
          const group = await this.groupManager.joinGroupWithOptions(state.player.id, state.player.name, code, {
            enforceRankBand: guardrailCheckbox.checked,
            playerHighScore: state.player.highScore,
          });
            this.showMessage('Joined Crew', `You joined ${group.groupName}`);
          this.currentView = 'list';
          this.renderView();
        } catch (error: any) {
          this.showMessage('Error', error.message || 'Failed to join group');
        }
      },
    });

    this.buttons.push(joinBtn);
    this.contentContainer.appendChild(joinBtn.element);
  }

  private async showGroupLeaderboard(group: Group): Promise<void> {
    const scores = await this.groupManager.getGroupLeaderboard(group.$id);

    const modal = new GroupLeaderboardModal({
      group,
      scores,
      currentUserId: stateManager.getState().player.id,
      onLeave: () => this.confirmLeaveGroup(group),
    });

    modal.open();
  }

  private async spectateGroup(group: Group): Promise<void> {
    const scores = await this.groupManager.getGroupLeaderboard(group.$id);
    const modal = new GroupLeaderboardModal({
      group,
      scores,
      currentUserId: stateManager.getState().player.id,
    });
    modal.open();
  }

  private castRematchVote(group: Group): void {
    const state = stateManager.getState();
    if (!state.player.id) {
      this.showMessage('Sign in required', 'Please log in to vote for rematch.');
      return;
    }

    const key = `hextris:rematchVotes:${group.$id}`;
    let voteState: { voters: string[] } = { voters: [] };
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.voters)) {
          voteState = { voters: parsed.voters.filter((entry: unknown) => typeof entry === 'string') };
        }
      }
    } catch (_error) {
      voteState = { voters: [] };
    }

    if (!voteState.voters.includes(state.player.id)) {
      voteState.voters.push(state.player.id);
    }
    localStorage.setItem(key, JSON.stringify(voteState));

    const requiredVotes = Math.max(1, Math.ceil(group.memberCount * MultiplayerPage.REMATCH_VOTE_THRESHOLD));
    const currentVotes = voteState.voters.length;
    if (currentVotes >= requiredVotes) {
      this.showMessage('Rematch Ready', `Vote target reached (${currentVotes}/${requiredVotes}). Restarting room flow.`);
      stateManager.updateUI({ currentGroupId: group.$id, currentGameMode: 'multiplayerRace', multiplayerMode: 'race' });
      Router.getInstance().navigate(ROUTES.DIFFICULTY);
      localStorage.removeItem(key);
      return;
    }

    this.showMessage('Vote Counted', `Rematch votes: ${currentVotes}/${requiredVotes}.`);
  }


  private async playGroup(group: Group): Promise<void> {
    const state = stateManager.getState();
    if (!state.player.id) {
      this.showMessage('Sign in required', 'Please log in to start a sync match.');
      return;
    }

    const difficulty = await this.promptSyncDifficulty();
    if (!difficulty) return;

    syncBattleClient.startSyncInvitation(group.$id, state.player.id, state.player.name, difficulty);
    this.showMessage('Invitation Sent', `Crew invitation sent with ${difficulty.toUpperCase()} difficulty.`);
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
        this.renderView();
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

  private showInlineMessage(message: string): void {
    const text = document.createElement('div');
    text.className = 'text-sm theme-inline-message';
    text.textContent = message;
    this.contentContainer.appendChild(text);
  }

  private showMessage(title: string, message: string): void {
    const modal = new Modal({
      title,
      closeOnBackdrop: true,
      closeOnEscape: true,
    });

    const content = document.createElement('div');
    content.className = 'space-y-4';

    const text = document.createElement('p');
    text.className = 'text-sm theme-text-secondary';
    text.textContent = message;
    content.appendChild(text);

    const closeBtn = new Button('OK', {
      variant: 'primary',
      size: 'small',
      fullWidth: true,
      onClick: () => modal.close(),
    });
    this.buttons.push(closeBtn);
    content.appendChild(closeBtn.element);

    modal.setContent(content);
    modal.open();
  }

  private promptSyncDifficulty(): Promise<'easy' | 'medium' | 'hard' | null> {
    return new Promise((resolve) => {
      const modal = new Modal({
        title: 'Select Sync Difficulty',
        closeOnBackdrop: true,
        closeOnEscape: true,
      });

      const content = document.createElement('div');
      content.className = 'space-y-3';
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
      difficulties.forEach((difficulty) => {
        const button = new Button(difficulty.toUpperCase(), {
          variant: 'primary',
          size: 'medium',
          fullWidth: true,
          onClick: () => {
            modal.close();
            resolve(difficulty);
          },
        });
        this.buttons.push(button);
        content.appendChild(button.element);
      });

      const cancelBtn = new Button('Cancel', {
        variant: 'ghost',
        size: 'small',
        fullWidth: true,
        onClick: () => {
          modal.close();
          resolve(null);
        },
      });
      this.buttons.push(cancelBtn);
      content.appendChild(cancelBtn.element);

      modal.setContent(content);
      modal.open();
    });
  }

  private handleSyncInvitation(payload: SyncInvitationPayload): void {
    const state = stateManager.getState();
    if (!state.player.id) return;
    if (payload.leaderId === state.player.id) return;
    if (!this.groups.some((group) => group.$id === payload.battleId)) return;

    const modal = new Modal({
      title: 'Sync Match Invitation',
      closeOnBackdrop: false,
      closeOnEscape: false,
    });

    const content = document.createElement('div');
    content.className = 'space-y-4';

    const text = document.createElement('p');
    text.className = 'text-sm theme-text-secondary';
    text.textContent = `${payload.leaderName || 'Crew leader'} started a ${payload.difficulty.toUpperCase()} sync match.`;
    content.appendChild(text);

    const acceptBtn = new Button('Accept', {
      variant: 'primary',
      size: 'small',
      fullWidth: true,
      onClick: () => {
        syncBattleClient.respondToInvitation(payload.battleId, payload.invitationId, state.player.id, true);
        modal.close();
      },
    });
    this.buttons.push(acceptBtn);
    content.appendChild(acceptBtn.element);

    const declineBtn = new Button('Decline', {
      variant: 'ghost',
      size: 'small',
      fullWidth: true,
      onClick: () => {
        syncBattleClient.respondToInvitation(payload.battleId, payload.invitationId, state.player.id, false);
        modal.close();
      },
    });
    this.buttons.push(declineBtn);
    content.appendChild(declineBtn.element);

    modal.setContent(content);
    modal.open();
  }

  private handleMatchStarted(payload: SyncMatchStartedPayload): void {
    if (!this.groups.some((group) => group.$id === payload.battleId)) return;
    const mappedDifficulty = this.mapSyncDifficulty(payload.difficulty);
    stateManager.updateUI({
      currentGroupId: payload.battleId,
      currentGameMode: 'multiplayerRace',
      multiplayerMode: 'sync',
    });
    stateManager.updateGame({ difficulty: mappedDifficulty });
    Router.getInstance().navigate(ROUTES.GAME, { difficulty: mappedDifficulty });
  }

  private mapSyncDifficulty(difficulty: 'easy' | 'medium' | 'hard'): DifficultyLevel {
    if (difficulty === 'easy') return DifficultyLevel.EASY;
    if (difficulty === 'hard') return DifficultyLevel.FIERCE;
    return DifficultyLevel.STANDARD;
  }

  public onMount(): void {
    this.invitationListener = (event: Event) => {
      const customEvent = event as CustomEvent<SyncInvitationPayload>;
      this.handleSyncInvitation(customEvent.detail);
    };
    this.matchStartedListener = (event: Event) => {
      const customEvent = event as CustomEvent<SyncMatchStartedPayload>;
      this.handleMatchStarted(customEvent.detail);
    };
    window.addEventListener('syncInvitationReceived', this.invitationListener);
    window.addEventListener('syncMatchStarted', this.matchStartedListener);
  }

  public onUnmount(): void {
    if (this.invitationListener) {
      window.removeEventListener('syncInvitationReceived', this.invitationListener);
      this.invitationListener = null;
    }
    if (this.matchStartedListener) {
      window.removeEventListener('syncMatchStarted', this.matchStartedListener);
      this.matchStartedListener = null;
    }
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons = [];
  }
}
