import { Player as PlayerInterface, PlayerState, Stats } from "../../utils/types/interfaces";
import { PlayerObject } from "../../utils/types/types";

class Player implements PlayerInterface {
  stats: Stats;
  state: PlayerState;

  constructor(player: PlayerObject) {
    this.stats = player.stats;
    this.state = player.state;
  };
  public update(): void {

  };
  public render(context: CanvasRenderingContext2D, cameraWidth: number, cameraHeight: number): void {
    const width = 32;
    const height = 32;

    const centerX = cameraWidth / 2;
    const centerY = cameraHeight / 2;
    
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