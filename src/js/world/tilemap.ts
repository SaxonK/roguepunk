import { BoundingBox, IInteractionState, Layer, Map, IScenes, Tile, Tilemap as ITilemap, TilePlacement } from "../utils/types/interfaces";
import { CollisionStates, Coordinates, OTilemap, SceneTypes } from "../utils/types/types";

export default class Tilemap implements ITilemap {
  private scale: number = 2;
  public readonly name: string;
  public readonly map: Map;
  public readonly spritesheet: HTMLImageElement;
  public readonly tile: Tile;
  public readonly tileCount: number;
  public readonly layers: Array<Layer>;
  public readonly tilemaps: IScenes;

  constructor(configuration: OTilemap, spritesheet: string) {
    this.name = configuration.name;
    this.map = configuration.map;
    this.spritesheet = new Image();
    this.spritesheet.src = spritesheet;
    this.tile = configuration.tile;
    this.tileCount = (this.spritesheet.width / this.tile.width) * (this.spritesheet.height / this.tile.height);
    this.layers = configuration.layers.slice().reverse();
    this.tilemaps = {
      background: new Image(),
      foreground: new Image(),
      debug: new Image()
    };

    this.spritesheet.onload = () => {
      const tilemapCanvas = document.createElement('canvas') as HTMLCanvasElement;
      tilemapCanvas.width = (this.tile.width * this.scale) * this.map.columns;
      tilemapCanvas.height = (this.tile.height * this.scale) * this.map.rows;
      const context = tilemapCanvas.getContext('2d') as CanvasRenderingContext2D;

      this.generateTilemapByScene(context, 'background');
      this.tilemaps.background.src = tilemapCanvas.toDataURL();

      context.clearRect(0,0, tilemapCanvas.width, tilemapCanvas.height);

      this.generateTilemapByScene(context, 'foreground');
      this.tilemaps.foreground.src = tilemapCanvas.toDataURL();

      context.clearRect(0,0, tilemapCanvas.width, tilemapCanvas.height);

      this.generateTilemapByScene(context, 'debug');
      this.tilemaps.debug.src = tilemapCanvas.toDataURL();
    };
  };

  /* Getters */
  public get centreTilesPosition(): Coordinates {
    return {
      x: Math.floor(this.map.columns / 2),
      y: Math.floor(this.map.rows / 2)
    };
  };
  public get centreTilesPositionOffset(): Coordinates {
    return {
      x: (this.map.columns / 2) % 1,
      y: (this.map.rows / 2) % 1
    };
  };
  public get scaledTileSize() {
    return {
      width: this.tile.width * this.scale,
      height: this.tile.height * this.scale
    };
  };

  /* Public Methods */
  public checkHotspotInRange(position: Coordinates, range: number): IInteractionState {
    const tilePosition = this.getTilePositionFromCanvasPosition(position);
    const hotspots = this.layers.filter(layer => layer.name.startsWith('hotspot'));
    const activeHotspot = hotspots.filter(hotspot => {
      return hotspot.tiles.some(tile => Math.abs(tile.x - tilePosition.x) <= range && Math.abs(tile.y - tilePosition.y) <= range);
    });

    return activeHotspot.length > 0 ? { active: true, type: 'world' } : { active: false, type: '' };
  };
  public getCollisionStates(boundingBox: BoundingBox, movementSpeed: number): CollisionStates {
    const collisionStates: CollisionStates = {
      moveUp: false,
      moveDown: false,
      moveLeft: false,
      moveRight: false
    };

    Object.keys(collisionStates).forEach(movement => {
      const type = movement.split('move')[1].toLowerCase();
      switch(type) {
        case 'up':
          collisionStates[movement as keyof CollisionStates] = this.checkCollisionByMultipleCanvasPositions(
            'y',
            [{ x: boundingBox.max.x, y: boundingBox.max.y }, { x: boundingBox.min.x, y: boundingBox.max.y }],
            movementSpeed,
            ['negative','negative']
          );
          break;
        case 'down':
          collisionStates[movement as keyof CollisionStates] = this.checkCollisionByMultipleCanvasPositions(
            'y',
            [{ x: boundingBox.max.x, y: boundingBox.max.y }, { x: boundingBox.min.x, y: boundingBox.max.y }],
            movementSpeed,
            ['positive','positive']
          );
          break;
        case 'left':
          collisionStates[movement as keyof CollisionStates] = this.checkCollisionByCanvasPosition(
            'x',
            { x: boundingBox.min.x, y: boundingBox.max.y },
            movementSpeed,
            'negative'
          );
          break;
        case 'right':
          collisionStates[movement as keyof CollisionStates] = this.checkCollisionByCanvasPosition(
            'x',
            { x: boundingBox.max.x, y: boundingBox.max.y },
            movementSpeed,
            'positive'
          )
          break;
      };
    });
    
    return collisionStates;
  };
  public getCanvasPositionFromTilePosition(tilePosition: Coordinates): Coordinates {
    const tileX = (tilePosition.x - this.centreTilesPosition.x) * this.scaledTileSize.width;
    const tileY = (tilePosition.y - this.centreTilesPosition.y) * this.scaledTileSize.height;
    return {
      x: Math.floor(tileX),
      y: Math.floor(tileY)
    };
  };
  public getHotspotName(position: Coordinates, range: number): string {
    const tilePosition = this.getTilePositionFromCanvasPosition(position);
    const hotspots = this.layers.filter(layer => layer.name.startsWith('hotspot'));
    const activeHotspot = hotspots.find(hotspot => {
      return hotspot.tiles.some(tile => Math.abs(tile.x - tilePosition.x) <= range && Math.abs(tile.y - tilePosition.y) <= range);
    });

    return activeHotspot ? activeHotspot.name.split('_')[1] : '';
  };
  public getLayerByName(layerName: string): Layer | void {
    if(this.layers.some(layer => layer.name === layerName)) {
      return this.layers.find(layer => layer.name === layerName) as Layer;
    } else {
      console.error(`The layer '${layerName}' does not exist in the tilemap ${this.name}.`);
    };
  };
  public getTilePositionFromCanvasPosition(canvasPosition: Coordinates): Coordinates {
    const tileX = Math.floor((canvasPosition.x / this.scaledTileSize.width) + this.centreTilesPositionOffset.x) + this.centreTilesPosition.x;
    const tileY = Math.floor((canvasPosition.y / this.scaledTileSize.height) + this.centreTilesPositionOffset.y) + this.centreTilesPosition.y;
    return {
      x: tileX,
      y: tileY
    };
  };
  public getRandomTilePositionByLayer(layerName: string): Coordinates {
    const layer: Layer = this.layers.find(layer => layer.name === layerName) as Layer;

    const min: number = Math.ceil(0);
    const max: number = Math.floor(layer.tiles.length - 1);
    const randomIndex: number = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const randomTile: TilePlacement = layer.tiles[randomIndex];
    const { id, ...position } = randomTile;
    return { ...position };
  };

