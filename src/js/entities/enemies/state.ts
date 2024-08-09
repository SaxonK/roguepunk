import { EnemyState as State, StatusEffects } from "../../utils/types/interfaces";
import { PlayerStateObject } from "../../utils/types/types";

class EnemyState implements State {
  effects: StatusEffects[];
  hitpoints: number;
  position: { x: number; y: number; };

  constructor(state: PlayerStateObject) {
    this.effects = [];
    this.hitpoints = state.hitpoints;
    this.position = state.position;
  };

  render(): void {

  };
  update(): void {

  };
};

export default EnemyState;