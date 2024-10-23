import { Action, allActions } from "./utils/types/types";
import { enemyFactoryFunction } from "./utils/functions/EnemyFactoryFunction";
import { testTilemap } from "./world/initialiser";
import Camera from "./entities/camera/camera";
import ControlsManager from "./core/controls/controlsManager";
import ElementLayer from "./utils/UI/elementLayer";
import Enemy from "./entities/enemies/enemy";
import eventEmitter from "./utils/events/initialiser";
import FPSManager from "./utils/FpsManager";
import Game from "./core/game";
import keyboardMapping from "./config/settings/controls/keyboard.json";
import MenuInterface from './utils/UI/menuUI';
import player from "./entities/player/initialiser";
import StatElementDetailed from "./utils/UI/statElementDetailed";
import StatElementExperience from "./utils/UI/statElementExperience";
import StatElementLevel from "./utils/UI/statElementLevel";
import StatElementWrapper from "./utils/UI/statElementWrapper";

window.addEventListener("load", () => {
  const app: HTMLElement = document.querySelector<HTMLDivElement>('#shootey-wavey') as HTMLElement;

  /* Initialise Controls Manager */
  const keyboard: Record<string, Action> = keyboardMapping as Record<string, Action>;
  const KeyBinds: Record<string, Action> = {} as Record<string, Action>;
  Object.keys(keyboard).forEach(key => {
    if(typeof keyboard[key] === 'string' && allActions.includes(keyboard[key])) {
      KeyBinds[key] = keyboard[key]
    }
  });
  const controlsManager: ControlsManager = new ControlsManager(KeyBinds);

  /* Initialise Game */
  const camera: Camera = new Camera(0, 0, window.innerWidth, window.innerHeight);
  let enemies: Enemy[];
  enemyFactoryFunction('grunt', 10, testTilemap).then(result => {
    enemies = result;
    game.state.enemies = [...game.state.enemies, ...enemies];
  });
  enemyFactoryFunction('assassin', 5, testTilemap).then(result => {
    enemies = result;
    game.state.enemies = [...game.state.enemies, ...enemies];
  });
  enemyFactoryFunction('sniper', 2, testTilemap).then(result => {
    enemies = result;
    game.state.enemies = [...game.state.enemies, ...enemies];
  });
  const fpsManager: FPSManager = new FPSManager(true, 60, window.performance.now());
  const game: Game = new Game(camera, fpsManager, player, eventEmitter);
  game.initialiseCanvas(app);

  /* Initialise Heads Up Display (HUD) layer */
  const elementLayer: ElementLayer = new ElementLayer();
  const expHealthCoupled = [
    new StatElementExperience(eventEmitter, game.state.player.state.gameplay.experience.experience, game.state.player.state.gameplay.experience.experienceToNextLevel),
    new StatElementDetailed('hitpoints', game.state.player.stats.hitpoints, eventEmitter, 'Health')
  ];
  const coreStatElements = [
    new StatElementLevel(eventEmitter, game.state.player.state.gameplay.experience.level),
    new StatElementWrapper('Group exp health', expHealthCoupled)
  ];
  const coreStatsWrapper = new StatElementWrapper('Core Stats', coreStatElements);

  elementLayer.bindElementToAnchor('top-left', coreStatsWrapper);
  elementLayer.initialiseElementLayer(app);
  
  /* Initialise Main Menu */
  const mainMenuInterface: MenuInterface = new MenuInterface(['Start Game', 'Toggle FPS', 'Settings'], game.fps.displayFramerate);
  mainMenuInterface.appendElementToParent(app);
  mainMenuInterface.bindActionToButton('start-game', () => {
    mainMenuInterface.play();
    game.start(controlsManager);
  });
  mainMenuInterface.bindActionToButton('toggle-fps', () => {
    game.fps.toggleFramerateDisplay();
    mainMenuInterface.toggleFpsDisplay(game.fps.displayFramerate);
  });

  /* Initialise Event Listeners */
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    event.preventDefault();
    const keyPressed: string = event.key;
    controlsManager.setActionStateTrue(keyPressed);
    
    if(controlsManager.activeUserActions.includes('pause')) {
      game.pause();
      mainMenuInterface.pause();
    }
    if(mainMenuInterface.states['menu'] && !event.repeat) {
      mainMenuInterface.actionHandler(controlsManager);
    }
    if(!mainMenuInterface.states['menu'] && !event.repeat && controlsManager.activeUserActions.includes('unlockHud')) {
      elementLayer.toggleUnlockClass(true);
    }
  });
  document.addEventListener('keyup', (event: KeyboardEvent) => {
    event.preventDefault();
    const keyPressed: string = event.key;
    controlsManager.setActionStateFalse(keyPressed);
    
    if(!mainMenuInterface.states['menu'] && !event.repeat && !controlsManager.activeUserActions.includes('unlockHud')) {
      elementLayer.toggleUnlockClass(false);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      game.pause();
      mainMenuInterface.pause();
    }
  });
  document.addEventListener('mousemove',(event: MouseEvent) => game.setMousePosition(event));
});