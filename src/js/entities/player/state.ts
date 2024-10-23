import { EntityLifecycleState, LevelSystem, PlayerGameplayState, PlayerState as State } from "../../utils/types/interfaces";
import { PlayerStateObject } from "../../utils/types/types";

class PlayerState implements State {
  lifecycle: EntityLifecycleState;
  gameplay: PlayerGameplayState;

  constructor(state: PlayerStateObject, levelSystem: LevelSystem) {
    this.lifecycle = {
      alive: true,
      dying: false,
      dead: false
    };
    this.gameplay = {
      coins: state.coins,
      experience: levelSystem,
      hitpoints: state.hitpoints,
      items: state.items,
      position: state.position,
      weapons: state.weapons
    };

    this.gameplay.experience.setStartingExperience(state.startingExperience);
  };
};

export default PlayerState;