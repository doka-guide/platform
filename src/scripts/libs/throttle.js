export default function throttle(callback, delay, options = { leading: true }) {
  let isThrottled = false
  let savedArgs
  let savedThis

  return function wrapper() {
    if (isThrottled) {
      savedArgs = arguments
      savedThis = this
      return
    }

    options.leading && callback.apply(this, arguments)

    isThrottled = true

    setTimeout(function () {
      isThrottled = false
      if (savedArgs) {
        callback.apply(savedThis, savedArgs)
        savedArgs = savedThis = null
      }
    }, delay)
  }
}
