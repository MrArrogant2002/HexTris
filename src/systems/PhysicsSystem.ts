/**
 * PhysicsSystem - Handles block movement, collision detection, and attachment
 */

import { Block } from '@entities/Block';
import { Hex } from '@entities/Hex';

export class PhysicsSystem {
  private fallingBlocks: Block[] = [];
  private static readonly MAX_PHYSICS_STEP = 1.25;

  constructor(_hexRadius: number) {
    // hexRadius kept in constructor signature for API compatibility
  }

  /**
   * Add a falling block to track
   */
  public addFallingBlock(block: Block): void {
    this.fallingBlocks.push(block);
  }

  /**
   * Update all falling blocks
   * Original from update.js: CHECK COLLISION FIRST, THEN MOVE
   */
  public update(hex: Hex, deltaTime: number, scale: number): void {
    let remainingDt = Math.max(0, deltaTime);
    while (remainingDt > 0) {
      const dt = Math.min(PhysicsSystem.MAX_PHYSICS_STEP, remainingDt);
      this.stepFallingBlocks(hex, dt, scale);
      remainingDt -= dt;
    }
  }

  private stepFallingBlocks(hex: Hex, dt: number, scale: number): void {
    for (let i = this.fallingBlocks.length - 1; i >= 0; i--) {
      const block = this.fallingBlocks[i];
      hex.doesBlockCollide(block);
      if (!block.settled) {
        if (!block.initializing) {
          const movement = block.iter * dt * scale;
          const maxSafeMovement = Math.max(block.height * 0.9, 0.01);
          block.distFromHex -= Math.min(movement, maxSafeMovement);
        }
      } else if (!block.removed) {
        block.removed = true;
      }
    }

    for (let i = this.fallingBlocks.length - 1; i >= 0; i--) {
      if (this.fallingBlocks[i].removed) {
        this.fallingBlocks.splice(i, 1);
      }
    }
  }

  /**
   * Remove a falling block (e.g., if it was destroyed)
   */
  public removeFallingBlock(block: Block): void {
    const index = this.fallingBlocks.indexOf(block);
    if (index !== -1) {
      this.fallingBlocks.splice(index, 1);
    }
  }

  /**
   * Get all falling blocks
   */
  public getFallingBlocks(): Block[] {
    return this.fallingBlocks;
  }

  /**
   * Clear all falling blocks
   */
  public clearFallingBlocks(): void {
    this.fallingBlocks = [];
  }

  /**
   * Count falling blocks
   */
  public getFallingBlockCount(): number {
    return this.fallingBlocks.length;
  }

  /**
   * Get blocks in a specific lane
   */
  public getBlocksInLane(lane: number): Block[] {
    return this.fallingBlocks.filter(block => block.fallingLane === lane);
  }

  /**
   * Check if any block is close to center (game over check)
   */
  public isAnyBlockNearCenter(threshold: number): boolean {
    return this.fallingBlocks.some(block => block.distFromHex < threshold);
  }

  /**
   * DEPRECATED: Falling blocks should NOT rotate with the hex!
   * Original Hextris: Only ATTACHED blocks rotate. Falling blocks maintain their angle.
   * The hex rotation affects which LANE they land in (via doesBlockCollide calculation),
   * but not their visual angle during flight.
   */
  public rotateFallingBlocks(_direction: 1 | -1, _hex: Hex): void {
    // DO NOTHING - falling blocks don't rotate!
    // Only attached blocks rotate (handled in Block.draw when settled=true)
  }

  /**
   * Reset physics system
   */
  public reset(): void {
    this.fallingBlocks = [];
  }

  /**
   * Get closest block to center
   */
  public getClosestBlock(): Block | null {
    if (this.fallingBlocks.length === 0) return null;
    
    let closest = this.fallingBlocks[0];
    let minDist = closest.distFromHex;
    
    for (const block of this.fallingBlocks) {
      if (block.distFromHex < minDist) {
        minDist = block.distFromHex;
        closest = block;
      }
    }
    
    return closest;
  }

  /**
   * Check for potential matches involving falling blocks
   * (Useful for power-ups or special effects)
   */
  public getFallingBlocksByColor(color: string): Block[] {
    return this.fallingBlocks.filter(block => block.color === color);
  }

  /**
   * Speed up all falling blocks (difficulty increase)
   */
  public speedUpBlocks(factor: number): void {
    for (const block of this.fallingBlocks) {
      block.iter *= factor;
    }
  }

  /**
   * Slow down all falling blocks (power-up effect)
   */
  public slowDownBlocks(factor: number): void {
    for (const block of this.fallingBlocks) {
      block.iter *= factor;
    }
  }
}
