var EventBus = function () {
  this.topics = {};
};

/**
 * Get a topic in the event bus, if it doesn't exist, it will be created
 * @param {string} identifier 
 * @returns {Topic}
 */
EventBus.prototype.getTopic = function (identifier, options) {
  if (!this.topics[identifier]) {
    this.topics[identifier] = new Topic(identifier, options);
  }

  return this.topics[identifier];
};

/**
 * @returns {Topic[]}
 */
EventBus.prototype.getTopics = function () {
  return this.topics;
};

/**
 * @param {string} identifier 
 */
var Topic = function (identifier, options) {
  this.identifier = identifier;
  this.options = options || {};
  this.listeners = {};
  this.queue = {};
};

/**
 * @param {string} binding The event binding to listen to
 * @param {Function} callback The callback to be triggered on events
 * @returns {Listener}
 */
Topic.prototype.addListener = function (binding, callback) {
  var listener = new Listener(binding, callback, this);

  this.listeners[binding] = this.listeners[binding] || [];
  this.listeners[binding].push(listener);

  if (this.options.persistent === true) {
    consume(binding, this.queue, listener);
  }

  return listener;
};

/**
 * @param {Listener} listener The listener instance to remove
 */
Topic.prototype.removeListener = function (listener) {
  var i = 0,
    listeners = this.listeners[listener.event] || [];

  for (; i < listeners.length; i++) {
    if (listeners[i] === listener) {
      this.listeners[listener.event].splice(i, 1);
      return;
    }
  }
};

/**
 * @param {string} event The event to trigger
 * @param {any} data The data to broadcast to the listeners
 */
Topic.prototype.dispatch = function (event, data) {
  var binding,
    listeners = [];

  for (binding in this.listeners) {
    if (matchWildCard(event, binding)) {
      listeners = listeners.concat(this.listeners[binding]);
    }
  }

  for (i in listeners) {
    listeners[i].callback(data);
  }

  if (!listeners.length && this.options.persistent === true) {
    this.queue[event] = this.queue[event] || [];
    this.queue[event].push(data);
  }
};

function consume(binding, queue, listener) {
  for (var key in queue) {
    if (matchWildCard(key, binding)) {
      var messages = queue[key];

      for (var i in messages) {
        listener.callback(messages[i]);
      }

      queue[key].splice(0, queue[key].length);
    }
  }
}

function matchWildCard(str, rule) {
  return new RegExp('^' + rule.split('*').join('.*') + '$').test(str);
}

/**
 * @param {string} event The event this listener is attached to
 * @param {Function} callback The actual callable that will be triggered on events
 * @param {Topic} topic A reference to the topic this listener is attached to
 */
var Listener = function (event, callback, topic) {
  this.event = event;
  this.callback = callback;
  this.topic = topic;
};

Listener.prototype.unbind = function () {
  this.topic.removeListener(this);
};

/* istanbul ignore next */
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = EventBus;
} else {
  window.EventBus = EventBus;
}
