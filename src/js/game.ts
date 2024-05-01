import { FpsManager, Scope, States } from "./utils/interfaces";
import FPSManager from "./utils/FpsManager";
import gameLoop from "./core/gameLoop";

let gameContainer = document.querySelector(`#shootey-wavey`) as HTMLElement;

class Game implements Scope {
  viewport = document.createElement('canvas') as HTMLCanvasElement;
  context = this.viewport.getContext('2d') as CanvasRenderingContext2D;
  animationFrameId: number = 0;
  fps: FpsManager;
  state: States;

  constructor(width: number, fps: number, displayFps: boolean ) {
    this.viewport.width = width;
    this.viewport.height = width / 1.778;
    this.fps = new FPSManager(displayFps, fps, window.performance.now());
    this.state = {
      entities: [],
      player: {
        coins: 0,
        hitpoints: 10,
        position: {
          x: 0,
          y: 0
        },
        speed: 1,
        render: (): void => {
          
        },
        update: (): void => {
          
        }
      }
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

/* Bind toggleFramerateDisplay() to Toggle FPS button */
const fpsButton = document.querySelector(`button#fps-display`) as HTMLButtonElement;
fpsButton.addEventListener('click', () => {
  game.fps.toggleFramerateDisplay();
});