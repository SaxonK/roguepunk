import { Stats as StatsInterface } from "../../utils/types/interfaces";

class Stats implements StatsInterface {
  damage: number;
  hitpoints: number;
  resilience: number;
  speed: number;
  
  constructor(stats: StatsInterface) {
    this.damage = stats.damage;
    this.hitpoints = stats.hitpoints;
    this.resilience = stats.resilience;
    this.speed = stats.speed;
  };
};

export default Stats;