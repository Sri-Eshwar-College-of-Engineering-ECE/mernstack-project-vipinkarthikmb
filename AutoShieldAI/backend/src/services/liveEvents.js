const { EventEmitter } = require('events');

const liveEvents = new EventEmitter();

function publishLiveEvent(type, payload = {}) {
  liveEvents.emit('event', {
    type,
    payload,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  liveEvents,
  publishLiveEvent
};
