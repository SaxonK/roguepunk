import { Scope } from "../utils/types/interfaces";
import { testTilemap } from "../world/initialiser";

const render = (gameScope: Scope): void => {
  let width = gameScope.state.camera.width;
  let height = gameScope.state.camera.height;

  gameScope.context.clearRect(0, 0, width, height);

  testTilemap.render(gameScope.context);

  if(gameScope.fps.displayFramerate) {
    gameScope.fps.render(gameScope.context, gameScope.viewport.width);
  };

  if (gameScope.state.hasOwnProperty('entities') && gameScope.state.entities.length > 0) {
    /* let entities = gameScope.state.entities;

    entities.forEach(entity => {
      entity.state.render();
    }); */
  };

  gameScope.state.player.render(gameScope.context, width, height);
  gameScope.state.camera.render(gameScope.context);
};

export default render;