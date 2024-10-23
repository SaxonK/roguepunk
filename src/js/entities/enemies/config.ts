import { EnemyConfig } from "../../utils/types/interfaces";
import { BaseCombatType, BaseMovementType } from "../../utils/types/types";

class EnemyConfiguration implements EnemyConfig {
  name: string;
  combat: BaseCombatType;
  movement: BaseMovementType;
  width: number;
  height: number;
  offset: { x: number; y: number; };

  constructor(config: EnemyConfig) {
    this.name = `enemy-${config.name}`;
    this.combat = config.combat;
    this.movement = config.movement;
    this.width = config.width;
    this.height = config.height;
    this.offset = config.offset;
  };
};

export default EnemyConfiguration;