/**
 * StrategyStatusHUD
 * Displays current phase, tempo, and surge state.
 */

export interface StrategyStatusState {
  phase?: string;
  tempoLevel?: number;
  surgeActive?: boolean;
  modeLabel?: string;
}

export class StrategyStatusHUD {
  private element: HTMLDivElement;
  private modeText!: HTMLDivElement;
  private phaseText!: HTMLDivElement;
  private tempoText!: HTMLDivElement;
  private surgeBadge!: HTMLSpanElement;
  private lastMode?: string;
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
      fixed top-20 left-1/2 -translate-x-1/2 z-20
      flex items-center gap-3
      px-4 py-2
      bg-black/70 text-white
      border border-white/20
      rounded-full
      shadow-lg
      backdrop-blur-md
      text-xs uppercase tracking-widest
    `.trim().replace(/\s+/g, ' ');

    this.phaseText = document.createElement('div');
    this.phaseText.className = 'font-semibold';
    this.phaseText.textContent = 'Phase: --';

    this.modeText = document.createElement('div');
    this.modeText.className = 'font-semibold text-white/80';
    this.modeText.textContent = 'Mode: --';
    this.modeText.style.display = 'none';

    this.tempoText = document.createElement('div');
    this.tempoText.className = 'font-semibold text-white/80';
    this.tempoText.textContent = 'Tempo: steady';

    this.surgeBadge = document.createElement('span');
    this.surgeBadge.className = 'px-2 py-1 text-[10px] rounded-full bg-white/15 text-white/70';
    this.surgeBadge.textContent = 'SURGE';

    container.appendChild(this.phaseText);
    container.appendChild(this.modeText);
    container.appendChild(this.tempoText);
    container.appendChild(this.surgeBadge);

    return container;
  }

  public setStatus(state: StrategyStatusState): void {
    const phase = state.phase ?? '---';
    const tempo = state.tempoLevel ?? 0;
    const surge = Boolean(state.surgeActive);
    const modeLabel = state.modeLabel;

    if (modeLabel !== this.lastMode) {
      if (modeLabel) {
        this.modeText.textContent = `Mode: ${modeLabel}`;
        this.modeText.style.display = 'inline-flex';
      } else {
        this.modeText.style.display = 'none';
      }
      this.lastMode = modeLabel;
    }

    if (phase !== this.lastPhase) {
      this.phaseText.textContent = `Phase: ${phase}`;
      this.lastPhase = phase;
    }

    if (tempo !== this.lastTempo) {
      this.tempoText.textContent = `Tempo: ${this.getTempoLabel(tempo)}`;
      this.tempoText.className = `font-semibold ${this.getTempoClass(tempo)}`;
      this.lastTempo = tempo;
    }

    if (surge !== this.lastSurge) {
      this.surgeBadge.style.display = surge ? 'inline-flex' : 'none';
      this.lastSurge = surge;
    }
  }

  private getTempoLabel(tempo: number): string {
    if (tempo <= -1) return 'assist';
    if (tempo >= 2) return 'surge';
    if (tempo === 1) return 'push';
    return 'steady';
  }

  private getTempoClass(tempo: number): string {
    if (tempo <= -1) return 'text-emerald-200';
    if (tempo >= 2) return 'text-rose-200';
    if (tempo === 1) return 'text-amber-200';
    return 'text-white/80';
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
