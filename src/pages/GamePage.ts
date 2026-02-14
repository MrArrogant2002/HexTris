/**
 * GamePage - Main game screen with canvas and HUD
 * Canvas rendering, game loop, controls, pause menu, game over
 */

import { BasePage } from './BasePage';
import { Button } from '@ui/components/Button';
import { Modal } from '@ui/components/Modal';
import { Router } from '@/router';
import { stateManager } from '@core/StateManager';
import { GameLoop } from '@core/GameLoop';
import { Canvas } from '@core/Canvas';
import { INVULNERABILITY_DURATION, LIFE_BONUS_INTERVAL, MAX_LIVES, ROUTES, GameStatus } from '@core/constants';
import { Hex } from '@entities/Hex';
import { Block } from '@entities/Block';
import { FloatingText } from '@entities/FloatingText';
import { WaveSystem } from '@systems/WaveSystem';
import { PhysicsSystem } from '@systems/PhysicsSystem';
import { MatchingSystem } from '@systems/MatchingSystem';
import { PowerUpSystem } from '@systems/PowerUpSystem';
import { SpecialPointsSystem } from '@systems/SpecialPointsSystem';
import { getInputManager } from '@utils/input';
import { themes, ThemeName } from '@config/themes';
import { DifficultyLevel, getDifficultyConfig } from '@config/difficulty';
import type { DifficultyConfig, AdaptiveAssistConfig } from '@config/difficulty';
import { appwriteClient } from '@network/AppwriteClient';
import { GroupManager } from '@network/GroupManager';
import { DailyChallengeSystem } from '@modes/DailyChallengeMode';
import { TimerAttackMode } from '@modes/TimerAttackMode';
import { DailyChallengeModal } from '@ui/modals/DailyChallengeModal';
import { ShopModal } from '@ui/modals/ShopModal';
import { 
  LivesDisplay, 
  PointsDisplay, 
  ScoreDisplay, 
  InventoryUI,
  StrategyStatusHUD,
  ComboHeatMeter,
  MomentumBar,
  TimeOrbDisplay
} from '@ui/hud';
import { audioManager } from '@/managers/AudioManager';
import { createEmptyInventory, ShopItemId } from '@config/shopItems';
import { type PowerUpType, getPowerDefinition } from '@config/powers';
import { TimeOrbSystem } from '@systems/TimeOrbSystem';
import { getChallengeScriptForDate, type ChallengeScript } from '@config/challengeSeeds';

export class GamePage extends BasePage {
  private canvas!: Canvas;
  private gameLoop!: GameLoop;
  private pauseModal: Modal | null = null;
  private gameOverModal: Modal | null = null;
  private shopModal: ShopModal | null = null;
  private shopPausedGame = false;
  private hasContinued = false;
  private lastLives = 0;
  private unsubscribeLivesChanged: (() => void) | null = null;
  
  // HUD Components
  private livesDisplay!: LivesDisplay;
  private pointsDisplay!: PointsDisplay;
  private scoreDisplay!: ScoreDisplay;
  private inventoryUI!: InventoryUI;
  private strategyStatusHUD!: StrategyStatusHUD;
  private comboHeatMeter!: ComboHeatMeter;
  private momentumBar!: MomentumBar;
  private timeOrbDisplay!: TimeOrbDisplay;
  
  // Game entities and systems
  private hex!: Hex;
  private waveSystem!: WaveSystem;
  private physicsSystem!: PhysicsSystem;
  private matchingSystem!: MatchingSystem;
  private powerUpSystem!: PowerUpSystem;
  private specialPointsSystem!: SpecialPointsSystem;
  private timeOrbSystem: TimeOrbSystem | null = null;
  private floatingTexts: FloatingText[] = [];
  private frameCount: number = 0;
  private rushMultiplier: number = 1;
  private powerUpSpeedMultiplier: number = 1;
  private powerUpSpawnMultiplier: number = 1;
  private scoreBoostMultiplier: number = 1;
  private slowMoTimeoutId: number | null = null;
  private slowMoIntervalId: number | null = null;
  private shieldTimeoutId: number | null = null;
  private invulnerabilityTimeoutId: number | null = null;
  private hammerEffectTimeoutId: number | null = null;
  private novaTimeoutId: number | null = null;
  private resonanceTimeoutId: number | null = null;
  private syncBoostTimeoutId: number | null = null;
  private nextLifeBonusScore: number = LIFE_BONUS_INTERVAL;
  private blockSettings: any;
  private dailyChallenge: DailyChallengeSystem | null = null;
  private dailyChallengeModal: DailyChallengeModal | null = null;
  private timerAttack: TimerAttackMode | null = null;
  private groupManager = new GroupManager();
  private unsubscribeGameOver: (() => void) | null = null;
  private effectLayer: HTMLDivElement | null = null;
  private slowMoOverlay: HTMLDivElement | null = null;
  private slowMoTimerEl: HTMLDivElement | null = null;
  private shieldOverlay: HTMLDivElement | null = null;
  private hammerOverlay: HTMLDivElement | null = null;
  private shiftOverlay: HTMLDivElement | null = null;
  private novaOverlay: HTMLDivElement | null = null;
  private resonanceOverlay: HTMLDivElement | null = null;
  private syncOverlay: HTMLDivElement | null = null;
  private surgeOverlay: HTMLDivElement | null = null;
  private surgeTimeoutId: number | null = null;
  private activeDifficultyConfig: DifficultyConfig | null = null;
  private currentPhaseName: string | null = null;
  private lifeLossTimestamps: number[] = [];
  private adaptiveAssistActive: boolean = false;
  private adaptiveAssistResetId: number | null = null;
  private comboHeatValue = 0;
  private comboTier = 0;
  private lastComboFrame = 0;
  private heatDecayRate = 6;
  private lastResonanceColor: string | null = null;
  private resonanceActive = false;
  private tempoActive = false;
  private challengeScript: ChallengeScript | null = null;
  private challengePhaseIndex = 0;
  private timerRampStage = 0;
  private timerRampSpeedMultiplier = 1;
  private timerRampSpawnMultiplier = 1;
  private challengeSpeedMultiplier = 1;
  private challengeSpawnMultiplier = 1;
  private catchupSpeedMultiplier = 1;
  private catchupSpawnMultiplier = 1;
  private momentumValue = 0;
  private momentumDecayRate = 4;
  private syncBoostActive = false;
  private activeMutators = new Set<string>();
  private noShieldActive = false;
  private handleGameOverSfx = (): void => {
    audioManager.playSfx('gameOver');
  };
  private handleBlockLandSfx = (): void => {
    audioManager.playSfx('blockLand');
  };
  private handlePowerUpCollectedSfx = (): void => {
    audioManager.playSfx('powerUpCollect');
  };
  private handlePowerUpCooldown = (event: Event): void => {
    const customEvent = event as CustomEvent<{ type?: PowerUpType; remainingMs?: number }>;
    const type = customEvent.detail?.type;
    if (!type) return;
    const remaining = Math.max(0, customEvent.detail?.remainingMs ?? 0);
    const label = getPowerDefinition(type).name.toUpperCase();
    this.floatingTexts.push(FloatingText.createMessage(
      this.canvas.element.width / 2,
      this.canvas.element.height / 2 + 140,
      `${label} ${Math.ceil(remaining / 1000)}s`,
      '#fbbf24'
    ));
  };
  private handlePowerUpUsedInventory = (event: Event): void => {
    const customEvent = event as CustomEvent<{ type?: ShopItemId }>;
    const type = customEvent.detail?.type;
    if (!type) return;
    this.consumeInventoryItem(type);
  };

  private handlePowerUpEffect = (event: Event): void => {
    const customEvent = event as CustomEvent<{ type?: string }>;
    const type = customEvent.detail?.type;
    if (type === 'pulse') {
      this.triggerHammerEffect();
    }
    if (type === 'shift') {
      this.triggerShiftEffect();
    }
  };

  private handleTimeOrbCollected = (): void => {
    const state = stateManager.getState();
    const nextCount = (state.game.timeOrbCount ?? 0) + 1;
    const goal = state.game.timeOrbGoal ?? 4;
    if (nextCount >= goal) {
      this.timerAttack?.addRelayCharge();
      stateManager.updateGame({ timeOrbCount: 0 });
      this.floatingTexts.push(FloatingText.createMessage(
        this.canvas.element.width / 2,
        this.canvas.element.height / 2 - 140,
        'RELAY!',
        '#c7d2fe'
      ));
    } else {
      stateManager.updateGame({ timeOrbCount: nextCount });
    }
  };

  private applyMutators(mutators: string[]): void {
    this.activeMutators = new Set(mutators);
    this.noShieldActive = this.activeMutators.has('noShield');
    const powerUpsAllowed = !this.activeMutators.has('noPowerUps');
    this.powerUpSystem?.setEnabled(powerUpsAllowed);
    stateManager.updateGame({ activeMutators: [...this.activeMutators] });
  }

  private handleSurgeChange = (state: { active: boolean; durationMs?: number; remainingMs?: number }): void => {
    stateManager.updateGame({ surgeActive: state.active });
    if (state.active) {
      this.showSurgeEffect(state.durationMs ?? 0);
    } else {
      this.hideSurgeEffect();
    }
    this.syncTempoLevel();
  };

  private handleTimerModeTimeUp = (event: Event): void => {
    if (stateManager.getState().status !== GameStatus.PLAYING) return;
    const customEvent = event as CustomEvent<{ score?: number }>;
    const finalScore = customEvent.detail?.score ?? stateManager.getState().game.score;
    stateManager.updateGame({ score: finalScore });
    stateManager.setState('status', GameStatus.GAME_OVER);
    stateManager.emit('gameOver', { score: finalScore, reason: 'timer' });

    const playerId = stateManager.getState().player.id;
    if (playerId) {
      void appwriteClient.updateTimerAttackBest(playerId, finalScore);
    }
  };

