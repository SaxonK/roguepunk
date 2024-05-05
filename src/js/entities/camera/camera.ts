import { Camera as cameraInterface } from "../../utils/types/interfaces";

class Camera implements cameraInterface {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
  };

  public update(playerX: number, playerY: number): void {
    this.x = playerX - this.width / 2;
    this.y = playerY - this.height / 2;
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

    context.setTransform(1, 0, 0, 1, 0, 0);
  };
};

export default Camera;