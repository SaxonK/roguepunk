import { Player, PlayerState, Tilemap } from './interfaces';

export const actions = {
  player: ['moveUp', 'moveDown', 'moveLeft', 'moveRight'],
  menu: ['moveUp', 'moveDown', 'pause', 'select']
} as const;
export const allActions = [...actions.player, ...actions.menu];

type Flatten<T> = T extends readonly (infer U)[] ? U : never;

export type AllActions = Flatten<ActionPairs>;
export type ActionPairs = typeof actions[keyof typeof actions];
export type Action = typeof actions.player[number] | typeof actions.menu[number];
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

export type InterfaceStates = string | boolean | { [key: string]: InterfaceStates };