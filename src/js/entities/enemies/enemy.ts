import { AnimationFrameDetails, AnimationHandler, BoundingBox, Enemy as EnemyInterface, EnemyConfig, EnemyState, Player, EnemyStats, EventEmitter, ProjectilePool } from "../../utils/types/interfaces";
import { AnimationType, BaseMovementType, Coordinates, EnemyObject, Events } from "../../utils/types/types";
import Projectile from "../projectiles/projectile";
export default class Enemy implements EnemyInterface {
  config: EnemyConfig;
  projectiles: Projectile[] = [];
  projectilePool: ProjectilePool;
  stats: EnemyStats;
  state: EnemyState;

  private animationHandler: AnimationHandler;
  private damaged: boolean = false;
  private eventEmitter: EventEmitter<Events>;
  private targetPosition: Coordinates;
  private lastAttack: number = 0;
  private lastDamage: number = 0;
  private playerInRange: boolean = false;
  private attackAnimation = false;
  private reachedTargetTime: number = 0;

  constructor(
    enemy: EnemyObject, 
    animationHandler: AnimationHandler,
    position: Coordinates, 
    eventEmitter: EventEmitter<Events>,
    projectilePool: ProjectilePool,
    target: Coordinates = {x: 0, y: 0}
  ) {
    this.config = enemy.config;
    this.eventEmitter = eventEmitter;
    this.stats = enemy.stats;
    this.state = enemy.state;
    this.state.gameplay.position = position;
    this.config.combat = enemy.config.combat;
    this.config.movement = enemy.config.movement;
    this.targetPosition = target;
    
    this.animationHandler = animationHandler;
    this.projectilePool = projectilePool;
  };

  /* Getters */
  public get boundingBox(): BoundingBox {
    return {
      min: {
        x: this.state.gameplay.position.x,
        y: this.state.gameplay.position.y
      },
      max: {
        x: this.state.gameplay.position.x + this.config.width,
        y: this.state.gameplay.position.y + this.config.height
      }
    };
  };
  public get dead(): boolean {
    return this.state.gameplay.hitpoints <= 0 ? true : false;
  };
  private get attackIntervalInMilliseconds(): number {
    return 1000 / this.stats.fireRate;
  };
  private get timeSinceLastAttack(): number {
    return window.performance.now() - this.lastAttack;
  };
  private get timeSinceReachedTarget(): number {
    return window.performance.now() - this.reachedTargetTime;
  };
  public get hasReachTargetPosition(): boolean {
    const sameX = this.state.gameplay.position.x === this.targetPosition.x ? true : false;
    const sameY = this.state.gameplay.position.y === this.targetPosition.y ? true : false;
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
  };
  private set newTargetPosition(newTarget: Coordinates) {
    this.targetPosition = newTarget;
  };

