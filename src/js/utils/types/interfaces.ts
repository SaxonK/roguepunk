import { Action, AllActions, ActionStates, BaseCombatType, BaseMovementType, Coordinates } from "./types";

export interface ActionBinding {
  [key: string]: Action;
};
export interface BoundingBox {
  min: Coordinates,
  max: Coordinates
}
export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  offset: {
    x: number,
    y: number
  }
  update: (playerX: number, playerY: number) => void;
  render: (context: CanvasRenderingContext2D) => void;
  resize: (width: number, height: number) => void;
};
export interface Config {
  width: number;
  height: number;
  offset: {
    x: number;
    y: number;
  };
};
export interface ControlsManager {
  actionMapping: ActionBinding;
  actionState: ActionStates;
  setActionStateTrue: (key: string) => void;
  setActionStateFalse: (key: string) => void;
  activeUserActions: AllActions[];
};
export interface Cycle {
  frameCount: number;
  startTime: EpochTimeStamp;
  elapsedTime: number;
};
export interface Cycles {
  [key: string]: Cycle;
};
export interface Enemy extends Entity {
  config: EnemyConfig;
  hasReachTargetPosition: boolean;
  state: EnemyState;
  stats: EnemyStats;
  update: (player: Player, tickInterval: number) => void;
  updateTargetPosition: (newTarget: Coordinates) => void;
};
export interface EnemyConfig extends Config {
  combat: BaseCombatType;
  movement: BaseMovementType;
};
export interface EnemyState extends State {
  effects: StatusEffects[];
};
export interface EnemyStats extends Stats {
  experience: number;
};
export interface Entity {
  config: Config;
  stats: Stats;
  boundingBox: BoundingBox;
  render: (context: CanvasRenderingContext2D) => void;
};
export interface EventEmitter<Events extends Record<string, any>> {
  on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void;
  off<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
};
export interface FpsManager {
  displayFramerate: boolean;
  TargetFramerate: number;
  calculateFPS: (timestamp: EpochTimeStamp) => void;
  render: (context: CanvasRenderingContext2D, width: number) => void;
  toggleFramerateDisplay: () => void;
};
export interface InterfaceStates {
  [key: string]: boolean | Record<string, boolean>[];
};
export interface Item {
  id: number;
  type: string;
  stats: Stats;
};
export interface Layer {
  name: string;
  tiles: Array<TilePlacement>;
  collider: boolean;
};
export interface Map {
  columns: number;
  rows: number;
};
export interface Player extends Entity {
  state: PlayerState;
  takeDamage: (damage: number) => void;
  update: (collisionStates: ActionStates, activeActions: AllActions[]) => void;
};
export interface PlayerState extends State {
  coins: number;
  experience: number;
  items: Array<Item>;
  weapons: Array<Weapon>;
  render: () => void;
  update: () => void;
};
export interface StatElementDetailed {
  stat: string;
  displayName: string;
  baseValue: number;
  currentValue: number;
  element: HTMLDivElement;
  update: (value: number) => void;
};
export interface StatElementExperience {
  stat: string;
  experience: number;
  experienceForNextLevel: number;
  element: HTMLDivElement;
  update: (value: number) => void;
};
export interface StatElementLevel {
  stat: string;
  level: number;
  element: HTMLDivElement;
  update: (value: number) => void;
};
export interface StatElementWrapper {
  stat: string;
  element: HTMLDivElement;
};
export interface State {
  hitpoints: number;
  position: {
    x: number;
    y: number;
  };
};
export interface States {
  camera: Camera;
  enemies: Enemy[];
  player: Player;
};
export interface Stats {
  damage: number;
  fireRate: number;
  hitpoints: number;
  range: number;
  resilience: number;
  speed: number;
};
export interface StatusEffects {
  damage: number;
  duration: number;
  name: string;
  startTime: Date;
};
export interface Scope {
  viewport: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  fps: FpsManager;
  animationFrameId: number;
  state: States;
};
export interface Tile {
  width: number;
  height: number;
};
export interface Tilemap {
  name: string;
  map: Map;
  spritesheet: HTMLImageElement;
  tile: Tile;
  tileCount: number;
  layers: Array<Layer>;
  getCanvasPositionFromTilePosition: (tilePosition: Coordinates) => Coordinates;
  getRandomTilePositionByLayer: (layerName: string) => Coordinates;
};
export interface TilePlacement {
  id: string;
  x: number;
  y: number;
};
export interface Weapon {
  id: number;
  type: string;
  stats: Object;
};