import type { IWeapon, IWeaponsManager } from "@/utils/types/interfaces";
import type { OWeapon } from "@/utils/types/types";
import eventEmitter from "@/utils/events/initialiser";
import projectilePool from "../projectiles/initialiser";
import weaponFactory from "./factory";
import WeaponsManager from "./manager";
import baseballBat from "@/config/weapons/baseball_bat.json";
import claymore from "@/config/weapons/claymore.json";
import grenade from "@/config/weapons/grenade.json";
import katana from "@/config/weapons/katana.json";
import pistol from "@/config/weapons/pistol.json";
import revolver from "@/config/weapons/revolver.json";
import rifle from "@/config/weapons/rifle.json";
import rocketLauncher from "@/config/weapons/rocket_launcher.json";
import shotgun from "@/config/weapons/shotgun.json";
import sledgehammer from "@/config/weapons/sledgehammer.json";

const weaponConfigurations = [
  baseballBat,
  claymore,
  grenade,
  katana,
  pistol,
  revolver,
  rifle,
  rocketLauncher,
  shotgun,
  sledgehammer
];
const weapons: IWeapon[] = [];
weaponConfigurations.forEach(configuration => weapons.push(weaponFactory.createWeapon(configuration as OWeapon)));
const weaponsManager: IWeaponsManager = new WeaponsManager(eventEmitter, projectilePool, weapons);

export default weaponsManager;