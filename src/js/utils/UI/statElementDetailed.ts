import { EventEmitter, StatElementDetailed as StatElementInterface } from "../types/interfaces";
import { ElementStatTypes, Events, HtmlElementTypes } from "../types/types";

export default class StatElementDetailed implements StatElementInterface {
  stat: ElementStatTypes;
  displayName: string;
  baseValue: number;
  currentValue: number;
  element: HTMLDivElement;

  private eventEmitter: EventEmitter<Events>;

  constructor(stat: ElementStatTypes, baseValue: number, eventEmitter: EventEmitter<Events>, displayName?: string) {
    this.stat = stat;
    this.displayName = displayName === undefined ? stat : displayName;
    this.baseValue = baseValue;
    this.currentValue = baseValue;
    this.element = document.createElement('div');
    this.element.classList.add('stat-element');
    this.element.id = stat.toLowerCase().replace(/ /g, '-');
    this.eventEmitter = eventEmitter;

    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.classList.add('element-wrapper');

    /* Inner Elements */
    wrapper.appendChild(this.createInnerElement(
      ['stat-label'], 
      'span', 
      `${this.displayName}:`
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
    this.eventEmitter.on(`${stat}Changed`, (data) => this.update(data));
  };

  private createInnerElement(classList: string[], tag: HtmlElementTypes, value: string = ''): HTMLElement {
    const element: HTMLElement = document.createElement(tag);
    classList.forEach(item => element.classList.add(item));
    element.innerText = value;

    return element;
  };
  private currentValueChange(value: number): number {
    const difference: number =  (value - this.currentValue);
    const element: HTMLDivElement = this.element.querySelector('.value-change') as HTMLDivElement;

    element.innerText = difference.toLocaleString();

    return difference;
  };
  private get currentValuePercentage(): number {
    return (this.currentValue / this.baseValue) * 100;
  };
  public update(value: number): void {
    const currentValueElement: HTMLDivElement = this.element.querySelector('.current-value') as HTMLDivElement;
    const valueChangeElement: HTMLDivElement = this.element.querySelector('.value-change') as HTMLDivElement;
    const backgroundProgress: HTMLDivElement = this.element.querySelector('.background-progress') as HTMLDivElement;
    const valueChange: number = this.currentValueChange(value);

    this.currentValue = value;
    currentValueElement.innerText = this.currentValue.toLocaleString();
    backgroundProgress.style['width'] = `${this.currentValuePercentage}%`;

    if(Math.sign(valueChange) === 1) {
      this.element.classList.add('heal');
      valueChangeElement.classList.add('visible');
    } else if(Math.sign(valueChange) === -1) {
      this.element.classList.add('damage');
      valueChangeElement.classList.add('visible');
    };

    setTimeout(() => {
      valueChangeElement.classList.remove('visible');
      this.element.classList.remove('heal');
      this.element.classList.remove('damage');
    }, 2000);
  };
};