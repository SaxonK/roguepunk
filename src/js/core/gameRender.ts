import { Scope } from "../utils/types/interfaces";
import { testTilemap } from "../world/initialiser";

const render = (gameScope: Scope): void => {
  const { context, state, viewport } = gameScope;
  const width = viewport.width;
  const height = viewport.height;

  /* Clear the canvas */
  context.clearRect(0, 0, width, height);

  /* Calculate camera offsets */
  const cameraOffsetX = state.camera.x - width / 2;
  const cameraOffsetY = state.camera.y - height / 2;

  /* Render tilemap at the origin (relative to camera) */
  context.save();
  context.translate(-cameraOffsetX, -cameraOffsetY);
  testTilemap.render(context);
  context.restore();

  /* Render entities (Player and Enemies) */
  context.save();
  context.translate(-cameraOffsetX, -cameraOffsetY);

  /* Render Enemies */
  if (state.enemies && state.enemies.length > 0) {
    state.enemies.forEach(enemy => {
      enemy.render(context);
    });
  }

  /* Render Player */
  state.player.render(context);

  context.restore();

  /* Render Camera */
  state.camera.render(context);

  /* Render FPS */
  if (gameScope.fps.displayFramerate) {
    gameScope.fps.render(context, viewport.width);
  }
};

export default render;