  public render(context: CanvasRenderingContext2D, scene: SceneTypes): void {
    const width = this.tilemaps[scene].width / 2;
    const height = this.tilemaps[scene].height / 2;
    context.drawImage(this.tilemaps[scene], -Math.abs(width), -Math.abs(height));
  };

  /* Private Methods */
  private checkCollisionByMultipleCanvasPositions(axis: 'x' | 'y', positions: Coordinates[], pixels: number, sign: ('positive' | 'negative')[]): boolean {
    let isColliding: boolean = false;
    let collisions: boolean[] = [];
    positions.forEach((position, index) => {
      collisions.push(this.checkCollisionByCanvasPosition(axis, position, pixels, sign[index]));
    });
    if(collisions.includes(true)) isColliding = true;

    return isColliding;
  };
  private checkCollisionByCanvasPosition(axis: 'x' | 'y', position: Coordinates, pixels: number, sign: 'positive' | 'negative'): boolean {
    let isColliding: boolean = false;
    const margin: number = sign === 'negative' ? -pixels : +pixels;
    const canvasPosition: Coordinates = { x: position.x, y: position.y };
    canvasPosition[axis] += margin;
    const tilePosition: Coordinates = this.getTilePositionFromCanvasPosition(canvasPosition);
    
    if(this.checkCollisionByTile(tilePosition)) isColliding = true;
    // if(Math.abs(position[axis] - tileCanvasPosition[axis]) <= pixels) isColliding = true;

    return isColliding;
  };
  private checkCollisionByTile(tilePosition: Coordinates): boolean {
    const boundaryLayers = this.layers.filter(layer => layer.collider);
    let isColliding = false;
    boundaryLayers?.forEach(layer => {
      if(layer.tiles.some(tile => tile.x === tilePosition.x && tile.y === tilePosition.y)) isColliding = true;
    });

    return isColliding;
  };
  private generateTilemapByScene(context: CanvasRenderingContext2D, scene: SceneTypes): void {
    const spritesheetCols = this.spritesheet.width / this.tile.width;
    const spritesheetRows = this.spritesheet.height / this.tile.height;

    // Pre-calculate sprite positions
    const spritePositions: { [id: string]: { col: number; row: number } } = {};
    for (let i = 0; i < spritesheetCols * spritesheetRows; i++) {
      const col = i % spritesheetCols;
      const row = Math.floor(i / spritesheetCols);
      spritePositions[i.toString()] = { col, row };
    };

    if(scene === 'debug') {
      this.layers.forEach(layer => {
        layer.tiles.forEach(tile => {
          context.font = "8px serif";
          context.fillStyle = '#00FFFF';
          context.fillText(
            `${tile.x},${tile.y}`,
            tile.x * (this.tile.width * this.scale) + 1,
            tile.y * (this.tile.height * this.scale) + 11
          );
        });
      });
    } else {
      const layers = this.layers.filter(layer => scene === 'foreground' ? layer.name.includes('foreground') : !layer.name.includes('foreground'));
      layers.forEach(layer => {
        layer.tiles.forEach(tile => {
          const tilePosition = spritePositions[tile.id];
          const tilePositionCol = tilePosition.col;
          const tilePositionRow = tilePosition.row;
  
          context.drawImage(
            this.spritesheet,
            tilePositionCol * this.tile.width,
            tilePositionRow * this.tile.height,
            this.tile.width - 1,
            this.tile.height - 1,
            tile.x * (this.tile.width * this.scale),
            tile.y * (this.tile.height * this.scale),
            this.tile.width * this.scale,
            this.tile.height * this.scale
          );
        });
      });
    };
  };
};