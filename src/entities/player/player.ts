import { AnimationFrameDetails, BoundingBox, Enemy, EventEmitter, Player as PlayerInterface, PlayerConfig, PlayerState, Stats } from "../../utils/types/interfaces";
import { actions, ActionFunctions, ActionMovement, AllActions, CollisionStates, Events, PlayerObject, Coordinates } from "../../utils/types/types";
export default class Player implements PlayerInterface {
  actions: ActionFunctions;
  config: PlayerConfig;
  damaged: boolean = false;
  stats: Stats;
  state: PlayerState;

  private eventEmitter: EventEmitter<Events>;
  private lastAttack: number = 0;
  private lastDamage: number = 0;

  constructor(
    player: PlayerObject,
    eventEmitter: EventEmitter<Events>
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

    this.eventEmitter = eventEmitter;
  };

  /* Getters */
  public get boundingBox(): BoundingBox {
    return {
      min: {
        x: Math.floor(this.state.gameplay.position.x - this.horizontalOffset),
        y: Math.floor(this.state.gameplay.position.y - this.verticalOffset)
      },
      max: {
        x: Math.floor(this.state.gameplay.position.x + this.horizontalOffset),
        y: Math.floor(this.state.gameplay.position.y + this.verticalOffset)
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

  /* Setters */
  public set position(position: Coordinates) {
    const coordinates = { x: position.x, y: position.y };
    this.state.gameplay.position = coordinates;
  };

  /* Public Methods */
  public attack(enemies: Enemy[]): void {
    if(this.timeSinceLastAttack < this.attackIntervalInMilliseconds) return;
    if(this.config.combat === 'melee'){
      this.melee(enemies);
      this.lastAttack = window.performance.now();
    } else if(this.config.combat === 'range') {
      this.lastAttack = window.performance.now();
    }
  };
  public takeDamage(damage: number): void {
    this.state.gameplay.hitpoints -= damage;
    this.eventEmitter.emit('hitpointsChanged', this.state.gameplay.hitpoints);
    this.eventEmitter.emit('hudUpdateValue', { name: 'hitpoints', arrayValue: [], numValue: this.state.gameplay.hitpoints, maxValue: this.stats.hitpoints, stringValue: '', booleanValue: false, updateType: 'replace' });
    this.damaged = true;
    this.lastDamage = window.performance.now();
  };
  public update(
    collisionStates: CollisionStates,
    activeActions: AllActions[],
    enemies: Enemy[],
    combat: boolean
  ): void {
    this.move(collisionStates, activeActions);
    if(combat) {
      this.attack(enemies);
      this.resetDamageState();
    }
    // this.animationHandler.update(this.state.gameplay.position, this.stats, this.damaged, null, this.state.lifecycle.dying);
  };
  public debug(context: CanvasRenderingContext2D): void {
    /* Center Point */
    context.strokeStyle = '#FFFFFF';
    context.fillStyle = '#FFFFFF';
    context.font = "8px serif";
    context.strokeRect(this.state.gameplay.position.x - this.horizontalOffset, this.state.gameplay.position.y - this.verticalOffset, this.config.width, this.config.height);
    context.fillRect(
      this.state.gameplay.position.x - 2.5,
      this.state.gameplay.position.y - 2.5,
      5,
      5
    );
    context.fillText(
      `${Math.floor(this.state.gameplay.position.x)}, ${Math.floor(this.state.gameplay.position.y)}`,
      this.state.gameplay.position.x - (this.horizontalOffset / 2),
      this.state.gameplay.position.y - 10
    );

    /* Bounding Box Points */
    this.renderPositionPoints(context, { x: this.boundingBox.min.x, y: this.boundingBox.min.y }, 'top', '#FFFFFF');
    this.renderPositionPoints(context, { x: this.boundingBox.max.x, y: this.boundingBox.min.y }, 'top', '#FFFFFF');
    this.renderPositionPoints(context, { x: this.boundingBox.min.x, y: this.boundingBox.max.y }, 'bottom', '#FFFFFF');
    this.renderPositionPoints(context, { x: this.boundingBox.max.x, y: this.boundingBox.max.y }, 'bottom', '#FFFFFF');
  };
  public render(context: CanvasRenderingContext2D, frameDetails: AnimationFrameDetails): void {  
    context.save();
    try {      
      if(frameDetails) {
        /* Flip image if moving left */
        if (this.state.animation.current.scale === -1) {
          context.save();
            context.translate(this.state.gameplay.position.x - this.horizontalOffset + frameDetails.sw / 2 , this.state.gameplay.position.y - this.verticalOffset + frameDetails.sh / 2); 
            context.scale(this.state.animation.current.scale, 1);
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
            this.state.gameplay.position.x - this.horizontalOffset,
            this.state.gameplay.position.y - this.verticalOffset,
            frameDetails.sw,
            frameDetails.sh
          );
        };
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
  public resetAnimationState(): void {
    this.state.animation = {
      current: {
        active: true,
        index: 0,
        animation: 'idle',
        animating: false,
        scale: 1
      },
      previous: {
        animation: 'idle',
        change: 0,
        position: this.state.gameplay.position,
        scale: 1
      }
    };
  };

  /* Private Methods */
  private renderPositionPoints(context: CanvasRenderingContext2D, position: Coordinates, textPosition: 'top' | 'bottom', color: string): void {
    const verticalAlign = textPosition === 'top' ? -8: 11;
    context.fillStyle = color;
    context.font = "8px serif";
    context.fillRect(
      position.x - 2.5,
      position.y - 2.5,
      5,
      5
    );
    context.fillText(
      `${Math.floor(position.x)}, ${Math.floor(position.y)}`,
      position.x - 2.5,
      position.y + verticalAlign
    );
  };

  private aabbIntersect(enemyBoundingBox: BoundingBox, range: number = 0): boolean {
    for (const [key] of Object.entries(this.state.gameplay.position)) {
      if(this.boundingBox.min[key as keyof Coordinates] - range > enemyBoundingBox.max[key as keyof Coordinates]) return false;
      if(this.boundingBox.max[key as keyof Coordinates] + range < enemyBoundingBox.min[key as keyof Coordinates]) return false;
    };

    return true;
  }
  private move(collisionStates: CollisionStates, activeActions: AllActions[]): void {
    activeActions.forEach(action => {
      if (this.actions[action] && !collisionStates[action as ActionMovement]) {
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
  private resetDamageState(): void {
    if(window.performance.now() - this.lastDamage >= 500) {
      this.damaged = false;
    };
  };
};