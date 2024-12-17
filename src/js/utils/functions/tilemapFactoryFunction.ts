
import { Tilemap as ITilemap } from "../types/interfaces";
import { OTilemap } from "../types/types";
import Tilemap from "../../world/tilemap";

export async function tilemapFactoryFunction(name: string): Promise<ITilemap> {
  const map: OTilemap = await import(`../../config/worlds/${name}/map.json`);
  const spritesheet = await import(`../../config/worlds/${name}/spritesheet.png`);
  const spritesheetUrl = typeof spritesheet === 'string' ? spritesheet : spritesheet.default;

  return new Tilemap(map, spritesheetUrl);
};