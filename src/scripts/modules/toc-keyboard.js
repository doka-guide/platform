function init() {
  const toc = document.querySelector('.toc')

  if (!toc) {
    return
  }

  const links = toc.querySelectorAll('.toc__link')

  const linksLength = links.length

  if (linksLength === 0) {
    return
  }

  let currentLinkIndex = 0

  const DIRECTIONS = {
    FORWARD: 1,
    BACKWARD: -1,
  }

  function setLinkFocus(direction) {
    const newIndex = (currentLinkIndex + linksLength + direction) % linksLength
    links[currentLinkIndex]?.setAttribute('tabindex', -1)
    links[newIndex]?.setAttribute('tabindex', 0)
    links[newIndex]?.focus()
    currentLinkIndex = newIndex
  }

  function keyHandler(event) {

    switch (event.code) {
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault()
        setLinkFocus(DIRECTIONS.BACKWARD)
        break;
      }

      case 'ArrowRight':
        case 'ArrowDown': {
        event.preventDefault()
        setLinkFocus(DIRECTIONS.FORWARD)
        break;
      }
    }
  }

  toc.addEventListener('focusin', () => {
    links.forEach((link, index) => {
      link.setAttribute('tabindex', index !== currentLinkIndex ? -1 : 0)
    })
  }, { once: true })

  toc.addEventListener('focusin', () => {
    document.addEventListener('keydown', keyHandler)
  })

  toc.addEventListener('focusout', () => {
    document.removeEventListener('keydown', keyHandler)
  })
}

init()
