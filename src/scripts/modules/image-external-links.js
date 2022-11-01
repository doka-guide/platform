function init() {
  const images = document.querySelectorAll('.figure__picture img')

  if (!images) {
    return
  }

  images.forEach((image) => {
    const imageCurrentSourceLink = image.currentSrc
    const imageExternalLink = image.parentNode.nextElementSibling.firstElementChild

    if (!imageExternalLink.hasAttribute('href')) {
      return
    }

    imageExternalLink.setAttribute('href', `${imageCurrentSourceLink}`)
  })
}

init()
