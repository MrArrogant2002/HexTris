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
import {
  multiplayerStrategies,
  type MultiplayerRoleId,
  type MultiplayerStrategyId,
} from '@config/multiplayerStrategies';
import type { Group } from '../types/game';

type View = 'list' | 'create' | 'join';

export class MultiplayerPage extends BasePage {
  private groupManager = new GroupManager();
  private currentView: View = 'list';
  private groups: Group[] = [];
  private contentContainer!: HTMLDivElement;
  private buttons: Button[] = [];

  public render(): void {
    const container = this.initPageLayout({
      align: 'top',
      maxWidthClass: 'max-w-4xl',
      paddingClass: 'px-2 sm:px-4 py-8 sm:py-12',
    });

    const header = this.createHeader('MULTIPLAYER GROUPS', 'Create or join groups to compare scores');
    container.appendChild(header);

    const tabRow = document.createElement('div');
    tabRow.className = 'grid grid-cols-3 gap-2';

    tabRow.appendChild(this.createTabButton('My Groups', 'list'));
    tabRow.appendChild(this.createTabButton('Create', 'create'));
    tabRow.appendChild(this.createTabButton('Join', 'join'));

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
    loading.textContent = 'Loading groups...';
    this.contentContainer.appendChild(loading);

    void this.loadGroups();
  }

  private async loadGroups(): Promise<void> {
    const state = stateManager.getState();
    if (!state.player.id) return;

    this.groups = await this.groupManager.getUserGroups(state.player.id);
    this.contentContainer.innerHTML = '';

    if (this.groups.length === 0) {
      this.showInlineMessage('No groups yet. Create or join one to get started.');
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

      const leaderboardBtn = new Button('View Leaderboard', {
        variant: 'outline',
        size: 'small',
        onClick: () => this.showGroupLeaderboard(group),
      });
      this.buttons.push(leaderboardBtn);
      actions.appendChild(leaderboardBtn.element);

      const playBtn = new Button('Play In Group', {
        variant: 'primary',
        size: 'small',
        onClick: () => this.playGroup(group),
      });
      this.buttons.push(playBtn);
      actions.appendChild(playBtn.element);

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
      label: 'Group Name',
      placeholder: 'Enter group name',
      required: true,
      maxLength: 50,
    });

    this.contentContainer.appendChild(nameInput.container);

