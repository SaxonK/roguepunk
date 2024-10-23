import { Camera, ControlsManager, Enemy, EventEmitter, FpsManager, Player, Scope, States } from "../utils/types/interfaces";
import { Coordinates, Events } from "../utils/types/types";
import gameLoop from "./gameLoop";

export default class Game implements Scope {
  viewport: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  animationFrameId: number = -1;
  fps: FpsManager;
  state: States;

  private eventEmitter: EventEmitter<Events>;

  constructor(
    camera: Camera,
    fpsManager: FpsManager,
    player: Player,
    eventEmitter: EventEmitter<Events>
  ) {
    this.viewport = document.createElement('canvas') as HTMLCanvasElement;
    this.context = this.viewport.getContext('2d') as CanvasRenderingContext2D;

    this.setupViewport();

    this.fps = fpsManager;
    this.state = {
      camera: camera,
      enemies: [],
      player: player,
      mouse: { x: 0, y: 0 }
    };

    this.eventEmitter = eventEmitter;
  };

  public get mouseCanvasPosition(): Coordinates {
    return {
      x: Math.floor((this.state.mouse.x + (this.state.camera.x))),
      y: Math.floor((this.state.mouse.y + (this.state.camera.y)))
    };
  };

  private setupViewport(): void {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;
    this.context.translate(this.viewport.width / 2, this.viewport.height / 2);
  }

  public initialiseCanvas(gameContainer: HTMLElement): void {
    this.viewport.id = 'game-container';
    gameContainer.insertBefore(this.viewport, gameContainer.firstChild);
    window.addEventListener("resize", this.updateViewport);
  }

  public pause(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
    this.eventEmitter.emit('gameStateChanged', false);
  }

  set enemies(enemies: Enemy[]) {
    this.state.enemies = enemies;
  };

  public setMousePosition(event: MouseEvent) {
    const viewportBounds = this.viewport.getBoundingClientRect();
    this.state.mouse.x = event.clientX - (viewportBounds.width / 2);
    this.state.mouse.y = event.clientY - (viewportBounds.height / 2);
  };

  public start(controlsManager: ControlsManager): void {
    this.updateViewport();
    gameLoop(this, controlsManager);
    this.eventEmitter.emit('gameStateChanged', true);
  };

  private updateViewport = (): void => {
    if (this.animationFrameId !== 0 && this.animationFrameId !== -1) {
      this.viewport.width = window.innerWidth;
      this.viewport.height = window.innerHeight;
      this.state.camera.resize(window.innerWidth, window.innerHeight);
    }
  };
};