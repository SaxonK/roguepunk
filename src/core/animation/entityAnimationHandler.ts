import { AnimationData, IAnimationEntityState, AnimationFrameDetails, IEntityAnimationHandler, IEntityAnimationState, Frame, Stats, EventEmitter } from "../../utils/types/interfaces";
import { AnimationLibrary, AnimationType, CharacterBoundingBoxByEntity, Coordinates, EntityAnimationLibrary, EntityType, EntityTypeCharacters, EntityTypeCharactersByEntity, EntityTypeCharacterCodes, WorldTypes, Events } from "../../utils/types/types";

export default class EntityAnimationHandler implements IEntityAnimationHandler {
  private library: EntityAnimationLibrary;
  private eventEmitter: EventEmitter<Events>;

  constructor(
    animations: ReadonlyArray<AnimationType>,
    entities: EntityTypeCharacters,
    eventEmitter: EventEmitter<Events>,
    world: WorldTypes,
    scale: number
  ) {
    this.eventEmitter = eventEmitter;
    this.library = this.constructLibrary(animations, entities);
    this.initialiseLibrary(scale, world);
  };

  /* Getters */
  public get initialised(): boolean {
    return Object.values(this.library).every((entity) => {
      return Object.values(entity).every((character) => {
        const activeAnimations = Object.values(character).filter((animation) => animation.active);
        return activeAnimations.every((animation) => animation.initialised);
      });
    });
  };

  /* Public Methods */
  public getCharactersByEntity<Entity extends EntityType>(entity: Entity): EntityTypeCharactersByEntity<Entity>[] {
    const characters = Object.keys(this.library[entity]) as EntityTypeCharactersByEntity<Entity>[];
    return characters;
  };
  public async getCharacterBoundingBoxByEntity<Entity extends EntityType>(entity: Entity): Promise<CharacterBoundingBoxByEntity<Entity>> {
    const boundingBoxes = {} as CharacterBoundingBoxByEntity<Entity>;
    Object.entries(this.library[entity as EntityType]).forEach(([character, animations]) => {
      const dimensions = {
        width: animations['idle'].frames[0].width,
        height: animations['idle'].frames[0].height
      }; 
      boundingBoxes[character as keyof CharacterBoundingBoxByEntity<Entity>] = dimensions;
    });
    return boundingBoxes;
  };
  public getFrame(animation: AnimationType, entityName: EntityTypeCharacterCodes, index: number): AnimationFrameDetails {
    const animationData: AnimationData = this.getAnimationDataByEntityCharacterCode(animation, entityName);

    return {
      spritesheet: animationData.spritesheet as HTMLImageElement,
      sx: animationData.frames[index].sx,
      sy: 0,
      sw: animationData.frames[index].width,
      sh: animationData.frames[index].height
    };
  };
  public async reloadLibrary(scale: number, world: WorldTypes): Promise<void> {
    this.initialiseLibrary(scale, world);
  };
  public update(
    entityName: EntityTypeCharacterCodes,
    state: IAnimationEntityState,
    stats: Stats
  ): IEntityAnimationState {
    if(!this.initialised) return state.animation;
    const updatedState: IEntityAnimationState = { ...state.animation };
    
    switch(true) {
      case !state.alive:
        this.updatePlayToFinalFrameByAnimation('death', entityName, updatedState, 4);
        break;
      case state.attacking:
      case !state.attacking && state.animation.current.animation === 'attack' && state.animation.current.index < this.getTotalFramesByAnimation('attack', entityName):
        this.updatePlayToFinalFrameByAnimation('attack', entityName, updatedState, stats.fireRate);
        break;
      default:
        updatedState.current.animating = false;
        this.updateMoving(entityName, state.position, updatedState, stats.speed, state.damaged);
        break;
    };

    return updatedState;
  };

