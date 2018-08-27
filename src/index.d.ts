declare module EventBus {

  export interface EventBus {
    constructor();
    getTopic(identifier: string, options: TopicOptions): Topic;
    getTopics(): Topic[];
  }

  export interface Topic {
    constructor(identifier: string, options: TopicOptions);
    addListener(binding: string, callback: ListenerCallback): Listener;
    removeListener(listener: Listener): void;
    dispatch(event: string, data: any): void;
  }

  export interface TopicOptions {
    persistent?: boolean = false
  }

  export interface Listener {
    constructor(event: string, callback: ListenerCallback, topic: Topic);
    unbind(): void;
  }

  export type ListenerCallback = () => void;

  export = EventBus;

}