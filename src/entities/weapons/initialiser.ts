import type { IWeapon, IWeaponsManager } from "@/utils/types/interfaces";
import type { OWeapon } from "@/utils/types/types";
import eventEmitter from "@/utils/events/initialiser";
import projectilePool from "../projectiles/initialiser";
import weaponFactory from "./factory";
import WeaponsManager from "./manager";

const weaponConfigurations = import.meta.glob("@/config/weapons/*.json", { eager: true }) as Record<string, { default: OWeapon }>;
const generateWeaponObjects = (configurations: Record<string, { default: OWeapon }>): IWeapon[] => {
  const weaponConfigs = Object.values(configurations).map(module => module.default);
  const weapons: IWeapon[] = weaponConfigs.map(config => weaponFactory.createWeapon(config));
  return weapons;
};

const weapons: IWeapon[] = generateWeaponObjects(weaponConfigurations);
const weaponsManager: IWeaponsManager = new WeaponsManager(eventEmitter, projectilePool, weapons);

export default weaponsManager;