import type { IWeapon } from "@/utils/types/interfaces";
import type { OWeapon } from "@/utils/types/types";
import * as Weapon from "@/entities/weapons/types";

class WeaponFactory {
  createWeapon(config: OWeapon): IWeapon {
    switch (config.type) {
      case "aoe":
        return new Weapon.Aoe(config);
      case "melee":
        return new Weapon.Melee(config);
      case "proximity":
        return new Weapon.Proximity(config);
      case "range":
        return new Weapon.Range(config);
      default:
        throw new Error(`Unknown weapon type: ${config.type}`);
    };
  };
};

const weaponFactory = new WeaponFactory();

export default weaponFactory;