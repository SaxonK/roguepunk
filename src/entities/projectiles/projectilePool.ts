import { IProjectile, IProjectilePool } from "../../utils/types/interfaces";
import { Coordinates } from "../../utils/types/types";
import Projectile from "./projectile";

export default class ProjectilePool implements IProjectilePool {
  private pool: IProjectile[] = [];

  constructor() {
    for(let i = 0; i < 20; i++) {
      this.pool.push(new Projectile(0, { x: 0, y: 0 }, 0));
    };
  };

  public getProjectile(startingPosition: Coordinates, targetPosition: Coordinates): IProjectile {
    if(this.pool.length > 0) {
      const projectile = this.pool.pop()!;
      projectile.angle = this.calculateAngle(startingPosition, targetPosition);
      projectile.position = startingPosition;
      projectile.creation = window.performance.now();
      return projectile;
    } else {
      return new Projectile(this.calculateAngle(startingPosition, targetPosition), startingPosition, window.performance.now());
    };
  };
  public returnProjectile(projectile: IProjectile): void {
    projectile.angle = 0;
    projectile.duration = 0;
    projectile.expired = false;
    projectile.pierce = 0;
    projectile.position = { x: 0, y: 0 };
    projectile.creation = 0;
    this.pool.push(projectile as IProjectile);
  };

  private calculateAngle(startingPosition: Coordinates, targetPosition: Coordinates): number {
    const dx = targetPosition.x - startingPosition.x;
    const dy = targetPosition.y - startingPosition.y;
    
    let theta = Math.atan2(dy, dx);

    return theta;
  };
};