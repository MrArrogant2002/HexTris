/**
 * Settings Page - Game settings and preferences
 * Theme selector, audio settings, accessibility options, account management
 */

import { BasePage } from './BasePage';
import { Card } from '@ui/components/Card';
import { Button } from '@ui/components/Button';
import { Router } from '@/router';
import { stateManager } from '@core/StateManager';
import { ROUTES } from '@core/constants';
import { ThemeName, themes, availableThemes, themePrices, type Theme } from '@config/themes';
import {
  CONTROL_DEFINITIONS,
  DEFAULT_CONTROL_MAPPING,
  formatKeyLabel,
  loadControlMapping,
  saveControlMapping,
  updateControlMapping,
  type ControlCommand,
  type ControlMapping,
} from '@config/controls';
import { MODE_GUIDES, UI_GUIDELINES } from '@config/modeGuide';
import { POWER_DEFINITIONS } from '@config/powers';
import { authService } from '@services/AuthService';
import { appwriteClient } from '@network/AppwriteClient';
import { audioManager } from '@/managers/AudioManager';
import { themeManager } from '@/managers/ThemeManager';
import { getInputManager } from '@utils/input';

export class SettingsPage extends BasePage {
  private buttons: Button[] = [];

  public render(): void {
    const contentWrapper = this.initPageLayout({
      align: 'top',
      maxWidthClass: 'max-w-5xl',
      paddingClass: 'px-2 sm:px-4 py-8 sm:py-12',
    });

    // Back button
    const backBtn = this.createBackButton('<- Back', () => {
      Router.getInstance().navigate(ROUTES.MENU);
    });
    backBtn.style.marginBottom = '1.5rem';
    contentWrapper.appendChild(backBtn);

    // Content container
      const container = document.createElement('div');
      container.className = 'max-w-4xl mx-auto py-4 sm:py-8 space-y-8 sm:space-y-12 pb-16';

    // Header
    const header = this.createHeader('SETTINGS', 'Customize your experience');
    container.appendChild(header);

    // Settings sections
    const sections = document.createElement('div');
    sections.className = 'space-y-6 sm:space-y-8';

    // Theme Selector Section
    sections.appendChild(this.createThemeSection());

    // Audio Section
    sections.appendChild(this.createAudioSection());

    // Accessibility Section
    sections.appendChild(this.createAccessibilitySection());

    // Controls Section
    sections.appendChild(this.createControlsSection());

    // Game Guide Section
    sections.appendChild(this.createGuideSection());

    // Account Section
    sections.appendChild(this.createAccountSection());

    container.appendChild(sections);
    contentWrapper.appendChild(container);
    this.mount();
  }

  /**
   * Create theme selector section
   */
  private createThemeSection(): HTMLElement {
    const card = new Card({
      title: 'Theme',
      subtitle: 'Choose your visual style',
      padding: 'large',
    });

    const themesGrid = document.createElement('div');
    themesGrid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 mt-4';

    const player = stateManager.getState().player;
    const currentTheme = player.selectedTheme;
    const unlockedThemes = new Set(player.themesUnlocked);

    availableThemes.forEach((themeName) => {
      const theme = themes[themeName];
      const themeCard = this.createThemeCard(theme, {
        isSelected: currentTheme === themeName,
        isUnlocked: unlockedThemes.has(themeName),
        cost: themePrices[themeName] ?? 0,
      });
      themesGrid.appendChild(themeCard);
    });

    card.appendChild(themesGrid);
    return card.element;
  }

