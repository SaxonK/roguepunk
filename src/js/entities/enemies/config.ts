import { Config } from "../../utils/types/interfaces";

class EnemyConfiguration implements Config {
  width: number;
  height: number;
  offset: { x: number; y: number; };

  constructor(config: Config) {
    this.width = config.width;
    this.height = config.height;
    this.offset = config.offset;
  };
};

export default EnemyConfiguration;