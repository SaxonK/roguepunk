import { Enemy as IEnemy, IEnemyPool, EnemyState as IEnemyState, EventEmitter, ProjectilePool } from "../../utils/types/interfaces";
import { Coordinates, Dimensions, EntityTypeCharactersByEntity, EnemyCharacterConfigurations, Events } from "../../utils/types/types";
import Enemy from "./enemy";
import EnemyState from "./state";

export default class EnemyPool implements IEnemyPool {
  private configurations: EnemyCharacterConfigurations;
  private defaultState: IEnemyState;
  private eventEmitter: EventEmitter<Events>;
  private pool: IEnemy[] = [];
  private projectilePool: ProjectilePool;

  constructor(
    characters: EntityTypeCharactersByEntity<'enemy'>[],
    eventEmitter: EventEmitter<Events>,
    projectilePool: ProjectilePool,
  ) {
    this.configurations = {} as EnemyCharacterConfigurations;
    this.constructConfiguration(characters);
    this.defaultState = new EnemyState(1, []);
    this.eventEmitter = eventEmitter;
    this.projectilePool = projectilePool;
    this.eventEmitter.on("enemyCharacterInitialised", (data) => this.setBoundingBoxByCharacter(data.character, data.boundingBox));
  };

  /* Public Methods */
  public getEnemyByCharacter(
    character: EntityTypeCharactersByEntity<'enemy'>,
    position: Coordinates,
    target: Coordinates
  ): IEnemy {
    if (this.pool.length > 0) {
      const enemy = this.pool.pop()!;
      const startingPosition: Coordinates = { x: position.x, y: position.y };
      const targetPosition: Coordinates = { x: target.x, y: target.y };
      enemy.config = this.configurations[character].config;
      enemy.state.gameplay.position = { ...startingPosition };
      enemy.stats = this.configurations[character].stats;
      enemy.updateTargetPosition({ ...targetPosition });
      return enemy;
    } else {
      const state: IEnemyState = {
        animation: { 
          current: { ...this.defaultState.animation.current },
          previous: { ...this.defaultState.animation.previous }
        },
        gameplay: { ...this.defaultState.gameplay },
        lifecycle: { ...this.defaultState.lifecycle }
      };
      const startingPosition: Coordinates = { x: position.x, y: position.y };
      const targetPosition: Coordinates = { x: target.x, y: target.y };

      state.gameplay.position = startingPosition;
      state.gameplay.hitpoints = this.configurations[character].stats.hitpoints;

      const enemy = new Enemy(
        this.configurations[character],
        startingPosition,
        this.eventEmitter,
        this.projectilePool,
        state,
        targetPosition
      );
      return enemy;
    }
  };
  public returnEnemy(enemy: IEnemy): void {
    const state: IEnemyState = {
      animation: { 
        current: { ...this.defaultState.animation.current },
        previous: { ...this.defaultState.animation.previous }
      },
      gameplay: { ...this.defaultState.gameplay },
      lifecycle: { ...this.defaultState.lifecycle }
    };
    enemy.reset({...this.configurations['grunt'].config}, state);
    this.pool.push(enemy);
  };

  /* Private Methods */
  private async constructConfiguration(
    characters: EntityTypeCharactersByEntity<'enemy'>[]
  ): Promise<void> {
    for(const character of characters) {
      const config = await import(`../../config/enemies/${character}`);
      this.configurations[character as EntityTypeCharactersByEntity<'enemy'>] = config;
      this.configurations[character].config.name = `enemy.${character}`;
    };
  };
  private setBoundingBoxByCharacter(character: EntityTypeCharactersByEntity<'enemy'>, dimensions: Dimensions): void {
    this.configurations[character].config.width = dimensions.width;
    this.configurations[character].config.height = dimensions.height;
  };
};