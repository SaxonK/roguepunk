import { ProjectileConfig } from "../../utils/types/interfaces";

export default class Projectile {
  public x: number;
  public y: number;
  private velocityX: number;
  private velocityY: number;
  private config: ProjectileConfig;

  constructor(config: ProjectileConfig) {
    this.config = config;
    this.x = 0;
    this.y = 0;
    this.velocityX = 0;
    this.velocityY = 0;
  };

  public update(): void {
    this.x += this.velocityX;
    this.y += this.velocityY;
  };

  public render(context: CanvasRenderingContext2D): void {
    context.fillStyle = 'red';
    context.fillRect(this.x, this.y, this.config.width, this.config.height);
  };

  public reset(x: number, y: number, angle: number): void {
    this.x = x;
    this.y = y;
    this.velocityX = this.config.speed * Math.cos(angle);
    this.velocityY = this.config.speed * Math.sin(angle);
  };
};