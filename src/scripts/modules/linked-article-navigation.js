import runOnKeys from '../libs/run-on-keys.js'

function init() {
  const [
    previous,
    next
  ] = [
    document.querySelector('.linked-article--previous .linked-article__link'),
    document.querySelector('.linked-article--next .linked-article__link'),
  ]

  if (!(previous && next)) {
    return
  }

  function goToArticle(linkElement) {
    window.location = linkElement.href
  }

  function goToPrevious() {
    goToArticle(previous)
  }

  function goToNext() {
    goToArticle(next)
  }

  if (previous) {
    runOnKeys(goToPrevious, 'AltLeft', 'ArrowLeft')
    runOnKeys(goToPrevious, 'AltRight', 'ArrowLeft')
  }

  if (next) {
    runOnKeys(goToNext, 'AltLeft', 'ArrowRight')
    runOnKeys(goToNext, 'AltRight', 'ArrowRight')
  }
}

init()
