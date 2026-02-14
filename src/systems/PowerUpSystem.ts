/**
 * PowerUpSystem
 * Manages power-up spawning, collection, and activation
 */

import { Canvas } from '@core/Canvas';
import { stateManager } from '@core/StateManager';
import {
  GameStatus,
  POWER_UP_MAX_WAIT,
  POWER_UP_SCORE_INTERVAL,
  POWER_UP_SPAWN_COOLDOWN,
} from '@core/constants';
import type { Hex } from '@entities/Hex';
import { PowerUp } from '@entities/PowerUp';
import { type PowerUpType, getPowerDefinition, POWER_SPAWN_POOL } from '@config/powers';
import type { InventoryUI } from '@ui/hud/InventoryUI';

type PowerUpUseHandler = (type: PowerUpType) => void;

const MS_PER_FRAME_60FPS = 16.6667;
// Applied when lives <= 1.
const CRITICAL_LIFE_COOLDOWN_MULTIPLIER = 0.7;
// Applied when lives === 2.
const LOW_LIFE_COOLDOWN_MULTIPLIER = 0.85;
const MAX_PENDING_SPAWNS = 2;
export interface PowerUpSystemOptions {
  hex: Hex;
  canvas: Canvas;
  inventoryUI: InventoryUI;
  onUse?: PowerUpUseHandler;
}

export class PowerUpSystem {
  private hex: Hex;
  private canvas: Canvas;
  private inventoryUI: InventoryUI;
  private activePowerUps: PowerUp[] = [];
  private lastScoreBucket = 0;
  private enabled = true;
  private onUse?: PowerUpUseHandler;
  private cooldowns = new Map<PowerUpType, number>();
  private elapsedMs = 0;
  private lastSpawnMs = -Infinity;
  private pendingSpawns = 0;

  constructor(options: PowerUpSystemOptions) {
    this.hex = options.hex;
    this.canvas = options.canvas;
    this.inventoryUI = options.inventoryUI;
    this.onUse = options.onUse;

    this.init();
  }

  public update(dt: number): void {
    if (!this.enabled) return;

    this.elapsedMs += dt * MS_PER_FRAME_60FPS;
    this.tryTimedSpawn();
    this.trySpawnPending();

    const hexRadius = (this.hex.sideLength / 2) * Math.sqrt(3);
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const powerUp = this.activePowerUps[i];
      powerUp.update(dt, hexRadius);

      if (powerUp.collected) {
        this.handleCollected(powerUp);
      }

      if (powerUp.shouldRemove()) {
        this.activePowerUps.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.enabled) return;

    const centerX = this.canvas.element.width / 2 + this.hex.gdx;
    const centerY = this.canvas.element.height / 2 + this.hex.gdy;
    this.activePowerUps.forEach(powerUp => powerUp.render(ctx, centerX, centerY));
  }

