/**
 * Inventory UI HUD Component
 * Shows power-up slots at bottom-left
 */

export class InventoryUI {
  private element: HTMLDivElement;
  private slots: HTMLDivElement[] = [];
  private maxSlots: number = 3;
  private inventory: Array<string | null> = [];

  constructor(maxSlots: number = 3) {
    this.maxSlots = maxSlots;
    this.inventory = new Array(maxSlots).fill(null);
    this.element = this.createElements();
  }

  private createElements(): HTMLDivElement {
    // Container
    const container = document.createElement('div');
    container.className = `
      fixed bottom-40 left-1/2 -translate-x-1/2 sm:bottom-6 sm:left-6 sm:translate-x-0 z-40
      flex gap-2 sm:gap-3
    `;

    // Create slots
    for (let i = 0; i < this.maxSlots; i++) {
      const slot = this.createSlot(i);
      this.slots.push(slot);
      container.appendChild(slot);
    }

    return container;
  }

  private createSlot(index: number): HTMLDivElement {
    const slot = document.createElement('div');
    slot.className = `
      relative w-16 h-16 sm:w-20 sm:h-20
      flex items-center justify-center
      theme-card
      border border-transparent
      rounded-xl shadow-xl
      transition-all duration-200
      hover:scale-105 hover:shadow-2xl
      cursor-pointer
      backdrop-blur-sm
    `;
    slot.dataset.index = index.toString();

    // Slot number indicator
    const number = document.createElement('div');
    number.className = `
      absolute top-1 right-1
      w-6 h-6 rounded-full
      bg-black text-white
      text-xs font-bold
      flex items-center justify-center
      shadow-lg
    `;
    number.textContent = (index + 1).toString();
    number.style.fontSize = '11px';
    number.style.lineHeight = '1';

    slot.appendChild(number);

    // Click handler to use power-up
    slot.addEventListener('click', () => this.usePowerUp(index));

    return slot;
  }

  /**
   * Get power-up icon
   */
  private getPowerUpAsset(type: string): { src?: string; emoji: string; label: string } {
    const map: Record<string, { src?: string; emoji: string; label: string }> = {
      pulse: { emoji: '💫', label: 'Pulse Wave' },
      tempo: { emoji: '🌀', label: 'Tempo Break' },
      aegis: { emoji: '🛡️', label: 'Aegis Field' },
      nova: { emoji: '✨', label: 'Nova Spark' },
    };
    return map[type] || { emoji: '❓', label: 'Unknown' };
  }

  /**
   * Add power-up to inventory
   */
  public addPowerUp(type: string): boolean {
    // Find empty slot
    const emptyIndex = this.inventory.findIndex(item => item === null);
    if (emptyIndex === -1) {
      return false; // Inventory full
    }

    this.inventory[emptyIndex] = type;
    this.updateSlot(emptyIndex);

    // Bounce animation
    this.slots[emptyIndex].style.animation = 'none';
    setTimeout(() => {
      this.slots[emptyIndex].style.animation = 'bounce 0.5s ease-out';
    }, 0);

    return true;
  }

  /**
   * Use power-up from slot
   */
  public usePowerUp(index: number): void {
    const type = this.inventory[index];
    if (!type) return;

    // Dispatch custom event for game to handle
    const event = new CustomEvent('powerup-used', {
      detail: { type, index }
    });
    window.dispatchEvent(event);

    // Remove from inventory
    this.inventory[index] = null;
    this.updateSlot(index);

    // Flash animation
    this.slots[index].classList.add('animate-pulse');
    setTimeout(() => {
      this.slots[index].classList.remove('animate-pulse');
    }, 300);
  }

  /**
   * Update slot display
   */
  private updateSlot(index: number): void {
    const slot = this.slots[index];
    const type = this.inventory[index];

    // Remove existing icon
    const existingIcon = slot.querySelector('.power-up-icon');
    if (existingIcon) {
      existingIcon.remove();
    }

    // Remove existing empty placeholder
    const existingEmpty = slot.querySelector('.power-up-empty');
    if (existingEmpty) {
      existingEmpty.remove();
    }

    if (type) {
      // Add icon
      const iconWrap = document.createElement('div');
      iconWrap.className = 'power-up-icon text-4xl';
      iconWrap.style.lineHeight = '1';
      iconWrap.style.display = 'flex';
      iconWrap.style.alignItems = 'center';
      iconWrap.style.justifyContent = 'center';

      const asset = this.getPowerUpAsset(type);
      if (asset.src) {
        const img = document.createElement('img');
        img.src = asset.src;
        img.alt = asset.label;
        img.className = 'w-12 h-12';
        iconWrap.appendChild(img);
      } else {
        iconWrap.textContent = asset.emoji;
      }

      slot.appendChild(iconWrap);

      // Active state
      slot.style.borderColor = 'var(--theme-accent)';
      slot.style.borderWidth = '2px';
    } else {
      // Empty state
      slot.style.borderColor = 'var(--theme-border)';
      slot.style.borderWidth = '2px';

      const empty = document.createElement('div');
      empty.className = 'power-up-empty';
      empty.textContent = '-';
      empty.style.fontSize = '2.5rem';
      empty.style.color = 'var(--theme-text-secondary)';
      empty.style.fontWeight = 'bold';
      empty.style.lineHeight = '1';
      empty.style.display = 'flex';
      empty.style.alignItems = 'center';
      empty.style.justifyContent = 'center';
      slot.appendChild(empty);
    }
  }

  /**
   * Check if inventory is full
   */
  public isFull(): boolean {
    return !this.inventory.includes(null);
  }

  /**
   * Get inventory contents
   */
  public getInventory(): Array<string | null> {
    return [...this.inventory];
  }

  /**
   * Clear all power-ups
   */
  public clear(): void {
    this.inventory = new Array(this.maxSlots).fill(null);
    this.slots.forEach((_, index) => this.updateSlot(index));
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
  }

  /**
   * Get DOM element
   */
  public getElement(): HTMLDivElement {
    return this.element;
  }
}
