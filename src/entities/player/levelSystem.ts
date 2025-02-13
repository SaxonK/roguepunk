import { EventEmitter, LevelSystem as ILevelSystem } from "../../utils/types/interfaces";
import { Events } from "../../utils/types/types";

export default class LevelSystem implements ILevelSystem {
  experience: number;
  
  private constant: number;
  private eventEmitter: EventEmitter<Events>;
  private itemsAvailable: boolean = true;
  private startingExperience: number;

  constructor(constant: number, eventEmitter: EventEmitter<Events>, startingXP: number = 0) {
    this.constant = constant;
    this.eventEmitter = eventEmitter;
    this.experience = startingXP;
    this.startingExperience = startingXP;

    this.eventEmitter.on('playerGainExperience', (data) => this.addExperience(data));
    this.eventEmitter.on('itemsManagerMaxed', (data) => this.itemsAvailable = data);
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
    const nextExperience = Math.pow(this.level / this.constant, 2);
    return Math.ceil(nextExperience);
  };
  private get previousLevelExperienceThreshold(): number {
    const previousLevel = this.level - 1;
    const previousExperienceThreshold = Math.pow(previousLevel / this.constant, 2);
    return Math.ceil(previousExperienceThreshold);
  };
  private get remaindingExperienceAfterLevelUp(): number {
    const remainder = this.experience - this.previousLevelExperienceThreshold;
    return remainder > 0 ? remainder : 0;
  };

  /* Public Methods */
  public addExperience(experience: number): void {
    if(this.experience === 0) { 
      this.eventEmitter.emit('hudUpdateMaxValue', { name: 'experience', arrayValue: [], numValue: this.remaindingExperienceAfterLevelUp, maxValue: this.experienceToNextLevel, stringValue: '', booleanValue: false, updateType: 'replace' });
    }
    const currentLevel = this.level;
    this.experience += experience;

    if(currentLevel !== this.level) {
      this.eventEmitter.emit('hudUpdateValue', { name: 'level', arrayValue: [], numValue: this.level, maxValue: 0, stringValue: '', booleanValue: false, updateType: 'replace' });
      this.eventEmitter.emit('hudUpdateValue', { name: 'experience', arrayValue: [], numValue: this.remaindingExperienceAfterLevelUp, maxValue: 0, stringValue: '', booleanValue: false, updateType: 'replace' });
      this.eventEmitter.emit('hudUpdateMaxValue', { name: 'experience', arrayValue: [], numValue: this.remaindingExperienceAfterLevelUp, maxValue: this.experienceToNextLevel, stringValue: '', booleanValue: false, updateType: 'replace' });
      if(this.itemsAvailable) this.eventEmitter.emit('levelChanged', this.level);
    } else {
      this.eventEmitter.emit('hudUpdateValue', { name: 'experience', arrayValue: [], numValue: experience, maxValue: 0, stringValue: '', booleanValue: false, updateType: 'add' });
    };
  };
  public reset(): void {
    this.experience = this.startingExperience;

    // this.eventEmitter.emit('experienceChanged', this.experience);
    this.eventEmitter.emit('experienceReset', this.experience);
    this.eventEmitter.emit('experienceToNextLevelReset', this.experienceToNextLevel);
    this.eventEmitter.emit('levelChanged', this.level);
  };
  public setStartingExperience(experience: number): void {
    this.experience = experience;
    this.startingExperience = experience;
  };
};