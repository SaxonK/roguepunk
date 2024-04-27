import { Scope } from "../utils/interfaces";
import FPSManager from "../utils/FpsManager";

const gameLoop = (gameScope: Scope): void => {
  let lastUpdate: EpochTimeStamp = window.performance.now();
  const tickInterval: number = 1000 / gameScope.framerate;

  const tick = (timestamp: EpochTimeStamp): void => {
    /* store the frame ID in the game scope so we can pause the game loop */
    gameScope.animationFrameId = window.requestAnimationFrame(tick);
    
    const delta = timestamp - lastUpdate;
    const fps = new FPSManager(lastUpdate);

    /* Control the rate of each tick by comparing the elapsed time against the tick interval */
    if(delta > tickInterval) {
      lastUpdate = timestamp - (delta % tickInterval);

      if(gameScope.displayFramerate) {
        fps.calculateFPS(lastUpdate);
      }

      console.log('tick');
    };
  };

  gameScope.animationFrameId = window.requestAnimationFrame(tick);
};

export default gameLoop;