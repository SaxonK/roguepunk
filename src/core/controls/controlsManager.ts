import { ControlsManager as ControlsManagerInterface } from "../../utils/types/interfaces";
import { ActionBinding, allActions, Action, AllActions, ActionStates, keyBinds } from "../../utils/types/types";
export default class ControlsManager implements ControlsManagerInterface {
  public actionMapping: ActionBinding;
  public actionState: ActionStates;

  constructor(mapping: keyBinds) {
    const states: Record<Action, boolean> = {} as Record<Action, boolean>;
    const actionMap: ActionBinding = {} as ActionBinding;
    
    allActions.forEach(action => {
      states[action as Action] = false;
      actionMap[action as Action] = {
        keys: {
          keyboard: mapping[action],
          controller: ""
        },
        repeatable: action !== 'select' ? true : false
      };
    });

    this.actionState = states;
    this.actionMapping = actionMap;
  };
  public isRepeatableByKey(key: string): boolean | undefined {
    for(const action in this.actionMapping) {
      if(this.actionMapping[action as Action].keys.keyboard === key) {
        return this.actionMapping[action as Action].repeatable;
      }
    };
  };
  public resetActionStates(): void {
    for(const action in this.actionMapping) {
      this.actionState[action as Action] = false;
    };
  }
  public setActionStateTrue(key: string): void {
    for(const action in this.actionMapping) {
      if(this.actionMapping[action as Action].keys.keyboard === key) {
        this.actionState[action as Action] = true;
      };
    };
  };
  public setActionStateFalse(key: string): void {
    for(const action in this.actionMapping) {
      if(this.actionMapping[action as Action].keys.keyboard === key) {
        this.actionState[action as Action] = false;
      };
    };
  };
  public get activeUserActions(): AllActions[] {
    return Object.keys(this.actionState).filter(key => this.actionState[key as Action] === true) as AllActions[];
  };
};