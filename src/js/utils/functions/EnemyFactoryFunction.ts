import { EnemyConfig, EnemyState as IEnemyState, EnemyStats as IEnemyStats, Tilemap } from "../types/interfaces";
import { EnemyClass, EnemyObject } from "../types/types";
import AnimationHandler from "../../core/animation/animate";
import Enemy from "../../entities/enemies/enemy";
import EnemyConfiguration from "../../entities/enemies/config";
import EnemyState from "../../entities/enemies/state";
import EnemyStats from "../../entities/enemies/stats";
import eventEmitter from "../../utils/events/initialiser";
import projectilePool from "../../entities/projectiles/initialiser";

export async function enemyFactoryFunction(enemyType: EnemyClass, count: number, tilemap: Tilemap): Promise<Enemy[]> {
  const config = await import(`../../config/enemies/${enemyType}`);
  const enemies: Enemy[] = [];
  
  for(let i = 0; i < count; i++) {
    const randomiser = {
      position: tilemap.getCanvasPositionFromTilePosition(tilemap.getRandomTilePositionByLayer('Arena')),
      target: tilemap.getCanvasPositionFromTilePosition(tilemap.getRandomTilePositionByLayer('Arena'))
    };
    const configuration: EnemyConfig = new EnemyConfiguration(config.config);
    const state: IEnemyState = new EnemyState(config.state);
    const stats: IEnemyStats = new EnemyStats(config.stats);
    const enemyObject: EnemyObject = {
      config: configuration,
      state: state,
      stats: stats
    };

    const animationHandler = new AnimationHandler(enemyObject.config, {...randomiser.position});
    const newEnemy = new Enemy(enemyObject, animationHandler, {...randomiser.position}, eventEmitter, projectilePool, {...randomiser.target});
    enemies.push(newEnemy);
  };

  return enemies;
}