  public render(): void {
    this.element.className = 'page min-h-screen w-full theme-page relative overflow-hidden';

    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.className = 'h-screen w-full flex flex-col';

    // Canvas Container (full screen for HUD overlay)
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'flex-1 flex items-center justify-center p-4';
    canvasContainer.id = 'game-canvas-container';
    gameContainer.appendChild(canvasContainer);

    // Controls Info (mobile)
    const controls = this.createControls();
    gameContainer.appendChild(controls);

    this.element.appendChild(gameContainer);
    this.mount();
  }

  /**
   * Create controls info
   */
  private createControls(): HTMLElement {
    const controls = document.createElement('div');
    controls.className = 'theme-card-muted backdrop-blur-sm border-t-2 px-4 py-2 text-center';
    controls.innerHTML = `
      <div class="text-xs theme-text-secondary">
        <span class="hidden md:inline">Arrow Keys Rotate • Shift to Glide • 1-3 Powers • P to Pause</span>
        <span class="md:hidden">Swipe to Rotate • Tap to Nudge • Hold to Glide</span>
      </div>
    `;
    return controls;
  }

  /**
   * Initialize canvas
   */
  private initCanvas(): void {
    const container = document.getElementById('game-canvas-container');
    if (!container) return;

    // Initialize Canvas wrapper (it creates its own canvas element)
    this.canvas = new Canvas(container);

    // Add border and shadow styles
    this.canvas.element.className = 'border-4 border-black rounded-lg shadow-2xl';

    // Create HUD overlay container
    const hudContainer = document.createElement('div');
    hudContainer.className = 'absolute inset-0 pointer-events-none';
    hudContainer.id = 'hud-overlay';
    container.appendChild(hudContainer);

    // Make HUD elements clickable
    const hudStyle = document.createElement('style');
    hudStyle.textContent = `#hud-overlay > * { pointer-events: auto; }`;
    document.head.appendChild(hudStyle);

    this.effectLayer = document.createElement('div');
    this.effectLayer.className = 'game-effect-layer';
    hudContainer.appendChild(this.effectLayer);

    // Initialize HUD components
    const state = stateManager.getState();
    this.livesDisplay = new LivesDisplay(state.game.lives);
    this.pointsDisplay = new PointsDisplay(state.player.specialPoints, {
      onShopClick: () => this.openShopModal(),
    });
    this.scoreDisplay = new ScoreDisplay(state.game.score);
    this.inventoryUI = new InventoryUI(3);
    this.strategyStatusHUD = new StrategyStatusHUD({
      phase: state.game.strategyPhase,
      tempoLevel: state.game.tempoLevel,
      surgeActive: state.game.surgeActive,
    });
    this.comboHeatMeter = new ComboHeatMeter();
    this.momentumBar = new MomentumBar();
    this.timeOrbDisplay = new TimeOrbDisplay();
    this.lastLives = state.game.lives;
    this.nextLifeBonusScore = LIFE_BONUS_INTERVAL;

    this.seedInventorySlots();
    this.applyStoredExtraLives();

    // Mount to overlay
    this.livesDisplay.mount(hudContainer);
    this.pointsDisplay.mount(hudContainer);
    this.scoreDisplay.mount(hudContainer);
    this.inventoryUI.mount(hudContainer);
    this.strategyStatusHUD.mount(hudContainer);
    this.comboHeatMeter.mount(hudContainer);
    this.momentumBar.mount(hudContainer);
    this.timeOrbDisplay.mount(hudContainer);

    // Add pause button
    const pauseButton = document.createElement('button');
    pauseButton.className = `
      fixed top-4 left-1/2 transform -translate-x-1/2 translate-y-16 z-20
      px-4 py-2 theme-card backdrop-blur-md
      rounded-lg shadow-lg
      text-sm font-bold theme-text
      hover:scale-105 transition-all duration-200
      active:scale-95
    `;
    pauseButton.textContent = 'PAUSE (P)';
    pauseButton.onclick = () => this.pauseGame();
    hudContainer.appendChild(pauseButton);

    // Initialize game entities
    const centerX = this.canvas.element.width / 2;
    const centerY = this.canvas.element.height / 2;
    // hexSideLength is actually the RADIUS (center to vertex), not side length
    // Original Hextris uses 65 for desktop, 87 for mobile
    // Scale proportionally to canvas size
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseHexWidth = isMobile ? 87 : 65;
    const hexRadius = baseHexWidth * Math.min(centerX / 400, centerY / 400);
    
    // Create hex with correct parameters (radius, canvasWidth, canvasHeight)
    this.hex = new Hex(hexRadius, this.canvas.element.width, this.canvas.element.height, {
      scale: 1,
      comboTime: 240
    });
    
    // Get current theme colors for blocks
    const theme = themes[state.player.selectedTheme] || themes[ThemeName.CLASSIC];
    const blockColors = theme.colors.blocks;
    
    // Initialize game systems
    const difficultyLevel = state.game.difficulty ?? DifficultyLevel.STANDARD;
    const difficultyConfig = getDifficultyConfig(difficultyLevel);
    this.activeDifficultyConfig = difficultyConfig;
    this.currentPhaseName = null;
    this.lifeLossTimestamps = [];
    this.adaptiveAssistActive = false;
    this.comboHeatValue = 0;
    this.comboTier = 0;
    this.lastComboFrame = 0;
    this.timerRampStage = 0;
    this.timerRampSpeedMultiplier = 1;
    this.timerRampSpawnMultiplier = 1;
    this.challengeSpeedMultiplier = 1;
    this.challengeSpawnMultiplier = 1;
    this.catchupSpeedMultiplier = 1;
    this.catchupSpawnMultiplier = 1;
    this.challengeScript = null;
    this.challengePhaseIndex = 0;
    this.momentumValue = 0;
    this.activeMutators = new Set();
    this.noShieldActive = false;
    if (this.adaptiveAssistResetId) {
      window.clearTimeout(this.adaptiveAssistResetId);
      this.adaptiveAssistResetId = null;
    }
    stateManager.updateGame({
      surgeActive: false,
      strategyPhase: 'Drift',
      tempoLevel: 0,
      timeOrbCount: 0,
      timeOrbGoal: 4,
      activeMutators: [],
    });

    const speedModifier = difficultyConfig.speedMultiplier;
    const creationSpeedModifier = difficultyConfig.spawnRateModifier;
    
    this.waveSystem = new WaveSystem(
      {
        colors: blockColors,
        speedModifier,
        creationSpeedModifier,
        surge: difficultyConfig.surge,
        onSurgeChange: this.handleSurgeChange,
      },
      6,
      (lane: number, color: string, speed: number) => this.spawnBlock(lane, color, speed)
    );
    this.syncTempoLevel();
    
    // Use hexRadius directly (already calculated above)
    this.physicsSystem = new PhysicsSystem(hexRadius);
    
    this.matchingSystem = new MatchingSystem(speedModifier, creationSpeedModifier);
    this.specialPointsSystem = new SpecialPointsSystem();
    this.powerUpSystem = new PowerUpSystem({
      hex: this.hex,
      canvas: this.canvas,
      inventoryUI: this.inventoryUI,
      onUse: (type) => this.activatePower(type),
    });
    this.timeOrbSystem = new TimeOrbSystem({
      hex: this.hex,
      canvas: this.canvas,
      spawnChance: 0.45,
      cooldownMs: 6200,
      onCollect: this.handleTimeOrbCollected,
    });
    this.timeOrbSystem.setEnabled(state.ui.currentGameMode === 'timerAttack');
    
    // Reset frame counter
    this.frameCount = 0;
    
    console.log('Canvas initialized', {
      canvasSize: `${this.canvas.element.width}x${this.canvas.element.height}`,
      hexCenter: `(${centerX}, ${centerY})`,
      hexRadius: hexRadius,
      hexApothem: (hexRadius * Math.sqrt(3) / 2).toFixed(2),
      blockColors
    });
  }
  
  /**
   * Spawn a new falling block
   */
  private spawnBlock(lane: number, color: string, speed: number): void {
    const state = stateManager.getState();
    if (state.status !== GameStatus.PLAYING) return;
    
    // Calculate starting distance from hex (spawn off-screen)
    // Original: 340 for desktop, 227 for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const baseStartDist = isMobile ? 227 : 340;
    const scale = Math.min(this.canvas.element.width / 800, this.canvas.element.height / 800);
    const startDist = baseStartDist * scale;
    
    // Create block settings (original values)
    const baseBlockHeight = isMobile ? 20 : 15;
    const creationDt = isMobile ? 60 : 9;
    this.blockSettings = {
      blockHeight: baseBlockHeight * scale,
      scale: scale,
      prevScale: scale,
      creationDt: creationDt,
      startDist,
    };
    
    // Pass hex reference for shake effects
    const block = new Block(
      lane,
      color,
      speed, // Don't apply rush here, it's applied in update()
      startDist,
      false,
      this.blockSettings,
      this.hex
    );
    this.physicsSystem.addFallingBlock(block);
  }

  /**
   * Start game loop
   */
  private startGameLoop(): void {
    // Create game loop with update and render callbacks
    this.gameLoop = new GameLoop(
      (deltaTime: number) => this.update(deltaTime),
      () => this.draw()
    );
    
    this.gameLoop.start();

    // No longer need HUD update interval - HUD updates in game loop
  }

