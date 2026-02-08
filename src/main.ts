/**
 * Main entry point for Hextris TypeScript version
 * Initializes the application and sets up routing
 */

import './tailwind.css';
import { Router } from './router';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { MenuPage } from './pages/MenuPage';
import { MultiplayerPage } from './pages/MultiplayerPage';
import { DifficultyPage } from './pages/DifficultyPage';
import { SettingsPage } from './pages/SettingsPage';
import { GamePage } from './pages/GamePage';
import { ROUTES } from './core/constants';
import { authService } from '@services/AuthService';
import { appwriteClient } from '@network/AppwriteClient';
import { stateManager } from '@core/StateManager';
import { ThemeName } from '@config/themes';

/**
 * Restore user session if exists
 */
async function restoreSession(): Promise<boolean> {
  try {
    const session = await authService.getCurrentSession();
    
    if (session) {
      // User is logged in, load their data
      const user = await appwriteClient.getUserById(session.userId);
      
      if (user) {
        // Restore state
        stateManager.updatePlayer({
          id: user.userId,
          name: user.name,
          highScore: user.singlePlayerHighScore,
          specialPoints: user.totalDiamonds,
          gamesPlayed: user.gamesPlayed,
          totalPlayTime: user.totalPlayTime,
          themesUnlocked: user.themesUnlocked as ThemeName[],
          selectedTheme: user.selectedTheme as ThemeName,
        });
        
        console.log('Session restored for:', user.name);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Failed to restore session:', error);
    return false;
  }
}

/**
 * Initialize the application
 */
async function init(): Promise<void> {
  // Get app container
  const appContainer = document.getElementById('app');
  
  if (!appContainer) {
    throw new Error('App container not found');
  }

  // Initialize router
  const router = Router.init(appContainer);

  //Register routes
  router.registerRoutes([
    {
      path: ROUTES.ENTRY,
      page: LoginPage,
      requiresAuth: false,
    },
    {
      path: ROUTES.RESET_PASSWORD,
      page: ResetPasswordPage,
      requiresAuth: false,
    },
    {
      path: ROUTES.MENU,
      page: MenuPage,
      requiresAuth: true,
    },
    {
      path: ROUTES.DIFFICULTY,
      page: DifficultyPage,
      requiresAuth: true,
    },
    {
      path: ROUTES.GAME,
      page: GamePage,
      requiresAuth: true,
    },
    {
      path: ROUTES.SETTINGS,
      page: SettingsPage,
      requiresAuth: true,
    },
    {
      path: ROUTES.MULTIPLAYER,
      page: MultiplayerPage,
      requiresAuth: true,
    },
  ]);

  // Restore session and navigate appropriately
  const sessionRestored = await restoreSession();

  // Navigate to current route or appropriate default page
  const currentPath = window.location.hash.slice(1) || '/';
  if (currentPath === '/') {
    // If at root path, navigate based on authentication status
    if (sessionRestored) {
      router.navigate(ROUTES.MENU);
    } else {
      router.navigate(ROUTES.ENTRY);
    }
  } else {
    // Trigger route change for the current path
    window.dispatchEvent(new Event('hashchange'));
  }

  console.log('Hextris initialized successfully!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle unhandled errors
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
  showErrorNotification('An unexpected error occurred', event.error?.message || 'Unknown error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorNotification('Promise Error', event.reason?.message || 'An async operation failed');
});

/**
 * Show error notification to user
 */
function showErrorNotification(title: string, message: string): void {
  // Create error notification element
  const notification = document.createElement('div');
  notification.className = `
    fixed top-4 right-4 z-[9999]
    max-w-md p-4 rounded-lg shadow-2xl
    bg-red-600 text-white border-2 border-red-800
    animate-slide-down
  `;
  
  const titleEl = document.createElement('div');
  titleEl.className = 'font-bold text-lg mb-1';
  titleEl.textContent = title;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'text-sm opacity-90';
  messageEl.textContent = message;
  
  notification.appendChild(titleEl);
  notification.appendChild(messageEl);
  document.body.appendChild(notification);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.classList.add('animate-fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

