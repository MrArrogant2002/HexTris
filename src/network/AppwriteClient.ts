/**
 * AppwriteClient - User data management with authentication
 * Handles all database operations for user game data
 */

import { databases } from '@lib/appwrite';
import { ID, Query } from 'appwrite';
import { createEmptyInventory, ShopItemId } from '@config/shopItems';

// User document interface (matches Appwrite schema)
export interface UserDocument {
  $id: string;
  userId: string; // Links to Appwrite Auth user ID
  name: string;
  email: string;
  singlePlayerHighScore: number;
  totalDiamonds: number;
  gamesPlayed: number;
  totalPlayTime: number;
  themesUnlocked: string[];
  selectedTheme: string;
  timerAttackBest: number;
  inventory?: Record<string, number>;
  inventory_continue?: number;
  inventory_extraLife?: number;
  inventory_pulse?: number;
  inventory_tempo?: number;
  inventory_aegis?: number;
  inventory_shift?: number;
  inventory_nova?: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface LeaderboardEntry {
  $id: string;
  name: string;
  score: number;
  rank?: number;
}

export interface UserStats {
  gamesPlayed?: number;
  totalPlayTime?: number;
  totalDiamonds?: number;
}

export class AppwriteClient {
  private databaseId: string;
  private usersCollectionId: string;
  // Group collections will be used in future priorities
  // private groupsCollectionId: string;
  // private groupScoresCollectionId: string;

  constructor() {
    this.databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    this.usersCollectionId = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
    // this.groupsCollectionId = import.meta.env.VITE_APPWRITE_GROUPS_COLLECTION_ID;
    // this.groupScoresCollectionId = import.meta.env.VITE_APPWRITE_GROUPSCORES_COLLECTION_ID;

    // Validate environment variables
    if (!this.databaseId || !this.usersCollectionId) {
      console.error('Missing Appwrite environment variables!');
    }
  }

  /**
   * Create new user record in database (after Appwrite Auth signup)
   */
  async createUser(userId: string, name: string, email: string): Promise<UserDocument> {
    try {
      console.log('Creating user database record:', { userId, name, email });
      const user = await databases.createDocument(
        this.databaseId,
        this.usersCollectionId,
        ID.unique(),
        {
          userId,
          name,
          email,
          singlePlayerHighScore: 0,
          totalDiamonds: 500,
          gamesPlayed: 0,
          totalPlayTime: 0,
          themesUnlocked: ['classic'],
          selectedTheme: 'classic',
          timerAttackBest: 0,
          inventory_continue: 0,
          inventory_extraLife: 0,
          inventory_pulse: 0,
          inventory_tempo: 0,
          inventory_aegis: 0,
          inventory_shift: 0,
          inventory_nova: 0,
        }
      );

      console.log('User database record created:', name);
      const document = user as unknown as UserDocument;
      return {
        ...document,
        inventory: this.buildInventoryFromDocument(document),
      };
    } catch (error: any) {
      console.error('Failed to create user record:', error);
      console.error('Error details:', error.message, error.code);
      throw new Error(`Failed to create user database record: ${error.message}`);
    }
  }

  /**
   * Get user by Appwrite Auth user ID
   */
  async getUserById(userId: string): Promise<UserDocument | null> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.usersCollectionId,
        [Query.equal('userId', userId), Query.limit(1)]
      );

