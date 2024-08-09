import { StatElementDetailed, StatElementExperience, StatElementLevel, StatElementWrapper } from "../types/interfaces";
import { anchorPoints, AnchorPoints } from "../types/types";

export default class ElementLayer {
  element: HTMLDivElement = document.createElement('div');
  anchorPointOrder: Record<AnchorPoints, (StatElementDetailed | StatElementExperience | StatElementLevel | StatElementWrapper)[]> = {} as Record<AnchorPoints, (StatElementDetailed | StatElementExperience | StatElementLevel | StatElementWrapper)[]>;

  constructor() {
    this.element.id = 'element-layer';
    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.id = 'anchor-wrapper';
    anchorPoints.forEach(anchor => {
      const element: HTMLDivElement = document.createElement('div');
      const positionClasses: string[] = anchor.split('-');
      element.classList.add('anchor-point');
      positionClasses.forEach(position => element.classList.add(position));
      element.id = anchor;
      element.setAttribute('draggable', 'false');
      element.addEventListener('dragover', this.onDragOver);
      element.addEventListener('dragleave', this.onDragLeave);
      element.addEventListener('drop', (event) => this.onDrop(event, element.id as AnchorPoints));

      this.anchorPointOrder[anchor] = [];
      
      wrapper.appendChild(element);
    });
    this.element.appendChild(wrapper);
  };

  public bindElementToAnchor(anchorPoint: AnchorPoints, statElement: StatElementDetailed | StatElementExperience | StatElementLevel | StatElementWrapper): void {
    this.anchorPointOrder[anchorPoint].push(statElement);
  };
  public initialiseElementLayer(parent: HTMLElement): void {
    for (const [anchor, stats] of Object.entries(this.anchorPointOrder)) {
      stats.forEach(stat => {
        this.addElementToLayer(anchor as AnchorPoints, stat.element)
      });
    };
    parent.appendChild(this.element);
  };
  public toggleUnlockClass(unlock: boolean): void {
    const action = unlock ? 'add' : 'remove';
    this.element.querySelectorAll('.anchor-point').forEach(anchor => {
      anchor.classList[action]('unlocked');
    });
    for (const stats of Object.values(this.anchorPointOrder)) {
      stats.forEach(stat => {
        stat.element.classList[action]('unlocked');
        stat.element.setAttribute('draggable', unlock.toString());
        stat.element.addEventListener('dragstart', this.onDragStart);
      });
    }
  };

  private addElementToLayer(anchorPoint: AnchorPoints, statElement: HTMLDivElement): void {
    const anchorElement: HTMLDivElement = this.element.querySelector(`#${anchorPoint}`) as HTMLDivElement;
    anchorElement.appendChild(statElement);
  };
  private onDragOver(event: DragEvent): void {
    event.preventDefault();
    const anchorPoint: HTMLDivElement = event.target as HTMLDivElement;
    anchorPoint.classList.add('hover');
  };
  private onDragLeave(event: DragEvent): void {
    event.preventDefault();
    const anchorPoint: HTMLDivElement = event.target as HTMLDivElement;
    anchorPoint.classList.remove('hover');
  };
  private onDragStart(event: DragEvent): void {
    if (event.target instanceof HTMLElement) {
      event.dataTransfer?.setData('text/plain', event.target.id);
    }
  };
  private onDrop = (event: DragEvent, anchorPoint: AnchorPoints): void => {
    event.preventDefault();
    const id = event.dataTransfer?.getData('text/plain');
    if (id) {
      const statElement: HTMLDivElement = document.getElementById(id) as HTMLDivElement;
      const anchorPointElement: HTMLDivElement = document.querySelector(`#${anchorPoint}`) as HTMLDivElement;
      console.log(anchorPointElement);
      anchorPointElement.appendChild(statElement);
      this.updateAnchorPointOrder(anchorPoint as AnchorPoints, id);
      anchorPointElement.classList.remove('hover');
    }
  };
  private updateAnchorPointOrder(anchorPoint: AnchorPoints, statElementId: string): void {
    for (const stats of Object.values(this.anchorPointOrder)) {
      const index = stats.findIndex(stat => stat.element.id === statElementId);
      if (index !== -1) {
        const [statElement] = stats.splice(index, 1);
        this.anchorPointOrder[anchorPoint].push(statElement);
        break;
      }
    }
  };
};