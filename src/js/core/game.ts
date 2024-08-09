import { Camera, ControlsManager, Enemy, EventEmitter, FpsManager, Player, Scope, States } from "../utils/types/interfaces";
import { Events } from "../utils/types/types";
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
      player: player
    };

    this.eventEmitter = eventEmitter;
  }

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

  public start(controlsManager: ControlsManager): void {
    this.updateViewport();
    gameLoop(this, controlsManager);
    this.eventEmitter.emit('gameStateChanged', true);
  }

  private updateViewport = (): void => {
    if (this.animationFrameId !== 0 && this.animationFrameId !== -1) {
      this.viewport.width = window.innerWidth;
      this.viewport.height = window.innerHeight;
      this.state.camera.resize(window.innerWidth, window.innerHeight);
    }
  }
};