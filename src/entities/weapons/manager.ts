import type { EventEmitter, IWeaponsManager, IProjectilePool, IWeapon } from "@/utils/types/interfaces";
import type { Events } from "@/utils/types/types";
import getWeightedRandomNumber from "@/utils/functions/getWeightedRandomNumber";

export default class WeaponsManager implements IWeaponsManager {
  private activeWeapons: IWeapon[];
  private weapons: IWeapon[];
  private eventEmitter: EventEmitter<Events>;
  private projectilePool: IProjectilePool;
  
  constructor(
    eventEmitter: EventEmitter<Events>,
    projectilePool: IProjectilePool,
    weapons: IWeapon[]
  ) {
    this.activeWeapons = [];
    this.weapons = weapons;
    this.eventEmitter = eventEmitter;
    this.projectilePool = projectilePool;
  };

  /* Public Getters */
  public get activeWeaponList(): IWeapon[] {
    return this.activeWeapons;
  };
  public get availableWeapons(): IWeapon[] {
    const activeWeapons: IWeapon[] = this.activeWeapons.filter(activeWeapon => activeWeapon.level < activeWeapon.stats.maxLevel);
    const newWeapons: IWeapon[] = this.activeWeapons.length < 6 ? this.weapons.filter(newWeapon => !newWeapon.active) : [];

    return [...activeWeapons, ...newWeapons].sort((a, b) => a.weight - b.weight);
  };
  /* Private Getters */
  private get weaponsToLevelUp(): IWeapon[] {
    let weapons: IWeapon[] = [];
    this.activeWeapons.forEach(weapon => {
      if(weapon.level < weapon.stats.maxLevel) {
        weapons.push(weapon);
      };
    });

    return weapons.sort((a, b) => a.weight - b.weight);
  };
  private get weightedTotal(): number {
    let total: number = 0;

    this.availableWeapons.forEach(weapon => {
      total += weapon.weight;
    });

    return total;
  };

  /* Public Methods */
  public activateWeapon(weaponName: string): void {
    const weapon = this.getWeaponByName(weaponName);

    if(weapon) {
      this.activeWeapons.push(weapon);
      weapon.active = true;
      if(this.availableWeapons.length === 0) this.eventEmitter.emit('itemsManagerMaxed', true);
    } else {
      console.error(`A weapon does not exist with the name '${weaponName}'.`);
    }
  };
  public levelUpWeapon(weaponName: string): void {
    const weapon = this.getWeaponToLevelUpByName(weaponName);
    if(weapon) {
      weapon.level++;
      if(this.availableWeapons.length === 0) this.eventEmitter.emit('itemsManagerMaxed', false);
    } else {
      console.error(`A weapon does not exist with the name '${weaponName}'.`);
    }
  };
  public getWeaponsByRandomAmount(): IWeapon[] {
    if(this.availableWeapons.length !== 0) {
      const min = this.availableWeapons.length < 3 ? this.availableWeapons.length : 3;
      const max = this.availableWeapons.length < 5 ? this.availableWeapons.length : 5;
      const amount = this.getRandomNumber(min, max);
      let weapons: IWeapon[] = [];

      for(let i = 0, previousWeapons: string[] = []; i < amount; i++) {
        let weapon = this.getRandomWeapon();

        if(previousWeapons.includes(weapon.name)) {
          while(previousWeapons.includes(weapon.name)) {
            weapon = this.getRandomWeapon();
          };
        };

        weapons.push(weapon);
        previousWeapons.push(weapon.name);
      };

      return weapons;
    } else {
      return [];
    }
  };
  public reset(): void {
    this.activeWeapons = [];
    this.weapons.forEach(weapon => {
      weapon.active = false;
      weapon.level = 1;
      weapon.lastFireTime = 0;
      weapon.projectiles.forEach(projectile => this.projectilePool.returnProjectile(projectile));
    });
  };

  /* Private Methods */
  private getRandomNumber (min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  };
  private getRandomWeapon(): IWeapon {
    const randomWeight = getWeightedRandomNumber(this.weightedTotal);
    let selection: IWeapon = {} as IWeapon;
    
    for(let i = 0, l = this.availableWeapons.length, cw = 0; i < l; i++) {
      const weapon = {...this.availableWeapons[i]};
      cw += weapon.weight;
      if(randomWeight <= cw) {
        selection = weapon;
        break;
      };
    };

    return selection;
  };
  private getWeaponToLevelUpByName(weaponName: string): IWeapon | undefined {
    const weapon = this.weaponsToLevelUp.find(weapon => weapon.name === weaponName);
    return weapon;
  };
  private getWeaponByName(weaponName: string): IWeapon | undefined {
    const weapon = this.weapons.find(weapon => weapon.name === weaponName);
    return weapon;
  };
};