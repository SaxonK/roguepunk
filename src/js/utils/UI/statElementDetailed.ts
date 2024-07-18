import { StatElementDetailed as StatElementInterface } from "../types/interfaces";
import { HtmlElementTypes } from "../types/types";

export default class StatElementDetailed implements StatElementInterface {
  stat: string;
  baseValue: number;
  currentValue: number;
  element: HTMLDivElement;

  constructor(stat: string, baseValue: number) {
    this.stat = stat;
    this.baseValue = baseValue;
    this.currentValue = baseValue;
    this.element = document.createElement('div');
    this.element.classList.add('stat-element');
    this.element.id = stat.toLowerCase().replace(/ /g, '-');

    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.classList.add('element-wrapper');

    /* Inner Elements */
    wrapper.appendChild(this.createInnerElement(
      ['stat-label'], 
      'span', 
      `${this.stat}:`
    ));
    wrapper.appendChild(this.createInnerElement(
      ['current-value'], 
      'div', 
      this.currentValue.toLocaleString()
    ));
    wrapper.appendChild(this.createInnerElement(
      ['divider'], 
      'div', 
      '/'
    ));
    wrapper.appendChild(this.createInnerElement(
      ['base-value'], 
      'div', 
      this.baseValue.toLocaleString()
    ));
    wrapper.appendChild(this.createInnerElement(
      ['value-change'], 
      'div'
    ));
    wrapper.appendChild(this.createInnerElement(
      ['background-progress'], 
      'div'
    ));
    this.element.appendChild(wrapper);
    this.update(this.currentValue);
  };

  private createInnerElement(classList: string[], tag: HtmlElementTypes, value: string = ''): HTMLElement {
    const element: HTMLElement = document.createElement(tag);
    classList.forEach(item => element.classList.add(item));
    element.innerText = value;

    return element;
  };
  private currentValueChange(value: number): void {
    const difference: string =  (value - this.currentValue).toLocaleString();
    const element: HTMLDivElement = this.element.querySelector('.value-change') as HTMLDivElement;

    element.innerText = difference;
  }
  private get currentValuePercentage(): number {
    return (this.currentValue / this.baseValue) * 100;
  }
  public update(value: number): void {
    this.currentValueChange(value);
    const valueChangeElement: HTMLDivElement = this.element.querySelector('.value-change') as HTMLDivElement;
    const backgroundProgress: HTMLDivElement = this.element.querySelector('.background-progress') as HTMLDivElement;
    valueChangeElement.classList.add('visible');
    this.currentValue = value;
    backgroundProgress.style['width'] = `${this.currentValuePercentage}%`;
    setTimeout(() => {
      valueChangeElement.classList.remove('visible');
    }, 2000);
  };
};