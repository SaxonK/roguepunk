import { IEnemyPool, EventEmitter, IEntityAnimationHandler, IInteractionState, IWeaponsManager, IWorld, IWorldStates, Layer, Player, Tilemap, Enemy } from "../utils/types/interfaces";
import { actions, ActionFunctions, AllActions, Coordinates, EntityTypeCharactersByEntity, Events, OWorld, WorldTypes } from "../utils/types/types";

export default class World implements IWorld {
  name: string;
  time: number;
  combat: boolean;
  multipliers: { time: number; movement: number; gold: number; experience: number; enemies: number; "enemy-health": number; };
  "additional-effects": Record<string, boolean> = {};
  state: IWorldStates;
  hud: boolean;

  private entityAnimationHandler: IEntityAnimationHandler;
  private actions: ActionFunctions;
  private enemyConstant: number = 10;
  private enemyPool: IEnemyPool;
  private eventEmitter: EventEmitter<Events>;
  private elapsedTime: EpochTimeStamp;
  private weaponsManager: IWeaponsManager;
  private loading: boolean;
  private nextEnemyWave: EpochTimeStamp = window.performance.now() + 30000;
  private startTime: EpochTimeStamp;

  constructor(
    entityAnimationHandler: IEntityAnimationHandler,
    config: OWorld,
    enemyPool: IEnemyPool,
    eventEmitter: EventEmitter<Events>,
    weaponsManager: IWeaponsManager,
    player: Player, 
    tilemap: Tilemap,
    tilemapFactoryFunction: (name: string) => Promise<Tilemap>
  ) {
    this.loading = true;
    this.name = config.name;
    this.time = config.time;
    this.combat = config.combat;
    this.enemyPool = enemyPool;
    this.hud = config.hud;
    this.weaponsManager = weaponsManager;
    this.multipliers = config.multipliers;
    this["additional-effects"] = config["additional-effects"];

    this.entityAnimationHandler = entityAnimationHandler;
    this.eventEmitter = eventEmitter;
    this.elapsedTime = 0;
    this.startTime = 0;
    this.state = {
      enemies: [],
      player: player,
      tilemap: tilemap,
      world: {
        interaction: {
          active: false,
          type: ''
        },
        spawning: false
      }
    };

    this.tilemapFactoryFunction = tilemapFactoryFunction;
    const actionObject = {} as ActionFunctions;
    actions.world.forEach(action => {
      actionObject[action] = this[action].bind(this);
    });
    this.actions = actionObject;
    this.state.player.position = this.state.tilemap.getCanvasPositionFromTilePosition(this.spawn);
    this.loading = false;

    this.eventEmitter.on("gameStart", () => this.start());
  };

  /* Getters */
  public get spawn(): Coordinates {
    const layer: Layer = this.state.tilemap.getLayerByName('spawn') as Layer;
    const { id, ...position } = layer.tiles[0];

    return position;
  };
  private get timeInMinutes(): number {
    return Math.floor(this.timeInSeconds / 60);
  };
  private get timeInSeconds(): number {
    return Math.floor(this.elapsedTime / 1000);
  };
  private get displayTime(): string {
    const timeFormatted = {
      minutes: String(this.timeInMinutes).padStart(2, '0'),
      seconds: String(this.timeInSeconds % 60).padStart(2, '0')
    };
    return `${timeFormatted.minutes}:${timeFormatted.seconds}`;
  };

  /* Setters */

