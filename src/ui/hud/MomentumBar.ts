/**
 * MomentumBar
 * Displays multiplayer momentum progress.
 */

export class MomentumBar {
  private element: HTMLDivElement;
  private fill!: HTMLDivElement;
  private lastValue = -1;

  constructor() {
    this.element = this.createElements();
  }

  private createElements(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `
      fixed top-16 left-4 z-20
      w-36 sm:w-44
      px-3 py-2
      bg-black/70 text-white
      border border-white/15
      rounded-xl
      shadow-lg
      backdrop-blur-md
      text-[10px] uppercase tracking-widest
    `.trim().replace(/\s+/g, ' ');

    const label = document.createElement('div');
    label.className = 'font-semibold mb-1';
    label.textContent = 'Sync Link';

    const bar = document.createElement('div');
    bar.className = 'h-2 w-full bg-white/10 rounded-full overflow-hidden';

    this.fill = document.createElement('div');
    this.fill.className = 'h-full bg-gradient-to-r from-indigo-400 to-cyan-300';
    this.fill.style.width = '0%';

    bar.appendChild(this.fill);
    container.appendChild(label);
    container.appendChild(bar);

    return container;
  }

  public setValue(value: number): void {
    if (value === this.lastValue) return;
    const clamped = Math.max(0, Math.min(100, value));
    this.fill.style.width = `${clamped}%`;
    this.lastValue = value;
  }

  public setVisible(visible: boolean): void {
    this.element.style.display = visible ? 'block' : 'none';
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
