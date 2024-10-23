import { AnimationFrameDetails, AnimationHandler as IAnimationHandler, AnimationState, EnemyConfig, Frame, PlayerConfig, Stats } from "../../utils/types/interfaces";
import { AnimationLibrary, animationType, AnimationType, Coordinates } from "../../utils/types/types";

export default class AnimationHandler implements IAnimationHandler {
  private state: AnimationState;
  private library: AnimationLibrary;

  constructor(entity: EnemyConfig | PlayerConfig, startingPosition: Coordinates) {
    this.library = {} as AnimationLibrary; 
    this.state = {
      current: {
        active: true,
        index: 0,
        animation: 'idle',
        animating: false,
        position: startingPosition,
        scale: 1
      },
      previous: {
        animation: 'idle',
        change: 0,
        position: startingPosition,
        scale: 1
      }
    };
    this.initialiseLibrary(entity.name.split('-'), animationType, 2);
  };

  /* Getters */
  public get deathAnimationComplete(): boolean {
    return this.state.current.animation === 'death' && this.state.current.animating && this.state.current.active ? false : true;
  };
  public get frame(): AnimationFrameDetails {
    return {
      spritesheet: this.library[this.state.current.animation].spritesheet as HTMLImageElement,
      scale: this.state.current.scale,
      sx: this.library[this.state.current.animation].frames[this.state.current.index].sx,
      sy: 0,
      sw: this.library[this.state.current.animation].frames[this.state.current.index].width,
      sh: this.library[this.state.current.animation].frames[this.state.current.index].height
    };
  };
  private get movementState(): string {
    return this.state.current.position.x === this.state.previous.position.x && this.state.current.position.y === this.state.previous.position.y ? 'idle' : 'move';
  };
  private get timeSinceLastFrameChange(): number {
    return window.performance.now() - this.state.previous.change;
  };

  /* Public Methods */
  public update(entityPosition: Coordinates, stats: Stats, damaged: boolean, animation: AnimationType | null = null, animating: boolean = false): void {
    switch(true) {
      case animation === 'death' && animating:
        this.updatePlayToFinalFrameByAnimation('death', 4);
        break;
      case animation === 'attack' && animating:
        this.updatePlayToFinalFrameByAnimation('attack', stats.fireRate);
        break;
      default:
        this.state.current.animating = false;
        this.updateMoving(entityPosition, stats.speed, damaged);
        break;
    };
  };

