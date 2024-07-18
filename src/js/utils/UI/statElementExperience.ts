import { HtmlElementTypes } from "../types/types";

export default class StatElementExperience {
  stat: string = 'Experience';
  experience: number;
  experienceForNextLevel: number;
  element: HTMLDivElement;

  constructor(experience: number, experienceForNextLevel: number) {
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
  public update(experience: number): void {
    const backgroundProgress: HTMLDivElement = this.element.querySelector('.background-progress') as HTMLDivElement;
    this.experience = experience;
    backgroundProgress.style['width'] = `${this.percentageToNextLevel}%`;
  };
};