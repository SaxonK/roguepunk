import { EventEmitter, LevelSystem as ILevelSystem } from "../../utils/types/interfaces";
import { Events } from "../../utils/types/types";

export default class LevelSystem implements ILevelSystem {
  experience: number;
  
  private constant: number;
  private eventEmitter: EventEmitter<Events>;
  private startingExperience: number;

  constructor(constant: number, eventEmitter: EventEmitter<Events>, startingXP: number = 0) {
    this.constant = constant;
    this.eventEmitter = eventEmitter;
    this.experience = startingXP;
    this.startingExperience = startingXP;

    this.eventEmitter.on('playerGainExperience', (data) => this.addExperience(data));
  };

  /* Getters */
  public get experienceToNextLevel(): number {
    return this.nextLevelExperienceThreshold - this.experience;
  };
  public get level(): number {
    const currentLevel = Math.floor(this.constant * Math.sqrt(this.experience)) + 1;
    return currentLevel;
  };
  public get nextLevelExperienceThreshold(): number {
    return Math.pow(this.level / this.constant, 2);
  };

  /* Public Methods */
  public addExperience(experience: number): void {
    const experienceToLevel = this.experienceToNextLevel;
    this.experience += experience;

    this.eventEmitter.emit('experienceChanged', experience);

    if(experienceToLevel <= experience) {
      this.eventEmitter.emit('levelChanged', this.level);
      this.eventEmitter.emit('experienceToNextLevelChanged', this.experienceToNextLevel);
    };
  };
  public reset(): void {
    this.experience = this.startingExperience;

    this.eventEmitter.emit('experienceChanged', this.experience);
    this.eventEmitter.emit('experienceReset', this.experience);
    this.eventEmitter.emit('experienceToNextLevelReset', this.experienceToNextLevel);
    this.eventEmitter.emit('levelChanged', this.level);
  };
  public setStartingExperience(experience: number): void {
    this.experience = experience;
    this.startingExperience = experience;
  };
};