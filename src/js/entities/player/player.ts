import { Player as PlayerInterface, PlayerState, Stats } from "../../utils/types/interfaces";
import { PlayerObject } from "../../utils/types/types";

class Player implements PlayerInterface {
  stats: Stats;
  state: PlayerState;

  constructor(player: PlayerObject) {
    this.stats = player.stats;
    this.state = player.state;
  };
  update(): void {

  };
  render(context: CanvasRenderingContext2D, viewportWidth: number, viewportHeight: number): void {
    const width = 10;
    const height = 10;

    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    const offsetX = centerX - this.state.position.x - width / 2;
    const offsetY = centerY - this.state.position.y - height / 2;

    context.translate(offsetX, offsetY);

    context.fillStyle = '#40d870';
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