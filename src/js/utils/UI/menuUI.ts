import { ControlsManager, InterfaceStates } from "../types/interfaces";
import { actions, ActionFunctions } from "../types/types";

class MenuButton {
  element: HTMLButtonElement = document.createElement('button') as HTMLButtonElement;
  constructor(text: string) {
    this.element.innerText = text;
    this.element.id = text.toLowerCase().replace(/ /g,"-");
  };
};

export default class MenuInterface {
  element: HTMLDivElement = document.createElement('div') as HTMLDivElement;
  states: InterfaceStates;
  actions: ActionFunctions;

  constructor(buttons: Array<string>, fpsDisplayState: boolean) {
    // Create Menu html element
    this.element.classList.add('menu');
    const innerHtml = `<div class="menu-wrapper">
      <h1>Shootey Wavey</h1>
      <div class="actions"></div>
      <video class="menu-background" autoplay muted loop>
        <source src="./src/assets/videos/menu-background.mp4" type="video/mp4" />
      </video>
    </div>`;
    const fpsDisplay = fpsDisplayState ? 'enabled' : 'disabled';
    const toggleFpsNotification = document.createElement('span') as HTMLSpanElement;
    toggleFpsNotification.id = "fps-notification";
    toggleFpsNotification.classList.add(fpsDisplay);
    toggleFpsNotification.innerHTML = `FPS Display <span id="fps-state">${fpsDisplay}</span>`;
    this.element.innerHTML = innerHtml;
    this.element.appendChild(toggleFpsNotification);
    const menuActions: HTMLDivElement = this.element.querySelector('.actions') as HTMLDivElement;
    
    // Create button html elements and append to menu actions
    const buttonStates: Record<string, boolean>[] = [];
    buttons.forEach(button => {
      const htmlButton = new MenuButton(button);
      const objState: Record<string, boolean> = {};
      if(buttons[0] === button) {
        objState[htmlButton.element.id] = true;
        buttonStates.push(objState);
        htmlButton.element.classList.add('highlight');
      } else {
        objState[htmlButton.element.id] = false;
        buttonStates.push(objState);
      }
      menuActions.appendChild(htmlButton.element);
    });

    // Define default states of the menu and buttons
    this.states = {
      menu: true,
      buttons: buttonStates
    };

    // Define user actions and controls mapping
    const actionObject = {} as ActionFunctions;
    actions.menu.forEach(action => {
      actionObject[action] = this[action].bind(this);
    });
    this.actions = actionObject;
  };
  private getHighlightedButtonId(buttons: Record<string, boolean>[]): string | undefined {
    for (const button of buttons) {
      for (const key in button) {
        if (button[key] === true) {
          return key;
        };
      };
    };
    return undefined;
  };
  private getHighlightedButtonIndex(buttons: Record<string, boolean>[]): number | undefined {
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      for (const key in button) {
        if (button[key] === true) {
          return i;
        };
      };
    };
    return undefined;
  };
  private toggleButtonState(buttons: Record<string, boolean>[], key: string): void {
    for (const button of buttons) {
      if (key in button) {
        button[key] = !button[key];
      };
    };
  };
  public appendElementToParent(parent: HTMLElement): void {
    parent.appendChild(this.element);
  };
  public actionHandler(controlsManager: ControlsManager): void {
    const activeMenuActions = [...new Set(actions.menu)].filter(action => controlsManager.activeUserActions.includes(action));
    activeMenuActions.forEach(action => {
      this.actions[action]();
    });
  };
  public bindActionToButton<T extends (...args: unknown[]) => unknown>(button: string, action: T): void {
    const targetButton = this.element.querySelector(`button#${button}`) as HTMLButtonElement;
    if(targetButton !== null || targetButton !== undefined) {
      targetButton.addEventListener('click', action);
    }
  };
  public debug(): void {
    console.log('Debug mode toggled');
  };
  public moveUp(): void {
    if(!this.states['menu']) return;
    const buttonStates = this.states['buttons'] as Record<string, boolean>[];
    const buttonIndex = this.getHighlightedButtonIndex(buttonStates) as number;
    const buttonId = this.getHighlightedButtonId(buttonStates) as string;
    const nextButtonId = buttonIndex !== 0 ? Object.keys(buttonStates[buttonIndex - 1])[0] : Object.keys(buttonStates[buttonStates.length - 1])[0];

    this.toggleButtonState(buttonStates, buttonId);
    this.toggleButtonState(buttonStates, nextButtonId);
    this.element.querySelector(`button#${buttonId}`)?.classList.remove('highlight');
    this.element.querySelector(`button#${nextButtonId}`)?.classList.add('highlight');
  };
  public moveDown(): void {
    if(!this.states['menu']) return;
    const buttonStates = this.states['buttons'] as Record<string, boolean>[];
    const buttonIndex = this.getHighlightedButtonIndex(buttonStates) as number;
    const buttonId = this.getHighlightedButtonId(buttonStates) as string;
    const nextButtonId = buttonIndex !== buttonStates.length - 1 ? Object.keys(buttonStates[buttonIndex + 1])[0] : Object.keys(buttonStates[0])[0];

    this.toggleButtonState(buttonStates, buttonId);
    this.toggleButtonState(buttonStates, nextButtonId);
    this.element.querySelector(`button#${buttonId}`)?.classList.remove('highlight');
    this.element.querySelector(`button#${nextButtonId}`)?.classList.add('highlight');
  };
  public pause(): void {
    if(this.states['menu']) return;
    this.states['menu'] = true;
    this.element.classList.remove('hidden');
  };
  public play(): void {
    if(!this.states['menu']) return;
    this.states['menu'] = false;
    this.element.classList.add('hidden');
  };
  public select(): void {
    if(!this.states['menu']) return;
    const buttonStates = this.states['buttons'] as Record<string, boolean>[];
    const buttonId = this.getHighlightedButtonId(buttonStates);
    const buttonElement = this.element.querySelector(`button#${buttonId}`) as HTMLElement;
    buttonElement.click();
  };
  public toggleFpsDisplay(fpsDisplayState: boolean): void {
    const state = fpsDisplayState ? 'enabled' : 'disabled';
    const notification = this.element.querySelector('#fps-notification') as HTMLSpanElement;
    const notificationState = notification?.querySelector('#fps-state') as HTMLSpanElement;
    if(fpsDisplayState) {
      notification?.classList.remove('disabled');
      notification?.classList.add('enabled');
    } else {
      notification?.classList.remove('enabled');
      notification?.classList.add('disabled'); 
    };
    notificationState.innerHTML = state;

    notification.classList.add('visible');
    setTimeout(() => {
      notification.classList.remove('visible');
    }, 1500);
  };
};