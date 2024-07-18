import { StatElementDetailed, StatElementExperience, StatElementLevel, StatElementWrapper as StatElementWrapperInterface } from "../types/interfaces";

export default class StatElementWrapper {
  stat: string;
  element: HTMLDivElement = document.createElement('div');
  statElements: (StatElementDetailed | StatElementExperience | StatElementLevel | StatElementWrapperInterface)[];

  constructor(stat: string, statElements: (StatElementDetailed | StatElementExperience | StatElementLevel | StatElementWrapperInterface)[]) {
    this.stat = stat;
    this.element.id = this.stat.toLowerCase().replace(/ /g, '-');
    this.element.classList.add('stats-wrapper');
    this.statElements = statElements;
    this.statElements.forEach(element => this.element.appendChild(element.element));
  };
};