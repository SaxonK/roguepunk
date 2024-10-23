import { BoundingBox, Config, Enemy, Projectile as IProjectile, Player, ProjectileConfig, ProjectileState } from "../../utils/types/interfaces";
import { Coordinates } from "../../utils/types/types";

export default class Projectile implements IProjectile {
  private angle: number | undefined = undefined;
  private config: ProjectileConfig;
  private entityConfig: Config;
  private startPosition: Coordinates;
  private state: ProjectileState;
  private targetInRange: boolean = false;
  private graphic: HTMLImageElement = new Image();

  constructor(config: ProjectileConfig, position: Coordinates, entityConfig: Config) {
    const coordinate = { x: position.x, y: position.y };
    this.config = config;
    this.entityConfig = entityConfig;
    this.state = {
      pierce: 0,
      position: coordinate
    };
    this.startPosition = coordinate;

    this.graphic.src = `./src/assets/images/entities/misc/bullet.png`;

    this.graphic.onload = () => {
      this.config.width = this.graphic.width;
      this.config.height = this.graphic.height;
    };
  };

  /* Getters */
  public get boundingBox(): BoundingBox {
    return {
      min: {
        x: this.state.position.x,
        y: this.state.position.y
      },
      max: {
        x: this.state.position.x + this.config.width * Math.cos(this.rotateAngle),
        y: this.state.position.y + this.config.width * Math.sin(this.rotateAngle)
      }
    };
  };
  private get maxTravelDistance(): number {
    return (16 * 3) * this.config.range;
  };
  private get currentPositionOffset(): Coordinates {
    return {
      x: this.state.position.x + (this.entityConfig.width / 2),
      y: this.state.position.y + (this.entityConfig.height / 2),
    };
  };
  private get rotateAngle(): number {
    return this.angle !== undefined ? this.angle : 0;
  };

  public get distanceTraveled(): number {
    const x = (this.startPosition.x - this.state.position.x);
    const y = (this.startPosition.y - this.state.position.y);
    const squareX = x * x;
    const squareY = y * y;
    const distance = Math.sqrt(squareX + squareY);

    return Math.floor(distance);
  };
  public get expired(): boolean {
    let isExpired = false;
    const distance = this.distanceTraveled;
    if(distance >= this.maxTravelDistance || this.state.pierce >= this.config.pierce) {
      isExpired = true;
    }
    return isExpired;
  };

  /* Setters */
  public set configure(config: ProjectileConfig) {
    this.config = config;
  };
  public set EntityConfigure(entityConfig: Config) {
    this.entityConfig = entityConfig;
  };
  private set isTargetInRange(target: Player | Enemy) {
    const inRange = this.aabbIntersect(target.boundingBox) ? true : false;
    this.targetInRange = inRange;
  };
  public set startingPosition(position: Coordinates) {
    this.startPosition = { x: position.x, y: position.y };
    this.state.position = { x: position.x, y: position.y };
  };

  /* Public Methods */
  public attack(target: Player | Enemy): void {
    this.isTargetInRange = target;
    if(this.targetInRange){
      target.takeDamage(this.config.damage);
      this.state.pierce += 1;
    }
  };
  public update(targetPosition: Coordinates): void {
    if(this.angle === undefined) this.angle = this.calculateAngle(targetPosition);
    
    this.state.position.x += this.config.speed * Math.cos(this.angle);
    this.state.position.y += this.config.speed * Math.sin(this.angle);
  };

  public render(context: CanvasRenderingContext2D, offset: Coordinates = {x: 0, y: 0}): void {
    this.config.offset = offset;
    const entityName = this.config.name.split('-');
    context.save();
    if(entityName[0] === 'player') context.translate(offset.x, offset.y);

    context.moveTo(this.currentPositionOffset.x, this.currentPositionOffset.y);
    context.drawImage(
      this.graphic,
      this.currentPositionOffset.x,
      this.currentPositionOffset.y,
      this.graphic.width,
      this.graphic.height
    );
    
    /* 
      context.fillStyle = '#fff';
      context.font = "12px serif";
      context.fillText(
        `${Math.floor(this.state.position.x)}, ${Math.floor(this.state.position.y)}`,
        this.state.position.x + 2,
        this.state.position.y + 10
      ); 
    */

    context.restore();
  };

  public reset(config: ProjectileConfig): void {
    const coordinate = { x: 0, y: 0 };

    this.angle = undefined;
    this.config.damage = config.damage;
    this.config = config;
    this.startPosition = coordinate;
    this.state = {
      pierce: 0,
      position: coordinate
    };
    this.targetInRange = false;
  };

  /* Private Methods */
  private aabbIntersect(targetBoundingBox: BoundingBox, range: number = 0): boolean {
    for (const [key] of Object.entries(this.state.position)) {
      if(this.boundingBox.min[key as keyof Coordinates] - range > targetBoundingBox.max[key as keyof Coordinates]) return false;
      if(this.boundingBox.max[key as keyof Coordinates] + range < targetBoundingBox.min[key as keyof Coordinates]) return false;
    };

    return true;
  };
  private calculateAngle(targetPosition: Coordinates): number {
    const dx = targetPosition.x - this.state.position.x;
    const dy = targetPosition.y - this.state.position.y;
    
    let theta = Math.atan2(dy, dx);

    return theta;
  };
};