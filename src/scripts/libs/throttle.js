export default function throttle(callback) {
  let requestId = null
  let savedArgs
  let savedThis

  function frameFunction() {
    callback.apply(savedThis, savedArgs)
    requestId = null
  }

  function replacedFunction() {
    savedThis = this
    savedArgs = arguments

    if (requestId === null) {
      requestId = requestAnimationFrame(frameFunction)
    }
  }

  return replacedFunction
}
