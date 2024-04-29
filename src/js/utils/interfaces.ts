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
  update: () => void;
};
export interface States {
  entities: Array<Entity>;
  player: State;
};
export interface Scope {
  animationFrameId: number;
  displayFramerate: boolean;
  framerate: number;
  state: States;
};
export interface Weapon {
  id: number;
  type: string;
  stats: Object;
};