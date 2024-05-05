import { FpsManager, Scope, States } from "./utils/types/interfaces";
import Camera from "./entities/camera/camera";
import FPSManager from "./utils/FpsManager";
import gameLoop from "./core/gameLoop";
import Player from "./entities/player/player";
import * as PlayerConfig from './config/player/default.json';
import PlayerState from "./entities/player/state";
import Stats from "./entities/player/stats";

let gameContainer = document.querySelector(`#shootey-wavey`) as HTMLElement;

class Game implements Scope {
  viewport = document.createElement('canvas') as HTMLCanvasElement;
  context = this.viewport.getContext('2d') as CanvasRenderingContext2D;
  animationFrameId: number = 0;
  fps: FpsManager;
  state: States;

  constructor(width: number, fps: number, displayFps: boolean, player: Player) {
    this.viewport.width = width;
    this.viewport.height = width / 1.778;
    this.fps = new FPSManager(displayFps, fps, window.performance.now());
    this.state = {
      camera: new Camera(0, 0, this.viewport.width, this.viewport.height),
      entities: [],
      player: player
    };
  };
  
  public initialiseCanvas(): void {
    this.viewport.id = 'game-container';
    gameContainer.insertBefore(this.viewport, gameContainer.firstChild);
  };
  public pauseGame(): void {
    cancelAnimationFrame(this.animationFrameId);
  };
  public startGame(): void {
    gameLoop(this);
  };
};

const player = new Player({
  stats: new Stats(PlayerConfig.stats),
  state: new PlayerState(PlayerConfig.state)
});

const game = new Game(window.innerWidth / 1.5, 60, true, player);
game.initialiseCanvas();
console.log(game);

/* Pause the game if the tab is hidden */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    game.pauseGame();
  }
});

/* Bind startGame() to start button */
const startButton = document.querySelector(`button#start`) as HTMLButtonElement;
startButton.addEventListener('click', () => {
  game.startGame();
});

/* Bind pauseGame() to pause button */
const pauseButton = document.querySelector(`button#pause`) as HTMLButtonElement;
pauseButton.addEventListener('click', () => {
  game.pauseGame();
});

/* Bind toggleFramerateDisplay() to Toggle FPS button */
const fpsButton = document.querySelector(`button#fps-display`) as HTMLButtonElement;
fpsButton.addEventListener('click', () => {
  game.fps.toggleFramerateDisplay();
});