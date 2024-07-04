import { Player as PlayerInterface, PlayerConfig, PlayerState, Stats } from "../../utils/types/interfaces";
import { actions, Action, ActionFunctions, AllActions, ActionStates, PlayerObject } from "../../utils/types/types";
export default class Player implements PlayerInterface {
  actions: ActionFunctions;
  config: PlayerConfig;
  stats: Stats;
  state: PlayerState;

  constructor(player: PlayerObject) {
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
  public get boundaryPositionTop(): number {
    return this.state.position.y + this.config.offset.y;
  };
  public get boundaryPositionBottom(): number {
    const bottomOffset = this.state.position.y + this.verticalOffset;
    return this.state.position.y + bottomOffset;
  };
  public get boundaryPositionLeft(): number {
    return this.state.position.x + this.config.offset.x;
  };
  public get boundaryPositionRight(): number {
    const rightOffset = this.state.position.x + this.horizontalOffset;
    return this.state.position.x + rightOffset;
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