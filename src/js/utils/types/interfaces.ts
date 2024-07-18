import { Action, AllActions, ActionStates } from "./types";

export interface ActionBinding {
  [key: string]: Action;
};
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
export interface Entity {
  id: number;
  stats: Stats;
  state: State;
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
export interface Player {
  config: PlayerConfig;
  stats: Stats;
  state: PlayerState;
  boundaryPositionTop: number;
  boundaryPositionBottom: number;
  boundaryPositionLeft: number;
  boundaryPositionRight: number;
  render: (context: CanvasRenderingContext2D) => void;
  update: (collisionStates: ActionStates, activeActions: AllActions[]) => void;
};
export interface PlayerConfig {
  width: number;
  height: number;
  offset: {
    x: number;
    y: number;
  };
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
  baseValue: number;
  currentValue: number;
  element: HTMLDivElement;
};
export interface StatElementExperience {
  stat: string;
  experience: number;
  experienceForNextLevel: number;
  element: HTMLDivElement;
};
export interface StatElementLevel {
  stat: string;
  level: number;
  element: HTMLDivElement;
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
  entities: Array<Entity>;
  player: Player;
};
export interface Stats {
  damage: number;
  fireRate: number;
  hitpoints: number;
  resilience: number;
  speed: number;
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