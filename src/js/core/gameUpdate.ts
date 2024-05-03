import { States } from "../utils/types/interfaces";

const update = (gameState: States): States => {
  let states = gameState;

  if (states.hasOwnProperty('entities') && states.entities.length > 0) {
    let entities = states.entities;
    
    /* entities.forEach(entity => {
      entity.state.update();
    }); */
  };

  states.player.update();

  return states;
};

export default update;