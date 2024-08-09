import { Layer, Map, Tile, TilePlacement } from "../utils/types/interfaces";
import { Coordinates, TilemapConfiguration } from "../utils/types/types";

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

  public get scaledTileSize() {
    return {
      width: this.tileConfig.width * this.scale,
      height: this.tileConfig.height * this.scale
    };
  };

  public checkCollision(x: number, y: number): boolean {
    let boundaryLayer = this.layers.find(boundary => boundary.collider);
    let isColliding = boundaryLayer?.tiles.some(tile => tile.x === x && tile.y === y);

    if(isColliding) return true;

    return false;
  };
  public get centreTilesPosition(): Coordinates {
    return {
      x: this.mapConfig.columns / 2,
      y: this.mapConfig.rows / 2
    };
  };
  public getCanvasPositionFromTilePosition(tilePosition: Coordinates): Coordinates {
    const tileX = (tilePosition.x - this.centreTilesPosition.x) * this.scaledTileSize.width + (this.scaledTileSize.width / 2);
    const tileY = (tilePosition.y - this.centreTilesPosition.y) * this.scaledTileSize.height + (this.scaledTileSize.height / 2);
    return {
      x: Math.floor(tileX),
      y: Math.floor(tileY)
    };
  }
  public getRandomTilePositionByLayer(layerName: string): Coordinates {
    const layer: Layer = this.layers.find(layer => layer.name === layerName) as Layer;

    const min = Math.ceil(0);
    const max = Math.floor(layer.tiles.length - 1);
    const randomIndex: number = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const randomTile: TilePlacement = layer.tiles[randomIndex];
    const { id, ...position } = randomTile;
    return position;
  };

  public render(destinationCanvas: CanvasRenderingContext2D) {
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