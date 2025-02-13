import type { IProjectile } from "@/utils/types/interfaces";
import type { Coordinates } from "@/utils/types/types";

export default class Projectile implements IProjectile {
  angle: number;
  creation: EpochTimeStamp;
  duration: number;
  expired: boolean;
  pierce: number;
  position: Coordinates;

  constructor(angle: number, position: Coordinates, creationTime: EpochTimeStamp) {
    this.angle = angle;
    this.creation = creationTime;
    this.duration = 0;
    this.expired = false;
    this.pierce = 0;
    this.position = { ...position };
  };
};