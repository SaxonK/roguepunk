import { ControlsManager, FpsManager, Scope, States } from "../utils/types/interfaces";
import Camera from "../entities/camera/camera";
import FPSManager from "../utils/FpsManager";
import gameLoop from "./gameLoop";
import Player from "../entities/player/player";
import * as PlayerConfig from '../config/player/default.json';
import PlayerConfiguration from "../entities/player/config";
import PlayerState from "../entities/player/state";
import Stats from "../entities/player/stats";

export default class Game implements Scope {
  viewport = document.createElement('canvas') as HTMLCanvasElement;
  context = this.viewport.getContext('2d') as CanvasRenderingContext2D;
  animationFrameId: number = -1;
  fps: FpsManager;
  state: States;

  constructor(fps: number, displayFps: boolean) {
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;
    this.context.translate(this.viewport.width / 2, this.viewport.height / 2);
    this.fps = new FPSManager(displayFps, fps, window.performance.now());
    this.state = {
      camera: new Camera(0, 0, this.viewport.width, this.viewport.height),
      entities: [],
      player: new Player({
        config: new PlayerConfiguration(PlayerConfig.config),
        stats: new Stats(PlayerConfig.stats),
        state: new PlayerState(PlayerConfig.state)
      })
    };
  };
  
  public initialiseCanvas(gameContainer: HTMLElement): void {
    this.viewport.id = 'game-container';
    gameContainer.insertBefore(this.viewport, gameContainer.firstChild);
    window.addEventListener("resize", this.updateViewport);
  };
  public pause(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = 0;
  };
  public start(ControlsManager: ControlsManager): void {
    gameLoop(this, ControlsManager);
  };
  public updateViewport = (): void => {
    if(this.animationFrameId !== 0 && this.animationFrameId !== -1) {
      this.viewport.width = window.innerWidth;
      this.viewport.height = window.innerHeight;
      this.state.camera.resize(window.innerWidth, window.innerHeight);
    }
  };
};