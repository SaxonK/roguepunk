import { BoundingBox, States } from "../utils/types/interfaces";
import { AllActions, Coordinates } from "../utils/types/types";
import { testTilemap } from "../world/initialiser";

const update = (gameState: States, activeActions: AllActions[], mouseCanvasPosition: Coordinates): States => {
  let states = gameState;
  let enemies = states.enemies.filter(enemy => !enemy.state.lifecycle.dead);
  let player = states.player;
  let camera = states.camera;

  if(states.hasOwnProperty('enemies') && states.enemies.length > 0) {
    enemies.forEach(enemy => {
      if(enemy.hasReachTargetPosition) {
        const newTile = testTilemap.getRandomTilePositionByLayer('Arena');
        const newCanvasPosition = testTilemap.getCanvasPositionFromTilePosition(newTile);
        enemy.updateTargetPosition(newCanvasPosition);
        enemy.setReachedTargetTime();
      };
      enemy.update(player);
    });
  };

  const playerTilemapPosition: Coordinates = testTilemap.getTilePositionFromCanvasPosition(player.state.gameplay.position);
  const playerBoundaryTilemapPositions: BoundingBox = {
    min: testTilemap.getTilePositionFromCanvasPosition(player.boundingBox.min),
    max: testTilemap.getTilePositionFromCanvasPosition(player.boundingBox.max)
  };
  const playerBoundaryCollisions = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    pause: false,
    select: false
  };
  activeActions.forEach(action => {
    switch(action) {
      case "moveUp":
        playerBoundaryCollisions[action] = testTilemap.checkCollision(playerTilemapPosition.x, playerTilemapPosition.y);
        break;
      case "moveDown":
        playerBoundaryCollisions[action] = testTilemap.checkCollision(playerTilemapPosition.x, playerBoundaryTilemapPositions.max.y);
        break;
      case "moveLeft":
        playerBoundaryCollisions[action] = testTilemap.checkCollision(playerBoundaryTilemapPositions.min.x, playerBoundaryTilemapPositions.max.y);
        break;
      case "moveRight":
        playerBoundaryCollisions[action] = testTilemap.checkCollision(playerBoundaryTilemapPositions.max.x, playerBoundaryTilemapPositions.max.y);
        break;
    }
  });

  console.log(playerTilemapPosition.x, playerTilemapPosition.y);
  console.log(playerBoundaryCollisions);

  player.update(playerBoundaryCollisions, activeActions, mouseCanvasPosition, enemies);
  camera.update(player.state.gameplay.position.x, player.state.gameplay.position.y);

  return states;
};

export default update;