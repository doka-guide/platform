function init() {
  const [previous, next] = [
    document.querySelector('.linked-article--previous .linked-article__link'),
    document.querySelector('.linked-article--next .linked-article__link'),
  ]

  if (!(previous && next)) {
    return
  }

  function goToArticle(event) {
    if (!(event.ctrlKey && event.altKey)) {
      return
    }

    const link = {
      ArrowLeft: previous,
      ArrowRight: next,
    }[event.code]

    if (!link) {
      return
    }

    window.location = link.href
  }

  document.addEventListener('keyup', goToArticle)
}

init()
