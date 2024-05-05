export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  update: (playerX: number, playerY: number) => void;
  render: (context: CanvasRenderingContext2D) => void;
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
export interface Item {
  id: number;
  type: string;
  stats: Stats;
};
export interface Player {
  stats: Stats;
  state: PlayerState;
  render: (context: CanvasRenderingContext2D, cameraWidth: number, cameraHeight: number) => void;
  update: () => void;
};
export interface PlayerState extends State {
  coins: number;
  items: Array<Item>;
  weapons: Array<Weapon>;
  render: () => void;
  update: () => void;
}
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
export interface Weapon {
  id: number;
  type: string;
  stats: Object;
};