  /**
   * Create theme card
   */
  private createThemeCard(
    theme: Theme,
    options: { isSelected: boolean; isUnlocked: boolean; cost: number }
  ): HTMLElement {
    const card = document.createElement('div');
    card.className = `
      relative p-4 rounded-lg border-2 cursor-pointer
      transition-all duration-200
      hover:scale-105 hover:shadow-lg
      theme-card
      ${options.isSelected ? 'scale-105' : ''}
      ${options.isUnlocked ? '' : 'opacity-60'}
    `.trim().replace(/\s+/g, ' ');

    // Theme name
    const name = document.createElement('div');
    name.className = 'font-bold text-center mb-3 theme-text';
    name.textContent = theme.name;
    card.appendChild(name);

    // Color preview
    card.appendChild(this.createThemeSwatches(theme));

    // Description
    const description = document.createElement('div');
    description.className = 'text-xs theme-text-secondary text-center';
    description.textContent = theme.description;
    card.appendChild(description);

    const price = document.createElement('div');
    price.className = 'mt-2 text-center text-xs font-semibold theme-text-secondary';
    price.textContent = options.cost > 0 ? `💎 ${options.cost}` : 'Free';
    card.appendChild(price);

    // Selected indicator
    if (options.isSelected) {
      const indicator = document.createElement('div');
      indicator.className = 'mt-2 text-center text-sm font-bold theme-text';
      indicator.textContent = 'EQUIPPED';
      card.appendChild(indicator);
    } else if (options.isUnlocked) {
      const indicator = document.createElement('div');
      indicator.className = 'mt-2 text-center text-xs font-semibold theme-text-secondary';
      indicator.textContent = 'UNLOCKED';
      card.appendChild(indicator);
    } else {
      const indicator = document.createElement('div');
      indicator.className = 'mt-2 text-center text-xs font-semibold theme-text-secondary';
      indicator.textContent = 'LOCKED';
      card.appendChild(indicator);
    }

    // Click handler
    card.addEventListener('click', () => {
      if (!options.isUnlocked) {
        this.showLockedThemeMessage(theme.name, options.cost);
        return;
      }
      this.selectTheme(theme.id);
    });

    return card;
  }

  private createThemeSwatches(theme: Theme): HTMLElement {
    const group = document.createElement('div');
    group.className = 'flex flex-wrap items-center justify-center gap-1.5 mb-2';
    theme.colors.blocks.forEach((color) => {
      const swatch = document.createElement('span');
      swatch.className = `theme-swatch ${this.getSwatchShapeClass(theme.previewShape)}`;
      swatch.style.backgroundColor = color;
      group.appendChild(swatch);
    });
    return group;
  }

  private getSwatchShapeClass(shape?: Theme['previewShape']): string {
    switch (shape) {
      case 'diamond':
        return 'theme-swatch-diamond';
      case 'pill':
        return 'theme-swatch-pill';
      case 'hex':
        return 'theme-swatch-hex';
      case 'spark':
        return 'theme-swatch-spark';
      default:
        return 'theme-swatch-circle';
    }
  }

  private showLockedThemeMessage(themeName: string, cost: number): void {
    const costLabel = cost > 0 ? `for ${cost} diamonds` : 'in the shop';
    alert(`${themeName} is locked. Unlock it ${costLabel}.`);
  }

  /**
   * Select theme
   */
  private selectTheme(themeName: ThemeName): void {
    const state = stateManager.getState();
    if (state.player.selectedTheme === themeName) {
      return;
    }

    stateManager.updatePlayer({ selectedTheme: themeName });
    themeManager.applyTheme(themeName);

    if (state.player.id) {
      void appwriteClient.updateSelectedTheme(state.player.id, themeName);
    }

    this.render();
    console.log(`Theme changed to: ${themeName}`);
  }

