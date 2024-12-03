class EventBus {
  constructor() {
    this.eventObject = {};
    this.callbackId = 0;
  }

  emit(eventName, ...args) {
    const callback = this.eventObject[eventName];

    if (!callback) return console.warn(eventName + ": event not found!");

    for (let id in callback) {
      callback[id](...args);
    }
  }

  on(eventName, callback) {
    if (!this.eventObject[eventName]) {
      this.eventObject[eventName] = {};
    }

    const id = this.callbackId++;

    this.eventObject[eventName][id] = callback;

    const unsubscribe = () => {
      delete this.eventObject[eventName][id];

      if (Object.keys(this.eventObject[eventName]).length === 0) {
        delete this.eventObject[eventName];
      }
    };

    return { unsubscribe };
  }

  // for UiModal
  open(modalName, ...args) {
    return this.emit('openModal', modalName, ...args)
  }

  close(modalName, ...args) {
    return this.emit('closeModal', modalName, ...args)
  }
}

const $bus = new EventBus()

export default $bus