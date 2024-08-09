import { ControlsManager, Scope } from "../utils/types/interfaces";
import render from "./gameRender";
import update from "./gameUpdate";

const gameLoop = (gameScope: Scope, ControlsManager: ControlsManager): void => {
  let lastUpdate: EpochTimeStamp = window.performance.now();
  const tickInterval: number = 1000 / gameScope.fps.TargetFramerate;

  const tick = (timestamp: EpochTimeStamp): void => {
    /* store the frame ID in the game scope so we can pause the game loop */
    gameScope.animationFrameId = window.requestAnimationFrame(tick);
    
    const delta = timestamp - lastUpdate;

    /* Control the rate of each tick by comparing the elapsed time against the tick interval */
    if(delta > tickInterval) {
      lastUpdate = timestamp - (delta % tickInterval);

      if(gameScope.fps.displayFramerate) {
        gameScope.fps.calculateFPS(lastUpdate);
      };

      gameScope.state = update(gameScope.state, ControlsManager.activeUserActions, tickInterval);
      render(gameScope);
      /* console.log('tick'); */
    };
  };

  gameScope.animationFrameId = window.requestAnimationFrame(tick);
};

export default gameLoop;