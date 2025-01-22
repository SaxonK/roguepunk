import { EnemyConfig } from "../../utils/types/interfaces";
import { BaseCombatType, BaseMovementType, EntityTypeCharacterCodesByEntity } from "../../utils/types/types";

class EnemyConfiguration implements EnemyConfig {
  name: EntityTypeCharacterCodesByEntity<'enemy'>;
  combat: BaseCombatType;
  movement: BaseMovementType;
  width: number;
  height: number;
  offset: { x: number; y: number; };

  constructor(config: EnemyConfig) {
    this.name = `enemy.${config.name}` as EntityTypeCharacterCodesByEntity<'enemy'>;
    this.combat = config.combat;
    this.movement = config.movement;
    this.width = config.width;
    this.height = config.height;
    this.offset = config.offset;
  };
};

export default EnemyConfiguration;