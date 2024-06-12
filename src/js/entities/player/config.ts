import { PlayerConfig } from "../../utils/types/interfaces";

class PlayerConfiguration implements PlayerConfig {
  width: number;
  height: number;
  offset: { x: number; y: number; };

  constructor(config: PlayerConfig) {
    this.width = config.width;
    this.height = config.height;
    this.offset = config.offset;
  };
};

export default PlayerConfiguration;