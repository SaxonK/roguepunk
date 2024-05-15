import Tilemap from "./tilemap";
import testMap from '../config/maps/testing/map.json';
import testSpritesheet from '../config/maps/testing/spritesheet.png';

export const testTilemap = new Tilemap(testMap, testSpritesheet);