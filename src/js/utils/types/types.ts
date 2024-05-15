import { Player, PlayerState, Tilemap } from './interfaces'

export type BinaryArray = (0 | 1)[];
export type PlayerObject = Omit<Player, 'update' | 'render'>;
export type PlayerStateObject = Omit<PlayerState, 'update' | 'render'>;
export type TilemapConfiguration = Omit<Tilemap, 'spritesheet' | 'tileCount'>;