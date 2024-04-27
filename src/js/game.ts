import { Scope } from "./utils/interfaces";
import gameLoop from "./core/gameLoop";

let gameContainer = document.querySelector(`#shootey-wavey`) as HTMLElement;

class Game implements Scope {
  viewport = document.createElement('canvas') as HTMLCanvasElement;
  context = this.viewport.getContext('2d') as CanvasRenderingContext2D;
  animationFrameId: number = 0;
  displayFramerate: boolean;
  framerate: number;
  state: object = {};

  constructor(width: number, fps: number, displayFps: boolean ) {
    this.viewport.width = width;
    this.viewport.height = width / 1.778;
    this.framerate = fps;
    this.displayFramerate = displayFps;
  }
  
  public initialiseCanvas(): void {
    this.viewport.id = 'game-container';
    gameContainer.insertBefore(this.viewport, gameContainer.firstChild);
  }
  public pauseGame(): void {
    cancelAnimationFrame(this.animationFrameId);
  }
  public startGame(): void {
    gameLoop(this);
  }
  public toggleDisplayFramerate(): void {
    this.displayFramerate = !this.displayFramerate;
  }
}

const game = new Game(800, 60, true);
game.initialiseCanvas();

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