export default function debounce(callback, delay) {
  let timeout
  return function (e) {
    timeout && clearTimeout(timeout)
    timeout = setTimeout(function () {
      callback(e)
    }, delay)
  }
}
