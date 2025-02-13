import type { IProjectile, IProjectilePool, IWeapon } from "@/utils/types/interfaces";
import type { Coordinates, OWeapon, WeaponStats, WeaponTypes } from "@/utils/types/types";

export class Aoe implements IWeapon {
  name: string;
  desciption: string;
  level: number = 1;
  stats: WeaponStats;
  type: WeaponTypes;
  effects: [];
  weight: number;
  active: boolean;
  projectiles: IProjectile[] = [];
  lastFireTime: EpochTimeStamp = 0;

  constructor(config: OWeapon) {
    this.name = config.name;
    this.desciption = config.desciption;
    this.stats = config.stats;
    this.type = config.type;
    this.effects = [];
    this.weight = config.weight;
    this.active = false;
  };

  /* Private Getters */
  private get activeProjectiles(): IProjectile[] {
    return this.projectiles.filter(projectile => !projectile.expired);
  };
  private get expiredProjectiles(): IProjectile[] {
    return this.projectiles.filter(projectile => projectile.expired);
  };

  /* Public Methods */
  public fire(projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates): void {
    const elapsedFireTime = (window.performance.now() - this.lastFireTime) / 1000;
    if(elapsedFireTime <= this.stats.cooldown && this.activeProjectiles.length < this.stats.maxAmount) {
      this.generateProjectiles(projectilePool, position, targetPosition);
      this.lastFireTime = window.performance.now();
    };
  };
  public update(projectilePool: IProjectilePool, _position: Coordinates = { x: 0, y: 0 }): void {
    this.updateActiveProjectiles();
    this.clearExpiredProjectiles(projectilePool);
  };

  /* Private Methods */
  private generateProjectiles(projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates): void {
    for(let i = 0; i < this.stats.amount; i++) {
      const projectile: IProjectile = projectilePool.getProjectile({ ...position }, { ...targetPosition });
      this.projectiles.push(projectile);
    };
  };
  private clearExpiredProjectiles(projectilePool: IProjectilePool): void {
    this.expiredProjectiles.forEach(projectile => projectilePool.returnProjectile(projectile));
  };
  private updateActiveProjectiles(): void {
    this.activeProjectiles.forEach(projectile => {
      const duration = (window.performance.now() - projectile.creation) / 1000;
      if(duration >= this.stats.effectDuration) projectile.expired = true;
    });
  }; 
};
export class Melee implements IWeapon {
  name: string;
  desciption: string;
  level: number = 1;
  stats: WeaponStats;
  type: WeaponTypes;
  effects: [];
  weight: number;
  active: boolean;
  projectiles: IProjectile[] = [];
  lastFireTime: EpochTimeStamp = 0;

  constructor(config: OWeapon) {
    this.name = config.name;
    this.desciption = config.desciption;
    this.stats = config.stats;
    this.type = config.type;
    this.effects = [];
    this.weight = config.weight;
    this.active = false;
  };

  /* Private Getters */
  private get activeProjectiles(): IProjectile[] {
    return this.projectiles.filter(projectile => !projectile.expired);
  };
  private get expiredProjectiles(): IProjectile[] {
    return this.projectiles.filter(projectile => projectile.expired);
  };

  /* Public Methods */
  public fire(projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates): void {
    const elapsedFireTime = (window.performance.now() - this.lastFireTime) / 1000;
    if(elapsedFireTime <= this.stats.cooldown && this.activeProjectiles.length < this.stats.maxAmount) {
      this.generateProjectiles(projectilePool, position, targetPosition);
      this.lastFireTime = window.performance.now();
    };
  };
  public update(projectilePool: IProjectilePool, _position: Coordinates = { x: 0, y: 0 }): void {
    this.updateActiveProjectiles();
    this.clearExpiredProjectiles(projectilePool);
  };

  /* Private Methods */
  private generateProjectiles(projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates): void {
    for(let i = 0; i < this.stats.amount; i++) {
      const projectile: IProjectile = projectilePool.getProjectile({ ...position }, { ...targetPosition });
      this.projectiles.push(projectile);
    };
  };
  private clearExpiredProjectiles(projectilePool: IProjectilePool): void {
    this.expiredProjectiles.forEach(projectile => projectilePool.returnProjectile(projectile));
  };
  private updateActiveProjectiles(): void {
    this.activeProjectiles.forEach(projectile => {
      const duration = (window.performance.now() - projectile.creation) / 1000;
      if(duration >= this.stats.effectDuration) projectile.expired = true;
    });
  }; 
};
export class Proximity implements IWeapon {
  name: string;
  desciption: string;
  level: number = 1;
  stats: WeaponStats;
  type: WeaponTypes;
  effects: [];
  weight: number;
  active: boolean;
  projectiles: IProjectile[] = [];
  lastFireTime: EpochTimeStamp = 0;

