/* 
  FPS Manager class that calculates and displays the current FPS.
  source: https://bengsfort.github.io/articles/making-a-js-game-part-1-game-engine/
*/

import { Cycle, Cycles } from "./types/interfaces";

class FPSManager {
  public displayFramerate: boolean;
  public TargetFramerate: number;
  private cycles: Cycles;
  private lastUpdate: number;
  private fps: number = 0;
  private initialCycle: string = "";
  private resetInterval: number;

  constructor(displayFramerate: boolean, TargetFramerate: number, previousUpdate: number) {
    this.displayFramerate = displayFramerate;
    this.TargetFramerate = TargetFramerate;
    this.lastUpdate = previousUpdate;
    this.initialCycle = "active";
    this.resetInterval = 5;
    this.cycles = {
      active: {
        frameCount: 0,
        startTime: this.lastUpdate,
        elapsedTime: 0
      } as Cycle,
      backup: {
        frameCount: 0,
        startTime: this.lastUpdate,
        elapsedTime: 0
      } as Cycle
    };
  };

  public calculateFPS(timestamp: EpochTimeStamp): void {
    /* Calculate FPS based on the elapsed time and frame count of the active cycle */

    /* Values used to determine the time elapsed since the last tick */
    let activeCycle: Cycle;
    let activeResetInterval: number;

    /* Update the frame count and elapsed time of the active and backup cycles */
    for(const cycle in this.cycles) {
      ++this.cycles[cycle].frameCount;
      this.cycles[cycle].elapsedTime = timestamp - this.cycles[cycle].startTime;
    };

    /* Set the active cycle for FPS calculation */
    activeCycle = this.cycles[this.initialCycle];

    /* Calculate the current FPS based on the elapsed time and frame count of the active cycle */
    this.fps = Math.round(1000 / (activeCycle.elapsedTime / activeCycle.frameCount));

    /* 
      Determine the reset interval for the active cycle based on synchronisation with the backup cycle
      If the active and backup cycles are synchronised, proceed with the determined resetInterval
      Otherwise, double the resetInterval in order to catch up
    */
    this.cycles.active.frameCount === this.cycles.backup.frameCount ?
    activeResetInterval = this.resetInterval * this.fps :
    activeResetInterval = (this.resetInterval * 2) * this.fps;
    
    /*
      Check if the frame count of the active cycle exceeds the reset interval
      If so, reset the frame count and start time of the active cycle
    */
    if(activeCycle.frameCount > activeResetInterval) {
      this.cycles[this.initialCycle].frameCount = 0;
      this.cycles[this.initialCycle].startTime = timestamp;
      this.cycles[this.initialCycle].elapsedTime = 0;
    };
  };
  public render(context: CanvasRenderingContext2D, width: number): void {
    context.fillStyle = '#FFFF00';
    context.fillText(this.fps.toLocaleString(), width - 20, 15);
  };
  public toggleFramerateDisplay(): void {
    this.displayFramerate = !this.displayFramerate;
  };
};

export default FPSManager;