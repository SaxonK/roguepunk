import { AnimationFrameDetails, AnimationHandler, BoundingBox, Enemy, EventEmitter, Player as PlayerInterface, PlayerConfig, PlayerState, ProjectilePool, Stats } from "../../utils/types/interfaces";
import { actions, Action, ActionFunctions, AllActions, ActionStates, Events, PlayerObject, Coordinates } from "../../utils/types/types";
import Projectile from "../projectiles/projectile";
export default class Player implements PlayerInterface {
  actions: ActionFunctions;
  config: PlayerConfig;
  projectiles: Projectile[] = [];
  projectilePool: ProjectilePool;
  stats: Stats;
  state: PlayerState;

  private animationHandler: AnimationHandler;
  private damaged: boolean = false;
  private eventEmitter: EventEmitter<Events>;
  private lastAttack: number = 0;
  private lastDamage: number = 0;

  constructor(
    player: PlayerObject,
    animationHandler: AnimationHandler,
    eventEmitter: EventEmitter<Events>,
    projectilePool: ProjectilePool
  ) {
    this.stats = player.stats;
    this.state = player.state;

    const actionObject = {} as ActionFunctions;
    actions.player.forEach(action => {
      actionObject[action] = this[action].bind(this);
    });
    this.actions = actionObject;
    this.config = player.config;

    this.config.offset.x = this.state.gameplay.position.x - this.config.width / 2;
    this.config.offset.y = this.state.gameplay.position.y - this.config.height / 2;

    this.animationHandler = animationHandler;
    this.eventEmitter = eventEmitter;
    this.projectilePool = projectilePool;
  };

  /* Getters */
  public get boundingBox(): BoundingBox {
    return {
      min: {
        x: this.state.gameplay.position.x - this.horizontalOffset,
        y: this.state.gameplay.position.y - this.verticalOffset
      },
      max: {
        x: this.state.gameplay.position.x + this.horizontalOffset,
        y: this.state.gameplay.position.y + this.verticalOffset
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
  private get horizontalOffset(): number {
    return this.config.width / 2;
  };
  private get verticalOffset(): number {
    return this.config.height / 2;
  };

  /* Public Methods */
  public attack(enemies: Enemy[]): void {
    if(this.timeSinceLastAttack < this.attackIntervalInMilliseconds) return;
    if(this.config.combat === 'melee'){
      this.melee(enemies);
      this.lastAttack = window.performance.now();
    } else if(this.config.combat === 'range') {
      this.range();
      this.lastAttack = window.performance.now();
    }
  };
  public takeDamage(damage: number): void {
    this.state.gameplay.hitpoints -= damage;
    this.eventEmitter.emit('hitpointsChanged', this.state.gameplay.hitpoints);
    this.damaged = true;
    this.lastDamage = window.performance.now();
  };
  public update(collisionStates: ActionStates, activeActions: AllActions[], cursorPosition: Coordinates, enemies: Enemy[]): void {
    this.move(collisionStates, activeActions);
    this.attack(enemies);
    this.updateProjectiles(cursorPosition, enemies);
    this.resetDamageState();
    this.animationHandler.update(this.state.gameplay.position, this.stats, this.damaged, null, this.state.lifecycle.dying);
    this.config.width = this.animationHandler.frame.sw;
    this.config.height = this.animationHandler.frame.sh;
  };
  public render(context: CanvasRenderingContext2D): void {  
    context.save();
    try{
      context.translate(
        -this.horizontalOffset,
        -this.verticalOffset
      );

      let frameDetails: AnimationFrameDetails = this.animationHandler.frame;
      
      if(frameDetails) {
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
        context.font = "8px serif";
        context.strokeRect(this.state.gameplay.position.x, this.state.gameplay.position.y, this.config.width, this.config.height);
        context.fillRect(
          this.state.gameplay.position.x + this.horizontalOffset - 2.5,
          this.state.gameplay.position.y + this.verticalOffset - 2.5,
          5,
          5
        );
        /* context.fillText(
          `${Math.floor(this.state.position.x)}, ${Math.floor(this.state.position.y)}`,
          this.state.position.x + 2,
          this.state.position.y + 10
        ); */
      };
    } catch(error) {
      if (error instanceof Error) {
        console.error(`Error while rendering player: ${error.message}`);
        console.error(`Stack trace:`, error.stack);
      } else {
        console.error('An unknown error occurred.');
      };

      context.fillStyle = '#FFFF00';
      context.fillRect(
        this.state.gameplay.position.x,
        this.state.gameplay.position.y,
        this.config.width,
        this.config.height
      );
    };
    context.restore();
  };

  /* Private Methods */
  private aabbIntersect(enemyBoundingBox: BoundingBox, range: number = 0): boolean {
    for (const [key] of Object.entries(this.state.gameplay.position)) {
      if(this.boundingBox.min[key as keyof Coordinates] - range > enemyBoundingBox.max[key as keyof Coordinates]) return false;
      if(this.boundingBox.max[key as keyof Coordinates] + range < enemyBoundingBox.min[key as keyof Coordinates]) return false;
    };

    return true;
  }
  private move(collisionStates: ActionStates, activeActions: AllActions[]): void {
    activeActions.forEach(action => {
      if (this.actions[action] && !collisionStates[action as Action]) {
        this.actions[action]();
      }
    });
  };
  private moveUp(): void {
    this.state.gameplay.position.y -= this.stats.speed;
  };
  private moveDown(): void {
    this.state.gameplay.position.y += this.stats.speed;
  };
  private moveRight(): void {
    this.state.gameplay.position.x += this.stats.speed;
  };
  private moveLeft(): void {
    this.state.gameplay.position.x -= this.stats.speed;
  };
  private melee(enemies: Enemy[]): void {
    enemies.forEach(enemy => {
      if(this.aabbIntersect(enemy.boundingBox, this.stats.range)) {
        enemy.takeDamage(this.stats.damage);
      };
    });
  };
  private range(): void {
    const position = { x: this.state.gameplay.position.x, y: this.state.gameplay.position.y };
    const projectile = new Object(this.projectilePool.getProjectile({
      name: this.config.name,
      width: 8,
      height: 4,
      offset: {
        x: 0,
        y: 0
      },
      damage: this.stats.damage,
      pierce: 1,
      range: this.stats.range,
      speed: 10
    }, position, this.config)) as Projectile;
    this.projectiles.push(projectile);
  };
  private resetDamageState(): void {
    if(window.performance.now() - this.lastDamage >= 500) {
      this.damaged = false;
    };
  };
  private updateProjectiles(cursorPosition: Coordinates, enemies: Enemy[]): void {
    if(this.projectiles.length > 0) {
      this.projectiles = this.projectiles.filter(projectile => {
        if (projectile.expired) {
          this.projectilePool.returnProjectile(projectile);
          return false;
        }
        projectile.update(cursorPosition);
        enemies.forEach(enemy => {
          projectile.attack(enemy);
        });
        return true;
      });
    };
  };
};