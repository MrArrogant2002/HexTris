/**
 * Button component for Hextris
 * Reusable button with multiple variants and styles
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: string;
  onClick?: (event: MouseEvent) => void;
}

export class Button {
  public element: HTMLButtonElement;
  private options: Required<ButtonOptions>;

  constructor(text: string, options: ButtonOptions = {}) {
    this.options = {
      variant: options.variant || 'primary',
      size: options.size || 'medium',
      fullWidth: options.fullWidth || false,
      disabled: options.disabled || false,
      icon: options.icon || '',
      onClick: options.onClick || (() => {}),
    };

    this.element = this.createElement(text);
  }

  /**
   * Create button element
   */
  private createElement(text: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.disabled = this.options.disabled;

    // Base classes
    const classes = [
      'theme-btn',
      'btn-hover-scale',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'focus-visible:outline-none',
    ];

    const variantClassMap: Record<ButtonVariant, string> = {
      primary: 'theme-btn-primary',
      secondary: 'theme-btn-secondary',
      outline: 'theme-btn-outline',
      ghost: 'theme-btn-ghost',
    };

    classes.push(variantClassMap[this.options.variant]);

    // Size classes
    const sizeClasses: Record<ButtonSize, string[]> = {
      small: ['px-3', 'sm:px-4', 'py-2', 'text-xs', 'sm:text-sm'],
      medium: ['px-4', 'sm:px-6', 'py-2.5', 'text-sm', 'sm:text-base'],
      large: ['px-6', 'sm:px-8', 'py-3', 'text-base', 'sm:text-lg'],
    };
    classes.push(...sizeClasses[this.options.size]);

    // Full width
    if (this.options.fullWidth) {
      classes.push('w-full');
    }

    button.className = classes.join(' ');

    // Add content
    if (this.options.icon) {
      const icon = document.createElement('span');
      icon.textContent = this.options.icon;
      icon.className = 'mr-2';
      button.appendChild(icon);
    }

    const textNode = document.createTextNode(text);
    button.appendChild(textNode);

    // Add click handler
    button.addEventListener('click', this.options.onClick);

    return button;
  }

  /**
   * Set button text
   */
  public setText(text: string): void {
    const textNode = this.element.childNodes[this.options.icon ? 1 : 0];
    if (textNode) {
      textNode.textContent = text;
    }
  }

  /**
   * Set disabled state
   */
  public setDisabled(disabled: boolean): void {
    this.options.disabled = disabled;
    this.element.disabled = disabled;
  }

  /**
   * Set loading state
   */
  public  setLoading(loading: boolean): void {
    if (loading) {
      this.element.disabled = true;
      this.element.classList.add('opacity-75', 'cursor-wait');
      const originalText = this.element.textContent;
      this.element.setAttribute('data-original-text', originalText || '');
      this.element.textContent = 'Loading...';
    } else {
      this.element.disabled = this.options.disabled;
      this.element.classList.remove('opacity-75', 'cursor-wait');
      const originalText = this.element.getAttribute('data-original-text');
      if (originalText) {
        this.element.textContent = originalText;
      }
    }
  }

  /**
   * Remove button from DOM
   */
  public destroy(): void {
    this.element.remove();
  }
}

