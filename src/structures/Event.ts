export type Awaitable<T> = T | Promise<T>;
export type ListenerFunciton = (...args: any[]) => Awaitable<void | any>;

class EventClass {
  listeners: { [k: string]: ListenerFunciton };
  constructor() {
    this.listeners = {};
  }

  on(event: string, fn: ListenerFunciton) {
    this.listeners[event] = fn;
  }

  emit(event: string, ...args: any[]) {
    event in this.listeners && this.listeners[event](...args);
  }
}

export const EventChest = new EventClass();