    const createBtn = new Button('Create Group', {
      variant: 'primary',
      size: 'medium',
      fullWidth: true,
      onClick: async () => {
        if (!nameInput.validate()) return;
        const name = nameInput.getValue();

        try {
          const group = await this.groupManager.createGroup(state.player.id, name, state.player.name);
          this.showMessage('Group Created', `Room code: ${group.roomCode}`);
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
      label: 'Room Code',
      placeholder: 'Enter room code',
      required: true,
      maxLength: 6,
      onChange: (value) => {
        codeInput.setValue(value.toUpperCase());
      },
    });

    this.contentContainer.appendChild(codeInput.container);

    const joinBtn = new Button('Join Group', {
      variant: 'primary',
      size: 'medium',
      fullWidth: true,
      onClick: async () => {
        if (!codeInput.validate()) return;
        const code = codeInput.getValue().toUpperCase();

        try {
          const group = await this.groupManager.joinGroup(state.player.id, state.player.name, code);
          this.showMessage('Joined Group', `You joined ${group.groupName}`);
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

  
  private playGroup(group: Group): void {
    this.showStrategySelection(group);
  }

  private showStrategySelection(group: Group): void {
    const modal = new Modal({
      title: 'Multiplayer Strategy',
      closeOnBackdrop: true,
      closeOnEscape: true,
    });

    const content = document.createElement('div');
    content.className = 'space-y-4';

    const intro = document.createElement('p');
    intro.className = 'text-sm theme-text-secondary';
    intro.textContent = 'Choose a competitive plan before jumping into the lobby.';
    content.appendChild(intro);

    const strategyGrid = document.createElement('div');
    strategyGrid.className = 'grid grid-cols-1 gap-3';
    content.appendChild(strategyGrid);

    const roleSection = document.createElement('div');
    roleSection.className = 'space-y-2';

    const roleHeader = document.createElement('div');
    roleHeader.className = 'text-xs font-semibold uppercase tracking-[0.3em] theme-text-secondary';
    roleHeader.textContent = 'Select Role';
    roleSection.appendChild(roleHeader);

    const roleGrid = document.createElement('div');
    roleGrid.className = 'grid grid-cols-1 sm:grid-cols-3 gap-2';
    roleSection.appendChild(roleGrid);

    const summary = document.createElement('div');
    summary.className = 'text-xs theme-text-secondary';

    let selectedStrategyId = stateManager.getState().ui.multiplayerStrategy ?? 'ultimateCompetition';
    if (!multiplayerStrategies[selectedStrategyId]) {
      selectedStrategyId = 'ultimateCompetition';
    }
    let selectedRoleId = stateManager.getState().ui.multiplayerRole;

    const getRoleDefault = (strategyId: MultiplayerStrategyId): MultiplayerRoleId | undefined => {
      const strategy = multiplayerStrategies[strategyId];
      return strategy.defaultRoleId ?? strategy.roles?.[0]?.id;
    };

    const strategyButtons = new Map<MultiplayerStrategyId, HTMLButtonElement>();

    const getStrategyClass = (selected: boolean): string => [
      'theme-card',
      'rounded-xl',
      'p-4',
      'text-left',
      'border-2',
      'transition-all',
      'duration-200',
      'hover:-translate-y-0.5',
      selected ? 'border-black shadow-lg' : 'border-transparent',
    ].join(' ');

    const getRoleClass = (selected: boolean): string => [
      'theme-card-muted',
      'rounded-xl',
      'p-3',
      'text-left',
      'border-2',
      'transition-all',
      'duration-200',
      'hover:-translate-y-0.5',
      selected ? 'border-black shadow-md' : 'border-transparent',
    ].join(' ');

    const updateStrategySelection = (): void => {
      strategyButtons.forEach((button, id) => {
        button.className = getStrategyClass(id === selectedStrategyId);
      });
    };

    const updateSummary = (): void => {
      const strategy = multiplayerStrategies[selectedStrategyId];
      const role = strategy.roles?.find((option) => option.id === selectedRoleId);
      summary.textContent = role
        ? `Locked in: ${strategy.name} · ${role.name}`
        : `Locked in: ${strategy.name}`;
    };

    const renderRoles = (): void => {
      roleGrid.innerHTML = '';
      const strategy = multiplayerStrategies[selectedStrategyId];
      if (!strategy.roles?.length) {
        roleSection.style.display = 'none';
        selectedRoleId = undefined;
        updateSummary();
        return;
      }

      roleSection.style.display = 'block';
      if (!selectedRoleId) {
        selectedRoleId = getRoleDefault(selectedStrategyId);
      }

      strategy.roles.forEach((role) => {
        const roleCard = document.createElement('button');
        roleCard.type = 'button';
        roleCard.className = getRoleClass(role.id === selectedRoleId);

        const title = document.createElement('div');
        title.className = 'text-sm font-bold theme-text';
        title.textContent = role.name;

        const description = document.createElement('div');
        description.className = 'text-xs theme-text-secondary mt-1';
        description.textContent = role.description;

        roleCard.appendChild(title);
        roleCard.appendChild(description);

        roleCard.addEventListener('click', () => {
          selectedRoleId = role.id;
          Array.from(roleGrid.children).forEach((child) => {
            if (child instanceof HTMLButtonElement) {
              child.className = getRoleClass(child === roleCard);
            }
          });
          updateSummary();
        });

        roleGrid.appendChild(roleCard);
      });

      updateSummary();
    };

    Object.values(multiplayerStrategies).forEach((strategy) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = getStrategyClass(strategy.id === selectedStrategyId);

      const title = document.createElement('div');
      title.className = 'text-sm font-bold theme-text';
      title.textContent = strategy.name;

      const description = document.createElement('div');
      description.className = 'text-xs theme-text-secondary mt-1';
      description.textContent = strategy.description;

      const objective = document.createElement('div');
      objective.className = 'text-[11px] mt-2 font-semibold uppercase tracking-[0.2em] theme-text-secondary';
      objective.textContent = strategy.objective;

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(objective);
      card.addEventListener('click', () => {
        selectedStrategyId = strategy.id;
        selectedRoleId = getRoleDefault(strategy.id);
        updateStrategySelection();
        renderRoles();
      });

      strategyButtons.set(strategy.id, card);
      strategyGrid.appendChild(card);
    });

    updateStrategySelection();
    renderRoles();
    content.appendChild(roleSection);
    content.appendChild(summary);

    const actionRow = document.createElement('div');
    actionRow.className = 'flex flex-col sm:flex-row gap-2 pt-2';

    const startButton = new Button('Continue to Difficulty', {
      variant: 'primary',
      size: 'small',
      fullWidth: true,
      onClick: () => {
        const multiplayerMode = selectedStrategyId === 'rolePlay' ? 'sync' : 'race';
        const currentGameMode = multiplayerMode === 'sync' ? 'multiplayerSync' : 'multiplayerRace';
        stateManager.updateUI({
          currentGroupId: group.$id,
          currentGameMode,
          multiplayerMode,
          multiplayerStrategy: selectedStrategyId,
          multiplayerRole: selectedRoleId,
        });
        modal.close();
        Router.getInstance().navigate(ROUTES.DIFFICULTY);
      },
    });
    this.buttons.push(startButton);
    actionRow.appendChild(startButton.element);

    const cancelButton = new Button('Cancel', {
      variant: 'outline',
      size: 'small',
      fullWidth: true,
      onClick: () => modal.close(),
    });
    this.buttons.push(cancelButton);
    actionRow.appendChild(cancelButton.element);

    content.appendChild(actionRow);

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
    this.buttons.forEach((btn) => btn.destroy());
    this.buttons = [];
  }
}
