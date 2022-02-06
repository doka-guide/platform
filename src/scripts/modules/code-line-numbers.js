import debounce from '../libs/debounce.js'

function init() {
  const codeBlocks = document.querySelectorAll('pre[data-lang]')

  if (codeBlocks.length === 0) {
    return
  }

  function computedHeights() {
    codeBlocks.forEach((block) => {
      const originalLines = block.querySelectorAll('.block-code__original-line')
      const linesMarkers = block.querySelectorAll('.block-code__line')

      originalLines.forEach((line, index) => {
        linesMarkers[index].style.height = `${getComputedStyle(line).height}`
      })
    })
  }

  const debouncedCallback = debounce(computedHeights, 100)

  window.addEventListener('resize', debouncedCallback)
  window.addEventListener('orientationchange', debouncedCallback)

  computedHeights()
}

init()
