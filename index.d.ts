declare module '@theiconic/event-bus' {

  export = EventBus

  declare class EventBus {
    constructor();
    getTopic(identifier: string, options?: TopicOptions): Topic;
    getTopics(): Topic[];
  }

  declare namespace EventBus {
    interface Topic {
      constructor(identifier: string, options: TopicOptions);
      addListener(binding: string, callback: ListenerCallback): Listener;
      removeListener(listener: Listener): void;
      dispatch(event: string, data: any): void;
    }

    interface TopicOptions {
      queue?: boolean
    }

    interface Listener {
      constructor(event: string, callback: ListenerCallback, topic: Topic);
      unbind(): void;
    }

    type ListenerCallback = (...data: any) => void;
  }

}