  /* Private Methods */
  private constructAnimationLibrary(animations: ReadonlyArray<AnimationType>): AnimationLibrary {
    const animationLibrary = {} as AnimationLibrary;

    animations.forEach(animation => {
      animationLibrary[animation] = {
        active: false,
        initialised: false,
        spritesheet: new Image(),
        frames: []
      };
    });

    return animationLibrary;
  };
  private constructLibrary(animations: ReadonlyArray<AnimationType>, entities: EntityTypeCharacters): EntityAnimationLibrary {
    const library = {} as EntityAnimationLibrary;

    Object.keys(entities).forEach(entity => {
      library[entity as EntityType] = {} as Record<EntityTypeCharactersByEntity<EntityType>, AnimationLibrary>;
      entities[entity as EntityType].forEach(character => {
        (library[entity as EntityType] as Record<string, AnimationLibrary>)[character] = this.constructAnimationLibrary(animations);
      });
    });
    return library;
  };
  private getAnimation(entityName: EntityTypeCharacterCodes, position: Coordinates, previousPosition: Coordinates, damaged: boolean, speed: number, threshold: number): AnimationType {
    const movementAnimation: AnimationType = this.getMovementAnimation(entityName, position, previousPosition, damaged, speed, threshold);
    return movementAnimation;
  };
  private getAnimationDataByEntityCharacterCode(animation: AnimationType, entityName: EntityTypeCharacterCodes): AnimationData {
    const entityType = entityName.split('.')[0] as EntityType;
    const characterType = entityName.split('.')[1] as EntityTypeCharactersByEntity<typeof entityType>;
    const animationData: AnimationData = (this.library[entityType as EntityType] as Record<string, AnimationLibrary>)[characterType][animation];

    return animationData;
  };
  private getAnimationDirectionX(entityPosition: Coordinates, state: IEntityAnimationState): 1 | -1 {
    switch(true){
      case entityPosition.x > state.previous.position.x:
        return 1;
      case entityPosition.x < state.previous.position.x:
        return -1;
      case entityPosition.x === state.previous.position.x:
        return state.previous.scale;
      default:
        return 1;
    };
  };
  private getFrameDelay(entityName: EntityTypeCharacterCodes, state: IEntityAnimationState, speed: number, constant: number = 500): number {
    const animationData: AnimationData = this.getAnimationDataByEntityCharacterCode(state.current.animation, entityName);
    return state.current.animation === 'idle' ? 175 : (constant / speed) / animationData.frames.length;
  };
  private getFramesByAnimation(animation: AnimationType, entityName: EntityTypeCharacterCodes): void {
    const animationData: AnimationData = this.getAnimationDataByEntityCharacterCode(animation, entityName);
    const spritesheetData: ImageData = this.getSpritesheetData(animationData.spritesheet, 0, 0, 'srgb');

    /* Find each frame within the spritesheet based on boundary colour */
    for(let i = 0, frame = 0, startPosition = 0; i < spritesheetData.data.length; i += 4) {
      const frameDetails: Frame = {
        frame: 0,
        width: 0,
        height: animationData.spritesheet.height,
        sx: 0
      };

      /* RGBA values of current pixel */
      const r = spritesheetData.data[i];
      const g = spritesheetData.data[i+1];
      const b = spritesheetData.data[i+2];
      const a = spritesheetData.data[i+3];

      /* If RGBA colour matches boundary colour push frame details */
      if(r >= 250 && g <= 5 && b <= 5 && a === 255) {
        frame ++;
        frameDetails.width = (i / 4) - startPosition - 1;
        frameDetails.frame = frame;
        frameDetails.sx = startPosition;
        animationData.frames.push(frameDetails);
        startPosition = startPosition + frameDetails.width + 3;
      };
    };
  };
  private getSpritesheetData(spritesheet: HTMLImageElement, sx: number, sy: number, settings: 'srgb' | 'display-p3', sh: number = 1): ImageData {
    /* Prepare temp canvas and context */
    const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.width = spritesheet.width;
    canvas.height = sh;
    canvas.style.imageRendering = 'pixelated';
    context.imageSmoothingEnabled = false;

    /* Draw spritesheet into canvas and get pixel data */
    context.drawImage(spritesheet, sx, sy, spritesheet.width, sh, 0, 0, spritesheet.width, sh);
    const spritesheetData: ImageData = context.getImageData(0, 0, spritesheet.width, sh, { colorSpace: settings });
    
    return spritesheetData;
  };
  private getMovementState(position: Coordinates, previousPosition: Coordinates): string {
    return position.x === previousPosition.x && position.y === previousPosition.y ? 'idle' : 'move';
  };
  private getMovementStateVariations(entityName: EntityTypeCharacterCodes, state: string): string[] {
    const entity = entityName.split('.')[0] as EntityType;
    const character = entityName.split('.')[1] as EntityTypeCharactersByEntity<typeof entity>;
    const activeAnimations = Object.fromEntries(Object.entries((this.library[entity as EntityType] as Record<string, AnimationLibrary>)[character]).filter(([_key, value]) => value.active));
    const variations = Object.keys(activeAnimations).filter(key => key.includes(state) && !key.includes('damaged'));

    return variations;
  };
  private getMoveTypes(entityName: EntityTypeCharacterCodes, damaged: boolean, speed: number, threshold: number): AnimationType {
    const entity = entityName.split('.')[0] as EntityType;
    const character = entityName.split('.')[1] as EntityTypeCharactersByEntity<typeof entity>;
    const activeAnimations = Object.fromEntries(Object.entries((this.library[entity as EntityType] as Record<string, AnimationLibrary>)[character]).filter(([_key, value]) => value.active));
    const types = Object.keys(activeAnimations).filter(key => {
      const isMoving = speed <= threshold ? key.includes('walk') : key.includes('run');
      const isDamaged = damaged ? key.includes('damaged') : !key.includes('damaged');
      return isMoving && isDamaged;
    });
    return types[0] as AnimationType;
  };
  private getMovementAnimation(entityName: EntityTypeCharacterCodes, position: Coordinates, previousPosition: Coordinates, damaged: boolean, speed: number, threshold: number): AnimationType {
    const movementState = this.getMovementState(position, previousPosition);
    const variations = this.getMovementStateVariations(entityName, movementState);
    if(variations.length > 1) {
      return this.getMoveTypes(entityName, damaged, speed, threshold);
    } else {
      const animation = damaged ? `${variations[0]}-damaged` : variations[0];
      return animation as AnimationType;
    };
  };
  private getTimeSinceLastFrameChange(previousChange: number): number {
    return window.performance.now() - previousChange;
  };
  private getTotalFramesByAnimation(animation: AnimationType, entityName: EntityTypeCharacterCodes): number {
    const animationData = this.getAnimationDataByEntityCharacterCode(animation, entityName);
    return animationData.frames.length - 1;
  };
  private initialiseLibrary(scale: number, world: WorldTypes): void {
    Object.entries(this.library).forEach(([entity, characters]) => {
      Object.entries(characters).forEach(([character, animations]) => {
        Object.entries(animations).forEach(([animation, data]) => {
          const source = entity === 'player' ? `/assets/images/entities/${entity}/${character}/${animation}.png` : `/assets/images/entities/${entity}/${world}/${character}/${animation}.png`;
          data.spritesheet = new Image();
          data.spritesheet.src = source;
          data.frames = [];
          data.spritesheet.onload = () => {
            const entityCharacterCode = `${entity}.${character}` as EntityTypeCharacterCodes;
            data.active = true;
            this.getFramesByAnimation(animation as AnimationType, entityCharacterCode);
            this.upscaleSpritesheetByAnimation(animation as AnimationType, entityCharacterCode, scale);
            this.recalculateFrameDetailsByAnimation(animation as AnimationType, entityCharacterCode, scale);
            data.initialised = true;
            
            if(entity === 'enemy' && animation  === 'idle') this.eventEmitter.emit("enemyCharacterInitialised", {
              character: character as EntityTypeCharactersByEntity<'enemy'>,
              boundingBox: { width: data.frames[0].width, height: data.frames[0].height }
            });
          };
          data.spritesheet.onerror = () => {
            data.active = false;
            data.initialised = false;
          };
        });
      });
    });
  };
  private recalculateFrameDetailsByAnimation(animation: AnimationType, entityName: EntityTypeCharacterCodes, multiplier: number): void {
    const animationData = this.getAnimationDataByEntityCharacterCode(animation, entityName);
    animationData.frames.forEach(frame => {
      frame.sx *= multiplier;
      frame.width *= multiplier;
      frame.height *= multiplier;
    });
  };
  /**
   * Scales an image be a given factor. 
   * @param imageData - ImageData for an image.
   * @param scale - The factor by which to scale the image.
   * @returns Returns the scaled image that you can use as a source for an HTML element.
   */
  private scaleImageNearestNeighbour(imageData: ImageData, scale: number): string {
    /* Define original and new dimensions */
    const originalDimensions = {
      width: imageData.width,
      height: imageData.height
    };
    const upscaledDimensions =  {
      width: imageData.width * scale,
      height: imageData.height * scale
    };

    /* Create canvas for upscaling */
    const canvas = document.createElement('canvas');
    canvas.width = upscaledDimensions.width;
    canvas.height = upscaledDimensions.height;
    const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

    /* Prepare scaled image data */
    const upscaledImageData = context.createImageData(upscaledDimensions.width, upscaledDimensions.height);
    const upscaledPixels = upscaledImageData.data;
    const originalPixels = imageData.data;

    /* Perform nearest neighbour scaling */
    for(let y = 0; y < originalDimensions.height; y++) {
      for(let x = 0; x < originalDimensions.width; x++) {
        /* Get rgba values of current pixel */
        const OriginalIndex = (y * originalDimensions.width + x) * 4;
        const r = originalPixels[OriginalIndex];
        const g = originalPixels[OriginalIndex + 1];
        const b = originalPixels[OriginalIndex + 2];
        const a = originalPixels[OriginalIndex + 3];

        /* Map pixel to scaled image */
        for(let dy = 0; dy < scale; dy++) {
          for(let dx = 0; dx < scale; dx++) {
            const coordinates = {
              x: x * scale + dx,
              y: y * scale + dy
            };
            const destinationIndex = (coordinates.y * upscaledDimensions.width + coordinates.x) * 4;

            /* Set RGBA values for scaled image */
            upscaledPixels[destinationIndex] = r;
            upscaledPixels[destinationIndex + 1] = g;
            upscaledPixels[destinationIndex + 2] = b;
            upscaledPixels[destinationIndex + 3] = a;
          };
        };
      };
    };

    /* Set scaled image to canvas ready to create base64 url */
    context.putImageData(upscaledImageData, 0, 0);

    return canvas.toDataURL('image/png');
  };
  private updatePlayToFinalFrameByAnimation(animation: AnimationType, entityName: EntityTypeCharacterCodes, state: IEntityAnimationState, speed: number): void {
    if(!state.current.animating) state.current.animating = true;
    if(state.current.animation !== animation) {
      state.current.animation = animation;
      state.current.index = 0;
    };
    const frameDelay = animation === 'death' ? 100 : this.getFrameDelay(entityName, state, speed, 100);
    if(this.getTimeSinceLastFrameChange(state.previous.change) >= frameDelay) {
      if(state.current.animating && state.current.index < this.getTotalFramesByAnimation(animation, entityName)) {
        state.current.index += 1;
        state.previous.change = window.performance.now();
      } else {
        if(animation === 'death') state.current.active = false;
        state.current.animating = false;
        state.previous.change = window.performance.now();
      };
    };
  };
  private updateMoving(entityName: EntityTypeCharacterCodes, entityPosition: Coordinates, state: IEntityAnimationState, speed: number, damaged: boolean): void {
    if(!this.initialised) return;
    
    /* Save previous state values */
    state.previous.animation = state.current.animation;
    state.previous.scale = state.current.scale;

    /* Get current state values */
    state.current.animation = this.getAnimation(entityName, entityPosition, state.previous.position, damaged, speed, 2.5);
    state.current.scale = this.getAnimationDirectionX(entityPosition, state);
    
    if (state.current.animation.split('-')[0] === state.previous.animation.split('-')[0]) {
      if (this.getTimeSinceLastFrameChange(state.previous.change) >= this.getFrameDelay(entityName, state, speed, 3000) && state.previous.change !== 0) {
        if (state.current.index === this.getTotalFramesByAnimation(state.current.animation, entityName)) {
          state.current.index = 0;
        } else {
          state.current.index += 1;
        };
        state.previous.change = window.performance.now();
      } else if (state.previous.change === 0) {
        state.previous.change = window.performance.now();
      };
    } else {
      state.current.index = 0;
      state.previous.change = window.performance.now();
    };
    
    state.previous.position = {...entityPosition};
  };
  private upscaleSpritesheetByAnimation(animation: AnimationType, entityName: EntityTypeCharacterCodes, scale: number): void {
    if (scale <= 1) throw new Error("Scale must be greater than 1");

    const animationData: AnimationData = this.getAnimationDataByEntityCharacterCode(animation, entityName);
    const spritesheetData: ImageData = this.getSpritesheetData(animationData.spritesheet, 0, 0, 'srgb', animationData.spritesheet.height);
    const upscaledSpritesheet = this.scaleImageNearestNeighbour(spritesheetData, scale);

    animationData.spritesheet.onload = null;
    animationData.spritesheet.width = spritesheetData.width * scale;
    animationData.spritesheet.height = spritesheetData.height * scale;
    animationData.spritesheet.src = upscaledSpritesheet;
  };
};