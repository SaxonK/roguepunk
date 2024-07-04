import { Action, allActions } from "./utils/types/types";
import ControlsManager from "./core/controls/controlsManager";
import Game from "./core/game";
import keyboardMapping from "./config/settings/controls/keyboard.json";
import MenuInterface from './utils/UI/menuUI';

window.addEventListener("load", () => {
  const app = document.querySelector<HTMLDivElement>('#shootey-wavey') as HTMLElement;

  /* Initialise Controls Manager */
  const keyboard = keyboardMapping as Record<string, Action>;
  let KeyBinds = {} as Record<string, Action>;
  Object.keys(keyboard).forEach(key => {
    if(typeof keyboard[key] === 'string' && allActions.includes(keyboard[key])) {
      KeyBinds[key] = keyboard[key]
    }
  });
  const controlsManager = new ControlsManager(KeyBinds);

  /* Initialise Game */
  const game = new Game(60, true);
  game.initialiseCanvas(app);
  
  /* Initialise Main Menu */
  const mainMenuInterface = new MenuInterface(['Start Game', 'Toggle FPS', 'Settings'], game.fps.displayFramerate);
  mainMenuInterface.appendElementToParent(app);
  mainMenuInterface.bindActionToButton('start-game', () => mainMenuInterface.play());
  mainMenuInterface.bindActionToButton('start-game', () => game.start(controlsManager));
  mainMenuInterface.bindActionToButton('toggle-fps', () => game.fps.toggleFramerateDisplay());
  mainMenuInterface.bindActionToButton('toggle-fps', () => mainMenuInterface.toggleFpsDisplay(game.fps.displayFramerate));

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
  });
  document.addEventListener('keyup', (event: KeyboardEvent) => {
    event.preventDefault();
    const keyPressed: string = event.key;
    controlsManager.setActionStateFalse(keyPressed);
  });
});