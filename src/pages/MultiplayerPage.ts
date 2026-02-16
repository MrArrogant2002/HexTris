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
import { ROUTES, CREW_BATTLE_MIN_PLAYERS, CREW_BATTLE_MAX_PLAYERS } from '@core/constants';
import { GroupManager } from '@network/GroupManager';
import { syncSocket, type MatchInvitationPayload } from '@network/SyncSocket';
import { DifficultyLevel, normalizePlayableDifficulty } from '@config/difficulty';
import type { Group } from '../types/game';

type View = 'list' | 'create' | 'join';

export class MultiplayerPage extends BasePage {
  private groupManager = new GroupManager();
  private currentView: View = 'list';
  private groups: Group[] = [];
  private contentContainer!: HTMLDivElement;
  private buttons: Button[] = [];
  private invitationHandler?: (payload: MatchInvitationPayload) => void;

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
    this.subscribeToCrewInvitations();
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

      const crewBattleBtn = new Button('Start Crew Battle', {
        variant: 'primary',
        size: 'small',
        onClick: () => this.playCrewBattle(group),
      });
      this.buttons.push(crewBattleBtn);
      actions.appendChild(crewBattleBtn.element);

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

    const joinBtn = new Button('Join Crew', {
      variant: 'primary',
      size: 'medium',
      fullWidth: true,
      onClick: async () => {
        if (!codeInput.validate()) return;
        const code = codeInput.getValue().toUpperCase();

        try {
          const group = await this.groupManager.joinGroup(state.player.id, state.player.name, code);
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

  private playCrewBattle(group: Group): void {
    const state = stateManager.getState();
    if (!state.player.id) return;
    if (group.memberCount < CREW_BATTLE_MIN_PLAYERS || group.memberCount > CREW_BATTLE_MAX_PLAYERS) {
      this.showMessage(
        'Crew Battle Unavailable',
        `Crew Battle requires ${CREW_BATTLE_MIN_PLAYERS} to ${CREW_BATTLE_MAX_PLAYERS} players in the group.`
      );
      return;
    }

    if (group.createdBy !== state.player.id) {
      this.showMessage('Leader Only', 'Only crew leaders can start synced matches.');
      return;
    }

    this.showDifficultySelector(group);
  }

  private showDifficultySelector(group: Group): void {
    const modal = new Modal({
      title: 'Start Synced Match',
      closeOnBackdrop: true,
      closeOnEscape: true,
    });
    const content = document.createElement('div');
    content.className = 'space-y-2';

    const options: Array<{ label: string; value: DifficultyLevel }> = [
      { label: 'Easy', value: DifficultyLevel.EASY },
      { label: 'Medium', value: DifficultyLevel.STANDARD },
      { label: 'Hard', value: DifficultyLevel.FIERCE },
    ];

    options.forEach((option) => {
      const btn = new Button(option.label, {
        variant: 'primary',
        size: 'medium',
        fullWidth: true,
        onClick: async () => {
          modal.close();
          await this.broadcastMatchInvitation(group, option.value);
        },
      });
      this.buttons.push(btn);
      content.appendChild(btn.element);
    });

    modal.setContent(content);
    modal.open();
  }

  private async broadcastMatchInvitation(group: Group, selectedDifficulty: DifficultyLevel): Promise<void> {
    const state = stateManager.getState();
    if (!state.player.id) return;

    const difficulty = normalizePlayableDifficulty(selectedDifficulty);
    const payload: MatchInvitationPayload = {
      groupId: group.$id,
      battleId: `${group.$id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      leaderId: state.player.id,
      leaderName: state.player.name,
      difficulty,
      memberCount: group.memberCount,
    };
    const result = await syncSocket.sendMatchInvitation(payload);
    if (!result.ok) {
      this.showMessage('Invite Failed', result.error || 'Unable to broadcast invitation.');
      return;
    }

    stateManager.updateGame({ difficulty });
    stateManager.updateUI({
      currentGroupId: group.$id,
      currentGameMode: 'multiplayerCrewBattle',
      multiplayerMode: 'crewBattle',
    });
    Router.getInstance().navigate(ROUTES.GAME, {
      difficulty,
      multiplayerMode: 'crewBattle',
      players: String(group.memberCount),
      battleId: payload.battleId,
    });
  }

  private subscribeToCrewInvitations(): void {
    const state = stateManager.getState();
    if (!state.player.id) return;

    this.groups.forEach((group) => {
      void syncSocket.joinCrew(group.$id, state.player.id!, state.player.name);
    });

    if (this.invitationHandler) {
      syncSocket.off('crew:matchInvitation', this.invitationHandler);
    }

    this.invitationHandler = (payload: MatchInvitationPayload) => {
      if (payload.leaderId === state.player.id) return;
      const difficulty = normalizePlayableDifficulty(payload.difficulty);
      this.showInvitationModal(payload, difficulty);
    };
    syncSocket.on('crew:matchInvitation', this.invitationHandler);
  }

  private showInvitationModal(payload: MatchInvitationPayload, difficulty: DifficultyLevel): void {
    const modal = new Modal({
      title: 'Crew Match Invite',
      closeOnBackdrop: false,
      closeOnEscape: false,
    });

    const content = document.createElement('div');
    content.className = 'space-y-3';
    const text = document.createElement('p');
    text.className = 'text-sm theme-text-secondary';
    text.textContent = `${payload.leaderName} started a ${difficulty.toUpperCase()} synced match. Join now?`;
    content.appendChild(text);

    const acceptBtn = new Button('Accept', {
      variant: 'primary',
      size: 'small',
      fullWidth: true,
      onClick: async () => {
        const state = stateManager.getState();
        if (!state.player.id) return;
        await syncSocket.respondToInvitation({
          groupId: payload.groupId,
          battleId: payload.battleId,
          playerId: state.player.id,
          accepted: true,
        });
        modal.close();
        stateManager.updateGame({ difficulty });
        stateManager.updateUI({
          currentGroupId: payload.groupId,
          currentGameMode: 'multiplayerCrewBattle',
          multiplayerMode: 'crewBattle',
        });
        Router.getInstance().navigate(ROUTES.GAME, {
          difficulty,
          multiplayerMode: 'crewBattle',
          players: String(payload.memberCount),
          battleId: payload.battleId,
        });
      },
    });
    this.buttons.push(acceptBtn);
    content.appendChild(acceptBtn.element);

    const declineBtn = new Button('Decline', {
      variant: 'ghost',
      size: 'small',
      fullWidth: true,
      onClick: async () => {
        const state = stateManager.getState();
        if (state.player.id) {
          await syncSocket.respondToInvitation({
            groupId: payload.groupId,
            battleId: payload.battleId,
            playerId: state.player.id,
            accepted: false,
          });
        }
        modal.close();
      },
    });
    this.buttons.push(declineBtn);
    content.appendChild(declineBtn.element);

    modal.setContent(content);
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

  public onUnmount(): void {
    if (this.invitationHandler) {
      syncSocket.off('crew:matchInvitation', this.invitationHandler);
      this.invitationHandler = undefined;
    }
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons = [];
  }
}
