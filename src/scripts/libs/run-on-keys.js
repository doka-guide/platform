export default function runOnKeys(callback, ...codes) {
  const pressedKeys = new Set()

  function onKeyDown(event) {
    if (event.repeat) {
      return
    }

    pressedKeys.add(event.code)

    const isCombinationPressed = codes.every(code => pressedKeys.has(code))

    if (isCombinationPressed) {
      pressedKeys.clear()
      callback(event)
    }
  }

  function onKeyUp(event) {
    pressedKeys.delete(event.code)
  }

  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
}
