/**
 * ResetPasswordPage - Password recovery page
 * Handles password reset flow from email link
 */

import { BasePage } from './BasePage';
import { Input } from '@ui/components/Input';
import { Button } from '@ui/components/Button';
import { Card } from '@ui/components/Card';
import { Router } from '@/router';
import { ROUTES } from '@core/constants';
import { authService } from '@services/AuthService';

export class ResetPasswordPage extends BasePage {
  private userId: string = '';
  private secret: string = '';
  private newPasswordInput!: Input;
  private confirmPasswordInput!: Input;
  private submitButton!: Button;

  constructor(container: HTMLElement, params: Record<string, string>) {
    super(container, params);
    // Extract userId and secret from URL params
    this.userId = params.userId || '';
    this.secret = params.secret || '';
  }

  public render(): void {
    const shell = this.initPageLayout({
      align: 'center',
      maxWidthClass: 'max-w-lg',
      paddingClass: 'py-10 px-4 sm:px-6',
      allowScroll: false,
    });

    // Create centered card
    const card = new Card({
      variant: 'glassmorphic',
      padding: 'large',
    });
    card.element.dataset.authCard = 'true';

    // Header
    const header = document.createElement('div');
    header.className = 'text-center mb-8';
    
    const title = document.createElement('h1');
    title.className = 'text-4xl sm:text-5xl font-black theme-text mb-3';
    title.textContent = 'Reset Password';
    header.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'theme-text-secondary text-base';
    subtitle.textContent = 'Enter your new password';
    header.appendChild(subtitle);

    card.appendChild(header);

    // Check if we have required params
    if (!this.userId || !this.secret) {
      this.renderError(card.element, 'Invalid or expired reset link');
      shell.appendChild(card.element);
      this.mount();
      return;
    }

    // New password input
    this.newPasswordInput = new Input({
      label: 'New Password',
      type: 'password',
      placeholder: 'Min 8 characters',
      required: true,
      minLength: 8,
      onEnter: () => this.confirmPasswordInput.focus(),
    });
    card.appendChild(this.newPasswordInput.container);

    // Confirm password input
    this.confirmPasswordInput = new Input({
      label: 'Confirm New Password',
      type: 'password',
      placeholder: 'Re-enter password',
      required: true,
      onEnter: () => this.handleSubmit(),
    });
    card.appendChild(this.confirmPasswordInput.container);

    // Submit button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mt-6 space-y-3';
    
    this.submitButton = new Button('RESET PASSWORD', {
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => this.handleSubmit(),
    });

    buttonContainer.appendChild(this.submitButton.element);

    // Back to login link
    const backLink = document.createElement('button');
    backLink.textContent = '<- Back to Login';
    backLink.type = 'button';
    backLink.className = 'w-full text-sm theme-text-secondary hover:opacity-80 transition-colors';
    backLink.onclick = () => Router.getInstance().navigate(ROUTES.ENTRY);
    buttonContainer.appendChild(backLink);

    card.appendChild(buttonContainer);

    // Add card to page
    shell.appendChild(card.element);
    this.mount();
  }

  public onMount(): void {
    if (this.newPasswordInput) {
      setTimeout(() => this.newPasswordInput.focus(), 100);
    }
  }

  private renderError(card: HTMLElement, message: string): void {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'p-4 theme-card-muted border border-red-300/70 rounded-lg text-red-600 text-center mb-6 font-semibold';
    errorDiv.dataset.authAlert = 'true';
    errorDiv.textContent = message;
    card.appendChild(errorDiv);

    // Add back button
    const button = new Button('Back to Login', {
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => Router.getInstance().navigate(ROUTES.ENTRY),
    });
    card.appendChild(button.element);
  }

  private async handleSubmit(): Promise<void> {
    if (!this.newPasswordInput.validate() || !this.confirmPasswordInput.validate()) {
      return;
    }

    const newPassword = this.newPasswordInput.getValue();
    const confirmPassword = this.confirmPasswordInput.getValue();

    // Check passwords match
    if (newPassword !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    this.submitButton.setLoading(true);
    this.newPasswordInput.setDisabled(true);
    this.confirmPasswordInput.setDisabled(true);

    try {
      await authService.completePasswordRecovery(
        this.userId,
        this.secret,
        newPassword
      );

      // Show success message
      this.showSuccess('Password reset successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        Router.getInstance().navigate(ROUTES.ENTRY);
      }, 2000);
    } catch (error: any) {
      this.showError(error.message || 'Password reset failed');
      this.submitButton.setLoading(false);
      this.newPasswordInput.setDisabled(false);
      this.confirmPasswordInput.setDisabled(false);
    }
  }

  private showError(message: string): void {
    const errorEl = document.createElement('div');
    errorEl.className = 'mt-4 p-3 theme-card-muted border border-red-400/60 rounded-lg text-red-600 text-sm font-semibold';
    errorEl.textContent = message;
    
    // Remove any existing messages
    const existing = this.element.querySelector('[data-auth-alert="true"]');
    if (existing) existing.remove();
    
    errorEl.dataset.authAlert = 'true';
    this.element.querySelector('[data-auth-card="true"]')?.appendChild(errorEl);

    // Auto-remove after 5 seconds
    setTimeout(() => errorEl.remove(), 5000);
  }

  private showSuccess(message: string): void {
    const successEl = document.createElement('div');
    successEl.className = 'mt-4 p-3 theme-card-muted border border-green-400/60 rounded-lg text-green-600 text-sm font-semibold text-center';
    successEl.textContent = message;
    
    // Remove any existing messages
    const existing = this.element.querySelector('[data-auth-alert="true"]');
    if (existing) existing.remove();
    
    successEl.dataset.authAlert = 'true';
    this.element.querySelector('[data-auth-card="true"]')?.appendChild(successEl);
  }

  public onUnmount(): void {
    this.newPasswordInput?.destroy();
    this.confirmPasswordInput?.destroy();
    this.submitButton?.destroy();
  }
}

