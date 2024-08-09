import { EventEmitter as IEventEmitter } from "../types/interfaces";

export default class EventEmitter<Events extends Record<string, any>> implements IEventEmitter<Events> {
  private listeners: { [K in keyof Events]?: Array<(data: Events[K]) => void> } = {};

  public on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  };

  public off<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter(l => l !== listener);
  };

  public emit<K extends keyof Events>(event: K, data: Events[K]): void {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach(listener => listener(data));
  };
};