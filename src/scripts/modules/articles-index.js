function init() {
  const rootBlock = document.querySelector('.index-block')

  if (!rootBlock) {
    return
  }

  const filter = rootBlock.querySelector('.index-block__filter-control')
  const sections = rootBlock.querySelectorAll('.index-section')

  if (!filter && !sections) {
    return
  }

  const PARAM_NAME = 'view'

  const VIEWS = {
    THEMES: 'themes',
    ALPHABET: 'alphabet',
  }

  function applyView(currentView) {
    for (const section of sections) {
      section.hidden = section.id !== currentView
    }
  }

  function setURLSearchParams(currentView) {
    const params = new URLSearchParams({
      [PARAM_NAME]: currentView,
    })
    history.replaceState(null, null, `?${params}`)
  }

  filter.addEventListener('change', (event) => {
    const { value: view } = event.target

    if (!view) {
      return
    }

    applyView(view)
    setURLSearchParams(view)
  })

  const params = new URLSearchParams(window.location.search)
  applyView(params.get(PARAM_NAME) || VIEWS.THEMES)

  // Chromium иногда не прокручивает до anchor-блока, если в адресной строке нажать enter
  const hash = window.location.hash
  if (hash) {
    window.addEventListener('load', () => {
      document.querySelector(hash)?.scrollIntoView()
    })
  }
}

init()
