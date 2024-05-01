import { Scope } from "../utils/interfaces";


const render = (gameScope: Scope): void => {
  let width = gameScope.viewport.width;
  let height = gameScope.viewport.height;

  gameScope.context.clearRect(0, 0, width, height);

  if(gameScope.fps.displayFramerate) {
    gameScope.fps.render(gameScope.context, gameScope.viewport.width);
  };

  if (gameScope.state.hasOwnProperty('entities') && gameScope.state.entities.length > 0) {
    let entities = gameScope.state.entities;

    entities.forEach(entity => {
      entity.state.render();
    });
  };

  gameScope.state.player.render();
};

export default render;