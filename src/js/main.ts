import { Action, allActions, keyBinds } from "./utils/types/types";
import Camera from "./entities/camera/camera";
import ControlsManager from "./core/controls/controlsManager";
import ElementLayer from "./utils/UI/elementLayer";
import eventEmitter from "./utils/events/initialiser";
import FPSManager from "./utils/FpsManager";
import Game from "./core/game";
import keyboardMapping from "./config/settings/controls/keyboard.json";
import MenuInterface from './utils/UI/menuUI';
import StatElementDetailed from "./utils/UI/statElementDetailed";
import StatElementExperience from "./utils/UI/statElementExperience";
import StatElementLevel from "./utils/UI/statElementLevel";
import TimerElement from "./utils/UI/timerElement";
import StatElementWrapper from "./utils/UI/statElementWrapper";
import world from "./world/initialiser";

window.addEventListener("load", () => {
  const app: HTMLElement = document.querySelector<HTMLDivElement>('#shootey-wavey') as HTMLElement;

  /* Initialise Controls Manager */
  const keyboard: keyBinds = keyboardMapping;
  const KeyBinds: keyBinds = {} as keyBinds;
  Object.keys(keyboard).forEach(key => {
    if(typeof keyboard[key as Action] === 'string' && allActions.includes(key as Action)) {
      KeyBinds[key as Action] = keyboard[key as Action]
    }
  });
  const controlsManager: ControlsManager = new ControlsManager(KeyBinds);

  /* Initialise Game */
  const camera: Camera = new Camera(0, 0, window.innerWidth, window.innerHeight);
  const fpsManager: FPSManager = new FPSManager(true, 60, window.performance.now());
  const game: Game = new Game(camera, controlsManager, fpsManager, world, eventEmitter);
  game.initialiseCanvas(app);

  /* Initialise Heads Up Display (HUD) layer */
  const elementLayer: ElementLayer = new ElementLayer();
  const expHealthCoupled = [
    new StatElementExperience(eventEmitter, game.state.world.state.player.state.gameplay.experience.experience, game.state.world.state.player.state.gameplay.experience.experienceToNextLevel),
    new StatElementDetailed('hitpoints', game.state.world.state.player.stats.hitpoints, eventEmitter, 'Health')
  ];
  const coreStatElements = [
    new StatElementLevel(eventEmitter, game.state.world.state.player.state.gameplay.experience.level),
    new StatElementWrapper('Group exp health', expHealthCoupled)
  ];
  const coreStatsWrapper = new StatElementWrapper('Core Stats', coreStatElements);
  const timerElement = new TimerElement(eventEmitter);

  elementLayer.bindElementToAnchor('top-left', coreStatsWrapper);
  elementLayer.bindElementToAnchor('top-center', timerElement);
  elementLayer.initialiseElementLayer(app);
  
  /* Initialise Main Menu */
  const mainMenuInterface: MenuInterface = new MenuInterface(['Start Game', 'Toggle FPS', 'Settings'], game.fps.displayFramerate);
  mainMenuInterface.appendElementToParent(app);
  mainMenuInterface.bindActionToButton('start-game', () => {
    mainMenuInterface.play();
    eventEmitter.emit('gameStart', true);
  });
  mainMenuInterface.bindActionToButton('toggle-fps', () => {
    game.fps.toggleFramerateDisplay();
    mainMenuInterface.toggleFpsDisplay(game.fps.displayFramerate);
  });

  /* Initialise Event Listeners */
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    event.preventDefault();
    const keyPressed: string = event.key;
    const actionRepeatable = controlsManager.isRepeatableByKey(keyPressed);
    
    if(!event.repeat || event.repeat && actionRepeatable) {
      controlsManager.setActionStateTrue(keyPressed);
    } else {
      controlsManager.setActionStateFalse(keyPressed);
    };

    if(controlsManager.activeUserActions.includes('pause')) {
      eventEmitter.emit("gamePause", false);
      mainMenuInterface.pause();
    }
    if(mainMenuInterface.states['menu'] && !event.repeat) {
      mainMenuInterface.actionHandler(controlsManager);
    }
    if(!mainMenuInterface.states['menu'] && !event.repeat && controlsManager.activeUserActions.includes('unlockHud')) {
      elementLayer.toggleUnlockClass(true);
    }
    if(controlsManager.activeUserActions.includes('debug')) {
      game.debugToggle();
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