import { BoundingBox, Config, EventEmitter, Player as PlayerInterface, PlayerState, Stats } from "../../utils/types/interfaces";
import { actions, Action, ActionFunctions, AllActions, ActionStates, Events, PlayerObject } from "../../utils/types/types";
export default class Player implements PlayerInterface {
  actions: ActionFunctions;
  config: Config;
  stats: Stats;
  state: PlayerState;

  private eventEmitter: EventEmitter<Events>;

  constructor(player: PlayerObject, eventEmitter: EventEmitter<Events>) {
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
  private get horizontalOffset(): number {
    return this.config.width / 2;
  };
  private get verticalOffset(): number {
    return this.config.height / 2;
  };
  public get boundingBox(): BoundingBox {
    return {
      min: {
        x: this.state.position.x + this.config.offset.x,
        y: this.state.position.y + this.config.offset.y
      },
      max: {
        x: this.state.position.x + (this.state.position.x + this.horizontalOffset),
        y: this.state.position.y + (this.state.position.y + this.verticalOffset)
      }
    };
  };
  public takeDamage(damage: number): void {
    this.state.hitpoints -= damage;
    this.eventEmitter.emit('hitpointsChanged', this.state.hitpoints);
  };
  public update(collisionStates: ActionStates, activeActions: AllActions[]): void {
    activeActions.forEach(action => {
      if (this.actions[action] && !collisionStates[action as Action]) {
        this.actions[action]();
      }
    });
  };
  public render(context: CanvasRenderingContext2D): void {    
    this.config.offset.x = this.state.position.x - this.horizontalOffset;
    this.config.offset.y = this.state.position.y - this.verticalOffset;

    context.translate(
      this.config.offset.x,
      this.config.offset.y
    );

    context.fillStyle = '#FFFF00';
    context.fillRect(
      this.state.position.x,
      this.state.position.y,
      this.config.width,
      this.config.height
    );

    context.setTransform(1, 0, 0, 1, 0, 0);
  };
};