  /**
   * Update game state
   * Original from update.js - proper order: update falling, check matches, remove deleted, update attached
   */
  private update(deltaTime: number): void {
    const state = stateManager.getState();
    if (state.status !== GameStatus.PLAYING) return;
    
    // Apply rush multiplier to deltaTime (original: dt * rush)
    const dt = deltaTime * this.rushMultiplier * this.powerUpSpeedMultiplier;
    
    this.frameCount++;
    
    // Update hex rotation animation and dt
    this.hex.dt = dt;
    
    // Sync hex difficulty with wave system
    this.hex.playThrough = this.waveSystem.getDifficulty();
    
    // Update wave generation (spawn new blocks)
    this.waveSystem.update(dt, this.frameCount);
    this.updateTimerRamp();
    this.updateChallengePhase();
    this.updateDifficultyPhase();
    this.updateCatchupMultiplier();
    
    // Update physics (falling blocks move toward center and check collision)
    // Pass scale=1 for now (can be adjusted for screen scaling later)
    this.physicsSystem.update(this.hex, dt, 1);

    this.powerUpSystem.update(dt);
    this.timeOrbSystem?.update(dt);
    
    // Check for matches on newly settled blocks (checked=1)
    // Original: for each block, if (block.checked == 1) consolidateBlocks(...)
    const matchResults = this.matchingSystem.checkAllMatches(this.hex, this.frameCount);
    let runningScore = state.game.score;
    let diamondsToAdd = 0;
    for (const result of matchResults) {
      const scoreMultiplier = this.scoreBoostMultiplier * (this.resonanceActive ? 1.2 : 1);
      const adjustedScore = Math.round(result.score * scoreMultiplier);
      runningScore += adjustedScore;
      window.dispatchEvent(new CustomEvent('scoreUpdate', { detail: { score: runningScore } }));

      const diamondsEarned = Math.floor(result.blocksCleared / 5);
      if (diamondsEarned > 0) {
        diamondsToAdd += diamondsEarned;
      }

      const centerX = this.canvas.element.width / 2;
      const centerY = this.canvas.element.height / 2;
      this.floatingTexts.push(
        FloatingText.createScore(centerX + result.centerX, centerY + result.centerY, adjustedScore, result.color)
      );

      window.dispatchEvent(new CustomEvent('matchResolved', {
        detail: {
          blocksCleared: result.blocksCleared,
          color: result.color,
          score: adjustedScore,
        },
      }));

      this.addResonance(result.blocksCleared, result.color);

      if (state.ui.currentGameMode === 'timerAttack' && result.blocksCleared >= 4) {
        this.timeOrbSystem?.trySpawn();
      }

      this.waveSystem.onBlocksDestroyed();
      this.addSyncCharge(result.blocksCleared);
    }

    if (matchResults.length > 0) {
      audioManager.playSfx('matchClear');
      stateManager.updateGame({ score: runningScore });
    }

    if (runningScore >= this.nextLifeBonusScore) {
      this.applyLifeBonus(runningScore);
    }

    if (diamondsToAdd > 0) {
      this.specialPointsSystem.addPoints(diamondsToAdd);
    }
    
    // Remove fully deleted blocks (deleted=2) and reset settled flags
    // Original: for each lane, splice deleted blocks, track lowest index, reset settled for blocks above
    for (let i = 0; i < this.hex.blocks.length; i++) {
      let lowestDeletedIndex = 999;
      
      for (let j = this.hex.blocks[i].length - 1; j >= 0; j--) {
        const block = this.hex.blocks[i][j];
        
        if (block.deleted === 2) {
          // Remove block
          this.hex.blocks[i].splice(j, 1);
          if (j < lowestDeletedIndex) {
            lowestDeletedIndex = j;
          }
        }
      }
      
      // Reset settled flag for blocks above deleted ones (they need to fall)
      if (lowestDeletedIndex < this.hex.blocks[i].length) {
        for (let j = lowestDeletedIndex; j < this.hex.blocks[i].length; j++) {
          this.hex.blocks[i][j].settled = false;
        }
      }
    }
    
    // Update attached blocks (make them fall to fill gaps)
    // Original: for each block, doesBlockCollide to settle, then move if not settled
    for (let i = 0; i < this.hex.blocks.length; i++) {
      for (let j = 0; j < this.hex.blocks[i].length; j++) {
        const block = this.hex.blocks[i][j];
        
        // Check collision to settle block
        this.hex.doesBlockCollide(block, j, this.hex.blocks[i]);
        
        // Move unsettled blocks down
        if (!block.settled) {
          block.distFromHex -= block.iter * dt * 1; // scale = 1
        }
      }
    }
    
    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const text = this.floatingTexts[i];
      const alive = text.update(dt);
      if (!alive) {
        this.floatingTexts.splice(i, 1);
      }
    }
    
    // Increment hex frame counter
    this.hex.ct += dt;

    this.decayResonance(dt);
    this.decaySync(dt);
    
    // Check for game over (original: checks if blocks exceed rows setting)
    if (this.hex.isGameOver(8)) { // Original uses settings.rows which is typically 7-8
      if (!state.game.isInvulnerable) {
        this.handleLifeLoss();
      }
    }

    // Update HUD displays
    const updatedState = stateManager.getState();
    this.scoreDisplay.setScore(updatedState.game.score);
    this.livesDisplay.setLives(updatedState.game.lives);

    // Update special points from player state
    this.pointsDisplay.setPoints(updatedState.player.specialPoints);
    this.comboHeatMeter.setHeat(updatedState.game.comboHeat ?? 0, updatedState.game.comboTier ?? 0);
    this.timeOrbDisplay.setCount(updatedState.game.timeOrbCount ?? 0, updatedState.game.timeOrbGoal ?? 3);
    this.momentumBar.setValue(updatedState.game.momentumValue ?? 0);
    this.strategyStatusHUD.setStatus({
      phase: updatedState.game.strategyPhase,
      tempoLevel: updatedState.game.tempoLevel,
      surgeActive: updatedState.game.surgeActive,
    });

