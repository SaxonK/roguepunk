import { BoundingBox, Enemy, EventEmitter, Player as PlayerInterface, PlayerConfig, PlayerState, ProjectilePool, Stats } from "../../utils/types/interfaces";
import { actions, Action, ActionFunctions, AllActions, ActionStates, Events, PlayerObject, Coordinates } from "../../utils/types/types";
import Projectile from "../projectiles/projectile";
export default class Player implements PlayerInterface {
  actions: ActionFunctions;
  config: PlayerConfig;
  projectiles: Projectile[] = [];
  projectilePool: ProjectilePool;
  stats: Stats;
  state: PlayerState;

  private eventEmitter: EventEmitter<Events>;
  private lastAttack: number = 0;

  constructor(player: PlayerObject, eventEmitter: EventEmitter<Events>, projectilePool: ProjectilePool) {
    this.stats = player.stats;
    this.state = player.state;

    const actionObject = {} as ActionFunctions;
    actions.player.forEach(action => {
      actionObject[action] = this[action].bind(this);
    });
    this.actions = actionObject;
    this.config = player.config;

    this.config.offset.x = this.state.position.x - this.config.width / 2;
    this.config.offset.y = this.state.position.y - this.config.height / 2;

    this.eventEmitter = eventEmitter;
    this.projectilePool = projectilePool;
  };

  /* Getters */
  public get boundingBox(): BoundingBox {
    return {
      min: {
        x: this.state.position.x - this.horizontalOffset,
        y: this.state.position.y - this.verticalOffset
      },
      max: {
        x: this.state.position.x + this.horizontalOffset,
        y: this.state.position.y + this.verticalOffset
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
    this.state.hitpoints -= damage;
    this.eventEmitter.emit('hitpointsChanged', this.state.hitpoints);
  };
  public update(collisionStates: ActionStates, activeActions: AllActions[], cursorPosition: Coordinates, enemies: Enemy[]): void {
    this.move(collisionStates, activeActions);
    this.attack(enemies);
    this.updateProjectiles(cursorPosition, enemies);
  };
  public render(context: CanvasRenderingContext2D): void {  
    context.save();
    context.translate(
      -this.horizontalOffset,
      -this.verticalOffset
    );

    context.fillStyle = '#FFFF00';
    context.fillRect(
      this.state.position.x,
      this.state.position.y,
      this.config.width,
      this.config.height
    );
    context.fillStyle = '#000000';
    context.font = "8px serif";
    context.fillText(
      `${Math.floor(this.state.position.x)}, ${Math.floor(this.state.position.y)}`,
      this.state.position.x + 2,
      this.state.position.y + 10
    );
    context.fillRect(
      this.state.position.x + this.horizontalOffset - 2.5,
      this.state.position.y + this.verticalOffset - 2.5,
      5,
      5
    );

    context.restore();
  };

  /* Private Methods */
  private aabbIntersect(enemyBoundingBox: BoundingBox, range: number = 0): boolean {
    for (const [key] of Object.entries(this.state.position)) {
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
    this.state.position.y -= this.stats.speed;
  };
  private moveDown(): void {
    this.state.position.y += this.stats.speed;
  };
  private moveRight(): void {
    this.state.position.x += this.stats.speed;
  };
  private moveLeft(): void {
    this.state.position.x -= this.stats.speed;
  };
  private melee(enemies: Enemy[]): void {
    enemies.forEach(enemy => {
      if(this.aabbIntersect(enemy.boundingBox, this.stats.range)) {
        enemy.takeDamage(this.stats.damage);
      };
    });
  };
  private range(): void {
    const position = { x: this.state.position.x, y: this.state.position.y };
    const projectile = new Object(this.projectilePool.getProjectile({
      name: this.config.name,
      width: 8,
      height: 4,
      offset: {
        x: 0,
        y: 0
      },
      damage: this.stats.damage,
      pierce: 2,
      range: this.stats.range,
      speed: 10
    }, position, this.config)) as Projectile;
    this.projectiles.push(projectile);
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