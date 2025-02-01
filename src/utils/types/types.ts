import { AnimationData, Enemy, IScenes, Player, PlayerGameplayState, PlayerState, Stats, Tilemap, IWeapon, IWorld } from './interfaces';

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
export const elementTypes = ['Basic', 'Detailed', 'Container', 'Progressbar'] as const;
export const entityTypeCharacters = {
  enemy: ['assassin', 'grunt', 'sniper'],
  player: ['biker', 'cyborg', 'punk']
} as const;
export const hotspots = ['interaction', 'world'] as const;
export const interactionTypes = {
  world: ['hub-interior', 'hub-exterior', 'dungeon']
} as const;
export const interfaceTypes = ['levelUp', 'mainMenu', 'pauseMenu'] as const;
export const mainMenuButtons = ['loadGame', 'newGame', 'settings'] as const;
export const pauseMenuButtons = ['resume', 'settings', 'quit'] as const;
export const weaponStats = {
  amount: 'The number of projectiles fired or melee swings per attack.',
  cooldown: 'The amount of time (seconds) between each attack. Modofied by the players Cooldown stat.',
  critChance: 'The likelyhood of a critical hit landing. Modified by the players Luck stat.',
  critMultiplier: 'The multiplier used when a critical hit lands.',
  damage: 'The damage dealt by a single projectile/attack per hit. Modified by the players Damage stat.',
  effectChance: 'The likelyhood of a weapons effect(s) triggering. Modified by the players Luck stat.',
  effectDuration: 'The length of time the weapons effect(s) will last. Modified by the players Duration stat.',
  maxAmount: 'The maximum number of projectiles that can be active on screen at a time.',
  maxLevel: 'The highest level the weapon can reach.',
  piercing: 'The number of enemies a projectile can hit before terminating.',
  range: 'The distance from the players position a projectile can be placed or travel towards.',
  rarity: 'The weighted chance of the weapon appearing. Modified by the players class alignment',
  size: 'The base size of fired projectiles, radius of Area of Effect (AOE) attacks, and area a melee swing will hit enemies.',
  speed: 'The speed at which a fired projectile will travel or how fast a melee attack is executed.'
};
export const weaponTypes = [
  'aoe',
  'melee',
  'proximity',
  'range'
] as const;

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
  gameExit: boolean;
  gamePause: boolean;
  gameStart: boolean;
  gameStateChanged: boolean;
  levelChanged: number;
  experienceToNextLevelChanged: number;
  experienceToNextLevelReset: number;
  hudUpdateValue: HudEventData;
  hudUpdateMaxValue: HudEventData;
  hudElementVisibility: HudEventData;
  itemsManagerMaxed: boolean;
  menuUp: boolean;
  menuDown: boolean;
  menuLeft: boolean;
  menuRight: boolean;
  menuSelect: boolean;
  playerGainExperience: number;
  worldTimer: EpochTimeStamp;
  worldEnd: boolean;
  worldLoadStart: boolean;
  worldLoadComplete: boolean;
};

/* HUD & UI */
export type AnchorPoints = Flatten<typeof anchorPoints>;
export type IAnchorPointConfiguration = {
  [K in keyof AnchorPoints as AnchorPoints]: ElementSettings[];
};
export type ButtonStates = {
  active: boolean;
  highlighted: boolean;
  displayOrder: number;
};
export type DroppedElement = { 
  toAnchorPoint: AnchorPoints; 
  elementName: string; 
};
export type ElementSettings = {
  name: string;
  type: ElementTypes;
  value: number | string | IWeapon[] | ElementSettings[];
  maxValue: number | null;
  direction: 'row' | 'column' | null;
  displayOrder: number;
  draggable: boolean;
  visible: boolean;
};
export type ElementStatTypes = Exclude<StatsAndStates, 'update' | 'render'> | 'level' | 'timer';
export type ElementTypes = typeof elementTypes[number];
export type Hotspots = typeof hotspots[number];
export type HtmlElementTypes = 'a' | 'div' | 'p' | 'span';
export type HudEventData = {
  name: string;
  arrayValue: Array<any>;
  numValue: number;
  maxValue: number;
  stringValue: string;
  booleanValue: boolean;
  updateType: 'add' | 'replace' | 'subtract';
};
export type InterfaceStates = Record<InterfaceTypes, boolean>;
export type InterfaceTypes = typeof interfaceTypes[number];
export type StatsAndStates = keyof Stats | keyof PlayerState;

export type KeyStates = Record<string, boolean>;
export type MainMenuButtons = typeof mainMenuButtons[number];
export type PauseMenuButtons = typeof pauseMenuButtons[number];
export type MenuButtons = MainMenuButtons | PauseMenuButtons;
export type MainMenuStates = {
  buttons: {
    [K in keyof MainMenuButtons as MainMenuButtons]: ButtonStates;
  };
};
export type PauseMenuStates = {
  buttons: {
    [K in keyof PauseMenuButtons as PauseMenuButtons]: ButtonStates;
  };
};

/* Tilemap */
export type OTilemap = Omit<jsonObject<Tilemap>, 'spritesheet' | 'tileCount' | 'tilemaps'>;
export type SceneTypes = keyof IScenes;

/* Weapons */
export type OWeapon = Omit<jsonObject<IWeapon>, 'active' | 'level' | 'effects' | 'projectiles' | 'lastFireTime'>;
export type WeaponStat = keyof typeof weaponStats;
export type WeaponStatValue = {
  description: string;
  value: number;
};
export type WeaponStats = Record<WeaponStat, number>;
export type WeaponTypes = typeof weaponTypes[number];

/* World */
export type OWorld = Omit<jsonObject<IWorld>, 'id' | 'state'>;
export type WorldTypes = typeof interactionTypes.world[number];