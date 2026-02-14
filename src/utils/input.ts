/**
 * Input utilities - Keyboard and touch controls
 * Modern event-driven input system
 */

import {
  type ControlCommand,
  type ControlMapping,
  loadControlMapping,
  normalizeKey,
} from '@config/controls';

export type InputCommand = ControlCommand;

export interface InputHandler {
  onCommand: (command: InputCommand, pressed: boolean) => void;
}

export class InputManager {
  private handlers: Map<InputCommand, ((pressed: boolean) => void)[]> = new Map();
  private pressedKeys = new Set<string>();
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private swipeThreshold: number = 50;
  private enabled: boolean = true;
  private controlMapping: ControlMapping = loadControlMapping();

  constructor() {
    this.initKeyboardListeners();
    this.initTouchListeners();
  }

  /**
   * Register a command handler
   */
  public on(command: InputCommand, handler: (pressed: boolean) => void): void {
    if (!this.handlers.has(command)) {
      this.handlers.set(command, []);
    }
    this.handlers.get(command)!.push(handler);
  }

  /**
   * Unregister a command handler
   */
  public off(command: InputCommand, handler: (pressed: boolean) => void): void {
    const handlers = this.handlers.get(command);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Trigger a command
   */
  private trigger(command: InputCommand, pressed: boolean): void {
    if (!this.enabled) return;
    
    const handlers = this.handlers.get(command);
    if (handlers) {
      handlers.forEach(handler => handler(pressed));
    }
  }

  /**
   * Initialize keyboard event listeners
   */
  private initKeyboardListeners(): void {
    document.addEventListener('keydown', (e) => {
      const key = normalizeKey(e.key); // Normalize key for consistent tracking
      if (this.pressedKeys.has(key)) return; // Prevent key repeat
      this.pressedKeys.add(key);

      const commands = this.getCommandsForKey(key);
      if (!commands.length) return;
      commands.forEach((command) => this.trigger(command, true));
      e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
      const key = normalizeKey(e.key); // Normalize key for consistent tracking
      this.pressedKeys.delete(key);

      const commands = this.getCommandsForKey(key);
      commands.forEach((command) => this.trigger(command, false));
    });

    // Clear pressed keys on window blur
    window.addEventListener('blur', () => {
      this.pressedKeys.clear();
    });
  }

  /**
   * Initialize touch event listeners
   */
  private initTouchListeners(): void {
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      // Prevent scrolling while playing
      if (this.enabled) {
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        
        // Horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0) {
              // Swipe right
              this.trigger('rotateRight', true);
              setTimeout(() => this.trigger('rotateRight', false), 50);
            } else {
              // Swipe left
              this.trigger('rotateLeft', true);
              setTimeout(() => this.trigger('rotateLeft', false), 50);
            }
          }
        }
        // Vertical swipe down
        else if (deltaY > this.swipeThreshold) {
          this.trigger('speedUp', true);
          setTimeout(() => this.trigger('speedUp', false), 50);
        }
        // Tap (no significant movement)
        else if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
          // Determine which side of screen was tapped
          const screenWidth = window.innerWidth;
          if (touch.clientX < screenWidth / 2) {
            // Left tap
            this.trigger('rotateLeft', true);
            setTimeout(() => this.trigger('rotateLeft', false), 50);
          } else {
            // Right tap
            this.trigger('rotateRight', true);
            setTimeout(() => this.trigger('rotateRight', false), 50);
          }
        }
      }
    }, { passive: true });

    // Handle speed up release
    document.addEventListener('touchcancel', () => {
      this.trigger('speedUp', false);
    }, { passive: true });
  }

  /**
   * Enable/disable input processing
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.pressedKeys.clear();
    }
  }

  /**
   * Check if input is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if a key is pressed
   */
  public isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(normalizeKey(key));
  }

  /**
   * Clear all handlers
   */
  public clearHandlers(): void {
    this.handlers.clear();
  }

  /**
   * Get all pressed keys (for debugging)
   */
  public getPressedKeys(): string[] {
    return Array.from(this.pressedKeys);
  }

  /**
   * Set swipe threshold for touch controls
   */
  public setSwipeThreshold(threshold: number): void {
    this.swipeThreshold = threshold;
  }

  public setControlMapping(mapping: ControlMapping): void {
    this.controlMapping = mapping;
  }

  public getControlMapping(): ControlMapping {
    return this.controlMapping;
  }

  private getCommandsForKey(key: string): InputCommand[] {
    const commands: InputCommand[] = [];
    (Object.keys(this.controlMapping) as InputCommand[]).forEach((command) => {
      if (this.controlMapping[command].includes(key)) {
        commands.push(command);
      }
    });
    return commands;
  }
}

// Singleton instance
let inputManagerInstance: InputManager | null = null;

/**
 * Get the global InputManager instance
 */
export function getInputManager(): InputManager {
  if (!inputManagerInstance) {
    inputManagerInstance = new InputManager();
  }
  return inputManagerInstance;
}

/**
 * Reset the input manager (useful for testing)
 */
export function resetInputManager(): void {
  inputManagerInstance = null;
}
