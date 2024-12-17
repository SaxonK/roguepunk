import { EventEmitter, TimerElement as ITimerElement } from "../types/interfaces";
import { ElementStatTypes, Events, HtmlElementTypes } from "../types/types";

export default class TimerElement implements ITimerElement {
  public stat: ElementStatTypes = 'timer';
  public element: HTMLDivElement;

  private time: EpochTimeStamp;
  private eventEmitter: EventEmitter<Events>;

  constructor(eventEmitter: EventEmitter<Events>, time: EpochTimeStamp = 0) {
    this.eventEmitter = eventEmitter;
    this.time = time;
    this.element = document.createElement('div');
    this.element.classList.add('stat-element');
    this.element.id = this.stat.toLowerCase().replace(/ /g, '-');

    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.classList.add('element-wrapper');

    /* Inner Elements */
    wrapper.appendChild(this.createInnerElement(
      ['value'], 
      'span'
    ));
    this.element.appendChild(wrapper);
    this.update(this.time);
    this.eventEmitter.on(`worldTimer`, (data) => this.update(data));
  };

  public update(value: EpochTimeStamp): void {
    const valueElement: HTMLDivElement = this.element.querySelector('.value') as HTMLDivElement;
    this.time = value;
    const timeFormatted = {
      minutes: String(this.timeInMinutes).padStart(2, '0'),
      seconds: String(this.timeInSeconds % 60).padStart(2, '0')
    };

    valueElement.innerText = `${timeFormatted.minutes}:${timeFormatted.seconds}`;
  };

  private createInnerElement(classList: string[], tag: HtmlElementTypes, value: string = ''): HTMLElement {
    const element: HTMLElement = document.createElement(tag);
    classList.forEach(item => element.classList.add(item));
    element.innerText = value;

    return element;
  };
  private get timeInMinutes(): number {
    return Math.floor(this.timeInSeconds / 60);
  };
  private get timeInSeconds(): number {
    return Math.floor(this.time / 1000);
  };
};