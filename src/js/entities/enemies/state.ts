import { AnimationState, EnemyGameplayState, EntityLifecycleState, EnemyState as State, StatusEffects } from "../../utils/types/interfaces";

class EnemyState implements State {
  animation: AnimationState;
  lifecycle: EntityLifecycleState;
  gameplay: EnemyGameplayState;

  constructor(hitpoints: number, effects: StatusEffects[]) {
    this.animation = {
      current: {
        active: true,
        index: 0,
        animation: 'idle',
        animating: false,
        position: { x: 0, y: 0 },
        scale: 1
      },
      previous: {
        animation: 'idle',
        change: 0,
        position: { x: 0, y: 0 },
        scale: 1
      }
    };
    this.lifecycle = {
      alive: true,
      dying: false,
      dead: false
    };
    this.gameplay = {
      effects: effects,
      hitpoints: hitpoints,
      position: { x: 0, y: 0 }
    };
  };
};

export default EnemyState;