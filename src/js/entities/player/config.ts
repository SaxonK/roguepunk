import { Config, PlayerConfig } from "../../utils/types/interfaces";
import { BaseCombatType } from "../../utils/types/types";

class PlayerConfiguration implements Config {
  name: string;
  combat: BaseCombatType;
  width: number;
  height: number;
  offset: { x: number; y: number; };

  constructor(config: PlayerConfig) {
    const combat = config.combat as BaseCombatType;

    this.name = `player-${config.name}`;
    this.combat = combat;
    this.width = config.width;
    this.height = config.height;
    this.offset = config.offset;
  };
};

export default PlayerConfiguration;