  /* Public Methods */
  public render(context: CanvasRenderingContext2D, cameraOffset: Coordinates, debug: boolean): void {
    if(this.loading) return;

    /* Render tilemap at the origin (relative to camera) */
    context.save();
      context.translate(-cameraOffset.x, -cameraOffset.y);
      this.state.tilemap.render(context, 'background');
      if(debug) this.state.tilemap.render(context, 'debug');
    context.restore();
  
    /* Render entities (Player and Enemies) */
    context.save();
      context.translate(-cameraOffset.x, -cameraOffset.y);

      /* Render Enemies */
      let enemies = this.state.enemies.filter(enemy => !enemy.state.lifecycle.dead);
      if (enemies && enemies.length > 0) {
        enemies.forEach(enemy => {
          const enemyFrame = this.entityAnimationHandler.getFrame(
            enemy.state.animation.current.animation,
            enemy.config.name,
            enemy.state.animation.current.index
          );
          enemy.render(context, enemyFrame);
          if(debug) enemy.debug(context);
        });
      };

      /* Render Enemy Projectiles
      let rangeEnemies = enemies.filter(enemy => enemy.config.combat === 'range');
      rangeEnemies.forEach(enemy => {
        if(enemy.projectiles.length > 0) {
          enemy.projectiles.forEach(projectile => {
            projectile.render(context, this.state.player.config.offset);
            if(debug) projectile.debug(context);
          });
        };
      }); */

      /* Render Player */
      const playerFrame = this.entityAnimationHandler.getFrame(
        this.state.player.state.animation.current.animation,
        this.state.player.config.name,
        this.state.player.state.animation.current.index
      );
      this.state.player.render(context, playerFrame);
      if(debug) this.state.player.debug(context);

      /* Render Player Projectiles
      if(this.state.player.projectiles.length > 0) {
        this.state.player.projectiles.forEach(projectile => {
          projectile.render(context, this.state.player.config.offset);
          if(debug) projectile.debug(context);
        });
      }; */
    context.restore();  

    /* Render tilemap at the origin (relative to camera) */
    context.save();
      context.translate(-cameraOffset.x, -cameraOffset.y);
      this.state.tilemap.render(context, 'foreground');
    context.restore();
  };
  public update(activeActions: AllActions[], cursorPosition: Coordinates): void {
    if(this.loading) return;
    if(this.startTime === 0) {
      this.toggleHudElementVisibility(); /* Set HUD visibility state on first gameloop */
      this.startTime = window.performance.now(); /* set start time on first gameloop */
    };

    this.timer();
    let activeEnemies = this.state.enemies.filter(enemy => !enemy.state.lifecycle.dead);
    let deadEnemies = this.state.enemies.filter(enemy => enemy.state.lifecycle.dead);
    const hotspotInRange: IInteractionState = this.state.tilemap.checkHotspotInRange({ x: this.state.player.state.gameplay.position.x, y: this.state.player.boundingBox.max.y }, 1);
    this.state.world.interaction.active = hotspotInRange.active;
    this.state.world.interaction.type = hotspotInRange.type;
    this.interactions(activeActions);

    if(deadEnemies.length > 0) {
      deadEnemies.forEach(enemy => this.enemyPool.returnEnemy(enemy));
      this.state.enemies = activeEnemies;
    };

    if(this.combat) {
      this.spawner(activeEnemies);
      activeEnemies.forEach(enemy => {
        if(enemy.hasReachTargetPosition) {
          const newTile = this.state.tilemap.getRandomTilePositionByLayer('Arena');
          const newCanvasPosition = this.state.tilemap.getCanvasPositionFromTilePosition(newTile);
          enemy.updateTargetPosition(newCanvasPosition);
          enemy.setReachedTargetTime();
        };
        enemy.update(this.state.player);
        enemy.state.animation = this.entityAnimationHandler.update(
          enemy.config.name,
          {
            alive: enemy.state.lifecycle.alive,
            animation: enemy.state.animation,
            attacking: enemy.attacking,
            damaged: enemy.damaged,
            position: enemy.state.gameplay.position
          },
          enemy.stats
        );
      });
    };
  
    this.state.player.update(
      this.state.tilemap.getCollisionStates(this.state.player.boundingBox, this.state.player.stats.speed),
      activeActions,
      activeEnemies,
      this.combat
    );
    this.state.player.state.animation = this.entityAnimationHandler.update(
      this.state.player.config.name,
      {
        alive: this.state.player.state.lifecycle.alive,
        animation: this.state.player.state.animation,
        attacking: false,
        damaged: this.state.player.damaged,
        position: this.state.player.state.gameplay.position
      },
      this.state.player.stats
    );
  };

  /* Private Methods */
  private tilemapFactoryFunction: (name: string) => Promise<Tilemap>;

