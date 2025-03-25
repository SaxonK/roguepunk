import { ActionBinding, AllActions, ActionStates, AnimationType, BaseCombatType, BaseMovementType, CharacterBoundingBoxByEntity, CollisionStates, Coordinates, EntityType, EntityTypeCharactersByEntity, EntityTypeCharacterCodes, Hotspots, SceneTypes, WeaponStats, WeaponTypes, WorldTypes } from "./types";

export interface AnimationData {
  active: boolean;
  initialised: boolean;
  spritesheet: HTMLImageElement;
  frames: Frame[];
};
export interface IAnimationEntityState {
  alive: boolean;
  animation: IEntityAnimationState;
  attacking: boolean;
  damaged: boolean;
  position: Coordinates;
};
export interface AnimationFrameDetails {
  spritesheet: HTMLImageElement;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};
export interface IEntityAnimationHandler {
  initialised: boolean;
  getCharactersByEntity: <Entity extends EntityType>(entity: Entity) => EntityTypeCharactersByEntity<Entity>[];
  getCharacterBoundingBoxByEntity: <Entity extends EntityType>(entity: Entity) => Promise<CharacterBoundingBoxByEntity<Entity>>;
  getFrame: (animation: AnimationType, entityName: EntityTypeCharacterCodes, index: number) => AnimationFrameDetails;
  reloadLibrary: (scale: number, world: WorldTypes) => Promise<void>;
  update: (entityName: EntityTypeCharacterCodes, state: IAnimationEntityState, stats: Stats) => IEntityAnimationState;
};
export interface AnimationHandler {
  deathAnimationComplete: boolean;
  frame: AnimationFrameDetails;
  initialised: boolean;
  update: (entityPosition: Coordinates, stats: Stats, damaged: boolean, animation: AnimationType | null, animating: boolean) => void;
};
export interface IEntityAnimationState {
  current: {
    active: boolean;
    index: number;
    animation: AnimationType;
    animating: boolean;
    scale: 1 | -1;
  };
  previous: {
    animation: AnimationType;
    change: number;
    position: Coordinates;
    scale: 1 | -1;
  };
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
  name: EntityTypeCharacterCodes;
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
  isRepeatableByKey: (key: string) => boolean | undefined;
  resetActionStates: () => void;
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
export interface IDimension {
  width: number;
  height: number;
};
export interface Enemy extends Entity {
  attacking: boolean;
  config: EnemyConfig;
  hasReachTargetPosition: boolean;
  state: EnemyState;
  stats: EnemyStats;
  reset: (config: EnemyConfig, state: EnemyState) => void;
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
export interface IEnemyPool {
  getEnemyByCharacter: (character: EntityTypeCharactersByEntity<'enemy'>, position: Coordinates, target: Coordinates) => Enemy;
  returnEnemy: (enemy: Enemy) => void;
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
  damaged: boolean;
  stats: Stats;
  boundingBox: BoundingBox;
  debug: (context: CanvasRenderingContext2D) => void;
  render: (context: CanvasRenderingContext2D, frameDetails: AnimationFrameDetails) => void;
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
export interface IHotspot {
  interaction: Layer[];
  world: Layer[];
};
export interface IInteractionState {
  active: boolean;
  type: Hotspots | '';
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
  position: Coordinates;
  state: PlayerState;
  resetAnimationState: () => void;
  update: (collisionStates: CollisionStates, activeActions: AllActions[], enemies: Enemy[], combat: boolean) => void;
};
export interface PlayerConfig extends Config {
  combat: BaseCombatType;
};
export interface PlayerGameplayState extends EntityGameplayState {
  coins: number;
  experience: LevelSystem;
  items: Array<Item>;
  weapons: Array<IWeapon>;
};
export interface PlayerState extends State {
  gameplay: PlayerGameplayState;
};
export interface IProjectile {
  angle: number;
  creation: EpochTimeStamp;
  duration: number;
  expired: boolean;
  pierce: number;
  position: Coordinates;
};
export interface IProjectilePool {
  getProjectile: (startingPosition: Coordinates, targetPosition: Coordinates) => IProjectile;
  returnProjectile: (projectile: IProjectile) => void;
};
export interface ProjectileState {
  pierce: number;
  position: Coordinates;
};
export interface IScenes {
  background: HTMLImageElement;
  foreground: HTMLImageElement;
  debug: HTMLImageElement;
};
export interface Scope {
  viewport: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  controlsManager: ControlsManager;
  fps: FpsManager;
  animationFrameId: number;
  state: States;
  mouseCanvasPosition: Coordinates;
  debugToggle: () => void;
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
export interface TimerElement {
  stat: string;
  element: HTMLDivElement;
  update: (value: EpochTimeStamp) => void;
};
export interface State {
  animation: IEntityAnimationState;
  lifecycle: EntityLifecycleState;
  gameplay: EntityGameplayState;
};
export interface States {
  camera: Camera;
  mouse: Coordinates;
  world: IWorld;
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
  tilemaps: IScenes;
  checkHotspotInRange: (position: Coordinates, range: number) => IInteractionState;
  getCollisionStates: (boundingBox: BoundingBox, movementSpeed: number) => CollisionStates;
  getCanvasPositionFromTilePosition: (tilePosition: Coordinates) => Coordinates;
  getHotspotName: (position: Coordinates, range: number) => string;
  getLayerByName: (layerName: string) => Layer | void;
  getTilePositionFromCanvasPosition: (canvasPosition: Coordinates) => Coordinates;
  getRandomTilePositionByLayer: (layerName: string) => Coordinates;
  // getRandomTilePositionByPosition: (position: Coordinates) => Coordinates;
  render: (context: CanvasRenderingContext2D, scene: SceneTypes) => void;
};
export interface TilePlacement {
  id: string;
  x: number;
  y: number;
};
export interface IWeapon {
  name: string;
  desciption: string;
  level: number;
  stats: WeaponStats;
  type: WeaponTypes;
  effects: [];
  weight: number;
  active: boolean;
  projectiles: IProjectile[];
  lastFireTime: EpochTimeStamp;
  // fire: (projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates) => void;
  // update: (projectilePool: IProjectilePool, position: Coordinates) => void;
};
export interface IWeaponsManager {
  readonly activeWeaponList: IWeapon[];
  readonly availableWeapons: IWeapon[];
  activateWeapon: (weaponName: string) => void;
  levelUpWeapon: (weaponName: string) => void;
  getWeaponsByRandomAmount: () => IWeapon[];
  reset: () => void;
};
export interface IWorld {
  name: string;
  time: number;
  combat: boolean;
  hud: boolean;
  multipliers: {
    time: number;
    movement: number;
    gold: number;
    experience: number;
    enemies: number;
    "enemy-health": number;
  };
  state: IWorldStates;
  "additional-effects": {
    [key: string]: boolean;
  };
  render: (context: CanvasRenderingContext2D, cameraOffset: Coordinates, debug: boolean) => void;
  update: (activeActions: AllActions[]) => void;
};
export interface IWorldState {
  interaction: {
    active: boolean;
    type: Hotspots | '';
  };
  spawning: boolean;
};
export interface IWorldStates {
  enemies: Enemy[];
  player: Player;
  tilemap: Tilemap;
  world: IWorldState;
};