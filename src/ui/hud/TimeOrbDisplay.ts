/**
 * TimeOrbDisplay
 * Shows timer orb progress during Timer Attack.
 */

export class TimeOrbDisplay {
  private element: HTMLDivElement;
  private countText!: HTMLSpanElement;
  private lastCount = -1;
  private lastGoal = -1;

  constructor() {
    this.element = this.createElements();
  }

  private createElements(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = `
      fixed top-16 right-4 z-20
      flex items-center gap-2
      px-3 py-2
      bg-black/70 text-white
      border border-white/15
      rounded-full
      shadow-lg
      backdrop-blur-md
      text-xs uppercase tracking-widest
    `.trim().replace(/\s+/g, ' ');

    const icon = document.createElement('span');
    icon.className = 'text-sm';
    icon.textContent = 'RELAY';

    this.countText = document.createElement('span');
    this.countText.className = 'font-semibold';
    this.countText.textContent = '0/3';

    container.appendChild(icon);
    container.appendChild(this.countText);

    return container;
  }

  public setCount(count: number, goal: number): void {
    if (count === this.lastCount && goal === this.lastGoal) return;
    this.countText.textContent = `${count}/${goal}`;
    this.lastCount = count;
    this.lastGoal = goal;
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
