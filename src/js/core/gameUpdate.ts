import { States } from "../utils/types/interfaces";
import { AllActions } from "../utils/types/types";
import { testTilemap } from "../world/initialiser";

const update = (gameState: States, activeActions: AllActions[], tickInterval: number): States => {
  let states = gameState;
  let player = states.player;
  let camera = states.camera;
  const tileSize = testTilemap.scaledTileSize;
  const mapWidth = testTilemap.tilemap.width;
  const mapHeight = testTilemap.tilemap.height;

  if (states.hasOwnProperty('enemies') && states.enemies.length > 0) {
    let enemies = states.enemies;
    
    enemies.forEach(enemy => {
      if(enemy.hasReachTargetPosition) {
        const newTile = testTilemap.getRandomTilePositionByLayer('Arena');
        const newCanvasPosition = testTilemap.getCanvasPositionFromTilePosition(newTile);
        enemy.updateTargetPosition(newCanvasPosition);
      };
      enemy.update(player, tickInterval);
    });
  };

  const playerTilemapPosition = {
    x: Math.floor(((mapWidth / 2) / tileSize.width) + (player.state.position.x / (tileSize.width / 2))),
    y: Math.floor(((mapHeight / 2) / tileSize.height) + (player.state.position.y / (tileSize.height / 2)))
  };
  const playerBoundaryTilemapPositions = {
    top: Math.floor(((mapHeight / 2) / tileSize.height) + (player.boundingBox.min.y / tileSize.height)),
    bottom: Math.floor(((mapHeight / 2) / tileSize.height) + (player.boundingBox.max.y / tileSize.height)),
    left: Math.floor(((mapWidth / 2) / tileSize.width) + (player.boundingBox.min.x / tileSize.width)),
    right: Math.floor(((mapWidth / 2) / tileSize.width) + (player.boundingBox.max.x / tileSize.width))
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
        playerBoundaryCollisions[action] = testTilemap.checkCollision(playerTilemapPosition.x, playerBoundaryTilemapPositions.top);
        break;
      case "moveDown":
        playerBoundaryCollisions[action] = testTilemap.checkCollision(playerTilemapPosition.x, playerBoundaryTilemapPositions.bottom);
        break;
      case "moveLeft":
        playerBoundaryCollisions[action] = testTilemap.checkCollision(playerBoundaryTilemapPositions.left, playerTilemapPosition.y);
        break;
      case "moveRight":
        playerBoundaryCollisions[action] = testTilemap.checkCollision(playerBoundaryTilemapPositions.right, playerTilemapPosition.y);
        break;
    }
  });

  player.update(playerBoundaryCollisions, activeActions);
  camera.update(player.state.position.x, player.state.position.y);
  console.log(player.state.hitpoints);
  return states;
};

export default update;