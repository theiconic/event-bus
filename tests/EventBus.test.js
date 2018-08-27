const EventBus = require('../src/EventBus');

describe('TiEventBus', () => {

  it('will create topic if getting with an unregistered topic identifier', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');

    expect(bus.topics.mytopic).toBe(topic);
  });

  it('will reuse topic if getting with a registered topic identifier', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');

    expect(bus.getTopic('mytopic')).toBe(topic);
  });

  it('will return all topics on `getTopics`', () => {
    const bus = new EventBus();
    const topic1 = bus.getTopic('mytopic1');
    const topic2 = bus.getTopic('mytopic2');
    const topic3 = bus.getTopic('mytopic3');
    const topics = bus.getTopics();

    expect(topics).toEqual({
      mytopic1: topic1,
      mytopic2: topic2,
      mytopic3: topic3,
    });
  });

  it('will bind listener to topic', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');
    const myCallback = () => { };

    topic.addListener('my.event', myCallback);

    const listener = topic.listeners['my.event'][0];

    expect(listener.callback).toBe(myCallback);
    expect(listener.event).toBe('my.event');
    expect(listener.topic).toBe(topic);
  });

  it('will remove listener from topic', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');
    const event = 'my.event';
    const myCallback = () => { };

    const listener = topic.addListener(event, myCallback);
    expect(topic.listeners[event][0]).toBe(listener);

    topic.removeListener(listener);
    expect(topic.listeners[event]).toEqual([]);
  });

  it('will not remove more than one listener from topic', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');
    const event = 'my.event';
    const myCallback = () => { };

    topic.addListener(event, () => { });
    const listener1 = topic.addListener(event, myCallback);

    expect(topic.listeners[event].length).toEqual(2);

    topic.removeListener(listener1);

    expect(topic.listeners[event].length).toEqual(1);
  });

  it('listener will detach itself', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');
    const event = 'my.event';
    const myCallback = () => { };

    const listener = topic.addListener(event, myCallback);
    expect(topic.listeners[event][0]).toBe(listener);

    listener.unbind();
    expect(topic.listeners[event]).toEqual([]);
  });

  it('will not throw errors if trying to remove listener from topic when there are no listeners', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');

    topic.removeListener({});
    expect(topic.listeners).toEqual({});
  });

  it('will forward event to listeners with single parameter and binding with no wildcard', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');
    const event = 'my.event';
    const expectedParam = 999;
    const listener1Mock = jest.fn();
    const listener2Mock = jest.fn();
    const otherListenerMock = jest.fn();

    topic.addListener(event, listener1Mock);
    topic.addListener(event, listener2Mock);
    topic.addListener('otherevent', otherListenerMock);

    topic.dispatch(event, expectedParam);

    expect(listener1Mock).toHaveBeenCalledWith(expectedParam);
    expect(listener2Mock).toHaveBeenCalledWith(expectedParam);
    expect(otherListenerMock).not.toHaveBeenCalled();
  });

  it('will forward event to listeners with single parameter and binding with wildcard', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');
    const expectedParam = 999;
    const listener1Mock = jest.fn();
    const listener2Mock = jest.fn();
    const otherListenerMock = jest.fn();

    topic.addListener('my.event.*', listener1Mock);
    topic.addListener('my.event.test', listener2Mock);
    topic.addListener('my.event.other', otherListenerMock);

    topic.dispatch('my.event.test', expectedParam);

    expect(listener1Mock).toHaveBeenCalledWith(expectedParam);
    expect(listener2Mock).toHaveBeenCalledWith(expectedParam);
    expect(otherListenerMock).not.toHaveBeenCalled();
  });

  it('persistent topic will forward event to listener added after event send', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic', { persistent: true });
    const event = 'my.event';
    const expectedParam = 999;
    const listenerMock = jest.fn();

    topic.dispatch(event, expectedParam);
    topic.dispatch('otherevent', expectedParam);
    topic.addListener(event, listenerMock);

    expect(listenerMock).toHaveBeenCalledWith(expectedParam);
    expect(listenerMock).toHaveBeenCalledTimes(1);
  });

  it('persistent topic will forward event to listener added before event send', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic', { persistent: true });
    const event = 'my.event';
    const expectedParam = 999;
    const listenerMock = jest.fn();

    topic.addListener(event, listenerMock);
    topic.dispatch(event, expectedParam);
    topic.dispatch('otherevent', expectedParam);

    expect(listenerMock).toHaveBeenCalledWith(expectedParam);
    expect(listenerMock).toHaveBeenCalledTimes(1);
  });

  it('non-persistent topic will discard event if there\'s no listerners at dispatch time', () => {
    const bus = new EventBus();
    const topic = bus.getTopic('mytopic');
    const event = 'my.event';
    const expectedParam = 999;
    const listenerMock = jest.fn();

    topic.dispatch(event, expectedParam);

    topic.addListener(event, listenerMock);

    expect(listenerMock).not.toHaveBeenCalled();
  });

});
