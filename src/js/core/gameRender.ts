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
  let enemies = state.enemies.filter(enemy => !enemy.dead);
  if (enemies && enemies.length > 0) {
    enemies.forEach(enemy => {
      enemy.render(context);
    });
  };

  /* Render Enemy Projectiles */
  let rangeEnemies = enemies.filter(enemy => enemy.config.combat === 'range');
  rangeEnemies.forEach(enemy => {
    if(enemy.projectiles.length > 0) {
      enemy.projectiles.forEach(projectile => {
        projectile.render(context, state.player.config.offset);
      });
    };
  });

  /* Render Player */
  state.player.render(context);

  /* Render Player Projectiles */
  if(state.player.projectiles.length > 0) {
    state.player.projectiles.forEach(projectile => {
      projectile.render(context, state.player.config.offset);
    });
  };

  context.fillStyle = '#fff';
  context.fillText(
    `${gameScope.mouseCanvasPosition.x},${gameScope.mouseCanvasPosition.y}`,
    gameScope.mouseCanvasPosition.x - 16,
    gameScope.mouseCanvasPosition.y - 16
  );

  context.restore();  

  /* Render Camera */
  state.camera.render(context);

  /* Render FPS */
  if (gameScope.fps.displayFramerate) {
    gameScope.fps.render(context, viewport.width);
  }
};

export default render;