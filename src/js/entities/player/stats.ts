import { Stats as StatsInterface } from "../../utils/types/interfaces";

class Stats implements StatsInterface {
  damage: number;
  fireRate: number;
  hitpoints: number;
  range: number;
  resilience: number;
  speed: number;
  
  constructor(stats: StatsInterface) {
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.hitpoints = stats.hitpoints;
    this.range = stats.range;
    this.resilience = stats.resilience;
    this.speed = stats.speed;
  };
};

export default Stats;