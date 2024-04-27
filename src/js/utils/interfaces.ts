export interface Scope {
  animationFrameId: number;
  displayFramerate: boolean;
  framerate: number;
  state: Object;
};
export interface Cycle {
  frameCount: number;
  startTime: EpochTimeStamp;
  elapsedTime: number;
};
export interface Cycles {
  [key: string]: Cycle;
};