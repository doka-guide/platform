function init() {
  const [
    previous,
    next
  ] = [
    document.querySelector('.linked-article--previous .linked-article__link'),
    document.querySelector('.linked-article--next .linked-article__link'),
  ]

  // продолжаем, если есть хотя бы одна ссылка
  if (!(previous || next)) {
    return
  }

  function goToArticle(linkElement) {
    window.location = linkElement.href
  }

  document.addEventListener('keyup', event => {
    if (!event.altKey) {
      return
    }

    const link = ({
      'ArrowLeft': previous,
      'ArrowRight': next
    })[event.code]

    link && goToArticle(link)
  })
}

init()
