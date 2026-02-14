/**
 * ComboHeatMeter
 * Displays combo heat buildup and tier.
 */

export class ComboHeatMeter {
  private element: HTMLDivElement;
  private fill!: HTMLDivElement;
  private tierBadge!: HTMLSpanElement;
  private lastHeat = -1;
  private lastTier = -1;

  constructor() {
    this.element = this.createElements();
  }

  private createElements(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `
      fixed bottom-28 sm:bottom-6 left-1/2 -translate-x-1/2 z-20
      w-56 sm:w-72
      px-3 py-2
      theme-card-muted
      rounded-xl
      shadow-lg
      text-xs uppercase tracking-widest
    `.trim().replace(/\s+/g, ' ');

    const labelRow = document.createElement('div');
    labelRow.className = 'flex items-center justify-between mb-1';

    const label = document.createElement('span');
    label.className = 'font-semibold theme-text';
    label.textContent = 'Resonance';

    this.tierBadge = document.createElement('span');
    this.tierBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-black/10 theme-text';
    this.tierBadge.textContent = 'Stage 0';

    labelRow.appendChild(label);
    labelRow.appendChild(this.tierBadge);

    const bar = document.createElement('div');
    bar.className = 'h-2 w-full bg-black/10 rounded-full overflow-hidden';

    this.fill = document.createElement('div');
    this.fill.className = 'h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-fuchsia-400';
    this.fill.style.width = '0%';

    bar.appendChild(this.fill);
    container.appendChild(labelRow);
    container.appendChild(bar);

    return container;
  }

  public setHeat(heat: number, tier: number): void {
    if (heat !== this.lastHeat) {
      const clamped = Math.max(0, Math.min(100, heat));
      this.fill.style.width = `${clamped}%`;
      this.lastHeat = heat;
    }

    if (tier !== this.lastTier) {
      this.tierBadge.textContent = `Stage ${tier}`;
      this.tierBadge.className = `text-[10px] px-2 py-0.5 rounded-full ${this.getTierClass(tier)}`;
      this.lastTier = tier;
    }
  }

  private getTierClass(tier: number): string {
    if (tier >= 3) return 'bg-rose-500/20 text-rose-600';
    if (tier === 2) return 'bg-amber-400/20 text-amber-600';
    if (tier === 1) return 'bg-cyan-400/20 text-cyan-600';
    return 'bg-black/10 theme-text-secondary';
  }

  public mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
  }

  public unmount(): void {
    this.element.remove();
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }
}
