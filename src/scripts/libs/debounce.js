export default function debounce(fn, delay) {
  let timeout
  return function(e) {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(function() {
      fn(e)
    }, delay)
  };
}