  /* Private Methods */
  private getAnimation(damaged: boolean, speed: number, threshold: number): AnimationType {
    const movementAnimation: AnimationType = this.getMovementAnimation(damaged, speed, threshold);
    return movementAnimation;
  };
  private getAnimationDirectionX(entityState: Coordinates): 1 | -1 {
    switch(true){
      case entityState.x > this.state.previous.position.x:
        return 1;
      case entityState.x < this.state.previous.position.x:
        return -1;
      case entityState.x === this.state.previous.position.x:
        return this.state.previous.scale;
      default:
        return 1;
    };
  };
  private getFrameDelay(speed: number, constant: number = 500): number {
    return this.state.current.animation === 'idle' ? 175 : (speed * constant) / this.library[this.state.current.animation].frames.length;
  };
  private getFramesByAnimation(animation: AnimationType): void {
    const spritesheetData = this.getSpritesheetDataByAnimation(0, 0, this.library[animation].spritesheet.width, 1, 'srgb' , animation);

    /* Find each frame within the spritesheet based on boundary colour */
    for(let i = 0, frame = 0, startPosition = 0; i < spritesheetData.data.length; i += 4) {
      const frameDetails: Frame = {
        frame: 0,
        width: 0,
        height: this.library[animation].spritesheet.height,
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
        this.library[animation].frames.push(frameDetails);
        startPosition = startPosition + frameDetails.width + 3;
      };
    };
  };
  private getSpritesheetDataByAnimation(sx: number, sy: number, sw: number, sh: number, settings: 'srgb' | 'display-p3', animation: AnimationType): ImageData {
    const spritesheet = this.library[animation].spritesheet;

    /* Prepare temp canvas and context */
    const canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
    const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.width = sw;
    canvas.height = sh;
    canvas.style.imageRendering = 'pixelated';
    context.imageSmoothingEnabled = false;

    /* Draw spritesheet into canvas and get pixel data */
    context.drawImage(spritesheet, sx, sy, sw, sh, 0, 0, sw, sh);
    const spritesheetData: ImageData = context.getImageData(0, 0, sw, sh, { colorSpace: settings });
    
    return spritesheetData;
  };
  private getMovementStateVariations(state: string): string[] {
    const activeAnimations = Object.fromEntries(Object.entries(this.library).filter(([_key, value]) => value.active));
    const variations = Object.keys(activeAnimations).filter(key => key.includes(state) && !key.includes('damaged'));
    return variations;
  };
  private getMoveTypes(damaged: boolean, speed: number, threshold: number): AnimationType {
    const activeAnimations = Object.fromEntries(Object.entries(this.library).filter(([key, value]) => key.includes('move') && value.active));
    const types = Object.keys(activeAnimations).filter(key => {
      const isMoving = speed <= threshold ? key.includes('walk') : key.includes('run');
      const isDamaged = damaged ? key.includes('damaged') : !key.includes('damaged');
      return isMoving && isDamaged;
    });
    return types[0] as AnimationType;
  };
  private getMovementAnimation(damaged: boolean, speed: number, threshold: number): AnimationType {
    const movementState = this.movementState;
    const variations = this.getMovementStateVariations(movementState);
    if(variations.length > 1) {
      return this.getMoveTypes(damaged, speed, threshold);
    } else {
      const animation = damaged ? `${variations[0]}-damaged` : variations[0];
      return animation as AnimationType;
    };
  };
  private getTotalFramesByAnimation(animation: AnimationType): number {
    return this.library[animation].frames.length - 1;
  };
  private initialiseLibrary(entityTypes: string[], animations: ReadonlyArray<AnimationType>, scale: number): void {
    animations.forEach(animation => {
      this.library[animation] = {
        active: false,
        spritesheet: new Image(),
        frames: []
      };
      this.library[animation].spritesheet.src = `./src/assets/images/entities/${entityTypes[0]}/${entityTypes[1]}/${animation}.png`;
      this.library[animation].spritesheet.onload = () => {
        this.library[animation].active = true;
        this.getFramesByAnimation(animation);
        this.upscaleSpritesheetByAnimation(animation, scale);
        this.recalculateFrameDetailsByAnimation(animation, scale);
      };
    });
  };
  private recalculateFrameDetailsByAnimation(animation: AnimationType, multiplier: number): void {
    this.library[animation].frames.forEach(frame => {
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
  private updatePlayToFinalFrameByAnimation(animation: AnimationType, speed: number): void {
    if(this.state.current.animation !== animation && !this.state.current.animating) {
      this.state.current.animation = animation;
      this.state.current.animating = true;
      this.state.current.index = 0;
    };
    if(this.state.current.animation === animation && this.state.current.animating && this.state.current.index !== this.getTotalFramesByAnimation(animation)) {
      if(this.timeSinceLastFrameChange >= 75) {
        this.state.current.index += 1;
        this.state.previous.change = window.performance.now();
      };
    } else {
      if(this.timeSinceLastFrameChange >= this.getFrameDelay(speed, 1000)) {
        this.state.current.active = false;
        this.state.previous.change = window.performance.now();
        this.state.current.index = 0;
      };
    };
  };
  private updateMoving(entityPosition: Coordinates, speed: number, damaged: boolean): void {
    /* Save previous state values */
    this.state.previous.animation = this.state.current.animation;
    this.state.previous.scale = this.state.current.scale;
    this.state.previous.position = {...this.state.current.position};

    /* Get current state values */
    this.state.current.position.x = entityPosition.x;
    this.state.current.position.y = entityPosition.y;
    this.state.current.animation = this.getAnimation(damaged, speed, 2.5);
    this.state.current.scale = this.getAnimationDirectionX(this.state.current.position);
    
    if (this.state.current.animation.split('-')[0] === this.state.previous.animation.split('-')[0]) {
      if (this.timeSinceLastFrameChange >= this.getFrameDelay(speed) && this.state.previous.change !== 0) {
        if (this.state.current.index === this.getTotalFramesByAnimation(this.state.current.animation)) {
          this.state.current.index = 0;
        } else {
          this.state.current.index += 1;
        };
        this.state.previous.change = window.performance.now();
      } else if (this.state.previous.change === 0) {
        this.state.previous.change = window.performance.now();
      };
    } else {
      this.state.current.index = 0;
      this.state.previous.change = window.performance.now();
    };
  };
  private upscaleSpritesheetByAnimation(animation: AnimationType, scale: number): void {
    if (scale <= 1) throw new Error("Scale must be greater than 1");

    const spritesheet = this.library[animation].spritesheet;
    const spritesheetData = this.getSpritesheetDataByAnimation(0, 0, spritesheet.width, spritesheet.height, "srgb", animation);
    const upscaledSpritesheet = this.scaleImageNearestNeighbour(spritesheetData, scale);

    spritesheet.onload = null;
    spritesheet.width = spritesheetData.width * scale;
    spritesheet.height = spritesheetData.height * scale;
    spritesheet.src = upscaledSpritesheet;
  };
};