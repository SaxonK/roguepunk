import { EntityLifecycleState, EnemyGameplayState, EnemyState as State } from "../../utils/types/interfaces";

class EnemyState implements State {
  lifecycle: EntityLifecycleState;
  gameplay: EnemyGameplayState;

  constructor(state: EnemyGameplayState) {
    this.lifecycle = {
      alive: true,
      dying: false,
      dead: false
    };
    this.gameplay = {
      effects: state.effects,
      hitpoints: state.hitpoints,
      position: state.position
    };
  };
};

export default EnemyState;