  /* Public Methods */
  public takeDamage(damage: number): void {
    this.state.gameplay.hitpoints -= damage;
    this.damaged = true;
    this.lastDamage = window.performance.now();
    if(this.dead) {
      this.eventEmitter.emit('playerGainExperience', this.stats.experience);  
    };
  };
  public setReachedTargetTime(): void {
    this.reachedTargetTime = window.performance.now();
  };
  public render(context: CanvasRenderingContext2D): void {
    this.config.offset.x = this.state.gameplay.position.x - this.horizontalOffset;
    this.config.offset.y = this.state.gameplay.position.y - this.verticalOffset;

    let frameDetails: AnimationFrameDetails = this.animationHandler.frame;

    /* Flip image if moving left */
    if (frameDetails.scale === -1) {
      context.save();
      context.translate(this.state.gameplay.position.x + frameDetails.sw / 2, this.state.gameplay.position.y + frameDetails.sh / 2); 
      context.scale(frameDetails.scale, 1);
      context.drawImage(
        frameDetails.spritesheet,
        frameDetails.sx,
        frameDetails.sy,
        frameDetails.sw,
        frameDetails.sh,
        -frameDetails.sw / 2,
        -frameDetails.sh / 2,
        frameDetails.sw,
        frameDetails.sh
      );
      context.restore();
    } else {
      context.drawImage(
        frameDetails.spritesheet,
        frameDetails.sx,
        frameDetails.sy,
        frameDetails.sw,
        frameDetails.sh,
        this.state.gameplay.position.x,
        this.state.gameplay.position.y,
        frameDetails.sw,
        frameDetails.sh
      );
    };

    context.strokeStyle = '#FFFFFF';
    context.fillStyle = '#FFFFFF';
    // context.strokeRect(this.state.position.x, this.state.position.y, this.config.width, this.config.height);

    /* Canvas Co-ordinates */
    context.font = "8px serif";
    context.fillText(
      `${Math.floor(this.state.gameplay.position.x)}, ${Math.floor(this.state.gameplay.position.y)}`,
      this.state.gameplay.position.x + 2,
      this.state.gameplay.position.y + 10
    );

    /* Entity Centre */
    context.fillRect(
      this.state.gameplay.position.x + this.horizontalOffset - 2.5,
      this.state.gameplay.position.y + this.verticalOffset - 2.5,
      5,
      5
    );
  };
  public update(player: Player): void {
    if(this.state.lifecycle.alive) {
      this.isPlayerInRange = player;
      this.attack(player);
      this.movement(this.config.movement, player.state.gameplay.position);
      this.resetDamageState();
    }
    if(!this.state.lifecycle.dead) {
      let animation: AnimationType | null = null;
      let animating: boolean = false;

      if(this.state.lifecycle.alive && this.playerInRange) { animation = 'attack'; animating = true; };
      if(this.state.lifecycle.dying) { animation = 'death'; animating = true; };

      this.animationHandler.update(this.state.gameplay.position, this.stats, this.damaged, animation, animating);
      this.config.width = this.animationHandler.frame.sw;
      this.config.height = this.animationHandler.frame.sh;
    };
    this.updateProjectiles(player.state.gameplay.position, player);
    this.lifecycleTransition();
  };
  public updateTargetPosition(newTarget: Coordinates): void {
    this.newTargetPosition = newTarget;
  };

  /* Private Methods */
  private aabbIntersect(playerBoundingBox: BoundingBox, range: number = 0): boolean {
    for (const [key] of Object.entries(this.state.gameplay.position)) {
      if(this.boundingBox.min[key as keyof Coordinates] - range > playerBoundingBox.max[key as keyof Coordinates]) return false;
      if(this.boundingBox.max[key as keyof Coordinates] + range < playerBoundingBox.min[key as keyof Coordinates]) return false;
    };

    return true;
  };
  private attack(player: Player): void {
    if(this.timeSinceLastAttack < this.attackIntervalInMilliseconds) return;
    if(this.playerInRange) this.attackAnimation = true;

    if(this.config.combat === 'melee'){
      this.melee(player);
      this.lastAttack = window.performance.now();
    } else if(this.config.combat === 'range') {
      this.range();
      this.lastAttack = window.performance.now();
    };
  };
  private lifecycleTransition(): void {
    switch(true){
      case this.state.lifecycle.alive && !this.state.lifecycle.dying && this.dead:
        this.state.lifecycle.alive = false;
        this.state.lifecycle.dying = true;
        break;
      case this.state.lifecycle.dying && this.animationHandler.deathAnimationComplete:
        this.state.lifecycle.dying = false;
        this.state.lifecycle.dead = true;
        break;
      default:
        break;
    };
  };
  private melee(player: Player): void {
    if(this.playerInRange) {
      player.takeDamage(this.stats.damage);
      this.attackAnimation = true;
    };
    if(!this.playerInRange && this.attackAnimation) {
      this.attackAnimation = false;
    }
  };
  private range(): void {
    const position = { x: this.state.gameplay.position.x, y: this.state.gameplay.position.y };
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
  private resetDamageState(): void {
    if(window.performance.now() - this.lastDamage >= 500) {
      this.damaged = false;
    };
  };
  private target(playerPosition: Coordinates): void {
    if(!this.playerInRange) {
      this.state.gameplay.position.x = this.updatePosition(this.state.gameplay.position.x, playerPosition.x, this.stats.speed);
      this.state.gameplay.position.y = this.updatePosition(this.state.gameplay.position.y, playerPosition.y, this.stats.speed);
    }
  };
  private wander(): void {
    if(this.timeSinceReachedTarget >= 2500) {
      this.state.gameplay.position.x = this.updatePosition(this.state.gameplay.position.x, this.targetPosition.x, this.stats.speed);
      this.state.gameplay.position.y = this.updatePosition(this.state.gameplay.position.y, this.targetPosition.y, this.stats.speed);
    };
  };
};