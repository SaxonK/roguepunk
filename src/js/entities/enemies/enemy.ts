import { BoundingBox, Enemy as EnemyInterface, EnemyConfig, EnemyState, Player, EnemyStats } from "../../utils/types/interfaces";
import { Coordinates, EnemyObject } from "../../utils/types/types";

export default class Enemy implements EnemyInterface {
  config: EnemyConfig;
  stats: EnemyStats;
  state: EnemyState;

  private targetPosition: Coordinates;
  private lastAttackTime: EpochTimeStamp = 0;
  private playerInRange: boolean = false;
  private currentColor: string = '#FF8A80';

  constructor(enemy: EnemyObject, position: Coordinates, target: Coordinates = {x: 0, y: 0}) {
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
  public get hasReachTargetPosition(): boolean {
    const sameX = this.state.position.x === this.targetPosition.x ? true : false;
    const sameY = this.state.position.y === this.targetPosition.y ? true : false;
    return sameX && sameY ? true : false;
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
  public render(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.currentColor;
    context.fillRect(
      this.state.position.x,
      this.state.position.y,
      this.config.width,
      this.config.height
    );
  };
  public update(player: Player, tickInterval: number): void {
    this.isPlayerInRange = player;
    this.attack(player, tickInterval);
    switch(this.config.movement) {
      case 'target':
        this.target(player.state.position);
        break;
      case 'wander':
        this.wander();
        break;
    };
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
  private attack(player: Player, tickInterval: number): void {
    if(this.config.combat === 'melee'){
      const tickFireRate = tickInterval / this.stats.fireRate;
      const now = Date.now();
      const readyToAttack = Math.abs(now - this.lastAttackTime) >= tickFireRate ? true : false;

      if(readyToAttack && this.playerInRange) {
        player.takeDamage(this.stats.damage);
        this.lastAttackTime = Date.now();
      };
    }
  };
  private updatePosition(current: number, target: number, speed: number): number {
    if (current < target) {
      return current + speed;
    } else if (current > target) {
      return current - speed;
    }

    return current;
  };
  private target(playerPosition: Coordinates): void {
    if(!this.playerInRange) {
      this.state.position.x = this.updatePosition(this.state.position.x, (playerPosition.x * 2), this.stats.speed);
      this.state.position.y = this.updatePosition(this.state.position.y, (playerPosition.y * 2), this.stats.speed);
    }
  };
  private wander(): void {
    this.state.position.x = this.updatePosition(this.state.position.x, this.targetPosition.x, this.stats.speed);
    this.state.position.y = this.updatePosition(this.state.position.y, this.targetPosition.y, this.stats.speed);
  };
};