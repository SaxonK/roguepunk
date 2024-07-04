import { ControlsManager as ControlsManagerInterface, ActionBinding } from "../../utils/types/interfaces";
import { allActions, Action, AllActions, ActionStates } from "../../utils/types/types";
export default class ControlsManager implements ControlsManagerInterface {
  public actionMapping: ActionBinding;
  public actionState: ActionStates;

  constructor(mapping: ActionBinding) {
    const initialActions: Record<Action, boolean> = {} as Record<Action, boolean>;
    allActions.forEach(action => {
      initialActions[action as Action] = false;
    });
    this.actionState = initialActions;
    this.actionMapping = mapping;
  };
  public setActionStateTrue(key: string): void {
    if(Object.keys(this.actionMapping).includes(key)) {
      const action = this.actionMapping[key];
      this.actionState[action] = true;
    };
  };
  public setActionStateFalse(key: string): void {
    if(Object.keys(this.actionMapping).includes(key)) {
      const action = this.actionMapping[key];
      this.actionState[action] = false;
    };
  };
  public get activeUserActions(): AllActions[] {
    return Object.keys(this.actionState).filter(key => this.actionState[key as Action] === true) as AllActions[];
  };
};