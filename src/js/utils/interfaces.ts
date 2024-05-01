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
  type: string;
  stats: Object;
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
  stats: Object;
};
export interface Player {
  damage: number;
  hitpoints: number;
  weapons: Array<Weapon>;
  items: Array<Item>;
};
export interface State {
  coins?: number;
  hitpoints: number;
  position: {
    x: number;
    y: number;
  };
  speed: number;
  render: () => void;
  update: () => void;
};
export interface States {
  entities: Array<Entity>;
  player: State;
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