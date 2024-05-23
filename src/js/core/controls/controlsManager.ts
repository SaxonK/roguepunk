import { ActionBinding } from "../../utils/types/interfaces";
import { Action, actions, ActionStates } from "../../utils/types/types";
import keyboardMapping from "../../config/settings/controls/keyboard.json";

class ControlsManager {
  public actionMapping: ActionBinding;
  public actionState: ActionStates;

  constructor(mapping: ActionBinding) {
    const initialActions: Record<Action, boolean> = {} as Record<Action, boolean>;
    actions.forEach(action => {
      initialActions[action as Action] = false;
    });
    this.actionState = initialActions;
    this.actionMapping = mapping;
  };

  private setActionStateTrue(key: string): void {
    if(Object.keys(this.actionMapping).includes(key)) {
      const action = this.actionMapping[key];
      this.actionState[action] = true;
    };
  };
  private setActionStateFalse(key: string): void {
    if(Object.keys(this.actionMapping).includes(key)) {
      const action = this.actionMapping[key];
      this.actionState[action] = false;
    };
  };
  public get activeUserActions(): Array<string> {
    return Object.keys(this.actionState).filter(key => this.actionState[key as Action] === true)
  };
  public initialiseEventListeners(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      event.preventDefault();
      const keyPressed: string = event.key;
      this.setActionStateTrue(keyPressed);
    });
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      event.preventDefault();
      const keyPressed: string = event.key;
      this.setActionStateFalse(keyPressed);
    });
  };
};

const keyboard = keyboardMapping as Record<string, Action>;
let KeyBinds = {} as Record<string, Action>;
Object.keys(keyboard).forEach(key => {
  if(typeof keyboard[key] === 'string' && actions.includes(keyboard[key])) {
    KeyBinds[key] = keyboard[key]
  }
});

export const controlsManager = new ControlsManager(KeyBinds);