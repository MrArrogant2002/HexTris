/**
 * LeaderboardModal - Displays global and timer attack leaderboards
 */

import { Modal } from '@ui/components/Modal';
import type { LeaderboardEntry } from '@network/AppwriteClient';
import type { Group } from '@/types/game';

export interface LeaderboardModalOptions {
  globalEntries: LeaderboardEntry[];
  timerEntries?: LeaderboardEntry[];
  groups?: Group[];
  currentPlayerName?: string;
  refreshIntervalMs?: number;
  onRefresh?: () => Promise<Pick<LeaderboardModalOptions, 'globalEntries' | 'timerEntries' | 'groups'>>;
  onOpenGroup?: (group: Group) => void;
}

type LeaderboardTab = 'global' | 'timer' | 'groups';
type FilterLimit = 'all' | 10 | 50 | 100;

export class LeaderboardModal {
  private modal: Modal;
  private options: LeaderboardModalOptions;
  private activeTab: LeaderboardTab = 'global';
  private searchTerm = '';
  private filterLimit: FilterLimit = 'all';
  private pageSize = 20;
  private currentPage = 1;
  private refreshIntervalId: number | null = null;
  private isRefreshing = false;

  constructor(options: LeaderboardModalOptions) {
    this.options = options;
    this.modal = new Modal({
      title: 'Leaderboard',
      closeOnBackdrop: true,
      closeOnEscape: true,
      maxWidth: 'lg',
      onClose: () => this.stopLiveRefresh(),
    });
  }

  public open(): void {
    this.modal.setContent(this.renderContent());
    this.modal.open();
    this.startLiveRefresh();
  }

  private renderContent(): HTMLElement {
    const content = document.createElement('div');
    content.className = 'space-y-4 theme-text';

    content.appendChild(this.createTabs());
    content.appendChild(this.createControls());

    const listContainer = document.createElement('div');
    listContainer.className = 'leaderboard-list max-h-96 overflow-y-auto rounded-2xl theme-card';
    listContainer.appendChild(this.renderList());
    content.appendChild(listContainer);

    const pagination = this.renderPagination();
    if (pagination) {
      content.appendChild(pagination);
    }

    return content;
  }

  private createTabs(): HTMLElement {
    const tabRow = document.createElement('div');
    tabRow.className = 'leaderboard-tabs flex gap-2';

    tabRow.appendChild(this.createTabButton('Global', 'global'));
    tabRow.appendChild(this.createTabButton('Timer Attack', 'timer'));
    tabRow.appendChild(this.createTabButton('My Groups', 'groups'));

    return tabRow;
  }

  private createTabButton(label: string, tab: LeaderboardTab): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.className = this.getTabClass(tab === this.activeTab);

    btn.addEventListener('click', () => {
      if (this.activeTab === tab) return;
      this.activeTab = tab;
      this.currentPage = 1;
      this.updateContent(true);
    });