  /**
   * Create audio section
   */
  private createAudioSection(): HTMLElement {
    const card = new Card({
      title: 'Audio',
      subtitle: 'Sound and music settings',
      padding: 'large',
    });

    const audioControls = document.createElement('div');
    audioControls.className = 'space-y-4 mt-4';

    const state = stateManager.getState();

    audioManager.setMusicMuted(state.ui.isMusicMuted);
    audioManager.setSfxMuted(state.ui.isSfxMuted);
    audioManager.setMusicVolume(state.ui.musicVolume);
    audioManager.setSfxVolume(state.ui.sfxVolume);

    // Sound Effects Toggle
    const sfxToggle = this.createToggle('Sound Effects', !state.ui.isSfxMuted, (enabled) => {
      stateManager.updateUI({ isSfxMuted: !enabled });
      audioManager.setSfxMuted(!enabled);
    });
    audioControls.appendChild(sfxToggle);

    // Music Toggle
    const musicToggle = this.createToggle('Background Music', !state.ui.isMusicMuted, (enabled) => {
      stateManager.updateUI({ isMusicMuted: !enabled });
      audioManager.setMusicMuted(!enabled);
    });
    audioControls.appendChild(musicToggle);

    // Music Volume Slider
    const musicSlider = this.createSlider('Music Volume', state.ui.musicVolume, (value) => {
      stateManager.updateUI({ musicVolume: value });
      audioManager.setMusicVolume(value);
    });
    audioControls.appendChild(musicSlider);

    // SFX Volume Slider
    const sfxSlider = this.createSlider('SFX Volume', state.ui.sfxVolume, (value) => {
      stateManager.updateUI({ sfxVolume: value });
      audioManager.setSfxVolume(value);
    });
    audioControls.appendChild(sfxSlider);

    card.appendChild(audioControls);
    return card.element;
  }

  /**
   * Create accessibility section
   */
  private createAccessibilitySection(): HTMLElement {
    const card = new Card({
      title: 'Accessibility',
      subtitle: 'Options for better experience',
      padding: 'large',
    });

    const accessibilityControls = document.createElement('div');
    accessibilityControls.className = 'space-y-4 mt-4';

    // High Contrast Mode
    const highContrastToggle = this.createToggle('High Contrast Mode', false, (enabled) => {
      console.log('High contrast:', enabled);
    });
    accessibilityControls.appendChild(highContrastToggle);

    // Screen Reader Support
    const screenReaderToggle = this.createToggle('Screen Reader Hints', false, (enabled) => {
      console.log('Screen reader:', enabled);
    });
    accessibilityControls.appendChild(screenReaderToggle);

    // Reduced Motion
    const reducedMotionToggle = this.createToggle('Reduced Motion', false, (enabled) => {
      console.log('Reduced motion:', enabled);
    });
    accessibilityControls.appendChild(reducedMotionToggle);

    card.appendChild(accessibilityControls);
    return card.element;
  }

