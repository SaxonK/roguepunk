import { Config, Projectile as IProjectile, ProjectileConfig, ProjectilePool as IProjectilePool } from "../../utils/types/interfaces";
import { Coordinates } from "../../utils/types/types";
import Projectile from "./projectile";

export default class ProjectilePool implements IProjectilePool {
  private defaultConfig: ProjectileConfig;
  private pool: Projectile[] = [];

  constructor(config: ProjectileConfig) {
    this.defaultConfig = config;
  };

  public getProjectile(config: ProjectileConfig, position: Coordinates, entityConfig: Config): Projectile {
    if (this.pool.length > 0) {
      const projectile = this.pool.pop()!;
      projectile.configure = config;
      projectile.EntityConfigure = entityConfig;
      projectile.startingPosition = position;
      return projectile;
    } else {
      return new Projectile(config, position, entityConfig);
    }
  };

  public returnProjectile(projectile: IProjectile): void {
    projectile.reset(this.defaultConfig);
    this.pool.push(projectile as Projectile);
  };
};