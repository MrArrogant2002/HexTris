/**
 * TimeOrb entity - collectible to extend timer attack duration.
 */

export interface TimeOrbOptions {
  lane: number;
  startDist: number;
  scale: number;
  speed?: number;
}

export class TimeOrb {
  public lane: number;
  public angle: number;
  public distFromHex: number;
  public speed: number;
  public size: number;
  public collected = false;
  public removed = false;
  public opacity = 1;
  private scale: number;
  private glowPhase = 0;

  constructor(options: TimeOrbOptions) {
    this.lane = options.lane;
    this.angle = 90 - (30 + 60 * options.lane);
    this.distFromHex = options.startDist;
    this.scale = options.scale;
    this.speed = options.speed ?? 1.2;
    this.size = 22 * options.scale;
  }

  public update(dt: number, hexRadius: number): void {
    if (this.collected || this.removed) {
      return;
    }

    this.distFromHex -= this.speed * dt * this.scale;
    this.glowPhase += dt * 5;

    if (this.distFromHex <= hexRadius + 10 * this.scale) {
      this.collected = true;
    }

    if (this.distFromHex < -40 * this.scale) {
      this.removed = true;
    }
  }

  public render(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
    if (this.collected || this.removed) {
      return;
    }

    const x = centerX + this.distFromHex * Math.cos(this.angle * (Math.PI / 180));
    const y = centerY + this.distFromHex * Math.sin(this.angle * (Math.PI / 180));
    const glow = 0.7 + Math.sin(this.glowPhase) * 0.3;

    ctx.save();
    ctx.globalAlpha = 0.25 * glow;
    ctx.fillStyle = '#9ad8ff';
    ctx.beginPath();
    ctx.arc(x, y, this.size * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#5ecbff';
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${this.size * 0.6}px "Exo 2", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+5', x, y);
    ctx.restore();
  }

  public shouldRemove(): boolean {
    return this.collected || this.removed;
  }
}
