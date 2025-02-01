import { Camera, ControlsManager, EventEmitter, FpsManager, Scope, States, IWorld } from "../utils/types/interfaces";
import { Coordinates, Events } from "../utils/types/types";

export default class Game implements Scope {
  viewport: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  controlsManager: ControlsManager;
  animationFrameId: number = -1;
  fps: FpsManager;
  state: States;

  private eventEmitter: EventEmitter<Events>;
  private debug: boolean;

  constructor(
    camera: Camera,
    controlsManager: ControlsManager,
    fpsManager: FpsManager,
    world: IWorld,
    eventEmitter: EventEmitter<Events>
  ) {
    this.viewport = document.createElement('canvas') as HTMLCanvasElement;
    this.context = this.viewport.getContext('2d') as CanvasRenderingContext2D;
    this.controlsManager = controlsManager;

    this.setupViewport();

    this.fps = fpsManager;
    this.state = {
      camera: camera,
      mouse: { x: 0, y: 0 },
      world: world
    };

    this.eventEmitter = eventEmitter;
    this.debug = false;
    this.eventEmitter.on("gamePause", () => this.pause());
    this.eventEmitter.on("gameStart", () => this.start());
    this.eventEmitter.on("levelChanged", () => this.pause());
    this.eventEmitter.on("worldEnd", () => this.pause());
    this.eventEmitter.on("worldLoadStart", () => this.pause());
    this.eventEmitter.on("worldLoadComplete", () => this.start());
  };

  /* Public Methods */
  public get mouseCanvasPosition(): Coordinates {
    return {
      x: Math.floor((this.state.mouse.x + (this.state.camera.x))),
      y: Math.floor((this.state.mouse.y + (this.state.camera.y)))
    };
  };
  public debugToggle(): void {
    this.debug = !this.debug;
  };
  private setupViewport(): void {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;
    this.context.translate(this.viewport.width / 2, this.viewport.height / 2);
  };

  public initialiseCanvas(gameContainer: HTMLElement): void {
    this.viewport.id = 'game-container';
    gameContainer.insertBefore(this.viewport, gameContainer.firstChild);
    window.addEventListener("resize", this.updateViewport);
  };

  public pause(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
    this.eventEmitter.emit('gameStateChanged', false);
    this.controlsManager.resetActionStates();
  };

  public setMousePosition(event: MouseEvent) {
    const viewportBounds = this.viewport.getBoundingClientRect();
    this.state.mouse.x = event.clientX - (viewportBounds.width / 2);
    this.state.mouse.y = event.clientY - (viewportBounds.height / 2);
  };

  public start(): void {
    this.updateViewport();
    this.gameLoop();
    this.eventEmitter.emit('gameStateChanged', true);
    this.controlsManager.resetActionStates();
    // console.log(this.state.world);
  };

  /* Private Methods */
  private gameLoop(): void {
    let lastUpdate: EpochTimeStamp = window.performance.now();
    const tickInterval: number = 1000 / this.fps.TargetFramerate;
  
    const tick = (timestamp: EpochTimeStamp): void => {
      /* store the frame ID in the game scope so we can pause the game loop */
      this.animationFrameId = window.requestAnimationFrame(tick);
      
      const delta = timestamp - lastUpdate;
  
      /* Control the rate of each tick by comparing the elapsed time against the tick interval */
      if(delta > tickInterval) {
        lastUpdate = timestamp - (delta % tickInterval);
  
        if(this.fps.displayFramerate) {
          this.fps.calculateFPS(lastUpdate);
        };
  
        this.update();
        this.render();
        // console.log('tick');
      };
    };
  
    this.animationFrameId = window.requestAnimationFrame(tick);
  };
  private cursorCoordinates(context: CanvasRenderingContext2D): void {
    context.fillStyle = '#fff';
    context.fillText(
      `${this.mouseCanvasPosition.x},${this.mouseCanvasPosition.y}`,
      this.mouseCanvasPosition.x - 16,
      this.mouseCanvasPosition.y - 16
    );
  };
  private update(): void {
    let player = this.state.world.state.player;
    let camera = this.state.camera;
    let world = this.state.world;

    world.update(this.controlsManager.activeUserActions, this.mouseCanvasPosition);
    camera.update(player.state.gameplay.position.x, player.state.gameplay.position.y);
  };
  private render(): void {
    const { context, state, viewport } = this;
    const width = viewport.width;
    const height = viewport.height;
  
    /* Clear the canvas */
    context.clearRect(0, 0, width, height);
  
    /* Calculate camera offsets */
    const cameraOffsetX = state.camera.x - width / 2;
    const cameraOffsetY = state.camera.y - height / 2;
  
    /* Render World */
    this.state.world.render(context, { x: cameraOffsetX, y: cameraOffsetY }, this.debug);

    /* Render Cursor Position */
    context.save();
      context.translate(-cameraOffsetX, -cameraOffsetY);
      if(this.debug) this.cursorCoordinates(context);
    context.restore();
  
    /* Render Camera */
    state.camera.render(context);

    /* Render FPS */
    if (this.fps.displayFramerate) this.fps.render(context, viewport.width);
  };
  private updateViewport = (): void => {
    if (this.animationFrameId !== 0 && this.animationFrameId !== -1) {
      this.viewport.width = window.innerWidth;
      this.viewport.height = window.innerHeight;
      this.state.camera.resize(window.innerWidth, window.innerHeight);
    }
  };
};