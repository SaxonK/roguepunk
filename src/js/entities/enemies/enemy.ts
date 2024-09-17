import { BoundingBox, Enemy as EnemyInterface, EnemyConfig, EnemyState, Player, EnemyStats, ProjectilePool } from "../../utils/types/interfaces";
import { BaseMovementType, Coordinates, EnemyObject } from "../../utils/types/types";
import Projectile from "../projectiles/projectile";
export default class Enemy implements EnemyInterface {
  config: EnemyConfig;
  projectiles: Projectile[] = [];
  projectilePool: ProjectilePool;
  stats: EnemyStats;
  state: EnemyState;

  private targetPosition: Coordinates;
  private lastAttack: number = 0;
  private playerInRange: boolean = false;
  private currentColor: string = '#FF8A80';

  constructor(enemy: EnemyObject, position: Coordinates, target: Coordinates = {x: 0, y: 0}, projectilePool: ProjectilePool) {
    this.config = enemy.config;
    this.stats = enemy.stats;
    this.state = {
      effects: enemy.state.effects,
      hitpoints: enemy.state.hitpoints,
      position: {
        x: position.x,
        y: position.y
      }
    };
    this.config.combat = enemy.config.combat;
    this.config.movement = enemy.config.movement;
    this.targetPosition = target;
    
    this.projectilePool = projectilePool;
  };

  /* Getters */
  public get boundingBox(): BoundingBox {
    return {
      min: {
        x: this.state.position.x,
        y: this.state.position.y
      },
      max: {
        x: this.state.position.x + this.config.width,
        y: this.state.position.y + this.config.height
      }
    };
  };
  public get dead(): boolean {
    return this.state.hitpoints <= 0 ? true : false;
  };
  private get attackIntervalInMilliseconds(): number {
    return 1000 / this.stats.fireRate;
  };
  private get timeSinceLastAttack(): number {
    return window.performance.now() - this.lastAttack;
  };
  public get hasReachTargetPosition(): boolean {
    const sameX = this.state.position.x === this.targetPosition.x ? true : false;
    const sameY = this.state.position.y === this.targetPosition.y ? true : false;
    return sameX && sameY ? true : false;
  };
  
  private get horizontalOffset(): number {
    return this.config.width / 2;
  };
  private get verticalOffset(): number {
    return this.config.height / 2;
  };

  /* Setters */
  private set isPlayerInRange(player: Player) {
    const inRange = this.aabbIntersect(player.boundingBox, this.stats.range) ? true : false;
    this.playerInRange = inRange;
    this.currentColor = inRange ? '#FF0000' : '#FF8A80';
  };
  private set newTargetPosition(newTarget: Coordinates) {
    this.targetPosition = newTarget;
  };

  /* Public Methods */
  public takeDamage(damage: number): void {
    this.state.hitpoints -= damage;
    // this.eventEmitter.emit('hitpointsChanged', this.state.hitpoints);
  };
  public render(context: CanvasRenderingContext2D): void {
    this.config.offset.x = this.state.position.x - this.horizontalOffset;
    this.config.offset.y = this.state.position.y - this.verticalOffset;

    context.fillStyle = this.currentColor;
    context.fillRect(
      this.state.position.x,
      this.state.position.y,
      this.config.width,
      this.config.height
    );

    /* Canvas Co-ordinates */
    context.fillStyle = '#000000';
    context.font = "8px serif";
    context.fillText(
      `${Math.floor(this.state.position.x)}, ${Math.floor(this.state.position.y)}`,
      this.state.position.x + 2,
      this.state.position.y + 10
    );

    /* Entity Centre */
    context.fillRect(
      this.state.position.x + this.horizontalOffset - 2.5,
      this.state.position.y + this.verticalOffset - 2.5,
      5,
      5
    );
  };
  public update(player: Player): void {
    this.isPlayerInRange = player;
    this.attack(player);
    this.movement(this.config.movement, player.state.position);
    this.updateProjectiles(player.state.position, player);
  };
  public updateTargetPosition(newTarget: Coordinates): void {
    this.newTargetPosition = newTarget;
  };

  /* Private Methods */
  private aabbIntersect(playerBoundingBox: BoundingBox, range: number = 0): boolean {
    for (const [key] of Object.entries(this.state.position)) {
      if(this.boundingBox.min[key as keyof Coordinates] - range > playerBoundingBox.max[key as keyof Coordinates]) return false;
      if(this.boundingBox.max[key as keyof Coordinates] + range < playerBoundingBox.min[key as keyof Coordinates]) return false;
    };

    return true;
  };
  private attack(player: Player): void {
    if(this.timeSinceLastAttack < this.attackIntervalInMilliseconds) return;
    if(this.config.combat === 'melee'){
      this.melee(player);
      this.lastAttack = window.performance.now();
    } else if(this.config.combat === 'range') {
      this.range();
      this.lastAttack = window.performance.now();
    };
  };
  private melee(player: Player): void {
    if(this.playerInRange) {
      player.takeDamage(this.stats.damage);
    };
  };
  private range(): void {
    const position = { x: this.state.position.x, y: this.state.position.y };
    const projectile = new Object(this.projectilePool.getProjectile({
      name: this.config.name,
      width: 12,
      height: 6,
      offset: {
        x: 0,
        y: 0
      },
      damage: this.stats.damage,
      pierce: 1,
      range: this.stats.range,
      speed: this.stats.speed
    }, position, this.config)) as Projectile;
    this.projectiles.push(projectile);
  };
  private updatePosition(current: number, target: number, speed: number): number {
    if (current < target) {
      return current + speed;
    } else if (current > target) {
      return current - speed;
    }

    return current;
  };
  private updateProjectiles(targetPosition: Coordinates, player: Player): void {
    if(this.projectiles.length > 0) {
      this.projectiles = this.projectiles.filter(projectile => {
        if (projectile.expired) {
          this.projectilePool.returnProjectile(projectile);
          return false;
        }
        projectile.update(targetPosition);
        projectile.attack(player);
        return true;
      });
    };
  };
  private movement(movementType: BaseMovementType, playerPosition: Coordinates): void {
    switch(movementType) {
      case 'target':
        this.target(playerPosition);
        break;
      case 'wander':
        this.wander();
        break;
      default:
        break;
    };
  };
  private target(playerPosition: Coordinates): void {
    if(!this.playerInRange) {
      this.state.position.x = this.updatePosition(this.state.position.x, playerPosition.x, this.stats.speed);
      this.state.position.y = this.updatePosition(this.state.position.y, playerPosition.y, this.stats.speed);
    }
  };
  private wander(): void {
    this.state.position.x = this.updatePosition(this.state.position.x, this.targetPosition.x, this.stats.speed);
    this.state.position.y = this.updatePosition(this.state.position.y, this.targetPosition.y, this.stats.speed);
  };
};