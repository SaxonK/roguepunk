import { EventEmitter } from "../types/interfaces";
import { ElementStatTypes, Events, HtmlElementTypes } from "../types/types";

export default class StatElementLevel {
  stat: ElementStatTypes = 'level';
  level: number;
  element: HTMLDivElement;

  private eventEmitter: EventEmitter<Events>;

  constructor(eventEmitter: EventEmitter<Events>, level: number) {
    this.level = level;
    this.element = document.createElement('div');
    this.element.classList.add('stat-element');
    this.element.id = this.stat.toLowerCase().replace(/ /g, '-');
    this.eventEmitter = eventEmitter;

    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.classList.add('element-wrapper');

    /* Inner Elements */
    wrapper.appendChild(this.createInnerElement(
      ['level-value'], 
      'span',
      this.level.toLocaleString()
    ));

    this.element.appendChild(wrapper);
    this.eventEmitter.on(`${this.stat}Changed`, (data) => this.update(data));
  };

  private createInnerElement(classList: string[], tag: HtmlElementTypes, value: string = ''): HTMLElement {
    const element: HTMLElement = document.createElement(tag);
    classList.forEach(item => element.classList.add(item));
    element.innerText = value;

    return element;
  };
  public update(value: number): void {
    const levelValueElement: HTMLDivElement = this.element.querySelector('.level-value') as HTMLDivElement;
    this.level = value;
    levelValueElement.innerText = this.level.toLocaleString();
  };
};