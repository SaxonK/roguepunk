import { Scope } from "../utils/types/interfaces";
import { testTilemap } from "../world/initialiser";

const render = (gameScope: Scope): void => {
  let width = gameScope.state.camera.width;
  let height = gameScope.state.camera.height;

  // Clear the canvas
  gameScope.context.clearRect(0, 0, width, height);

  // Translate co-ordinates 0,0 to center of the viewport
  gameScope.context.translate(width / 2, height / 2);

  // Render tilemap
  testTilemap.render(gameScope.context);

  // Render Entities
  if (gameScope.state.hasOwnProperty('entities') && gameScope.state.entities.length > 0) {
    /* let entities = gameScope.state.entities;

    entities.forEach(entity => {
      entity.state.render();
    }); */
  };

  // Render Player
  gameScope.state.player.render(gameScope.context);

  // Render Camera
  gameScope.state.camera.render(gameScope.context);

  // Save the current state
  gameScope.context.save();

  if(gameScope.fps.displayFramerate) {
    gameScope.fps.render(gameScope.context, gameScope.viewport.width);
  };

  // Restore the state to remove the camera transformation
  gameScope.context.restore();
};

export default render;