    const isTimer = updatedState.ui.currentGameMode === 'timerAttack';
    const isMultiplayer = updatedState.ui.currentGameMode?.startsWith('multiplayer');
    this.timeOrbDisplay.getElement().style.display = isTimer ? 'flex' : 'none';
    this.momentumBar.setVisible(Boolean(isMultiplayer));
  }

  /**
   * Draw game frame
   */
  private draw(): void {
    if (!this.canvas) return;

    this.canvas.clear();
    const ctx = this.canvas.ctx;
    const state = stateManager.getState();
    
    // Save context state
    ctx.save();
    
    // Draw background gradient
    const themeConfig = themes[state.player.selectedTheme] || themes[ThemeName.CLASSIC];
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.element.height);
    gradient.addColorStop(0, themeConfig.ui.surfaceMuted);
    gradient.addColorStop(1, themeConfig.colors.background);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.element.width, this.canvas.element.height);
    
    // Process shake effects (reset each frame)
    this.hex.gdx = 0;
    this.hex.gdy = 0;
    for (const shake of this.hex.shakes) {
      const angle = (30 + shake.lane * 60) * (Math.PI / 180);
      this.hex.gdx -= Math.cos(angle) * shake.magnitude;
      this.hex.gdy += Math.sin(angle) * shake.magnitude;
    }
    
    // Draw outer hexagon ring (shows game-over boundary)
    // Original formula: (rows * blockHeight) * (2/Math.sqrt(3)) + hexWidth
    const rows = 8; // Maximum rows before game over
    const blockHeight = this.blockSettings?.blockHeight || 20;
    const outerRadius = (rows * blockHeight) * (2 / Math.sqrt(3)) + this.hex.sideLength;
    this.drawOuterHexagon(ctx, outerRadius);
    
    // Draw combo timer on outer hexagon (original Hextris feature)
    this.drawComboTimer(ctx, outerRadius);
    
    // Draw hexagon with attached blocks
    const theme = state.player.selectedTheme;
    this.hex.draw(ctx, theme);
    
    // Draw falling blocks
    const fallingBlocks = this.physicsSystem.getFallingBlocks();
    for (const block of fallingBlocks) {
      block.draw(ctx);
    }

    this.powerUpSystem.render(ctx);
    this.timeOrbSystem?.render(ctx);
    
    // Draw floating texts (score popups)
    for (const text of this.floatingTexts) {
      text.draw(ctx);
    }
    
    // Restore context state
    ctx.restore();
  }

  /**
   * Draw combo timer visualization (colored lines on outer hexagon)
   * Original: drawTimer() function
   */
  private drawComboTimer(ctx: CanvasRenderingContext2D, radius: number): void {
    const timeSinceLastCombo = this.hex.ct - this.hex.lastCombo;
    const comboTimeLimit = 240; // Original: settings.comboTime
    
    if (timeSinceLastCombo >= comboTimeLimit) return;
    
    const centerX = this.canvas.element.width / 2;
    const centerY = this.canvas.element.height / 2;
    
    // Draw colored progress lines on outer hexagon
    ctx.save();
    ctx.strokeStyle = this.hex.lastColorScored || '#3498db';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8;
    
    // Calculate how many complete sides to draw
    const progress = 1 - (timeSinceLastCombo / comboTimeLimit);
    const totalSides = 6;
    const completeSides = Math.floor(progress * totalSides);
    const partialProgress = (progress * totalSides) % 1;
    
    ctx.beginPath();
    for (let i = 0; i < completeSides; i++) {
      const angle1 = (30 + i * 60) * (Math.PI / 180);
      const angle2 = (30 + (i + 1) * 60) * (Math.PI / 180);
      const x1 = centerX + radius * Math.cos(angle1);
      const y1 = centerY + radius * Math.sin(angle1);
      const x2 = centerX + radius * Math.cos(angle2);
      const y2 = centerY + radius * Math.sin(angle2);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    
    // Draw partial side
    if (partialProgress > 0 && completeSides < totalSides) {
      const i = completeSides;
      const angle1 = (30 + i * 60) * (Math.PI / 180);
      const angle2 = (30 + (i + 1) * 60) * (Math.PI / 180);
      const x1 = centerX + radius * Math.cos(angle1);
      const y1 = centerY + radius * Math.sin(angle1);
      const x2 = centerX + radius * Math.cos(angle2);
      const y2 = centerY + radius * Math.sin(angle2);
      const partialX = x1 + (x2 - x1) * partialProgress;
      const partialY = y1 + (y2 - y1) * partialProgress;
      ctx.moveTo(x1, y1);
      ctx.lineTo(partialX, partialY);
    }
    
    ctx.stroke();
    ctx.restore();
  }
  
  /**
   * Draw outer hexagon boundary ring (shows game-over limit)
   * Uses SAME formula as inner hex - pointy-top orientation with fixed (non-rotating) angle
   */
  private drawOuterHexagon(ctx: CanvasRenderingContext2D, radius: number): void {
    const centerX = this.canvas.element.width / 2;
    const centerY = this.canvas.element.height / 2;
    
    ctx.save();
    ctx.strokeStyle = '#cbd5e1';
    ctx.fillStyle = 'transparent';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    
    // Use SAME formula as inner hexagon for perfect alignment
    // Initial angle is 30 degrees (180 / 6 sides)
    const baseAngle = 30; // This matches Hex.angle initial value
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      // Match inner hex formula: angle = base + (i * 360/sides)
      const vertexAngle = (baseAngle + (i * 360 / 6)) * (Math.PI / 180);
      // Match inner hex coordinate formula: x = centerX - radius * sin(angle), y = centerY + radius * cos(angle)
      const x = centerX - radius * Math.sin(vertexAngle);
      const y = centerY + radius * Math.cos(vertexAngle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();
    
    // Draw corner circles for better visibility
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 6; i++) {
      const vertexAngle = (baseAngle + (i * 360 / 6)) * (Math.PI / 180);
      const x = centerX - radius * Math.sin(vertexAngle);
      const y = centerY + radius * Math.cos(vertexAngle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Update HUD display
   */
  /**
   * Pause game
   */
  private pauseGame(): void {
    this.gameLoop.pause();
    window.dispatchEvent(new CustomEvent('pauseGame'));

    this.pauseModal = new Modal({
      title: 'PAUSED',
      closeOnBackdrop: false,
      closeOnEscape: false,
    });

    const content = document.createElement('div');
    content.className = 'space-y-4 py-4';

    // Resume button
    const resumeBtn = new Button('Resume Game', {
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => this.resumeGame(),
    });
    content.appendChild(resumeBtn.element);

    // Restart button
    const restartBtn = new Button('Restart', {
      variant: 'outline',
      size: 'medium',
      fullWidth: true,
      onClick: () => this.restartGame(),
    });
    content.appendChild(restartBtn.element);

    // Main menu button
    const menuBtn = new Button('Main Menu', {
      variant: 'ghost',
      size: 'medium',
      fullWidth: true,
      onClick: () => this.exitToMenu(),
    });
    content.appendChild(menuBtn.element);

    this.pauseModal.setContent(content);
    this.pauseModal.open();
  }

  /**
   * Resume game
   */
  private resumeGame(): void {
    if (this.pauseModal) {
      this.pauseModal.close();
      this.pauseModal = null;
    }
    this.gameLoop.resume();
    window.dispatchEvent(new CustomEvent('resumeGame'));
  }

  /**
   * Restart game
   */
  private restartGame(): void {
    if (this.pauseModal) {
      this.pauseModal.close();
      this.pauseModal = null;
    }
    stateManager.resetGame();
    
    // Reset game systems
    this.hex.clearBlocks();
    this.physicsSystem.reset();
    this.waveSystem.reset();
    this.matchingSystem.resetCombo();
    this.powerUpSystem.reset();
    this.timeOrbSystem?.reset();
    this.floatingTexts = [];
    this.frameCount = 0;
    this.rushMultiplier = 1;
    this.powerUpSpeedMultiplier = 1;
    this.powerUpSpawnMultiplier = 1;
    this.scoreBoostMultiplier = 1;
    this.comboHeatValue = 0;
    this.comboTier = 0;
    this.lastComboFrame = 0;
    this.momentumValue = 0;
    this.resonanceActive = false;
    this.lastResonanceColor = null;
    this.tempoActive = false;
    this.syncBoostActive = false;
    stateManager.updateGame({ comboHeat: 0, comboTier: 0, momentumValue: 0, timeOrbCount: 0 });
    this.nextLifeBonusScore = LIFE_BONUS_INTERVAL;
    if (this.slowMoTimeoutId) {
      window.clearTimeout(this.slowMoTimeoutId);
      this.slowMoTimeoutId = null;
    }
    if (this.shieldTimeoutId) {
      window.clearTimeout(this.shieldTimeoutId);
      this.shieldTimeoutId = null;
    }
    if (this.novaTimeoutId) {
      window.clearTimeout(this.novaTimeoutId);
      this.novaTimeoutId = null;
    }
    if (this.resonanceTimeoutId) {
      window.clearTimeout(this.resonanceTimeoutId);
      this.resonanceTimeoutId = null;
    }
    if (this.syncBoostTimeoutId) {
      window.clearTimeout(this.syncBoostTimeoutId);
      this.syncBoostTimeoutId = null;
    }
    this.clearSlowMoEffect();
    this.hideShieldEffect();
    this.hideSurgeEffect();
    this.hideNovaEffect();
    this.hideResonanceEffect();
    this.hideSyncEffect();
    audioManager.setMusicIntensity(0.4);
    audioManager.setMusicTempoLevel(0);
    if (this.hammerOverlay) {
      this.hammerOverlay.remove();
      this.hammerOverlay = null;
    }
    if (this.shiftOverlay) {
      this.shiftOverlay.remove();
      this.shiftOverlay = null;
    }
    if (this.hammerEffectTimeoutId) {
      window.clearTimeout(this.hammerEffectTimeoutId);
      this.hammerEffectTimeoutId = null;
    }
    
    this.resumeGame();
  }

  /**
   * Exit to main menu
   */
  private exitToMenu(): void {
    if (this.pauseModal) {
      this.pauseModal.close();
      this.pauseModal = null;
    }
    this.gameLoop.stop();
    Router.getInstance().navigate(ROUTES.MENU);
  }

  private activatePower(type: PowerUpType): void {
    const definition = getPowerDefinition(type);
    switch (type) {
      case 'pulse':
        this.triggerPulseWave();
        break;
      case 'tempo':
        this.applySlowMo(0.7, definition.durationMs ?? 6000);
        break;
      case 'aegis':
        this.applyShield(definition.durationMs ?? 8000);
        break;
      case 'shift':
        this.applyOrbitShift();
        break;
      case 'nova':
        this.applyNovaBoost(definition.durationMs ?? 10000);
        break;
      default:
        break;
    }
  }

  private applySlowMo(multiplier: number, durationMs: number): void {
    if (this.slowMoTimeoutId) {
      window.clearTimeout(this.slowMoTimeoutId);
    }
    this.clearSlowMoEffect();
    this.powerUpSpeedMultiplier = multiplier;
    this.tempoActive = true;
    this.powerUpSpawnMultiplier = 0.85;
    this.applyWaveTuning();
    this.showSlowMoEffect(durationMs);
    this.slowMoTimeoutId = window.setTimeout(() => {
      this.powerUpSpeedMultiplier = 1;
      this.tempoActive = false;
      this.powerUpSpawnMultiplier = this.resonanceActive ? 0.9 : 1;
      this.clearSlowMoEffect();
      this.applyWaveTuning();
      this.slowMoTimeoutId = null;
    }, durationMs);
  }

  private applyShield(durationMs: number): void {
    if (this.noShieldActive) {
      return;
    }
    if (this.shieldTimeoutId) {
      window.clearTimeout(this.shieldTimeoutId);
    }
    stateManager.updateGame({ isInvulnerable: true });
    this.showShieldEffect();
    this.shieldTimeoutId = window.setTimeout(() => {
      stateManager.updateGame({ isInvulnerable: false });
      this.hideShieldEffect();
      this.shieldTimeoutId = null;
    }, durationMs);
  }

  private showSlowMoEffect(durationMs: number): void {
    if (!this.effectLayer) return;
    this.clearSlowMoEffect();

    const overlay = document.createElement('div');
    overlay.className = 'game-effect-tempo';

    const label = document.createElement('div');
    label.className = 'game-effect-label';
    label.textContent = 'TEMPO';

    const timer = document.createElement('div');
    timer.className = 'game-effect-timer';

    overlay.appendChild(label);
    overlay.appendChild(timer);
    this.effectLayer.appendChild(overlay);

    this.slowMoOverlay = overlay;
    this.slowMoTimerEl = timer;

    const start = performance.now();
    const updateTimer = (): void => {
      if (!this.slowMoTimerEl) return;
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, durationMs - elapsed);
      this.slowMoTimerEl.textContent = `${(remaining / 1000).toFixed(1)}s`;
    };

    updateTimer();
    this.slowMoIntervalId = window.setInterval(updateTimer, 100);

    if (this.canvas?.element) {
      this.canvas.element.classList.add('game-canvas-tempo');
    }
  }

  private clearSlowMoEffect(): void {
    if (this.slowMoIntervalId) {
      window.clearInterval(this.slowMoIntervalId);
      this.slowMoIntervalId = null;
    }
    if (this.slowMoOverlay) {
      this.slowMoOverlay.remove();
      this.slowMoOverlay = null;
      this.slowMoTimerEl = null;
    }
    this.canvas?.element.classList.remove('game-canvas-tempo');
  }

  private showShieldEffect(): void {
    if (!this.effectLayer) return;
    this.hideShieldEffect();
    const overlay = document.createElement('div');
    overlay.className = 'game-effect-aegis';
    this.effectLayer.appendChild(overlay);
    this.shieldOverlay = overlay;
    this.canvas?.element.classList.add('game-canvas-aegis');
  }

  private hideShieldEffect(): void {
    if (this.shieldOverlay) {
      this.shieldOverlay.remove();
      this.shieldOverlay = null;
    }
    this.canvas?.element.classList.remove('game-canvas-aegis');
  }

  private triggerHammerEffect(): void {
    if (!this.effectLayer) return;
    if (this.hammerOverlay) {
      this.hammerOverlay.remove();
      this.hammerOverlay = null;
    }
    if (this.hammerEffectTimeoutId) {
      window.clearTimeout(this.hammerEffectTimeoutId);
      this.hammerEffectTimeoutId = null;
    }

    const overlay = document.createElement('div');
    overlay.className = 'game-effect-pulse';

    const flash = document.createElement('div');
    flash.className = 'game-effect-pulse-flash';
    overlay.appendChild(flash);

    const burst = document.createElement('div');
    burst.className = 'game-effect-pulse-burst';

    const impact = document.createElement('div');
    impact.className = 'game-effect-pulse-impact';
    burst.appendChild(impact);

    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const ring = document.createElement('div');
      ring.className = 'game-effect-pulse-ring';
      ring.style.animationDelay = `${i * 0.1}s`;
      burst.appendChild(ring);
    }

    overlay.appendChild(burst);

    const sparkCount = 12;
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('span');
      spark.className = 'game-effect-pulse-spark';
      const rotation = (360 / sparkCount) * i + (Math.random() * 12 - 6);
      spark.style.setProperty('--spark-angle', `${rotation}deg`);
      spark.style.animationDelay = `${i * 0.02}s`;
      overlay.appendChild(spark);
    }

    this.effectLayer.appendChild(overlay);
    this.hammerOverlay = overlay;
    this.hammerEffectTimeoutId = window.setTimeout(() => {
      overlay.remove();
      this.hammerOverlay = null;
      this.hammerEffectTimeoutId = null;
    }, 1100);
  }

  private triggerPulseWave(): void {
    const lanes = this.hex.blocks;
    let cleared = 0;
    for (const lane of lanes) {
      const block = lane[lane.length - 1];
      if (block && block.deleted === 0) {
        block.deleted = 1;
        cleared += 1;
      }
    }
    if (cleared > 0) {
      const bonus = cleared * 60;
      const currentScore = stateManager.getState().game.score;
      const newScore = currentScore + bonus;
      stateManager.updateGame({ score: newScore });
      window.dispatchEvent(new CustomEvent('scoreUpdate', { detail: { score: newScore } }));
      this.floatingTexts.push(FloatingText.createMessage(
        this.canvas.element.width / 2,
        this.canvas.element.height / 2 - 120,
        `+${bonus}`,
        '#7cdeff'
      ));
      this.waveSystem.onBlocksDestroyed();
    }
  }

  private applyOrbitShift(): void {
    const sides = this.hex.sides;
    if (!sides) return;
    const shifted: Block[][] = Array.from({ length: sides }, () => []);
    for (let i = 0; i < sides; i++) {
      const target = (i + 1) % sides;
      const lane = this.hex.blocks[i];
      shifted[target] = lane;
      lane.forEach((block) => {
        block.attachedLane = target;
        block.targetAngle -= 60;
      });
    }
    this.hex.blocks = shifted;
  }

  private applyNovaBoost(durationMs: number): void {
    if (this.novaTimeoutId) {
      window.clearTimeout(this.novaTimeoutId);
    }
    this.scoreBoostMultiplier = 1.5;
    this.showNovaEffect(durationMs);
    this.novaTimeoutId = window.setTimeout(() => {
      this.scoreBoostMultiplier = 1;
      this.hideNovaEffect();
      this.novaTimeoutId = null;
    }, durationMs);
  }

  private triggerShiftEffect(): void {
    if (!this.effectLayer) return;
    if (this.shiftOverlay) {
      this.shiftOverlay.remove();
      this.shiftOverlay = null;
    }
    const overlay = document.createElement('div');
    overlay.className = 'game-effect-shift';
    overlay.textContent = 'SHIFT';
    this.effectLayer.appendChild(overlay);
    this.shiftOverlay = overlay;
    window.setTimeout(() => {
      overlay.remove();
      if (this.shiftOverlay === overlay) {
        this.shiftOverlay = null;
      }
    }, 900);
  }

  private showNovaEffect(durationMs: number): void {
    if (!this.effectLayer) return;
    if (this.novaOverlay) {
      this.novaOverlay.remove();
    }
    const overlay = document.createElement('div');
    overlay.className = 'game-effect-nova';
    overlay.innerHTML = '<span>NOVA</span><p>Score Surge</p>';
    this.effectLayer.appendChild(overlay);
    this.novaOverlay = overlay;
    window.setTimeout(() => {
      if (this.novaOverlay === overlay && durationMs <= 1200) {
        overlay.classList.add('fade');
      }
    }, 200);
  }

  private hideNovaEffect(): void {
    if (this.novaOverlay) {
      this.novaOverlay.remove();
      this.novaOverlay = null;
    }
  }

  private showResonanceEffect(durationMs: number): void {
    if (!this.effectLayer) return;
    if (this.resonanceOverlay) {
      this.resonanceOverlay.remove();
    }
    const overlay = document.createElement('div');
    overlay.className = 'game-effect-resonance';
    overlay.innerHTML = '<span>RESONANCE</span><p>Flow unlocked</p>';
    this.effectLayer.appendChild(overlay);
    this.resonanceOverlay = overlay;
    window.setTimeout(() => {
      if (this.resonanceOverlay === overlay && durationMs <= 1200) {
        overlay.classList.add('fade');
      }
    }, 300);
  }

  private hideResonanceEffect(): void {
    if (this.resonanceOverlay) {
      this.resonanceOverlay.remove();
      this.resonanceOverlay = null;
    }
  }

  private showSyncEffect(): void {
    if (!this.effectLayer) return;
    if (this.syncOverlay) {
      this.syncOverlay.remove();
      this.syncOverlay = null;
    }
    const overlay = document.createElement('div');
    overlay.className = 'game-effect-sync';
    overlay.innerHTML = '<span>SYNC LINK</span><p>Team tempo stabilized</p>';
    this.effectLayer.appendChild(overlay);
    this.syncOverlay = overlay;
  }

  private hideSyncEffect(): void {
    if (this.syncOverlay) {
      this.syncOverlay.remove();
      this.syncOverlay = null;
    }
  }

  private showSurgeEffect(durationMs: number): void {
    if (!this.effectLayer) return;
    this.hideSurgeEffect();
    const overlay = document.createElement('div');
    overlay.className = 'game-effect-surge';
    overlay.innerHTML = '<span>Surge</span><p>Brace for rapid waves</p>';
    this.effectLayer.appendChild(overlay);
    this.surgeOverlay = overlay;
    if (this.surgeTimeoutId) {
      window.clearTimeout(this.surgeTimeoutId);
      this.surgeTimeoutId = null;
    }
    if (durationMs > 0) {
      this.surgeTimeoutId = window.setTimeout(() => {
        this.hideSurgeEffect();
      }, durationMs + 100);
    }
  }

  private hideSurgeEffect(): void {
    if (this.surgeOverlay) {
      this.surgeOverlay.remove();
      this.surgeOverlay = null;
    }
    if (this.surgeTimeoutId) {
      window.clearTimeout(this.surgeTimeoutId);
      this.surgeTimeoutId = null;
    }
  }

  private updateDifficultyPhase(): void {
    const state = stateManager.getState();
    if (state.ui.currentGameMode && state.ui.currentGameMode !== 'standard') {
      return;
    }
    if (!this.waveSystem || !this.activeDifficultyConfig || !this.activeDifficultyConfig.phases?.length) {
      return;
    }
    const elapsedSeconds = this.waveSystem.getElapsedMs() / 1000;
    let activePhase = this.activeDifficultyConfig.phases[0];
    for (const phase of this.activeDifficultyConfig.phases) {
      if (elapsedSeconds + 0.001 >= phase.startsAt) {
        activePhase = phase;
      } else {
        break;
      }
    }
    if (!activePhase || this.currentPhaseName === activePhase.name) {
      return;
    }
    this.currentPhaseName = activePhase.name;
    stateManager.updateGame({ strategyPhase: activePhase.name });
    if (typeof activePhase.musicIntensity === 'number') {
      audioManager.setMusicIntensity(activePhase.musicIntensity);
    }
    window.dispatchEvent(new CustomEvent('difficultyPhaseChanged', { detail: activePhase }));
  }

  private applyWaveTuning(): void {
    if (!this.waveSystem) return;
    const speedMultiplier = this.timerRampSpeedMultiplier
      * this.challengeSpeedMultiplier
      * this.catchupSpeedMultiplier
      * this.powerUpSpawnMultiplier;
    const spawnMultiplier = this.timerRampSpawnMultiplier
      * this.challengeSpawnMultiplier
      * this.catchupSpawnMultiplier
      * this.powerUpSpawnMultiplier;
    this.waveSystem.setExternalMultipliers({ speedMultiplier, spawnMultiplier });
  }

  private updateChallengePhase(): void {
    if (!this.challengeScript || !this.waveSystem) return;
    const elapsedSeconds = this.waveSystem.getElapsedMs() / 1000;
    const phases = this.challengeScript.phases;
    if (!phases.length) return;

    let nextIndex = this.challengePhaseIndex;
    while (nextIndex + 1 < phases.length && elapsedSeconds >= phases[nextIndex + 1].startsAt) {
      nextIndex += 1;
    }

    if (nextIndex === this.challengePhaseIndex) return;
    this.challengePhaseIndex = nextIndex;
    const phase = phases[nextIndex];
    this.currentPhaseName = phase.name;
    stateManager.updateGame({ strategyPhase: phase.name });

    this.challengeSpeedMultiplier = phase.speedMultiplier ?? 1;
    this.challengeSpawnMultiplier = phase.spawnMultiplier ?? 1;
    this.applyWaveTuning();

    if (typeof phase.musicIntensity === 'number') {
      audioManager.setMusicIntensity(phase.musicIntensity);
    }

    if (phase.message) {
      this.floatingTexts.push(FloatingText.createMessage(
        this.canvas.element.width / 2,
        this.canvas.element.height / 2 - 150,
        phase.message,
        '#f9a826'
      ));
    }
  }

  private registerLifeLossAssist(): void {
    const assist = this.activeDifficultyConfig?.adaptiveAssist;
    if (!assist?.enabled) return;
    const now = performance.now();
    const cutoff = now - assist.windowMs;
    this.lifeLossTimestamps = this.lifeLossTimestamps.filter((ts) => ts >= cutoff);
    this.lifeLossTimestamps.push(now);
    if (this.adaptiveAssistActive) return;
    if (this.lifeLossTimestamps.length >= assist.lossThreshold) {
      this.triggerAdaptiveAssist(assist);
    }
  }

  private triggerAdaptiveAssist(config: AdaptiveAssistConfig): void {
    if (this.adaptiveAssistActive) return;
    this.adaptiveAssistActive = true;
    this.applySlowMo(config.slowScalar, config.durationMs);
    this.syncTempoLevel();
    if (this.adaptiveAssistResetId) {
      window.clearTimeout(this.adaptiveAssistResetId);
    }
    this.adaptiveAssistResetId = window.setTimeout(() => {
      this.adaptiveAssistActive = false;
      this.lifeLossTimestamps = [];
      this.syncTempoLevel();
      this.adaptiveAssistResetId = null;
    }, config.durationMs + 200);
  }

  private syncTempoLevel(): void {
    let tempo = 0;
    if (this.adaptiveAssistActive) {
      tempo = -1;
    } else if (this.resonanceActive || this.syncBoostActive) {
      tempo = 1;
    } else if (this.waveSystem?.isSurgeActive()) {
      tempo = 2;
    }
    stateManager.updateGame({ tempoLevel: tempo });
    audioManager.setMusicTempoLevel(tempo);
  }

  private updateTimerRamp(): void {
    const state = stateManager.getState();
    if (state.ui.currentGameMode !== 'timerAttack' || !this.timerAttack) return;
    const stage = this.timerAttack.getRelayStage();
    if (stage === this.timerRampStage) return;
    this.timerRampStage = stage;
    this.timerRampSpeedMultiplier = 1 + this.timerRampStage * 0.04;
    this.timerRampSpawnMultiplier = 1 + this.timerRampStage * 0.05;
    this.applyWaveTuning();

    const phaseLabel = this.timerAttack.getPhaseLabel();
    if (phaseLabel && phaseLabel !== this.currentPhaseName) {
      this.currentPhaseName = phaseLabel;
      stateManager.updateGame({ strategyPhase: phaseLabel });
    }
  }

  private updateCatchupMultiplier(): void {
    const state = stateManager.getState();
    const isMultiplayer = state.ui.currentGameMode?.startsWith('multiplayer');
    if (!isMultiplayer) {
      this.catchupSpeedMultiplier = 1;
      this.catchupSpawnMultiplier = 1;
      this.applyWaveTuning();
      return;
    }
    if (this.syncBoostActive) {
      return;
    }
    if (this.catchupSpeedMultiplier !== 1 || this.catchupSpawnMultiplier !== 1) {
      this.catchupSpeedMultiplier = 1;
      this.catchupSpawnMultiplier = 1;
      this.applyWaveTuning();
    }
  }

  private addResonance(blocksCleared: number, color: string): void {
    if (blocksCleared < 4) return;
    const colorShift = this.lastResonanceColor && this.lastResonanceColor !== color ? 6 : 0;
    const gain = Math.min(32, blocksCleared * 4 + colorShift);
    this.comboHeatValue = Math.min(100, this.comboHeatValue + gain);
    this.lastComboFrame = this.hex.ct;
    this.lastResonanceColor = color;

    const nextTier = this.getResonanceTier(this.comboHeatValue);
    if (nextTier !== this.comboTier) {
      this.comboTier = nextTier;
      this.scoreDisplay.flashCombo();
    }

    if (this.comboHeatValue >= 100) {
      this.triggerResonanceSurge();
    }

    stateManager.updateGame({ comboHeat: this.comboHeatValue, comboTier: this.comboTier });
  }

  private decayResonance(dt: number): void {
    if (this.resonanceActive) return;
    const sinceCombo = this.hex.ct - this.lastComboFrame;
    if (sinceCombo < 30) return;
    if (this.comboHeatValue <= 0) return;

    this.comboHeatValue = Math.max(0, this.comboHeatValue - this.heatDecayRate * dt);
    const nextTier = this.getResonanceTier(this.comboHeatValue);
    if (nextTier !== this.comboTier) {
      this.comboTier = nextTier;
    }
    stateManager.updateGame({ comboHeat: this.comboHeatValue, comboTier: this.comboTier });
  }

  private getResonanceTier(heat: number): number {
    if (heat >= 85) return 3;
    if (heat >= 60) return 2;
    if (heat >= 30) return 1;
    return 0;
  }

  private triggerResonanceSurge(): void {
    if (this.resonanceActive) return;
    this.resonanceActive = true;
    this.powerUpSpawnMultiplier = this.tempoActive ? 0.85 : 0.9;
    this.applyWaveTuning();
    this.showResonanceEffect(8000);
    this.syncTempoLevel();
    if (this.resonanceTimeoutId) {
      window.clearTimeout(this.resonanceTimeoutId);
    }
    this.resonanceTimeoutId = window.setTimeout(() => {
      this.resonanceActive = false;
      this.powerUpSpawnMultiplier = this.tempoActive ? 0.85 : 1;
      this.comboHeatValue = 0;
      this.comboTier = 0;
      this.hideResonanceEffect();
      this.applyWaveTuning();
      this.syncTempoLevel();
      stateManager.updateGame({ comboHeat: 0, comboTier: 0 });
      this.resonanceTimeoutId = null;
    }, 8000);
  }

  private addSyncCharge(blocksCleared: number): void {
    const state = stateManager.getState();
    const isMultiplayer = state.ui.currentGameMode?.startsWith('multiplayer');
    if (!isMultiplayer) return;

    const gain = Math.min(18, blocksCleared * 3);
    this.momentumValue = Math.min(100, this.momentumValue + gain);
    if (this.momentumValue >= 100) {
      this.triggerSyncBoost();
    }
    stateManager.updateGame({ momentumValue: this.momentumValue });
    this.updateSyncPhase();
  }

  private decaySync(dt: number): void {
    const state = stateManager.getState();
    const isMultiplayer = state.ui.currentGameMode?.startsWith('multiplayer');
    if (!isMultiplayer || this.syncBoostActive) return;

    if (this.momentumValue <= 0) return;
    this.momentumValue = Math.max(0, this.momentumValue - this.momentumDecayRate * dt);
    stateManager.updateGame({ momentumValue: this.momentumValue });
    this.updateSyncPhase();
  }

  private triggerSyncBoost(): void {
    if (this.syncBoostActive) return;
    this.syncBoostActive = true;
    this.momentumValue = 0;
    stateManager.updateGame({ momentumValue: 0 });
    this.catchupSpeedMultiplier = 0.92;
    this.catchupSpawnMultiplier = 0.9;
    this.applyWaveTuning();
    this.showSyncEffect();
    this.syncTempoLevel();
    this.updateSyncPhase();
    if (this.syncBoostTimeoutId) {
      window.clearTimeout(this.syncBoostTimeoutId);
    }
    this.syncBoostTimeoutId = window.setTimeout(() => {
      this.syncBoostActive = false;
      this.catchupSpeedMultiplier = 1;
      this.catchupSpawnMultiplier = 1;
      this.applyWaveTuning();
      this.hideSyncEffect();
      this.syncTempoLevel();
      this.updateSyncPhase();
      this.syncBoostTimeoutId = null;
    }, 7000);
  }

  private updateSyncPhase(): void {
    const state = stateManager.getState();
    if (!state.ui.currentGameMode?.startsWith('multiplayer')) return;
    let phase = 'Signal';
    if (this.syncBoostActive) {
      phase = 'Sync Burst';
    } else if (this.momentumValue >= 70) {
      phase = 'Harmonic';
    } else if (this.momentumValue >= 35) {
      phase = 'Linking';
    }
    if (phase !== this.currentPhaseName) {
      this.currentPhaseName = phase;
      stateManager.updateGame({ strategyPhase: phase });
    }
  }

  private applyLifeBonus(score: number): void {
    const state = stateManager.getState();
    if (state.game.lives >= MAX_LIVES) {
      this.nextLifeBonusScore = Math.ceil(score / LIFE_BONUS_INTERVAL) * LIFE_BONUS_INTERVAL + LIFE_BONUS_INTERVAL;
      return;
    }

    let livesToAdd = 0;
    while (score >= this.nextLifeBonusScore) {
      livesToAdd += 1;
      this.nextLifeBonusScore += LIFE_BONUS_INTERVAL;
    }

    const nextLives = Math.min(MAX_LIVES, state.game.lives + livesToAdd);
    if (nextLives > state.game.lives) {
      stateManager.updateGame({ lives: nextLives });
      const centerX = this.canvas.element.width / 2;
      const centerY = this.canvas.element.height / 2;
      this.floatingTexts.push(FloatingText.createLifeGained(centerX, centerY - 120));
    }
  }

  private handleLifeLoss(): void {
    const state = stateManager.getState();
    const nextLives = state.game.lives - 1;
    const centerX = this.canvas.element.width / 2;
    const centerY = this.canvas.element.height / 2;

    if (nextLives <= 0) {
      stateManager.updateGame({ lives: 0 });
      stateManager.setState('status', GameStatus.GAME_OVER);
      stateManager.emit('gameOver', { score: state.game.score });
      window.dispatchEvent(new CustomEvent('gameOver', { detail: { score: state.game.score } }));
      return;
    }

    this.registerLifeLossAssist();
    stateManager.updateGame({ lives: nextLives, isInvulnerable: true });
    this.floatingTexts.push(FloatingText.createLifeLost(centerX, centerY - 120));
    this.clearBlocksAndRestart();

    if (this.invulnerabilityTimeoutId) {
      window.clearTimeout(this.invulnerabilityTimeoutId);
    }
    this.invulnerabilityTimeoutId = window.setTimeout(() => {
      stateManager.updateGame({ isInvulnerable: false });
      this.invulnerabilityTimeoutId = null;
    }, INVULNERABILITY_DURATION);
  }

  private clearBlocksAndRestart(): void {
    this.hex.clearBlocks();
    this.physicsSystem.clearFallingBlocks();
    this.matchingSystem.resetCombo();
  }

  private openShopModal(): void {
    if (this.shopModal || this.pauseModal || this.gameOverModal) {
      return;
    }

    this.shopPausedGame = this.gameLoop.getIsRunning();
    if (this.shopPausedGame) {
      this.gameLoop.pause();
    }

    stateManager.updateUI({ isShopOpen: true });
    this.shopModal = new ShopModal({
      mode: 'game',
      inventoryUI: this.inventoryUI,
      onClose: () => {
        this.shopModal = null;
        stateManager.updateUI({ isShopOpen: false });
        if (this.shopPausedGame && stateManager.getState().status === GameStatus.PLAYING) {
          this.gameLoop.resume();
        }
        this.shopPausedGame = false;
      },
    });
    this.shopModal.open();
  }

  /**
   * Show game over screen
   */
  private showGameOver(): void {
    this.gameLoop.stop();

    const state = stateManager.getState();
    const uiState = state.ui;

    // Check if daily challenge was completed
    if (uiState.currentGameMode === 'dailyChallenge' && this.dailyChallenge) {
      const challenge = this.dailyChallenge.getCurrentChallenge();
      const isCompleted = this.dailyChallenge.checkCompletion();
      const streak = this.dailyChallenge.getStreak();

      // Show completion modal for daily challenge
      if (isCompleted && challenge) {
        this.dailyChallengeModal = new DailyChallengeModal();
        this.dailyChallengeModal.showCompletion(challenge, streak, state.game.score);
        
        // Update player diamonds with challenge reward
        const newDiamonds = state.player.specialPoints + challenge.totalReward;
        stateManager.updatePlayer({
          specialPoints: newDiamonds,
        });

        if (state.player.id) {
          void appwriteClient.addDiamonds(state.player.id, challenge.totalReward);
        }
      }
    }

    this.gameOverModal = new Modal({
      title: 'GAME OVER',
      closeOnBackdrop: false,
      closeOnEscape: false,
    });

    const content = document.createElement('div');
    content.className = 'space-y-6 py-4';

    // Score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'text-center';
    scoreDisplay.innerHTML = `
      <div class="text-6xl font-bold mb-2">${state.game.score}</div>
      <div class="text-gray-600">Final Score</div>
      ${state.game.score > state.player.highScore ? '<div class="text-sm text-green-600 font-bold mt-2">NEW HIGH SCORE!</div>' : ''}
    `;
    content.appendChild(scoreDisplay);

    // Play again button
    const playAgainBtn = new Button('Play Again', {
      variant: 'primary',
      size: 'large',
      fullWidth: true,
      onClick: () => this.playAgain(),
    });
    content.appendChild(playAgainBtn.element);

    const continueCount = this.getInventoryCount(ShopItemId.CONTINUE);
    const canContinue = !this.hasContinued && continueCount > 0;
    const continueBtn = new Button(`Continue (${continueCount})`, {
      variant: 'secondary',
      size: 'medium',
      fullWidth: true,
      disabled: !canContinue,
      onClick: () => this.continueGame(),
    });
    content.appendChild(continueBtn.element);

    if (this.hasContinued) {
      const continueHint = document.createElement('p');
      continueHint.className = 'text-xs text-gray-500 text-center';
      continueHint.textContent = 'Continue already used this run.';
      content.appendChild(continueHint);
    } else if (continueCount === 0) {
      const continueHint = document.createElement('p');
      continueHint.className = 'text-xs text-gray-500 text-center';
      continueHint.textContent = 'No continues in inventory.';
      content.appendChild(continueHint);
    }

    // Main menu button
    const menuBtn = new Button('Main Menu', {
      variant: 'outline',
      size: 'medium',
      fullWidth: true,
      onClick: () => this.exitToMenu(),
    });
    content.appendChild(menuBtn.element);

    this.gameOverModal.setContent(content);
    this.gameOverModal.open();

    // Update high score and games played
    const isNewHighScore = state.game.score > state.player.highScore;
    stateManager.updatePlayer({
      highScore: isNewHighScore ? state.game.score : state.player.highScore,
      gamesPlayed: state.player.gamesPlayed + 1,
    });

    if (isNewHighScore && state.player.id) {
      void appwriteClient.updateSinglePlayerScore(state.player.id, state.game.score);
    }

    if (uiState.currentGameMode === 'timerAttack' && state.player.id) {
      void appwriteClient.updateTimerAttackBest(state.player.id, state.game.score);
    }

    const groupId = state.ui.currentGroupId;
    if (groupId && state.player.id) {
      void this.groupManager.recordGroupScore(
        state.player.id,
        state.player.name,
        groupId,
        state.game.score,
        String(state.game.difficulty)
      );
    }
  }

  /**
   * Play again
   */
  private playAgain(): void {
    if (this.gameOverModal) {
      this.gameOverModal.close();
      this.gameOverModal = null;
    }
    this.hasContinued = false;
    stateManager.resetGame();
    this.startGameLoop();
  }

  private continueGame(): void {
    if (this.hasContinued || !this.specialPointsSystem) {
      return;
    }

    const consumed = this.consumeInventoryItem(ShopItemId.CONTINUE);
    if (!consumed) {
      return;
    }

    this.hasContinued = true;
    if (this.gameOverModal) {
      this.gameOverModal.close();
      this.gameOverModal = null;
    }

    this.applyContinueRecovery();
    stateManager.setState('status', GameStatus.PLAYING);
    stateManager.updateGame({ lives: 1 });
    this.gameLoop.start();
  }

  private seedInventorySlots(): void {
    const inventory = stateManager.getState().player.inventory ?? createEmptyInventory();
    const slotOrder: ShopItemId[] = [
      ShopItemId.PULSE,
      ShopItemId.TEMPO,
      ShopItemId.AEGIS,
      ShopItemId.SHIFT,
      ShopItemId.NOVA,
    ];

    for (const itemId of slotOrder) {
      const count = Math.max(0, inventory[itemId] ?? 0);
      for (let i = 0; i < count; i++) {
        if (!this.inventoryUI.addPowerUp(itemId)) {
          return;
        }
      }
    }
  }

  private applyStoredExtraLives(): void {
    const state = stateManager.getState();
    const inventory = state.player.inventory ?? createEmptyInventory();
    const available = Math.max(0, inventory[ShopItemId.EXTRA_LIFE] ?? 0);
    if (available === 0) return;

    const lifeRoom = Math.max(0, MAX_LIVES - state.game.lives);
    const toApply = Math.min(available, lifeRoom);
    if (toApply === 0) return;

    const nextInventory = {
      ...inventory,
      [ShopItemId.EXTRA_LIFE]: available - toApply,
    };

    stateManager.updateGame({ lives: state.game.lives + toApply });
    stateManager.updatePlayer({ inventory: nextInventory });

    if (state.player.id) {
      void appwriteClient.updateInventory(state.player.id, nextInventory);
    }
  }

  private applyContinueRecovery(): void {
    const maxRows = 8;
    const targetRows = Math.max(4, maxRows - 2);

    for (let i = 0; i < this.hex.blocks.length; i++) {
      const lane = this.hex.blocks[i];
      let active = lane.filter(block => block.deleted === 0).length;

      for (let j = lane.length - 1; j >= 0 && active > targetRows; j--) {
        if (lane[j].deleted === 0) {
          lane.splice(j, 1);
          active -= 1;
        }
      }
    }
  }

  /**
   * Handle window resize
   */
  public onResize(): void {
    if (this.canvas) {
      this.canvas.updateScale();
    }
  }

  public onMount(): void {
    this.element.classList.add('animate-fade-in');

    this.hasContinued = false;

    audioManager.playGameMusic();

    const uiState = stateManager.getState().ui;
    audioManager.setMusicMuted(uiState.isMusicMuted);
    audioManager.setSfxMuted(uiState.isSfxMuted);
    audioManager.setMusicVolume(uiState.musicVolume);
    audioManager.setSfxVolume(uiState.sfxVolume);
    
    // Set game status to playing
    stateManager.setState('status', GameStatus.PLAYING);
    
    this.initCanvas();
    this.startGameLoop();

    if (uiState.currentGameMode === 'dailyChallenge') {
      if (!this.dailyChallenge) {
        this.dailyChallenge = new DailyChallengeSystem();
      }
      
      // Show challenge preview modal
      const challenge = this.dailyChallenge.getCurrentChallenge();
      const streak = this.dailyChallenge.getStreak();
      if (challenge) {
        this.dailyChallengeModal = new DailyChallengeModal();
        this.dailyChallengeModal.showPreview(challenge, streak);
      }
      
      window.dispatchEvent(new CustomEvent('activateDailyChallenge'));
      const date = new Date().toISOString().slice(0, 10);
      this.challengeScript = getChallengeScriptForDate(date);
      if (this.challengeScript) {
        this.challengePhaseIndex = 0;
        this.challengeSpeedMultiplier = this.challengeScript.phases[0]?.speedMultiplier ?? 1;
        this.challengeSpawnMultiplier = this.challengeScript.phases[0]?.spawnMultiplier ?? 1;
        this.currentPhaseName = this.challengeScript.phases[0]?.name ?? 'Trial';
        stateManager.updateGame({ strategyPhase: this.currentPhaseName });
        this.applyWaveTuning();
        this.applyMutators(this.challengeScript.mutators);
      }
    } else if (uiState.currentGameMode === 'timerAttack') {
      const duration = uiState.timerDuration || 90;
      this.timerAttack = new TimerAttackMode(duration);
      this.currentPhaseName = this.timerAttack.getPhaseLabel();
      stateManager.updateGame({ strategyPhase: this.currentPhaseName });
      stateManager.updateGame({ timeOrbGoal: this.timerAttack.getRelayGoal() });
      window.dispatchEvent(new CustomEvent('activateTimerMode'));
      this.timeOrbSystem?.setEnabled(true);
      this.applyMutators([]);
    } else {
      this.applyMutators([]);
    }

    window.dispatchEvent(new CustomEvent('gameStart'));

    // Setup input manager
    const inputManager = getInputManager();
    inputManager.clearHandlers(); // Clear any existing handlers to prevent double rotation
    inputManager.setEnabled(true);
    inputManager.on('rotateLeft', (pressed) => {
      if (pressed && stateManager.getState().status === GameStatus.PLAYING) {
        // Original Hextris: only rotate hex, not falling blocks
        this.hex.rotate(1);
        window.dispatchEvent(new CustomEvent('hexRotated', { detail: { direction: 'left' } }));
      }
    });
    inputManager.on('rotateRight', (pressed) => {
      if (pressed && stateManager.getState().status === GameStatus.PLAYING) {
        // Original Hextris: only rotate hex, not falling blocks
        this.hex.rotate(-1);
        window.dispatchEvent(new CustomEvent('hexRotated', { detail: { direction: 'right' } }));
      }
    });
    inputManager.on('speedUp', (pressed) => {
      this.rushMultiplier = pressed ? 4 : 1;
    });
    inputManager.on('pause', (pressed) => {
      if (pressed) {
        if (this.gameLoop.getIsRunning()) {
          this.pauseGame();
        } else {
          this.resumeGame();
        }
      }
    });
    inputManager.on('powerSlot1', (pressed) => {
      if (pressed) {
        this.inventoryUI.usePowerUp(0);
      }
    });
    inputManager.on('powerSlot2', (pressed) => {
      if (pressed) {
        this.inventoryUI.usePowerUp(1);
      }
    });
    inputManager.on('powerSlot3', (pressed) => {
      if (pressed) {
        this.inventoryUI.usePowerUp(2);
      }
    });
    inputManager.on('restart', (pressed) => {
      if (!pressed) return;
      if (stateManager.getState().status === GameStatus.GAME_OVER) {
        this.playAgain();
      }
    });
    
    // Listen for game over event
    this.unsubscribeGameOver = stateManager.subscribe('gameOver', () => {
      this.handleGameOverSfx();
      this.showGameOver();
    });
    this.unsubscribeLivesChanged = stateManager.subscribe('livesChanged', (lives) => {
      if (typeof lives !== 'number') return;
      if (lives < this.lastLives) {
        this.handleLifeLostSfx();
      }
      this.lastLives = lives;
    });
    window.addEventListener('timerModeTimeUp', this.handleTimerModeTimeUp as EventListener);
    window.addEventListener('powerUpCollected', this.handlePowerUpCollectedSfx as EventListener);
    window.addEventListener('powerUpUsed', this.handlePowerUpUsedInventory as EventListener);
    window.addEventListener('powerUpEffect', this.handlePowerUpEffect as EventListener);
    window.addEventListener('powerUpCooldown', this.handlePowerUpCooldown as EventListener);
    window.addEventListener('blockLand', this.handleBlockLandSfx as EventListener);
  }

  public onUnmount(): void {
    // Stop game loop
    if (this.gameLoop) {
      this.gameLoop.stop();
    }
    
    // Disable input manager
    const inputManager = getInputManager();
    inputManager.setEnabled(false);
    inputManager.clearHandlers();

    // Remove event listeners
    window.removeEventListener('timerModeTimeUp', this.handleTimerModeTimeUp as EventListener);
    window.removeEventListener('powerUpCollected', this.handlePowerUpCollectedSfx as EventListener);
    window.removeEventListener('powerUpUsed', this.handlePowerUpUsedInventory as EventListener);
    window.removeEventListener('powerUpEffect', this.handlePowerUpEffect as EventListener);
    window.removeEventListener('powerUpCooldown', this.handlePowerUpCooldown as EventListener);
    window.removeEventListener('blockLand', this.handleBlockLandSfx as EventListener);

    this.clearSlowMoEffect();
    this.hideShieldEffect();
    this.hideNovaEffect();
    this.hideResonanceEffect();
    this.hideSyncEffect();
    if (this.hammerOverlay) {
      this.hammerOverlay.remove();
      this.hammerOverlay = null;
    }
    if (this.shiftOverlay) {
      this.shiftOverlay.remove();
      this.shiftOverlay = null;
    }
    if (this.hammerEffectTimeoutId) {
      window.clearTimeout(this.hammerEffectTimeoutId);
      this.hammerEffectTimeoutId = null;
    }

    if (this.slowMoTimeoutId) {
      window.clearTimeout(this.slowMoTimeoutId);
      this.slowMoTimeoutId = null;
    }
    if (this.shieldTimeoutId) {
      window.clearTimeout(this.shieldTimeoutId);
      this.shieldTimeoutId = null;
    }
    if (this.novaTimeoutId) {
      window.clearTimeout(this.novaTimeoutId);
      this.novaTimeoutId = null;
    }
    if (this.resonanceTimeoutId) {
      window.clearTimeout(this.resonanceTimeoutId);
      this.resonanceTimeoutId = null;
    }
    if (this.syncBoostTimeoutId) {
      window.clearTimeout(this.syncBoostTimeoutId);
      this.syncBoostTimeoutId = null;
    }
    if (this.invulnerabilityTimeoutId) {
      window.clearTimeout(this.invulnerabilityTimeoutId);
      this.invulnerabilityTimeoutId = null;
    }

    if (this.adaptiveAssistResetId) {
      window.clearTimeout(this.adaptiveAssistResetId);
      this.adaptiveAssistResetId = null;
    }
    this.adaptiveAssistActive = false;
    this.lifeLossTimestamps = [];
    this.activeDifficultyConfig = null;
    this.currentPhaseName = null;
    stateManager.updateGame({ surgeActive: false, tempoLevel: 0, strategyPhase: undefined });
    audioManager.setMusicIntensity(0.4);
    audioManager.setMusicTempoLevel(0);

    if (this.powerUpSystem) {
      this.powerUpSystem.destroy();
    }

    if (this.timerAttack) {
      this.timerAttack.deactivate();
      this.timerAttack = null;
    }

    if (this.timeOrbSystem) {
      this.timeOrbSystem.setEnabled(false);
      this.timeOrbSystem = null;
    }

    if (this.dailyChallenge) {
      this.dailyChallenge.deactivate();
      this.dailyChallenge = null;
    }

    // Clean up Daily Challenge modal
    if (this.dailyChallengeModal) {
      this.dailyChallengeModal.close();
      this.dailyChallengeModal = null;
    }

    // Clean up modals
    if (this.pauseModal) {
      this.pauseModal.destroy();
      this.pauseModal = null;
    }
    if (this.gameOverModal) {
      this.gameOverModal.destroy();
      this.gameOverModal = null;
    }

    if (this.shopModal) {
      this.shopModal.close();
      this.shopModal = null;
    }

    if (this.unsubscribeGameOver) {
      this.unsubscribeGameOver();
      this.unsubscribeGameOver = null;
    }

    if (this.unsubscribeLivesChanged) {
      this.unsubscribeLivesChanged();
      this.unsubscribeLivesChanged = null;
    }
  }

  private handleLifeLostSfx(): void {
    if (stateManager.getState().status !== GameStatus.PLAYING) return;
    audioManager.playSfx('lifeLost');
  }

  private consumeInventoryItem(itemId: ShopItemId): boolean {
    const state = stateManager.getState();
    const inventory = state.player.inventory ?? createEmptyInventory();
    const current = inventory[itemId] ?? 0;
    if (current <= 0) return false;

    const nextInventory = {
      ...inventory,
      [itemId]: current - 1,
    };

    stateManager.updatePlayer({ inventory: nextInventory });
    if (state.player.id) {
      void appwriteClient.updateInventory(state.player.id, nextInventory);
    }

    return true;
  }

  private getInventoryCount(itemId: ShopItemId): number {
    const inventory = stateManager.getState().player.inventory ?? createEmptyInventory();
    return inventory[itemId] ?? 0;
  }
}
