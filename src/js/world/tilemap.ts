import { Layer, Map, Tile } from "../utils/types/interfaces";
import { TilemapConfiguration } from "../utils/types/types";

class Tilemap {
  private scale: number = 3;
  public readonly name: string;
  public readonly mapConfig: Map;
  public readonly spritesheet: HTMLImageElement;
  public readonly tileConfig: Tile;
  public readonly tileCount: number;
  public readonly layers: Array<Layer>;
  public readonly tilemap: HTMLImageElement;

  constructor(configuration: TilemapConfiguration, spritesheet: string) {
    this.name = configuration.name;
    this.mapConfig = configuration.map;
    this.spritesheet = new Image();
    this.spritesheet.src = spritesheet;
    this.tileConfig = configuration.tile;
    this.tileCount = (this.spritesheet.width / this.tileConfig.width) * (this.spritesheet.height / this.tileConfig.height);
    this.layers = configuration.layers;
    this.tilemap = new Image();

    this.spritesheet.onload = () => {
      const tilemapCanvas = document.createElement('canvas') as HTMLCanvasElement;
      tilemapCanvas.width = (this.tileConfig.width * this.scale) * this.mapConfig.columns;
      tilemapCanvas.height = (this.tileConfig.height * this.scale) * this.mapConfig.rows;
      const context = tilemapCanvas.getContext('2d') as CanvasRenderingContext2D;

      this.generateTilemap(context);
      this.tilemap.src = tilemapCanvas.toDataURL();
    };
  };

  render(destinationCanvas: CanvasRenderingContext2D) {
    const width = this.tilemap.width / 2;
    const height = this.tilemap.height / 2;
    destinationCanvas.drawImage(this.tilemap, -Math.abs(width), -Math.abs(height));
  };

  private generateTilemap(context: CanvasRenderingContext2D): void {
    const spritesheetCols = this.spritesheet.width / this.tileConfig.width;
    const spritesheetRows = this.spritesheet.height / this.tileConfig.height;

    // Pre-calculate sprite positions
    const spritePositions: { [id: string]: { col: number; row: number } } = {};
    for (let i = 0; i < spritesheetCols * spritesheetRows; i++) {
      const col = i % spritesheetCols;
      const row = Math.floor(i / spritesheetCols);
      spritePositions[i.toString()] = { col, row };
    };

    // Group tiles by sprite ID
    const tilesBySpriteId: { [id: string]: { x: number; y: number }[] } = {};
    this.layers.forEach(layer => {
      layer.tiles.forEach(tile => {
        const spriteId = tile.id.toString();
        if (!tilesBySpriteId[spriteId]) {
            tilesBySpriteId[spriteId] = [];
        }
        tilesBySpriteId[spriteId].push({ x: tile.x, y: tile.y });
      });
    });

    // Draw tiles batch by batch
    Object.keys(tilesBySpriteId).forEach(spriteId => {
      const spritePosition = spritePositions[spriteId];
      const spritesheetCol = spritePosition.col;
      const spritesheetRow = spritePosition.row;
      const tiles = tilesBySpriteId[spriteId];
      tiles.forEach(tile => {
        context.drawImage(
          this.spritesheet,
          spritesheetCol * this.tileConfig.width,
          spritesheetRow * this.tileConfig.height,
          this.tileConfig.width,
          this.tileConfig.height,
          tile.x * (this.tileConfig.width * this.scale),
          tile.y * (this.tileConfig.height * this.scale),
          this.tileConfig.width * this.scale,
          this.tileConfig.height * this.scale
        );
      });
    });
  };
};

export default Tilemap;