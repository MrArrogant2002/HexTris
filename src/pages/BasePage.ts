/**
 * Base page class for Hextris
 * Abstract class that all pages extend
 */

type PageAlignment = 'top' | 'center';

interface PageLayoutOptions {
  align?: PageAlignment;
  maxWidthClass?: string;
  paddingClass?: string;
  gapClass?: string;
  allowScroll?: boolean;
  showBackground?: boolean;
  extraClasses?: string;
}

export abstract class BasePage {
  protected container: HTMLElement;
  protected element: HTMLDivElement;
  protected params: Record<string, string>;
  private scrollButton?: HTMLButtonElement;
  private scrollButtonMode: 'down' | 'up' = 'down';

  private readonly handleScrollButtonClick = (): void => {
    const target = this.scrollButtonMode === 'down'
      ? this.element.scrollHeight - this.element.clientHeight
      : 0;
    this.element.scrollTo({ top: target, behavior: 'smooth' });
  };

  private readonly handleScrollButtonScroll = (): void => {
    this.updateScrollButtonState();
  };

  constructor(container: HTMLElement, params: Record<string, string> = {}) {
    this.container = container;
    this.params = params;
    this.element = this.createPageElement();
  }

  /**
   * Create the page root element
   */
  protected createPageElement(): HTMLDivElement {
    const page = document.createElement('div');
    page.className = 'page theme-page min-h-screen w-full';
    return page;
  }

  /**
   * Prepare the page shell with consistent spacing, background, and overflow rules
   */
  protected initPageLayout(options: PageLayoutOptions = {}): HTMLDivElement {
    const {
      align = 'top',
      maxWidthClass = 'max-w-4xl',
      paddingClass = 'px-4 sm:px-6 py-6 sm:py-10',
      gapClass = 'gap-6',
      allowScroll = true,
      showBackground = true,
      extraClasses = '',
    } = options;

    const alignmentClass = align === 'center'
      ? 'items-center'
      : 'items-start';

    this.disableScrollButton();
    this.element.className = `
      page theme-page min-h-screen w-full relative flex ${alignmentClass} justify-center
      ${allowScroll ? 'overflow-y-auto' : 'overflow-hidden'} px-4 sm:px-6
    `.trim().replace(/\s+/g, ' ');

    this.element.innerHTML = '';

    if (showBackground) {
      const aurora = document.createElement('div');
      aurora.className = 'theme-aurora';
      this.element.appendChild(aurora);

      const grid = document.createElement('div');
      grid.className = 'theme-grid-overlay';
      this.element.appendChild(grid);
    }

    const shell = document.createElement('div');
    shell.className = `
      relative z-10 w-full ${maxWidthClass} ${paddingClass}
      flex flex-col ${gapClass} ${extraClasses}
    `.trim().replace(/\s+/g, ' ');

    this.element.appendChild(shell);

    if (allowScroll) {
      this.enableScrollButton();
    }

    return shell;
  }

  /**
   * Abstract render method - must be implemented by subclasses
   */
  public abstract render(): void;

  /**
   * Lifecycle: called after page is mounted to DOM
   */
  public onMount?(): void;

  /**
   * Lifecycle: called before page is unmounted from DOM
   */
  public onUnmount?(): void;

  /**
   * Lifecycle: called when window is resized
   */
  public onResize?(): void;

  /**
   * Append the page to container
   */
  protected mount(): void {
    this.container.appendChild(this.element);
  }

  /**
   * Helper: Create a centered container
   */
  protected createCenteredContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'flex items-center justify-center min-h-screen p-4';
    return container;
  }

  /**
   * Helper: Create a page header
   */
  protected createHeader(title: string, subtitle?: string): HTMLElement {
    const header = document.createElement('header');
    header.className = 'text-center mb-8';

    const titleElement = document.createElement('h1');
    titleElement.className = 'text-5xl sm:text-6xl font-bold theme-text mb-2 drop-shadow';
    titleElement.textContent = title;
    header.appendChild(titleElement);

    if (subtitle) {
      const subtitleElement = document.createElement('p');
      subtitleElement.className = 'theme-text-secondary text-base sm:text-lg';
      subtitleElement.textContent = subtitle;
      header.appendChild(subtitleElement);
    }

    return header;
  }

  /**
   * Helper: Create a back button
   */
  protected createBackButton(text: string = '<- Back', onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `
      fixed top-4 left-4 z-10
      px-4 py-2 rounded-xl
      theme-btn theme-btn-outline
      transition-transform duration-200
    `.trim().replace(/\s+/g, ' ');
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }

  /**
   * Helper: Create a loading spinner
   */
  protected createLoader(): HTMLDivElement {
    const loader = document.createElement('div');
    loader.className = 'flex items-center justify-center min-h-screen';
    loader.innerHTML = `
      <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-black"></div>
    `;
    return loader;
  }

  /**
   * Clean up and remove page
   */
  public destroy(): void {
    this.disableScrollButton();
    this.element.remove();
  }

  private enableScrollButton(): void {
    if (this.scrollButton) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scroll-button theme-btn theme-btn-primary';
    button.innerHTML = this.getScrollButtonIcon('down');
    button.addEventListener('click', this.handleScrollButtonClick);

    this.scrollButton = button;
    this.scrollButtonMode = 'down';
    this.element.appendChild(button);
    this.element.addEventListener('scroll', this.handleScrollButtonScroll, { passive: true });

    requestAnimationFrame(() => {
      this.updateScrollButtonState();
    });
  }

  private disableScrollButton(): void {
    if (!this.scrollButton) return;

    this.scrollButton.removeEventListener('click', this.handleScrollButtonClick);
    this.scrollButton.remove();
    this.scrollButton = undefined;
    this.element.removeEventListener('scroll', this.handleScrollButtonScroll);
  }

  private updateScrollButtonState(): void {
    if (!this.scrollButton) return;

    const maxScroll = this.element.scrollHeight - this.element.clientHeight;
    if (maxScroll <= 8) {
      this.scrollButton.classList.add('opacity-0', 'pointer-events-none');
      return;
    }

    this.scrollButton.classList.remove('opacity-0', 'pointer-events-none');

    const shouldScrollUp = this.element.scrollTop > this.element.clientHeight * 0.35;
    const nextMode: 'down' | 'up' = shouldScrollUp ? 'up' : 'down';

    if (this.scrollButtonMode !== nextMode) {
      this.scrollButtonMode = nextMode;
      this.scrollButton.innerHTML = this.getScrollButtonIcon(nextMode);
    }
  }

  private getScrollButtonIcon(mode: 'down' | 'up'): string {
    const label = mode === 'down' ? 'Scroll Down' : 'Back to Top';
    const arrow = mode === 'down'
      ? '<path d="M12 5v14M5 12l7 7 7-7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />'
      : '<path d="M12 19V5M5 12l7-7 7 7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />';

    return `
      <span class="sr-only">${label}</span>
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        ${arrow}
      </svg>
    `;
  }
}

