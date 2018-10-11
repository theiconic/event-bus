[![Build Status](https://travis-ci.org/theiconic/event-bus.svg?branch=master)](https://travis-ci.org/theiconic/event-bus)
[![Maintainability](https://api.codeclimate.com/v1/badges/a7872af6085afca4e71e/maintainability)](https://codeclimate.com/github/theiconic/event-bus/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a7872af6085afca4e71e/test_coverage)](https://codeclimate.com/github/theiconic/event-bus/test_coverage)

# Event Bus


EventBus is a simple JavaScript library for managing events. It can be used in both NodeJS and the browser.

The main driver for this library is enabling frontend microservices to interact with each other, allowing certain tasks to be deferred to another service, thus making our frontend microservices truly micro.

## Examples

### NodeJS

```typescript
import EventBus from '@theiconic/eventbus';

const eventBus = new EventBus();
const wishlistTopic = eventBus.getTopic('wishlist');

wishlistTopic.addListener('update', (wishlistItem) => {
  console.log(`Wishlist item with SKU ${wishlistItem.sku} updated!`);
});

wishlistTopic.dispatch('update', { sku: 'MYSKU123', quantity: 1 });
```

### Browser

Load EventBus

```html
<script type="text/javascript" src="/path/to/eventbus.min.js" />
```

Expose the instance on the `window` object:

```html
<script type="text/javascript">
  window.eventBus = new EventBus();
</script>
```

Access it using angular

```javascript
(function(angular, EventBus) {
    angular.module('ti.myservice').provider('myservice', [
        function() {
            var topic = EventBus.getTopic('mytopic');

            topic.addListener('my.event', (data) => {
              console.log('Do something with data!');
            });
        }
    ]);
})(angular, window.eventBus);
```

Or some other framework, such as React:

```typescript
// window.ts

import { EventBus } from '@theiconic/eventbus';

declare var eventBus: EventBus;

export {
  eventBus: window.eventBus,
};
```

```tsx
// mycomponent.tsx

import React, { Component } from 'react';
import { Listener, Topic } from '@theiconic/eventbus';
import { eventBus } from './window';

export default class FooComponent extends Component {
    
    private topic: Topic = eventBus.getTopic('mytopic');
    private eventListener: Listener;

    constructor(props) {
      super(props);

      this.handleEvent = this.handleEvent.bind(this);
    }

    private handleEvent(data: any): void {
      this.setState({
        someprop: data.myprop,
      });
    }

    private componentWillMount() {
      this.eventListener = eventBus.addListener('myevent', this.handleEvent);
    }

    private componentWillUnmount() {
      this.eventListener.unbind();
    }

    render() {
        return (<div>{this.state.someprop}</div>)
    }
}
```

## API

### EventBus

#### `getTopic(identifier, options): Topic`

Create a new topic or return an existing one based on the identifier. A topic should represent a namespace for your events, e.g. `orders`, `wishlist`, `cart`.

Options:

| Property | Description | Required | Default value |
|----------|-------------|:--------:|---------------|
| `persistent` | Whether messages should be queued if not consumed immediately. This will keep the messages in memory | `false` | `false` |

#### `getTopics(): Topic[]`

Returns all registered topics for an EventBus instance.

### Topic

#### `addListener(binding: string, callback: (data: any) => void): Listener`

Add a listener to an event binding. An event binding can be a wildcard, for example `add.*`. This is useful in scenarios where the event sent contains an ID like `add.MYID` and you want to capture all of these events.

Returns the [listener](#listener) instance.

#### `removeListener(listener: Listener): void`

Takes a [listener](#listener) object and will unbind it from the topic, not sending events to it anymore.

#### `dispatch(event: string, data: any): void`

Sends an event to all listeners, with any data of your choosing. 

Note that this **does not support wildcards**.

### Listener

#### `unbind(): void`

Unbinds a listener from its topic. This will prevent this listener from receiving any events.
