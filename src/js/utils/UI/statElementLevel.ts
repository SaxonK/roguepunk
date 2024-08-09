import { HtmlElementTypes } from "../types/types";

export default class StatElementLevel {
  stat: string = 'level';
  level: number;
  element: HTMLDivElement;

  constructor(level: number) {
    this.level = level;
    this.element = document.createElement('div');
    this.element.classList.add('stat-element');
    this.element.id = this.stat.toLowerCase().replace(/ /g, '-');

    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.classList.add('element-wrapper');

    /* Inner Elements */
    wrapper.appendChild(this.createInnerElement(
      ['level-value'], 
      'span',
      this.level.toLocaleString()
    ));

    this.element.appendChild(wrapper);
  };

  private createInnerElement(classList: string[], tag: HtmlElementTypes, value: string = ''): HTMLElement {
    const element: HTMLElement = document.createElement(tag);
    classList.forEach(item => element.classList.add(item));
    element.innerText = value;

    return element;
  };
  public update(value: number): void {
    this.level = value;
  };
};