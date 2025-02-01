import type { IProjectile, IWeapon } from "@/utils/types/interfaces";
import type { OWeapon, WeaponStats, WeaponTypes } from "@/utils/types/types";

export default class Weapon implements IWeapon {
  name: string;
  desciption: string;
  level: number = 1;
  stats: WeaponStats;
  type: WeaponTypes;
  effects: [];
  weight: number;
  active: boolean;
  lastUpdateTime: EpochTimeStamp = 0;

  projectiles: IProjectile[] = [];

  constructor(config: OWeapon) {
    this.name = config.name;
    this.desciption = config.desciption;
    this.stats = config.stats;
    this.type = config.type;
    this.effects = [];
    this.weight = config.weight;
    this.active = false;
  };
};