    return btn;
  }

  private createControls(): HTMLElement {
    const controls = document.createElement('div');
    controls.className = 'leaderboard-controls flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between';

    const searchWrap = document.createElement('div');
    searchWrap.className = 'flex items-center gap-2';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.value = this.searchTerm;
    searchInput.placeholder = this.activeTab === 'groups' ? 'Search groups' : 'Search players';
    searchInput.className = 'theme-input w-full sm:w-56 text-sm';
    searchInput.addEventListener('input', () => {
      this.searchTerm = searchInput.value.trim();
      this.currentPage = 1;
      this.updateListAndPagination();
    });

    searchWrap.appendChild(searchInput);
    controls.appendChild(searchWrap);

    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'flex items-center gap-2 justify-between sm:justify-end';

    if (this.activeTab !== 'groups') {
      const filterSelect = document.createElement('select');
      filterSelect.className = 'theme-input text-sm sm:w-auto';
      filterSelect.innerHTML = `
        <option value="all">All</option>
        <option value="10">Top 10</option>
        <option value="50">Top 50</option>
        <option value="100">Top 100</option>
      `;
      filterSelect.value = String(this.filterLimit);
      filterSelect.addEventListener('change', () => {
        const value = filterSelect.value;
        this.filterLimit = value === 'all' ? 'all' : Number(value) as FilterLimit;
        this.currentPage = 1;
        this.updateListAndPagination();
      });
      optionsWrap.appendChild(filterSelect);
    }

    const pageSizeSelect = document.createElement('select');
    pageSizeSelect.className = 'theme-input text-sm sm:w-auto';
    pageSizeSelect.innerHTML = `
      <option value="10">10 / page</option>
      <option value="20">20 / page</option>
      <option value="50">50 / page</option>
    `;
    pageSizeSelect.value = String(this.pageSize);
    pageSizeSelect.addEventListener('change', () => {
      this.pageSize = Number(pageSizeSelect.value);
      this.currentPage = 1;
      this.updateListAndPagination();
    });
    optionsWrap.appendChild(pageSizeSelect);

    controls.appendChild(optionsWrap);

    return controls;
  }

  private updateContent(full: boolean): void {
    const body = this.getBody();
    if (!body) return;

    if (full) {
      const tabs = body.querySelector('.leaderboard-tabs');
      if (tabs) {
        tabs.replaceWith(this.createTabs());
      }

      const controls = body.querySelector('.leaderboard-controls');
      if (controls) {
        controls.replaceWith(this.createControls());
      }
    }

    this.updateListAndPagination(body);
  }

  private updateListAndPagination(body?: HTMLElement): void {
    const target = body || this.getBody();
    if (!target) return;

    const listContainer = target.querySelector('.leaderboard-list');
    if (listContainer) {
      listContainer.innerHTML = '';
      listContainer.appendChild(this.renderList());
    }

    const existingPagination = target.querySelector('.leaderboard-pagination');
    const nextPagination = this.renderPagination();
    if (existingPagination) {
      if (nextPagination) {
        existingPagination.replaceWith(nextPagination);
      } else {
        existingPagination.remove();
      }
    } else if (nextPagination) {
      target.appendChild(nextPagination);
    }
  }

  private renderList(): HTMLElement {
    if (this.activeTab === 'groups') {
      return this.renderGroupList();
    }

    const entries = this.getPagedEntries();
    const totalEntries = this.getFilteredEntries().length;

    const list = document.createElement('div');
    list.className = 'divide-y theme-border rounded-2xl overflow-hidden';

    if (totalEntries === 0) {
      const empty = document.createElement('div');
      empty.className = 'p-6 text-center text-sm theme-text-secondary';
      empty.textContent = this.searchTerm ? 'No results found.' : 'No scores yet. Be the first to play.';
      list.appendChild(empty);
      return list;
    }

    entries.forEach((entry, index) => {
      const row = document.createElement('div');
      const isCurrent = this.options.currentPlayerName
        ? entry.name === this.options.currentPlayerName
        : false;

      row.className = `flex items-center justify-between p-3 ${isCurrent ? 'theme-card' : 'theme-card-muted'}`;

      const left = document.createElement('div');
      left.className = 'flex items-center gap-3';

      const rank = document.createElement('div');
      rank.className = 'text-xs font-semibold theme-text-secondary w-8 text-center';
      const fallbackRank = (this.currentPage - 1) * this.pageSize + index + 1;
      rank.textContent = String(entry.rank ?? fallbackRank);
      left.appendChild(rank);

      const name = document.createElement('div');
      name.className = 'text-sm font-semibold theme-text';
      name.textContent = entry.name;
      left.appendChild(name);

      const score = document.createElement('div');
      score.className = 'text-sm font-bold theme-text';
      score.textContent = entry.score.toLocaleString();

      row.appendChild(left);
      row.appendChild(score);
      list.appendChild(row);
    });

    return list;
  }

  private renderGroupList(): HTMLElement {
    const groups = this.getPagedGroups();
    const totalGroups = this.getFilteredGroups().length;

    const list = document.createElement('div');
    list.className = 'divide-y theme-border rounded-2xl overflow-hidden';

    if (totalGroups === 0) {
      const empty = document.createElement('div');
      empty.className = 'p-6 text-center text-sm theme-text-secondary';
      empty.textContent = this.searchTerm ? 'No groups found.' : 'No groups yet. Join one to get started.';
      list.appendChild(empty);
      return list;
    }

    groups.forEach((group) => {
      const row = document.createElement('div');
      row.className = 'flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 theme-card gap-2';

      const info = document.createElement('div');
      info.className = 'space-y-1';

      const name = document.createElement('div');
      name.className = 'text-sm font-semibold theme-text';
      name.textContent = group.groupName;

      const meta = document.createElement('div');
      meta.className = 'text-xs theme-text-secondary';
      meta.textContent = `${group.roomCode} • ${group.memberCount} members`;

      info.appendChild(name);
      info.appendChild(meta);

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.className = 'px-3 py-2 text-xs font-semibold rounded-lg theme-btn theme-btn-primary';
      viewBtn.textContent = 'View Leaderboard';
      viewBtn.addEventListener('click', () => {
        this.modal.close();
        this.options.onOpenGroup?.(group);
      });

      row.appendChild(info);
      row.appendChild(viewBtn);
      list.appendChild(row);
    });

    return list;
  }

  private renderPagination(): HTMLElement | null {
    const totalPages = this.getTotalPages();
    if (totalPages <= 1) {
      return null;
    }

    const pagination = document.createElement('div');
    pagination.className = 'leaderboard-pagination flex items-center justify-between text-sm theme-text-secondary';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = 'Previous';
    prevBtn.className = 'px-3 py-1 rounded-lg border theme-border disabled:opacity-50 theme-text';
    prevBtn.disabled = this.currentPage <= 1;
    prevBtn.addEventListener('click', () => {
      if (this.currentPage <= 1) return;
      this.currentPage -= 1;
      this.updateListAndPagination();
    });

    const label = document.createElement('div');
    label.textContent = `Page ${this.currentPage} of ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = 'Next';
    nextBtn.className = 'px-3 py-1 rounded-lg border theme-border disabled:opacity-50 theme-text';
    nextBtn.disabled = this.currentPage >= totalPages;
    nextBtn.addEventListener('click', () => {
      if (this.currentPage >= totalPages) return;
      this.currentPage += 1;
      this.updateListAndPagination();
    });

    pagination.appendChild(prevBtn);
    pagination.appendChild(label);
    pagination.appendChild(nextBtn);

    return pagination;
  }

  private getFilteredEntries(): LeaderboardEntry[] {
    const entries = this.activeTab === 'global'
      ? this.options.globalEntries
      : this.options.timerEntries || [];

    let filtered = entries;

    if (this.searchTerm) {
      const needle = this.searchTerm.toLowerCase();
      filtered = filtered.filter((entry) => entry.name.toLowerCase().includes(needle));
    }

    if (this.filterLimit !== 'all') {
      filtered = filtered.slice(0, this.filterLimit);
    }

    return filtered;
  }

  private getPagedEntries(): LeaderboardEntry[] {
    const filtered = this.getFilteredEntries();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  private getFilteredGroups(): Group[] {
    const groups = this.options.groups || [];
    if (!this.searchTerm) {
      return groups;
    }

    const needle = this.searchTerm.toLowerCase();
    return groups.filter((group) =>
      group.groupName.toLowerCase().includes(needle) || group.roomCode.toLowerCase().includes(needle)
    );
  }

  private getPagedGroups(): Group[] {
    const filtered = this.getFilteredGroups();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  private getTotalPages(): number {
    const total = this.activeTab === 'groups'
      ? this.getFilteredGroups().length
      : this.getFilteredEntries().length;

    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  private getTabClass(isActive: boolean): string {
    return isActive
      ? 'flex-1 py-2 px-3 rounded-lg bg-black text-white text-sm font-semibold'
      : 'flex-1 py-2 px-3 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300';
  }

  private getBody(): HTMLElement | null {
    return this.modal.element.querySelector('.modal-container .p-6');
  }

  private startLiveRefresh(): void {
    if (!this.options.onRefresh) return;
    const interval = this.options.refreshIntervalMs ?? 5000;
    this.refreshIntervalId = window.setInterval(() => {
      void this.refreshLeaderboardData();
    }, interval);
  }

  private stopLiveRefresh(): void {
    if (this.refreshIntervalId !== null) {
      window.clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
    }
  }

  private async refreshLeaderboardData(): Promise<void> {
    if (!this.options.onRefresh || this.isRefreshing) return;
    this.isRefreshing = true;
    try {
      const nextData = await this.options.onRefresh();
      this.options.globalEntries = nextData.globalEntries;
      this.options.timerEntries = nextData.timerEntries;
      this.options.groups = nextData.groups;
      this.updateListAndPagination();
    } catch (error) {
      console.warn('Leaderboard live refresh failed:', error);
    } finally {
      this.isRefreshing = false;
    }
  }
}
