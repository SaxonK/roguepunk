import { Camera as cameraInterface } from "../../utils/types/interfaces";

class Camera implements cameraInterface {
  x: number;
  y: number;
  width: number;
  height: number;
  offset: {
    x: number,
    y: number
  };

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.offset = {
      x: 1.5,
      y: 2
    };
  };

  public update(playerX: number, playerY: number): void {
    this.x = playerX * this.offset.x;
    this.y = playerY * this.offset.y;
  };
  public render(context: CanvasRenderingContext2D): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    const offsetX = centerX - this.x - this.width / 2;
    const offsetY = centerY - this.y - this.height / 2;

    context.translate(offsetX, offsetY);

    context.strokeStyle = 'rgb(255 0 255 / 50%)';
    context.strokeRect(
      this.x,
      this.y,
      this.width,
      this.height
    );

    context.setTransform(1, 0, 0, 1, -1 * this.x, -1 * this.y);
  };
};

export default Camera;