  private getDistanceBetweenTwoEntities(entityA: Coordinates, entityB: Coordinates): number {
    const a = Math.abs(entityA.x - entityB.x);
    const b = Math.abs(entityA.y - entityB.y);

    return Math.sqrt((a * a) + (b * b));
  };
  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  private getRandomCanvasPositionByPlayerProximity(proximity: number): Coordinates {
    let position = { ...this.state.tilemap.getCanvasPositionFromTilePosition(this.state.tilemap.getRandomTilePositionByLayer('Arena')) };
    let distanceFromPlayer = this.getDistanceBetweenTwoEntities(this.state.player.state.gameplay.position, position);

    do {
      position = { ...this.state.tilemap.getCanvasPositionFromTilePosition(this.state.tilemap.getRandomTilePositionByLayer('Arena')) };
      distanceFromPlayer = this.getDistanceBetweenTwoEntities(this.state.player.state.gameplay.position, position);
    } while(distanceFromPlayer <= proximity);
    
    return position;
  };
  private interactions(activeActions: AllActions[]): void {
    activeActions.forEach(action => {
      if (this.actions[action] && this.state.world.interaction.active) this.actions[action]();
    });
  };
  private async loadWoldByName(name: WorldTypes): Promise<void> {
    try {
      await this.entityAnimationHandler.reloadLibrary(3, name);
      const config = await import(`../config/worlds/${name}/config.json`);
      const tilemap = await this.tilemapFactoryFunction(name);

      this.state.tilemap = tilemap;
      Object.assign(this, {
        name: config.name,
        time: config.time,
        combat: config.combat,
        hud: config.hud,
        multipliers: config.multipliers,
        "additional-effects": config["additional-effects"]
      });

      this.elapsedTime = 0;
      this.startTime = 0;
      this.toggleHudElementVisibility();
    } catch (error) {
      console.error("Error loading world:", error);
      throw error;
    };
  };
  private select(): void {
    switch(this.state.world.interaction.type) {
      case 'world':
        this.loading = true;
        this.eventEmitter.emit("worldLoadStart", false);
        const worldName = this.state.tilemap.getHotspotName({ x: this.state.player.state.gameplay.position.x, y: this.state.player.boundingBox.max.y }, 1) as WorldTypes;
        this.loadWoldByName(worldName).then(_result => {
          this.state.player.position = this.state.tilemap.getCanvasPositionFromTilePosition(this.spawn);
          this.state.player.resetAnimationState();
          this.loading = false;
          this.eventEmitter.emit("worldLoadComplete", true);
        });
        break;
      case 'interaction': 
        break;
    };
  };
  private spawner(enemies: Enemy[]): void {
    if(!this.state.world.spawning) {
      const isNextWave = this.elapsedTime - this.nextEnemyWave >= 30000 ? true : false;
      const enemyCount = this.enemyConstant + (1 * Math.floor((this.elapsedTime / 1000) / 60));
      if(enemies.length < enemyCount * 0.2 || isNextWave) {
        if(isNextWave) {
          this.enemyConstant = Math.floor(this.enemyConstant * 1.1);
          this.nextEnemyWave += 30000;
        }
        if(!this.state.world.spawning) {
          this.state.world.spawning = true;
          this.spawnEnemiesByCharacter('grunt', enemyCount * 0.5);
          this.spawnEnemiesByRandomCharacter(Math.floor(enemyCount * 0.5));
        };
      };
    };
  };
  private spawnEnemiesByRandomCharacter(spawnCount: number): void {
    const characters = this.entityAnimationHandler.getCharactersByEntity('enemy');
    for(let i = 0; i < spawnCount; i++) {
      const index = this.getRandomNumber(0, characters.length - 1);
      this.spawnEnemiesByCharacter(characters[index], 1);
    };
  };
  private spawnEnemiesByCharacter(character: EntityTypeCharactersByEntity<'enemy'>, spawnCount: number): void {
    for(let i = 0; i < spawnCount; i++) {
      const randomiser = {
        position: { ...this.getRandomCanvasPositionByPlayerProximity(200) },
        target: { ...this.state.tilemap.getCanvasPositionFromTilePosition(this.state.tilemap.getRandomTilePositionByLayer('Arena')) }
      };
      this.state.enemies.push(this.enemyPool.getEnemyByCharacter(character, randomiser.position, randomiser.target));
    };
    this.state.world.spawning = false;
  };
  private start(): void {
    if(this.time === 0) return;
    this.startTime = window.performance.now() - this.elapsedTime;
  };
  private timer(): void {
    if(this.time === 0) return;

    this.elapsedTime = window.performance.now() - this.startTime;
    const elapsedTimeInSeconds = Math.floor(this.elapsedTime / 1000);
    const timeLimitInSeconds = this.time * 60;
    if(elapsedTimeInSeconds <= timeLimitInSeconds) {
      this.eventEmitter.emit('hudUpdateValue', { name: 'timer', arrayValue: [], numValue: 0, maxValue: 0, stringValue: this.displayTime, booleanValue: false, updateType: 'replace' });
    } else {
      this.eventEmitter.emit("worldEnd", true);
    };
  };
  private toggleHudElementVisibility(): void {
    this.eventEmitter.emit("hudElementVisibility", { name: "core-stats", arrayValue: [], numValue: 0, maxValue: 0, stringValue: '', booleanValue: this.hud, updateType: 'replace' });
    this.eventEmitter.emit("hudElementVisibility", { name: "timer", arrayValue: [], numValue: 0, maxValue: 0, stringValue: '', booleanValue: this.hud, updateType: 'replace' });
    this.eventEmitter.emit("hudElementVisibility", { name: "weapons", arrayValue: [], numValue: 0, maxValue: 0, stringValue: '', booleanValue: this.hud, updateType: 'replace' });
  };
};