import { Item, LevelSystem, PlayerState as State, Weapon } from "../../utils/types/interfaces";
import { PlayerStateObject } from "../../utils/types/types";

class PlayerState implements State {
  coins: number;
  experience: LevelSystem;
  hitpoints: number;
  items: Item[];
  position: { x: number; y: number; };
  weapons: Weapon[];

  constructor(state: PlayerStateObject, levelSystem: LevelSystem) {
    this.coins = state.coins;
    this.experience = levelSystem;
    this.hitpoints = state.hitpoints;
    this.items = state.items;
    this.position = state.position;
    this.weapons = state.weapons;

    this.experience.setStartingExperience(state.startingExperience);
  };
};

export default PlayerState;