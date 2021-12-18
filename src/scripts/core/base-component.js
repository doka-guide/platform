class BaseComponent extends EventTarget {
  emit(eventType, detail) {
    this.dispatchEvent(
      new CustomEvent(eventType, {
        detail,
      })
    )
  }
}

Object.assign(BaseComponent.prototype, {
  on: EventTarget.prototype.addEventListener,
  off: EventTarget.prototype.removeEventListener,
})

export default BaseComponent
