import { EventEmitter, StatElementExperience as StatElementInterface } from "../types/interfaces";
import { ElementStatTypes, Events, HtmlElementTypes } from "../types/types";

export default class StatElementExperience implements StatElementInterface {
  stat: ElementStatTypes = 'experience';
  experience: number;
  experienceForNextLevel: number;
  element: HTMLDivElement;

  private eventEmitter: EventEmitter<Events>;

  constructor(eventEmitter: EventEmitter<Events>, experience: number, experienceForNextLevel: number) {
    this.eventEmitter = eventEmitter;
    this.experience = experience;
    this.experienceForNextLevel = experienceForNextLevel;
    this.element = document.createElement('div');
    this.element.classList.add('stat-element');
    this.element.id = this.stat.toLowerCase().replace(/ /g, '-');

    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.classList.add('element-wrapper');

    /* Inner Elements */
    wrapper.appendChild(this.createInnerElement(
      ['background-progress'], 
      'div'
    ));
    this.element.appendChild(wrapper);
    this.update(this.experience);
    this.eventEmitter.on(`${this.stat}Changed`, (data) => this.update(data));
    this.eventEmitter.on('experienceToNextLevelChanged', (data) => this.experienceForNextLevelUpdate(data));
  };

  private createInnerElement(classList: string[], tag: HtmlElementTypes, value: string = ''): HTMLElement {
    const element: HTMLElement = document.createElement(tag);
    classList.forEach(item => element.classList.add(item));
    element.innerText = value;

    return element;
  };
  private get percentageToNextLevel(): number {
    return (this.experience / this.experienceForNextLevel) * 100;
  }
  public update(value: number): void {
    const backgroundProgress: HTMLDivElement = this.element.querySelector('.background-progress') as HTMLDivElement;
    this.experience += value;
    backgroundProgress.style['width'] = `${this.percentageToNextLevel}%`;
  };
  public experienceForNextLevelUpdate(value: number): void {
    const backgroundProgress: HTMLDivElement = this.element.querySelector('.background-progress') as HTMLDivElement;
    const remainder = this.experience - this.experienceForNextLevel;
    remainder > 0 ? this.experience = remainder : this.experience = 0;
    this.experienceForNextLevel = value;
    backgroundProgress.style['width'] = `${this.percentageToNextLevel}%`;
  };
};