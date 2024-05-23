import { Player as PlayerInterface, PlayerState, Stats } from "../../utils/types/interfaces";
import { actions, ActionFunctions, PlayerObject } from "../../utils/types/types";
import { controlsManager } from "../../core/controls/controlsManager";
class Player implements PlayerInterface {
  actions: ActionFunctions;
  stats: Stats;
  state: PlayerState;

  constructor(player: PlayerObject) {
    this.stats = player.stats;
    this.state = player.state;

    const actionObject = {} as ActionFunctions;
    actions.forEach(action => {
      if (typeof (this as any)[action] === 'function') {
        actionObject[action] = this[action].bind(this);
      } else {
        console.warn(`Action ${action} is not a function on Player`);
      }
    });
    this.actions = actionObject;
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
  public update(): void {
    controlsManager.activeUserActions.forEach(action => {
      if (this.actions[action]) {
        this.actions[action]();
      }
    });
    console.log(this.state.position);
  };
  public render(context: CanvasRenderingContext2D): void {
    const width = 32;
    const height = 32;
    
    const offsetX = this.state.position.x - width / 2;
    const offsetY = this.state.position.y - height / 2;

    context.translate(offsetX, offsetY);

    context.fillStyle = '#FFFF00';
    context.fillRect(
      this.state.position.x,
      this.state.position.y,
      width,
      height
    );

    context.setTransform(1, 0, 0, 1, 0, 0);
  };
};

export default Player;