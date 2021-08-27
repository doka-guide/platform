export default function throttle(callback, delay) {
  let isThrottled = false
  let savedArgs
  let savedThis

  return function wrapper() {
    if (isThrottled) {
      savedArgs = arguments
      savedThis = this
      return
    }

    callback.apply(this, arguments)

    isThrottled = true

    setTimeout(function () {
      isThrottled = false
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs)
        savedArgs = savedThis = null
      }
    }, delay)
  };
}
