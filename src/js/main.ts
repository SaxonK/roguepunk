import { Action, allActions } from "./utils/types/types";
import ControlsManager from "./core/controls/controlsManager";
import ElementLayer from "./utils/UI/elementLayer";
import Game from "./core/game";
import keyboardMapping from "./config/settings/controls/keyboard.json";
import MenuInterface from './utils/UI/menuUI';
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
  const game: Game = new Game(60, true);
  game.initialiseCanvas(app);

  /* Initialise Heads Up Display (HUD) layer */
  const elementLayer: ElementLayer = new ElementLayer();
  const expHealthCoupled = [
    new StatElementExperience(game.state.player.state.experience, 100),
    new StatElementDetailed('Health', game.state.player.stats.hitpoints)
  ];
  const coreStatElements = [
    new StatElementLevel(1),
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
});