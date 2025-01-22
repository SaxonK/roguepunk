import { Stats as IStats } from "../../utils/types/interfaces";

class Stats implements IStats {
  damage: number;
  fireRate: number;
  hitpoints: number;
  range: number;
  resilience: number;
  speed: number;
  
  constructor(stats: IStats) {
    this.damage = stats.damage;
    this.fireRate = stats.fireRate;
    this.hitpoints = stats.hitpoints;
    this.range = stats.range;
    this.resilience = stats.resilience;
    this.speed = stats.speed;
  };
};

export default Stats;