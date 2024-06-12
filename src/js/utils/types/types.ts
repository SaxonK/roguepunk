import { Player, PlayerState, Tilemap } from './interfaces';

export const actions = ['moveUp', 'moveDown', 'moveLeft', 'moveRight'] as const;
export type Action = typeof actions[number];
export type ActionStates = Record<Action, boolean>;
export type keyBinding = {
  [key: string]: Action;
};
export type ActionFunctions = {
  [key: string]: () => void;
};
export type BinaryArray = (0 | 1)[];
export type PlayerObject = Omit<Player, 'update' | 'render' | 'boundaryPositionTop' | 'boundaryPositionBottom' | 'boundaryPositionLeft' | 'boundaryPositionRight'>;
export type PlayerStateObject = Omit<PlayerState, 'update' | 'render'>;
export type TilemapConfiguration = Omit<Tilemap, 'spritesheet' | 'tileCount'>;