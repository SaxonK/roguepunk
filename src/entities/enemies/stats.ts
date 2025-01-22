import { EnemyStats as IEnemyStats } from "../../utils/types/interfaces";

class EnemyStats implements IEnemyStats {
  damage: number;
  experience: number;
  fireRate: number;
  hitpoints: number;
  range: number;
  resilience: number;
  speed: number;
  
  constructor(stats: IEnemyStats) {
    this.damage = stats.damage;
    this.experience = stats.experience
    this.fireRate = stats.fireRate;
    this.hitpoints = stats.hitpoints;
    this.range = stats.range;
    this.resilience = stats.resilience;
    this.speed = stats.speed;
  };
};

export default EnemyStats;