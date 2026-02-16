/**
 * Shop item configuration for Hextris
 * Defines purchasable items and their effects
 */

export enum ShopItemId {
  CONTINUE = 'continue',
  EXTRA_LIFE = 'extraLife',
  PULSE = 'pulse',
  TEMPO = 'tempo',
  AEGIS = 'aegis',
  NOVA = 'nova',
}

export interface ShopItem {
  id: ShopItemId;
  name: string;
  description: string;
  cost: number; // Cost in special points
  icon: string; // Short ASCII label
  category: 'consumable' | 'powerup';
  maxQuantity?: number; // Max in inventory (undefined = unlimited)
  effect: string; // Description of the effect
}

export const shopItems: Record<ShopItemId, ShopItem> = {
  [ShopItemId.CONTINUE]: {
    id: ShopItemId.CONTINUE,
    name: 'Continue Game',
    description: 'Resume from game over',
    cost: 500,
    icon: 'RETRY',
    category: 'consumable',
    maxQuantity: 1,
    effect: 'Resurrect with 1 life after game over',
  },
  [ShopItemId.EXTRA_LIFE]: {
    id: ShopItemId.EXTRA_LIFE,
    name: 'Extra Life',
    description: 'Gain one additional life',
    cost: 300,
    icon: 'HEART',
    category: 'consumable',
    effect: 'Immediately adds 1 life (max 5)',
  },
  [ShopItemId.PULSE]: {
    id: ShopItemId.PULSE,
    name: 'Pulse Wave',
    description: 'Clear a full outer ring of blocks',
    cost: 220,
    icon: 'PULSE',
    category: 'powerup',
    maxQuantity: 3,
    effect: 'Clears the furthest block in each lane instantly.',
  },
  [ShopItemId.TEMPO]: {
    id: ShopItemId.TEMPO,
    name: 'Tempo Break',
    description: 'Slow down the incoming rhythm',
    cost: 180,
    icon: 'TEMPO',
    category: 'powerup',
    maxQuantity: 3,
    effect: 'Slows block fall and spawn speed for a short time.',
  },
  [ShopItemId.AEGIS]: {
    id: ShopItemId.AEGIS,
    name: 'Aegis Field',
    description: 'Project a protective field',
    cost: 260,
    icon: 'AEGIS',
    category: 'powerup',
    maxQuantity: 3,
    effect: 'Grants invulnerability while the field is active.',
  },
  [ShopItemId.NOVA]: {
    id: ShopItemId.NOVA,
    name: 'Nova Spark',
    description: 'Amplify scoring streaks',
    cost: 280,
    icon: 'NOVA',
    category: 'powerup',
    maxQuantity: 3,
    effect: 'Boosts score output for your next few clears.',
  },
};

/**
 * Get shop item by ID
 */
export function getShopItem(id: ShopItemId): ShopItem {
  return shopItems[id];
}

/**
 * Get all shop items
 */
export function getAllShopItems(): ShopItem[] {
  return Object.values(shopItems);
}

/**
 * Get shop items by category
 */
export function getShopItemsByCategory(category: 'consumable' | 'powerup'): ShopItem[] {
  return getAllShopItems().filter(item => item.category === category);
}

/**
 * Check if player can afford an item
 */
export function canAfford(item: ShopItem, playerPoints: number): boolean {
  return playerPoints >= item.cost;
}

/**
 * Create an empty inventory for all shop items
 */
export function createEmptyInventory(): Record<ShopItemId, number> {
  return {
    [ShopItemId.CONTINUE]: 0,
    [ShopItemId.EXTRA_LIFE]: 0,
    [ShopItemId.PULSE]: 0,
    [ShopItemId.TEMPO]: 0,
    [ShopItemId.AEGIS]: 0,
    [ShopItemId.NOVA]: 0,
  };
}
