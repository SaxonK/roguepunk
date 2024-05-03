import { Item, PlayerState as State, Weapon } from "../../utils/types/interfaces";
import { PlayerStateObject } from "../../utils/types/types";

class PlayerState implements State {
  coins: number;
  hitpoints: number;
  items: Item[];
  position: { x: number; y: number; };
  weapons: Weapon[];

  constructor(state: PlayerStateObject) {
    this.coins = state.coins;
    this.hitpoints = state.hitpoints;
    this.items = state.items;
    this.position = state.position;
    this.weapons = state.weapons;
  };

  render(): void {

  };
  update(): void {

  };
};

export default PlayerState;