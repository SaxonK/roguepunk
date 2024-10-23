import { Action, AllActions, ActionStates, AnimationType, BaseCombatType, BaseMovementType, Coordinates } from "./types";

export interface ActionBinding {
  [key: string]: Action;
};
export interface AnimationData {
  active: boolean;
  spritesheet: HTMLImageElement;
  frames: Frame[];
};
export interface AnimationFrameDetails {
  spritesheet: HTMLImageElement;
  scale: 1 | -1;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};
export interface AnimationHandler {
  deathAnimationComplete: boolean;
  frame: AnimationFrameDetails;
  update: (entityPosition: Coordinates, stats: Stats, damaged: boolean, animation: AnimationType | null, animating: boolean) => void;
};
export interface AnimationState {
  current: {
    active: boolean;
    index: number;
    animation: AnimationType;
    animating: boolean;
    position: Coordinates;
    scale: 1 | -1;
  };
  previous: {
    animation: AnimationType;
    change: number;
    position: Coordinates;
    scale: 1 | -1;
  };
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
  name: string;
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
  setReachedTargetTime: () => void;
  update: (player: Player) => void;
  updateTargetPosition: (newTarget: Coordinates) => void;
};
export interface EnemyConfig extends Config {
  combat: BaseCombatType;
  movement: BaseMovementType;
};
export interface EnemyGameplayState extends EntityGameplayState {
  effects: StatusEffects[];
};
export interface EnemyState extends State {
  gameplay: EnemyGameplayState;
};
export interface EnemyStats extends Stats {
  experience: number;
};
export interface Entity {
  config: Config;
  dead: boolean;
  projectiles: Projectile[];
  projectilePool: ProjectilePool;
  stats: Stats;
  boundingBox: BoundingBox;
  render: (context: CanvasRenderingContext2D) => void;
  takeDamage: (damage: number) => void;
};
export interface EntityLifecycleState {
  alive: boolean;
  dying: boolean;
  dead: boolean;
};
export interface EntityGameplayState {
  hitpoints: number;
  position: {
    x: number;
    y: number;
  };
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
export interface Frame {
  frame: number;
  width: number;
  height: number;
  sx: number;
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
export interface LevelSystem {
  experience: number;
  experienceToNextLevel: number;
  level: number;
  addExperience: (experience: number) => void;
  reset: () => void;
  setStartingExperience: (experience: number) => void;
};
export interface Map {
  columns: number;
  rows: number;
};
export interface Player extends Entity {
  config: PlayerConfig;
  state: PlayerState;
  update: (collisionStates: ActionStates, activeActions: AllActions[], cursorPosition: Coordinates, enemies: Enemy[]) => void;
};
export interface PlayerConfig extends Config {
  combat: BaseCombatType;
};
export interface PlayerGameplayState extends EntityGameplayState {
  coins: number;
  experience: LevelSystem;
  items: Array<Item>;
  weapons: Array<Weapon>;
};
export interface PlayerState extends State {
  gameplay: PlayerGameplayState;
};
export interface Projectile {
  boundingBox: BoundingBox;
  expired: boolean;
  attack: (target: Player | Enemy) => void;
  update: (targetPosition: Coordinates) => void;
  render: (context: CanvasRenderingContext2D, offset: Coordinates) => void;
  reset: (config: ProjectileConfig) => void;
};
export interface ProjectileConfig extends Config {
  damage: number;
  pierce: number;
  range: number;
  speed: number;
};
export interface ProjectilePool {
  getProjectile: (config: ProjectileConfig, position: Coordinates, entityConfig: Config) => Projectile;
  returnProjectile: (projectile: Projectile) => void;
};
export interface ProjectileState {
  pierce: number;
  position: Coordinates;
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
  lifecycle: EntityLifecycleState;
  gameplay: EntityGameplayState;
};
export interface States {
  camera: Camera;
  enemies: Enemy[];
  player: Player;
  mouse: Coordinates;
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
  mouseCanvasPosition: Coordinates;
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