/**
 * StrategyStatusHUD
 * Displays current phase, tempo, and surge state.
 */

export interface StrategyStatusState {
  phase?: string;
  tempoLevel?: number;
  surgeActive?: boolean;
}

export class StrategyStatusHUD {
  private element: HTMLDivElement;
  private phaseText!: HTMLDivElement;
  private tempoText!: HTMLDivElement;
  private surgeBadge!: HTMLSpanElement;
  private lastPhase?: string;
  private lastTempo?: number;
  private lastSurge?: boolean;

  constructor(initial: StrategyStatusState = {}) {
    this.element = this.createElements();
    this.setStatus(initial);
  }

  private createElements(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `
      fixed top-24 sm:top-20 left-1/2 -translate-x-1/2 z-20
      flex items-center gap-3
      px-4 py-2
      theme-card-muted
      rounded-full
      shadow-lg
      text-xs uppercase tracking-widest
    `.trim().replace(/\s+/g, ' ');

    this.phaseText = document.createElement('div');
    this.phaseText.className = 'font-semibold theme-text';
    this.phaseText.textContent = 'Mode: --';

    this.tempoText = document.createElement('div');
    this.tempoText.className = 'font-semibold theme-text-secondary';
    this.tempoText.textContent = 'Rhythm: steady';

    this.surgeBadge = document.createElement('span');
    this.surgeBadge.className = 'px-2 py-1 text-[10px] rounded-full bg-black/10 theme-text';
    this.surgeBadge.textContent = 'BOOST';

    container.appendChild(this.phaseText);
    container.appendChild(this.tempoText);
    container.appendChild(this.surgeBadge);

    return container;
  }

  public setStatus(state: StrategyStatusState): void {
    const phase = state.phase ?? '---';
    const tempo = state.tempoLevel ?? 0;
    const surge = Boolean(state.surgeActive);

    if (phase !== this.lastPhase) {
      this.phaseText.textContent = `Mode: ${phase}`;
      this.lastPhase = phase;
    }

    if (tempo !== this.lastTempo) {
      this.tempoText.textContent = `Rhythm: ${this.getTempoLabel(tempo)}`;
      this.tempoText.className = `font-semibold ${this.getTempoClass(tempo)}`;
      this.lastTempo = tempo;
    }

    if (surge !== this.lastSurge) {
      this.surgeBadge.style.display = surge ? 'inline-flex' : 'none';
      this.lastSurge = surge;
    }
  }

  private getTempoLabel(tempo: number): string {
    if (tempo <= -1) return 'glide';
    if (tempo >= 2) return 'flare';
    if (tempo === 1) return 'rise';
    return 'steady';
  }

  private getTempoClass(tempo: number): string {
    if (tempo <= -1) return 'text-emerald-600';
    if (tempo >= 2) return 'text-rose-500';
    if (tempo === 1) return 'text-amber-500';
    return 'theme-text-secondary';
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