  /**
   * Create controls section
   */
  private createControlsSection(): HTMLElement {
    const card = new Card({
      title: 'Controls',
      subtitle: 'View shortcuts and remap keys',
      padding: 'large',
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'space-y-4 mt-4';

    const controlsHint = 'Arrow keys (all directions) always rotate the hexagon. '
      + 'Power slots map to the three active slots. Remap secondary keys below.';
    const hint = document.createElement('p');
    hint.className = 'text-xs theme-text-secondary';
    hint.textContent = controlsHint;
    wrapper.appendChild(hint);

    let mapping: ControlMapping = loadControlMapping();
    const keySlots = new Map<ControlCommand, HTMLDivElement>();

    const updateKeyDisplay = (definition: typeof CONTROL_DEFINITIONS[number]): void => {
      const wrap = keySlots.get(definition.command);
      if (!wrap) return;
      wrap.innerHTML = '';
      const keys = mapping[definition.command] ?? [];
      const fixed = new Set(definition.fixedKeys ?? []);

      const seen = new Set<string>();
      keys.forEach((key) => {
        if (seen.has(key)) return;
        seen.add(key);
        const chip = document.createElement('span');
        chip.className = fixed.has(key)
          ? 'px-2 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-200'
          : 'px-2 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-white/80';
        chip.textContent = formatKeyLabel(key);
        wrap.appendChild(chip);
      });
    };

    const controlList = document.createElement('div');
    controlList.className = 'space-y-3';

    let activeCommand: ControlCommand | null = null;
    let activeButton: HTMLButtonElement | null = null;

    const handleKeyCapture = (event: KeyboardEvent): void => {
      if (!activeCommand) return;
      event.preventDefault();
      mapping = updateControlMapping(mapping, activeCommand, event.key);
      saveControlMapping(mapping);
      getInputManager().setControlMapping(mapping);
      const definition = CONTROL_DEFINITIONS.find(def => def.command === activeCommand);
      if (definition) {
        updateKeyDisplay(definition);
      }
      if (activeButton) {
        activeButton.textContent = 'Remap';
      }
      activeCommand = null;
      activeButton = null;
      window.removeEventListener('keydown', handleKeyCapture, true);
    };

    CONTROL_DEFINITIONS.forEach((definition) => {
      const row = document.createElement('div');
      row.className = 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between theme-card-muted rounded-xl p-3';

      const info = document.createElement('div');
      info.className = 'space-y-1';
      info.innerHTML = `
        <div class="text-sm font-semibold theme-text">${definition.label}</div>
        <div class="text-xs theme-text-secondary">${definition.description}</div>
      `;

      const keysWrap = document.createElement('div');
      keysWrap.className = 'flex flex-wrap items-center gap-2';
      keySlots.set(definition.command, keysWrap);
      updateKeyDisplay(definition);

      const remapBtn = document.createElement('button');
      remapBtn.type = 'button';
      remapBtn.className = 'theme-btn theme-btn-outline px-3 py-1 text-xs';
      remapBtn.textContent = 'Remap';
      remapBtn.addEventListener('click', () => {
        if (activeButton) {
          activeButton.textContent = 'Remap';
        }
        activeCommand = definition.command;
        activeButton = remapBtn;
        remapBtn.textContent = 'Press key...';
        window.removeEventListener('keydown', handleKeyCapture, true);
        window.addEventListener('keydown', handleKeyCapture, true);
      });

      const rightColumn = document.createElement('div');
      rightColumn.className = 'flex items-center justify-between gap-3 sm:justify-end sm:min-w-[14rem]';
      rightColumn.appendChild(keysWrap);
      if (definition.remappable) {
        rightColumn.appendChild(remapBtn);
      }

      row.appendChild(info);
      row.appendChild(rightColumn);
      controlList.appendChild(row);
    });

    const resetBtn = new Button('Reset Defaults', {
      variant: 'outline',
      size: 'small',
      onClick: () => {
        mapping = structuredClone(DEFAULT_CONTROL_MAPPING);
        saveControlMapping(mapping);
        getInputManager().setControlMapping(mapping);
        CONTROL_DEFINITIONS.forEach((definition) => updateKeyDisplay(definition));
      },
    });
    this.buttons.push(resetBtn);

    wrapper.appendChild(controlList);
    wrapper.appendChild(resetBtn.element);
    card.appendChild(wrapper);
    return card.element;
  }

  /**
   * Create guide section
   */
  private createGuideSection(): HTMLElement {
    const card = new Card({
      title: 'Game Playbook',
      subtitle: 'Rules, powers, and design guidelines',
      padding: 'large',
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'space-y-6 mt-4';

    const modeGrid = document.createElement('div');
    modeGrid.className = 'grid gap-4 md:grid-cols-2';
    MODE_GUIDES.forEach((mode) => {
      const modeCard = document.createElement('div');
      modeCard.className = 'theme-card-muted rounded-xl p-4 space-y-3';
      const title = document.createElement('div');
      title.className = 'text-sm font-bold theme-text';
      title.textContent = mode.name;
      const tagline = document.createElement('div');
      tagline.className = 'text-xs theme-text-secondary';
      tagline.textContent = mode.tagline;

      const rules = document.createElement('ul');
      rules.className = 'list-disc list-inside text-xs theme-text-secondary space-y-1';
      mode.rules.forEach((rule) => {
        const li = document.createElement('li');
        li.textContent = rule;
        rules.appendChild(li);
      });

      const strategy = document.createElement('ul');
      strategy.className = 'list-disc list-inside text-xs theme-text-secondary space-y-1';
      mode.strategy.forEach((rule) => {
        const li = document.createElement('li');
        li.textContent = rule;
        strategy.appendChild(li);
      });

      const strategyLabel = document.createElement('div');
      strategyLabel.className = 'text-[11px] font-semibold theme-text-secondary uppercase tracking-wide';
      strategyLabel.textContent = 'Strategy';

      modeCard.appendChild(title);
      modeCard.appendChild(tagline);
      modeCard.appendChild(rules);
      modeCard.appendChild(strategyLabel);
      modeCard.appendChild(strategy);
      modeGrid.appendChild(modeCard);
    });

    const powersGrid = document.createElement('div');
    powersGrid.className = 'grid gap-3 sm:grid-cols-2';
    Object.values(POWER_DEFINITIONS).forEach((power) => {
      const powerCard = document.createElement('div');
      powerCard.className = 'theme-card-muted rounded-xl p-3 space-y-2';
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';
      header.innerHTML = `
        <span class="text-sm font-semibold theme-text">${power.name}</span>
        <span class="text-lg">${power.icon}</span>
      `;
      const description = document.createElement('div');
      description.className = 'text-xs theme-text-secondary';
      description.textContent = power.description;
      const cooldown = document.createElement('div');
      cooldown.className = 'text-[11px] theme-text-secondary';
      cooldown.textContent = `Cooldown: ${(power.cooldownMs / 1000).toFixed(0)}s`;
      powerCard.appendChild(header);
      powerCard.appendChild(description);
      powerCard.appendChild(cooldown);
      powersGrid.appendChild(powerCard);
    });

    const uiList = document.createElement('ul');
    uiList.className = 'list-disc list-inside text-xs theme-text-secondary space-y-1';
    UI_GUIDELINES.forEach((rule) => {
      const li = document.createElement('li');
      li.textContent = rule;
      uiList.appendChild(li);
    });

    const powersLabel = document.createElement('div');
    powersLabel.className = 'text-xs font-semibold theme-text-secondary uppercase tracking-wide';
    powersLabel.textContent = 'Powers System';

    const uiLabel = document.createElement('div');
    uiLabel.className = 'text-xs font-semibold theme-text-secondary uppercase tracking-wide';
    uiLabel.textContent = 'UI/UX Guidelines';

    wrapper.appendChild(modeGrid);
    wrapper.appendChild(powersLabel);
    wrapper.appendChild(powersGrid);
    wrapper.appendChild(uiLabel);
    wrapper.appendChild(uiList);
    card.appendChild(wrapper);
    return card.element;
  }

  /**
   * Create account section
   */
  private createAccountSection(): HTMLElement {
    const card = new Card({
      title: 'Account',
      subtitle: 'Manage your data',
      padding: 'large',
    });

    const accountControls = document.createElement('div');
    accountControls.className = 'space-y-3 mt-4';

    const state = stateManager.getState();

    // Player name display
    const nameDisplay = document.createElement('div');
    nameDisplay.className = 'p-3 theme-card-muted rounded-lg';
    nameDisplay.innerHTML = `
      <div class="text-sm theme-text-secondary">Player Name</div>
      <div class="text-lg font-bold theme-text">${state.player.name}</div>
    `;
    accountControls.appendChild(nameDisplay);

    // Clear data button
    const clearDataBtn = new Button('Clear Local Data', {
      variant: 'outline',
      size: 'medium',
      fullWidth: true,
      onClick: () => this.clearData(),
    });
    this.buttons.push(clearDataBtn);
    accountControls.appendChild(clearDataBtn.element);

    // Logout button
    const logoutBtn = new Button('Logout', {
      variant: 'outline',
      size: 'medium',
      fullWidth: true,
      onClick: () => this.logout(),
    });
    this.buttons.push(logoutBtn);
    accountControls.appendChild(logoutBtn.element);

    card.appendChild(accountControls);
    return card.element;
  }

  /**
   * Create toggle switch
   */
  private createToggle(label: string, initialValue: boolean, onChange: (value: boolean) => void): HTMLElement {
    const container = document.createElement('div');
    container.className = 'flex items-center justify-between p-3 theme-card-muted rounded-lg';

    const labelElement = document.createElement('span');
    labelElement.className = 'font-medium theme-text';
    labelElement.textContent = label;
    container.appendChild(labelElement);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'relative inline-flex h-7 w-14 items-center rounded-full transition-transform duration-200 focus-visible:outline-none';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', String(initialValue));

    const toggleCircle = document.createElement('span');
    toggleCircle.className = 'inline-block h-5 w-5 transform rounded-full shadow-md transition-transform duration-200 ease-out';
    toggle.appendChild(toggleCircle);

    let isEnabled = initialValue;
    const updateVisual = (enabled: boolean): void => {
      toggle.setAttribute('aria-checked', String(enabled));
      toggle.dataset.enabled = enabled ? 'true' : 'false';
      toggle.style.background = enabled
        ? 'linear-gradient(120deg, var(--theme-accent-soft), var(--theme-accent))'
        : 'var(--theme-border-glass)';
      toggle.style.boxShadow = enabled ? '0 20px 35px var(--theme-glow)' : 'inset 0 0 0 1px var(--theme-border-glass)';
      toggleCircle.style.background = enabled ? 'var(--theme-surface)' : 'var(--theme-surface-muted)';
      toggleCircle.style.transform = enabled ? 'translateX(28px)' : 'translateX(2px)';
    };

    const handleToggle = (): void => {
      isEnabled = !isEnabled;
      updateVisual(isEnabled);
      onChange(isEnabled);
    };

    toggle.addEventListener('click', handleToggle);
    toggle.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleToggle();
      }
    });

    updateVisual(isEnabled);
    container.appendChild(toggle);
    return container;
  }

  private createSlider(label: string, initialValue: number, onChange: (value: number) => void): HTMLElement {
    const container = document.createElement('div');
    container.className = 'space-y-2 p-3 theme-card-muted rounded-lg';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between';

    const labelElement = document.createElement('span');
    labelElement.className = 'font-medium theme-text';
    labelElement.textContent = label;

    const valueElement = document.createElement('span');
    valueElement.className = 'text-sm theme-text-secondary';
    valueElement.textContent = `${Math.round(initialValue * 100)}%`;

    header.appendChild(labelElement);
    header.appendChild(valueElement);
    container.appendChild(header);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = `${Math.round(initialValue * 100)}`;
    slider.className = 'w-full';
    slider.style.accentColor = 'var(--theme-accent)';
    slider.addEventListener('input', () => {
      const value = Number(slider.value) / 100;
      valueElement.textContent = `${Math.round(value * 100)}%`;
      onChange(value);
    });

    container.appendChild(slider);
    return container;
  }

  /**
   * Clear local data (deletes user account and all data)
   */
  private async clearData(): Promise<void> {
    if (!confirm('Are you sure you want to delete your account and all data? This cannot be undone.')) {
      return;
    }

    try {
      const state = stateManager.getState();
      const userId = state.player.id;

      // Delete user from database
      await appwriteClient.deleteUser(userId);

      // Logout and clear session
      await authService.logout();

      // Navigate to login
      Router.getInstance().navigate(ROUTES.ENTRY);

      alert('Account deleted successfully.');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  }

  /**
   * Logout user
   */
  private async logout(): Promise<void> {
    if (!confirm('Are you sure you want to log out?')) {
      return;
    }

    try {
      await authService.logout();
      Router.getInstance().navigate(ROUTES.ENTRY);
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
    }
  }

  public onMount(): void {
    this.element.classList.add('animate-fade-in');
  }

  public onUnmount(): void {
    this.buttons.forEach(btn => btn.destroy());
    this.buttons = [];
  }
}
