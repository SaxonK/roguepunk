import { States } from "../utils/types/interfaces";
import { testTilemap } from "../world/initialiser";
import { controlsManager } from "./controls/controlsManager";

const update = (gameState: States): States => {
  let states = gameState;
  let player = states.player;
  let camera = states.camera;
  const tileSize = testTilemap.scaledTileSize;
  const mapWidth = testTilemap.tilemap.width;
  const mapHeight = testTilemap.tilemap.height;

  if (states.hasOwnProperty('entities') && states.entities.length > 0) {
    /* let entities = states.entities;
    
    entities.forEach(entity => {
      entity.state.update();
    }); */
  };

  const playerTilemapPosition = {
    x: Math.floor(((mapWidth / 2) / tileSize.width) + (player.state.position.x / (tileSize.width / 2))),
    y: Math.floor(((mapHeight / 2) / tileSize.height) + (player.state.position.y / (tileSize.height / 2)))
  };
  const playerBoundaryTilemapPositions = {
    top: Math.floor(((mapHeight / 2) / tileSize.height) + (player.boundaryPositionTop / tileSize.height)),
    bottom: Math.floor(((mapHeight / 2) / tileSize.height) + (player.boundaryPositionBottom / tileSize.height)),
    left: Math.floor(((mapWidth / 2) / tileSize.width) + (player.boundaryPositionLeft / tileSize.width)),
    right: Math.floor(((mapWidth / 2) / tileSize.width) + (player.boundaryPositionRight / tileSize.width))
  };
  const playerBoundaryCollisions = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false
  };
  controlsManager.activeUserActions.forEach(action => {
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

  player.update(playerBoundaryCollisions);
  camera.update(player.state.position.x, player.state.position.y);

  return states;
};

export default update;