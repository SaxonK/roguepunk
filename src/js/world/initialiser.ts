import { tilemapFactoryFunction } from '../utils/functions/tilemapFactoryFunction';
import { animationType, entityTypeCharacters, WorldTypes } from '../utils/types/types';
import EnemyPool from '../entities/enemies/pool';
import EntityAnimationHandler from '../core/animation/entityAnimationHandler';
import eventEmitter from '../utils/events/initialiser';
import hubConfig from '../config/worlds/hub-exterior/config.json';
import hubMap from '../config/worlds/hub-exterior/map.json';
import hubSpritesheet from '../config/worlds/hub-exterior/spritesheet.png';
import player from '../entities/player/initialiser';
import projectilePool from '../entities/projectiles/initialiser';
import Tilemap from "./tilemap";
import World from './world';

const enemies = [...entityTypeCharacters['enemy']];
const enemyPool = new EnemyPool(enemies, eventEmitter, projectilePool);
const entityAnimationHandler = new EntityAnimationHandler(
  animationType,
  entityTypeCharacters,
  eventEmitter,
  hubConfig.name as WorldTypes,
  3
);
const tilemap = new Tilemap(hubMap, hubSpritesheet);
const world = new World(entityAnimationHandler, hubConfig, enemyPool, eventEmitter, player, tilemap, tilemapFactoryFunction);

export default world;