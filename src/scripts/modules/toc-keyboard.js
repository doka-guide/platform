function init() {
  const toc = document.querySelector('.toc')

  if (!toc) {
    return
  }

  const LINK_SELECTOR = '.toc__link'

  const links = Array.from(toc.querySelectorAll(LINK_SELECTOR))

  const linksLength = links.length

  if (linksLength === 0) {
    return
  }

  let currentLinkIndex = 0

  function clamp(min, value, max) {
    return Math.max(min, Math.min(max, value))
  }

  function moveLinkFocus(directionStep) {
    const newIndex = clamp(0, currentLinkIndex + directionStep, linksLength - 1)
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
        moveLinkFocus(-1)
        break;
      }

      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault()
        moveLinkFocus(1)
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

  toc.addEventListener('click', (event) => {
    const link = event.target.closest(LINK_SELECTOR)

    if (!link) {
      return
    }

    const newIndex = links.indexOf(link)
    moveLinkFocus(newIndex - currentLinkIndex)
  })
}

init()
