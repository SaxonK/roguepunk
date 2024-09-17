import Enemy from "../../entities/enemies/enemy";
import projectilePool from "../../entities/projectiles/initialiser";
import Tilemap from "../../world/tilemap";  

export async function enemyFactoryFunction(enemyType: string, count: number, tilemap: Tilemap): Promise<Enemy[]> {
  const config = await import(`../../config/enemies/${enemyType}`);
  const enemies: Enemy[] = [];
  
  for(let i = 0; i < count; i++) {
    const randomPositionTile = tilemap.getRandomTilePositionByLayer('Arena');
    const randomTargetTile = tilemap.getRandomTilePositionByLayer('Arena');
    const randomPosition = tilemap.getCanvasPositionFromTilePosition(randomPositionTile);
    const randomTarget = tilemap.getCanvasPositionFromTilePosition(randomTargetTile);
    const newEnemy = new Enemy(config, randomPosition, randomTarget, projectilePool);
    enemies.push(newEnemy);
  };

  return enemies;
}