  constructor(config: OWeapon) {
    this.name = config.name;
    this.desciption = config.desciption;
    this.stats = config.stats;
    this.type = config.type;
    this.effects = [];
    this.weight = config.weight;
    this.active = false;
  };

  /* Private Getters */
  private get activeProjectiles(): IProjectile[] {
    return this.projectiles.filter(projectile => !projectile.expired);
  };
  private get expiredProjectiles(): IProjectile[] {
    return this.projectiles.filter(projectile => projectile.expired);
  };

  /* Public Methods */
  public fire(projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates): void {
    const elapsedFireTime = (window.performance.now() - this.lastFireTime) / 1000;
    if(elapsedFireTime <= this.stats.cooldown && this.activeProjectiles.length < this.stats.maxAmount) {
      this.generateProjectiles(projectilePool, position, targetPosition);
      this.lastFireTime = window.performance.now();
    };
  };
  public update(projectilePool: IProjectilePool, _position: Coordinates = { x: 0, y: 0 }): void {
    this.updateActiveProjectiles();
    this.clearExpiredProjectiles(projectilePool);
  };

  /* Private Methods */
  private generateProjectiles(projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates): void {
    for(let i = 0; i < this.stats.amount; i++) {
      const projectile: IProjectile = projectilePool.getProjectile({ ...position }, { ...targetPosition });
      this.projectiles.push(projectile);
    };
  };
  private clearExpiredProjectiles(projectilePool: IProjectilePool): void {
    this.expiredProjectiles.forEach(projectile => projectilePool.returnProjectile(projectile));
  };
  private updateActiveProjectiles(): void {
    this.activeProjectiles.forEach(projectile => {
      const duration = (window.performance.now() - projectile.creation) / 1000;
      if(duration >= this.stats.effectDuration) projectile.expired = true;
    });
  }; 
};
export class Range implements IWeapon {
  name: string;
  desciption: string;
  level: number = 1;
  stats: WeaponStats;
  type: WeaponTypes;
  effects: [];
  weight: number;
  active: boolean;
  projectiles: IProjectile[] = [];
  lastFireTime: EpochTimeStamp = 0;

  constructor(config: OWeapon) {
    this.name = config.name;
    this.desciption = config.desciption;
    this.stats = config.stats;
    this.type = config.type;
    this.effects = [];
    this.weight = config.weight;
    this.active = false;
  };

  /* Private Getters */
  private get activeProjectiles(): IProjectile[] {
    return this.projectiles.filter(projectile => !projectile.expired);
  };
  private get expiredProjectiles(): IProjectile[] {
    return this.projectiles.filter(projectile => projectile.expired);
  };

  /* Public Methods */
  public fire(projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates): void {
    const elapsedFireTime = (window.performance.now() - this.lastFireTime) / 1000;
    if(elapsedFireTime <= this.stats.cooldown && this.activeProjectiles.length < this.stats.maxAmount) {
      this.generateProjectiles(projectilePool, position, targetPosition);
      this.lastFireTime = window.performance.now();
    };
  };
  public update(projectilePool: IProjectilePool, position: Coordinates): void {
    this.updateActiveProjectiles(position);
    this.clearExpiredProjectiles(projectilePool);
  };

  /* Private Methods */
  private generateProjectiles(projectilePool: IProjectilePool, position: Coordinates, targetPosition: Coordinates): void {
    for(let i = 0; i < this.stats.amount; i++) {
      const projectile: IProjectile = projectilePool.getProjectile({ ...position }, { ...targetPosition });
      this.projectiles.push(projectile);
    };
  };
  private clearExpiredProjectiles(projectilePool: IProjectilePool): void {
    this.expiredProjectiles.forEach(projectile => projectilePool.returnProjectile(projectile));
  };
  private getDistanceBetweenTwoEntities(entityA: Coordinates, entityB: Coordinates): number {
    const a = Math.abs(entityA.x - entityB.x);
    const b = Math.abs(entityA.y - entityB.y);

    return Math.sqrt((a * a) + (b * b));
  };
  private IsProjectileExpired(distance: number, projectile: IProjectile): boolean {
    return (
      (distance >= this.stats.range) ||
      (projectile.pierce >= this.stats.piercing)
    );
  };
  private move(projectile: IProjectile): void {
    projectile.position.x += this.stats.speed * Math.cos(projectile.angle);
    projectile.position.y += this.stats.speed * Math.sin(projectile.angle);
  };
  private updateActiveProjectiles(position: Coordinates): void {
    this.activeProjectiles.forEach(projectile => {
      const distance = this.getDistanceBetweenTwoEntities(position, projectile.position);

      if(this.IsProjectileExpired(distance, projectile)) {
        projectile.expired = true;
        return;
      };

      this.move(projectile);
    });
  };
};