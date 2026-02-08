/**
 * SpecialPointsSystem
 * Manages special points economy - earning and spending
 */

import { stateManager } from '@core/StateManager';
import { appwriteClient } from '@network/AppwriteClient';

export class SpecialPointsSystem {
  public addPoints(amount: number): void {
    if (amount <= 0) {
      return;
    }

    const player = stateManager.getState().player;
    const newTotal = player.specialPoints + amount;
    stateManager.updatePlayer({ specialPoints: newTotal });

    if (player.id) {
      void appwriteClient.addDiamonds(player.id, amount);
    }
  }

  public spendPoints(amount: number): boolean {
    if (amount <= 0) {
      return true;
    }

    const player = stateManager.getState().player;
    if (player.specialPoints < amount) {
      return false;
    }

    const newTotal = player.specialPoints - amount;
    stateManager.updatePlayer({ specialPoints: newTotal });

    if (player.id) {
      void appwriteClient.addDiamonds(player.id, -amount);
    }

    return true;
  }
}

