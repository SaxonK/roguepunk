import { Stats as StatsInterface } from "../../utils/types/interfaces";

class EnemyStats implements StatsInterface {
  damage: number;
  fireRate: number;
  hitpoints: number;
  resilience: number;
  speed: number;
  
  constructor(stats: StatsInterface) {
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.hitpoints = stats.hitpoints;
    this.resilience = stats.resilience;
    this.speed = stats.speed;
  };
};

export default EnemyStats;