import { AnimationData, Enemy, IScenes, Player, PlayerGameplayState, PlayerState, Stats, Tilemap, IWorld } from './interfaces';

/* Constants */
export const actions = {
  hud: ['unlockHud'],
  player: ['moveUp', 'moveDown', 'moveLeft', 'moveRight'],
  menu: ['moveUp', 'moveDown', 'pause', 'select', 'debug'],
  world: ['select']
} as const;
export const allActions = [...actions.hud, ...actions.player, ...actions.menu];
export const anchorPoints = ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;
export const animationType = ['attack', 'idle', 'idle-damaged', 'death', 'move-run', 'move-run-damaged', 'move-walk', 'move-walk-damaged'] as const;
export const entityTypeCharacters = {
  enemy: ['assassin', 'grunt', 'sniper'],
  player: ['biker', 'cyborg', 'punk']
} as const;
export const hotspots = ['interaction', 'world'] as const;
export const interactionTypes = {
  world: ['hub-interior', 'hub-exterior', 'dungeon']
} as const;

/* Utility types */
type Flatten<T> = T extends readonly (infer U)[] ? U : never;
type jsonObject<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

/* Generic types */
export type BinaryArray = (0 | 1)[];
export type Coordinates = {
  x: number;
  y: number;
};
export type Dimensions = {
  width: number;
  height: number;
};

/* Actions */
export type AllActions = Flatten<ActionPairs>;
export type ActionPairs = typeof actions[keyof typeof actions];
export type Action = typeof actions.player[number] | typeof actions.menu[number];
export type ActionBinding = {
  [K in keyof Action as Action]: {
    keys: {
      keyboard: string;
      controller: string;
    };
    repeatable: boolean;
  }
};
export type ActionMovement = typeof actions.player[number];
export type ActionStates = Record<Action, boolean>;
export type ActionFunctions = {
  [key: string]: () => void;
};
export type BaseCombatType = 'melee' | 'range';
export type BaseMovementType = 'wander' | 'target';
export type CollisionStates = Omit<ActionStates, 'pause' | 'select' | 'debug'>;
export type keyBinds = Record<AllActions, string>;
export type MovementState<T extends AnimationTargetType> = T extends 'entity' ? 'idle' | 'left' | 'right' | 'up' | 'down' | 'left-up' | 'left-down' | 'right-up' | 'right-down' : null;

/* Animations */
export type AnimationLibrary = Record<AnimationType, AnimationData>;
export type AnimationType = typeof animationType[number];
export type AnimationTargetType = 'entity' | 'tile';
export type EntityAnimationLibrary = {
  [Entity in EntityType]: {
    [Character in EntityTypeCharactersByEntity<Entity>]: AnimationLibrary;
  };
};
export type CharacterBoundingBoxByEntity<Entity extends EntityType> = {
  [Character in EntityTypeCharactersByEntity<Entity>]: { width: number, height: number };
};

/* Entities */
export type EntityType = keyof typeof entityTypeCharacters;
export type EntityTypeCharacters = typeof entityTypeCharacters;
export type EntityTypeCharacterCodes = {
  [Entity in EntityType]: `${Entity}.${EntityTypeCharactersByEntity<Entity>}`
}[EntityType];
export type EntityTypeCharacterCodesByEntity<Entity extends EntityType> = `${Entity}.${EntityTypeCharactersByEntity<Entity>}`;
export type EntityTypeCharactersByEntity<Entity extends EntityType> = typeof entityTypeCharacters[Entity][number];
export type EntityBoundingBoxDetails<Entity extends EntityType> = {
  character: EntityTypeCharactersByEntity<Entity>,
  boundingBox: Dimensions
};

/* Entity - Enemies */
export type EnemyCharacterConfigurations = {
  [character in EntityTypeCharactersByEntity<'enemy'>]: EnemyObject;
};
export type EnemyObject = Omit<jsonObject<Enemy>, 'boundingBox' | 'damaged' | 'dead' | 'hasReachTargetPosition' | 'projectiles' | 'projectilePool' | 'state'>;

/* Entity - Player */
export type PlayerObject = Omit<jsonObject<Player>, 'boundingBox' | 'dead' | 'position' | 'projectiles' | 'projectilePool' | 'damaged'>;
export type PlayerStateObject = Omit<PlayerGameplayState, 'experience' | 'movement'> & {
  startingExperience: number;
};

/* Events */
export type Events = {
  [K in keyof ElementStatTypes as `${ElementStatTypes}Changed`]: number;
} & {
  enemyCharacterInitialised: EntityBoundingBoxDetails<'enemy'>;
  experienceReset: number;
  gamePause: boolean;
  gameStart: boolean;
  gameStateChanged: boolean;
  levelChanged: number;
  experienceToNextLevelChanged: number;
  experienceToNextLevelReset: number;
  playerGainExperience: number;
  worldTimer: EpochTimeStamp;
  worldEnd: boolean;
};

/* HUD & UI */
export type AnchorPoints = Flatten<typeof anchorPoints>;
export type Hotspots = typeof hotspots[number];
export type HtmlElementTypes = 'a' | 'div' | 'p' | 'span';
export type InterfaceStates = string | boolean | { [key: string]: InterfaceStates };
export type StatsAndStates = keyof Stats | keyof PlayerState;
export type ElementStatTypes = Exclude<StatsAndStates, 'update' | 'render'> | 'level' | 'timer';

/* Tilemap */
export type OTilemap = Omit<jsonObject<Tilemap>, 'spritesheet' | 'tileCount' | 'tilemaps'>;
export type SceneTypes = keyof IScenes;

/* World */
export type OWorld = Omit<jsonObject<IWorld>, 'id' | 'state'>;
export type WorldTypes = typeof interactionTypes.world[number];