      if (response.documents.length > 0) {
        const document = response.documents[0] as unknown as UserDocument;
        return {
          ...document,
          inventory: this.buildInventoryFromDocument(document),
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  /**
   * Get user document ID by auth user ID
   */
  async getUserDocumentId(userId: string): Promise<string | null> {
    const user = await this.getUserById(userId);
    return user ? user.$id : null;
  }

  /**
   * Update single player high score (if better than current)
   */
  async updateSinglePlayerScore(userId: string, newScore: number): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        console.error('User not found');
        return false;
      }

      if (newScore > user.singlePlayerHighScore) {
        await databases.updateDocument(
          this.databaseId,
          this.usersCollectionId,
          user.$id,
          { singlePlayerHighScore: newScore }
        );

        console.log(`New high score: ${newScore}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update high score:', error);
      return false;
    }
  }

  /**
   * Update timer attack best score (if better than current)
   */
  async updateTimerAttackBest(userId: string, score: number): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      const currentBest = user.timerAttackBest || 0;
      if (score > currentBest) {
        await databases.updateDocument(
          this.databaseId,
          this.usersCollectionId,
          user.$id,
          { timerAttackBest: score }
        );

        console.log(`New timer attack record: ${score}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update timer attack best:', error);
      return false;
    }
  }

  /**
   * Add diamonds to user account
   */
  async addDiamonds(userId: string, amount: number): Promise<number | null> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return null;

      const newTotal = user.totalDiamonds + amount;
      await databases.updateDocument(
        this.databaseId,
        this.usersCollectionId,
        user.$id,
        { totalDiamonds: newTotal }
      );

      console.log(`+${amount} diamonds (Total: ${newTotal})`);
      return newTotal;
    } catch (error) {
      console.error('Failed to add diamonds:', error);
      return null;
    }
  }

  /**
   * Spend diamonds (returns false if insufficient)
   */
  async spendDiamonds(userId: string, amount: number): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      if (user.totalDiamonds < amount) {
        console.warn('Insufficient diamonds');
        return false;
      }

      const newTotal = user.totalDiamonds - amount;
      await databases.updateDocument(
        this.databaseId,
        this.usersCollectionId,
        user.$id,
        { totalDiamonds: newTotal }
      );

      console.log(`-${amount} diamonds (Remaining: ${newTotal})`);
      return true;
    } catch (error) {
      console.error('Failed to spend diamonds:', error);
      return false;
    }
  }

  /**
   * Update user stats (games played, playtime, etc.)
   */
  async updateUserStats(userId: string, stats: UserStats): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      const updates: Partial<UserDocument> = {};

      if (stats.gamesPlayed !== undefined) {
        updates.gamesPlayed = user.gamesPlayed + stats.gamesPlayed;
      }

      if (stats.totalPlayTime !== undefined) {
        updates.totalPlayTime = user.totalPlayTime + stats.totalPlayTime;
      }

      if (stats.totalDiamonds !== undefined) {
        updates.totalDiamonds = user.totalDiamonds + stats.totalDiamonds;
      }

      await databases.updateDocument(
        this.databaseId,
        this.usersCollectionId,
        user.$id,
        updates
      );

      return true;
    } catch (error) {
      console.error('Failed to update user stats:', error);
      return false;
    }
  }

  /**
   * Update user inventory counts
   */
  async updateInventory(userId: string, inventory: Record<string, number>): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      await databases.updateDocument(
        this.databaseId,
        this.usersCollectionId,
        user.$id,
        this.buildInventoryPayload(inventory)
      );

      return true;
    } catch (error) {
      console.error('Failed to update inventory:', error);
      return false;
    }
  }

  /**
   * Unlock theme for user
   */
  async unlockTheme(userId: string, themeId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      if (user.themesUnlocked.includes(themeId)) {
        console.log('Theme already unlocked');
        return true;
      }

      const updatedThemes = [...user.themesUnlocked, themeId];
      await databases.updateDocument(
        this.databaseId,
        this.usersCollectionId,
        user.$id,
        { themesUnlocked: updatedThemes }
      );

      console.log(`Theme unlocked: ${themeId}`);
      return true;
    } catch (error) {
      console.error('Failed to unlock theme:', error);
      return false;
    }
  }

  /**
   * Update selected theme
   */
  async updateSelectedTheme(userId: string, themeId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      if (!user.themesUnlocked.includes(themeId)) {
        console.warn('Theme not unlocked');
        return false;
      }

      await databases.updateDocument(
        this.databaseId,
        this.usersCollectionId,
        user.$id,
        { selectedTheme: themeId }
      );

      console.log(`Theme selected: ${themeId}`);
      return true;
    } catch (error) {
      console.error('Failed to update selected theme:', error);
      return false;
    }
  }

  /**
   * Get global leaderboard (top players by single player high score)
   */
  async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.usersCollectionId,
        [
          Query.orderDesc('singlePlayerHighScore'),
          Query.greaterThan('singlePlayerHighScore', 0),
          Query.limit(limit),
        ]
      );

      return response.documents.map((doc, index) => ({
        $id: doc.$id,
        name: doc.name as string,
        score: doc.singlePlayerHighScore as number,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Failed to fetch global leaderboard:', error);
      return [];
    }
  }

  /**
   * Get timer attack leaderboard
   */
  async getTimerAttackLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const response = await databases.listDocuments(
        this.databaseId,
        this.usersCollectionId,
        [
          Query.orderDesc('timerAttackBest'),
          Query.greaterThan('timerAttackBest', 0),
          Query.limit(limit),
        ]
      );

      return response.documents.map((doc, index) => ({
        $id: doc.$id,
        name: doc.name as string,
        score: doc.timerAttackBest as number,
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Failed to fetch timer attack leaderboard:', error);
      return [];
    }
  }

  /**
   * Update user themes (unlocked themes and selected theme)
   */
  async updateThemes(userId: string, themesUnlocked: string[], selectedTheme: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        console.error('User not found');
        return false;
      }

      await databases.updateDocument(
        this.databaseId,
        this.usersCollectionId,
        user.$id,
        {
          themesUnlocked,
          selectedTheme,
        }
      );

      console.log('Themes updated:', { themesUnlocked, selectedTheme });
      return true;
    } catch (error) {
      console.error('Failed to update themes:', error);
      return false;
    }
  }

  /**
   * Delete user record (for account deletion)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      await databases.deleteDocument(
        this.databaseId,
        this.usersCollectionId,
        user.$id
      );

      console.log('User record deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }

  private buildInventoryPayload(inventory: Record<string, number>): Record<string, number> {
    return {
      inventory_continue: inventory[ShopItemId.CONTINUE] ?? 0,
      inventory_extraLife: inventory[ShopItemId.EXTRA_LIFE] ?? 0,
      inventory_pulse: inventory[ShopItemId.PULSE] ?? 0,
      inventory_tempo: inventory[ShopItemId.TEMPO] ?? 0,
      inventory_aegis: inventory[ShopItemId.AEGIS] ?? 0,
      inventory_shift: inventory[ShopItemId.SHIFT] ?? 0,
      inventory_nova: inventory[ShopItemId.NOVA] ?? 0,
    };
  }

  private buildInventoryFromDocument(document: UserDocument): Record<ShopItemId, number> {
    const base = createEmptyInventory();
    if (document.inventory) {
      return {
        ...base,
        ...document.inventory,
      } as Record<ShopItemId, number>;
    }
    return {
      ...base,
      [ShopItemId.CONTINUE]: document.inventory_continue ?? base[ShopItemId.CONTINUE],
      [ShopItemId.EXTRA_LIFE]: document.inventory_extraLife ?? base[ShopItemId.EXTRA_LIFE],
      [ShopItemId.PULSE]: document.inventory_pulse ?? base[ShopItemId.PULSE],
      [ShopItemId.TEMPO]: document.inventory_tempo ?? base[ShopItemId.TEMPO],
      [ShopItemId.AEGIS]: document.inventory_aegis ?? base[ShopItemId.AEGIS],
      [ShopItemId.SHIFT]: document.inventory_shift ?? base[ShopItemId.SHIFT],
      [ShopItemId.NOVA]: document.inventory_nova ?? base[ShopItemId.NOVA],
    };
  }
}

// Export singleton instance
export const appwriteClient = new AppwriteClient();