  public reset(): void {
    this.activePowerUps = [];
    this.lastScoreBucket = 0;
    this.inventoryUI.clear();
    this.cooldowns.clear();
    this.elapsedMs = 0;
    this.lastSpawnMs = -Infinity;
    this.pendingSpawns = 0;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.activePowerUps = [];
    }
  }

  public forceSpawn(): void {
    if (!this.enabled) return;
    if (stateManager.getState().status !== GameStatus.PLAYING) return;
    this.spawnPowerUp();
  }

  public destroy(): void {
    window.removeEventListener('scoreUpdate', this.handleScoreUpdate as EventListener);
    window.removeEventListener('powerup-used', this.handlePowerUpUsed as EventListener);
  }

  private init(): void {
    window.addEventListener('scoreUpdate', this.handleScoreUpdate as EventListener);
    window.addEventListener('powerup-used', this.handlePowerUpUsed as EventListener);
  }

  private handleScoreUpdate = (event: Event): void => {
    const customEvent = event as CustomEvent<{ score?: number }>;
    const score = customEvent.detail?.score ?? 0;
    if (stateManager.getState().status !== GameStatus.PLAYING) {
      return;
    }

    const bucket = Math.floor(score / POWER_UP_SCORE_INTERVAL);
    if (bucket <= this.lastScoreBucket) {
      return;
    }

    const spawnsToAdd = bucket - this.lastScoreBucket;
    this.lastScoreBucket = bucket;

    this.pendingSpawns = Math.min(this.pendingSpawns + spawnsToAdd, MAX_PENDING_SPAWNS);
    this.trySpawnPending();
  };

  private handlePowerUpUsed = (event: Event): void => {
    const customEvent = event as CustomEvent<{ type?: PowerUpType }>;
    const type = customEvent.detail?.type;
    if (!type) return;

    const activated = this.activatePowerUp(type);
    if (!activated) {
      return;
    }
    window.dispatchEvent(new CustomEvent('powerUpUsed', { detail: { type } }));
  };

  private spawnPowerUp(): void {
    const lane = this.randomInt(0, this.hex.sides);
    const type = POWER_SPAWN_POOL[this.randomInt(0, POWER_SPAWN_POOL.length)];

    const { startDist, scale } = this.getSpawnSettings();
    const powerUp = new PowerUp({
      type,
      lane,
      startDist,
      scale,
    });

    this.activePowerUps.push(powerUp);
    this.lastSpawnMs = this.elapsedMs;
  }

  private trySpawnPending(): void {
    if (this.pendingSpawns <= 0) return;
    if (this.inventoryUI.isFull()) return;
    if (!this.canSpawnNow()) return;
    this.pendingSpawns = Math.max(0, this.pendingSpawns - 1);
    this.spawnPowerUp();
  }

  private tryTimedSpawn(): void {
    if (this.inventoryUI.isFull()) return;
    if (this.elapsedMs - this.lastSpawnMs < POWER_UP_MAX_WAIT) return;
    if (!this.canSpawnNow()) return;
    this.spawnPowerUp();
  }

  private canSpawnNow(): boolean {
    if (stateManager.getState().status !== GameStatus.PLAYING) {
      return false;
    }
    const lives = stateManager.getState().game.lives;
    const cooldown = lives <= 1
      ? POWER_UP_SPAWN_COOLDOWN * CRITICAL_LIFE_COOLDOWN_MULTIPLIER
      : lives === 2
        ? POWER_UP_SPAWN_COOLDOWN * LOW_LIFE_COOLDOWN_MULTIPLIER
        : POWER_UP_SPAWN_COOLDOWN;
    return this.elapsedMs - this.lastSpawnMs >= cooldown;
  }

  private handleCollected(powerUp: PowerUp): void {
    if (this.inventoryUI.isFull()) {
      return;
    }

    const added = this.inventoryUI.addPowerUp(powerUp.type);
    if (added) {
      window.dispatchEvent(new CustomEvent('powerUpCollected', { detail: { type: powerUp.type } }));
    }
  }

  private activatePowerUp(type: PowerUpType): boolean {
    const definition = getPowerDefinition(type);
    const now = Date.now();
    const cooldownUntil = this.cooldowns.get(type) ?? 0;
    if (cooldownUntil > now) {
      this.inventoryUI.addPowerUp(type);
      window.dispatchEvent(new CustomEvent('powerUpCooldown', {
        detail: { type, remainingMs: cooldownUntil - now },
      }));
      return false;
    }
    this.cooldowns.set(type, now + definition.cooldownMs);

    if (this.onUse) {
      this.onUse(type);
    }
    window.dispatchEvent(new CustomEvent('powerUpEffect', { detail: { type } }));
    return true;
  }

  private getSpawnSettings(): { startDist: number; scale: number } {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseStartDist = isMobile ? 227 : 340;
    const scale = Math.min(this.canvas.element.width / 800, this.canvas.element.height / 800);
    return {
      startDist: baseStartDist * scale,
      scale,
    };
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
