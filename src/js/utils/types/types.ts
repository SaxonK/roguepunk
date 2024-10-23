import { AnimationData, Enemy, Player, PlayerGameplayState, PlayerState, Stats, Tilemap, TilePlacement } from './interfaces';

export const actions = {
  hud: ['unlockHud'],
  player: ['moveUp', 'moveDown', 'moveLeft', 'moveRight'],
  menu: ['moveUp', 'moveDown', 'pause', 'select']
} as const;
export const allActions = [...actions.hud, ...actions.player, ...actions.menu];
export const anchorPoints = ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;
export const animationType = ['attack', 'idle', 'idle-damaged', 'death', 'move-run', 'move-run-damaged', 'move-walk', 'move-walk-damaged'] as const;

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
export type AnchorPoints = Flatten<typeof anchorPoints>;
export type AnimationLibrary = Record<AnimationType, AnimationData>;
export type AnimationType = typeof animationType[number];
export type AnimationTargetType = 'entity' | 'tile';
export type BaseCombatType = 'melee' | 'range';
export type BaseMovementType = 'wander' | 'target';
export type BinaryArray = (0 | 1)[];
export type EnemyType = `enemy.${ 'assassin' | 'grunt' | 'sniper' }`;
export type EntityType<T extends AnimationTargetType> = T extends 'entity' ? EnemyType | PlayerType : null;
export type Coordinates = Omit<TilePlacement, 'id'>;
export type HtmlElementTypes = 'a' | 'div' | 'p' | 'span';
export type EnemyObject = Omit<Enemy, 'update' | 'updateTargetPosition' | 'render' | 'boundingBox' | 'boundaryPositionTop' | 'boundaryPositionBottom' | 'boundaryPositionLeft' | 'boundaryPositionRight' | 'hasReachTargetPosition' | 'setReachedTargetTime' | 'takeDamage' | 'projectiles' | 'projectilePool' | 'dead' | 'spritesheets'>;
export type MovementState<T extends AnimationTargetType> = T extends 'entity' ? 'idle' | 'left' | 'right' | 'up' | 'down' | 'left-up' | 'left-down' | 'right-up' | 'right-down' : null;
export type PlayerObject = Omit<Player, 'update' | 'render' | 'boundaryPositionTop' | 'boundingBox' | 'boundaryPositionBottom' | 'boundaryPositionLeft' | 'boundaryPositionRight' | 'takeDamage' | 'projectiles' | 'projectilePool' | 'dead' | 'spritesheets'>;
export type PlayerStateObject = Omit<PlayerGameplayState, 'experience' | 'movement'> & {
  startingExperience: number;
};
export type PlayerType = `player.${ 'biker' | 'punk' | 'cyborg' }`;
export type TilemapConfiguration = Omit<Tilemap, 'spritesheet' | 'tileCount' | 'getCanvasPositionFromTilePosition' | 'getRandomTilePositionByLayer'>;

export type InterfaceStates = string | boolean | { [key: string]: InterfaceStates };

export type StatsAndStates = keyof Stats | keyof PlayerState;
export type ElementStatTypes = Exclude<StatsAndStates, 'update' | 'render'> | 'level';
export type Events = {
  [K in keyof ElementStatTypes as `${ElementStatTypes}Changed`]: number;
} & {
  experienceReset: number;
  gameStateChanged: boolean;
  levelChanged: number;
  experienceToNextLevelChanged: number;
  experienceToNextLevelReset: number;
  playerGainExperience: number;
};