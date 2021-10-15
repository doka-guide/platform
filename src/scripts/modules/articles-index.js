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

  filter.addEventListener('change', event => {
    const { value: view } = event.target

    if (!view) {
      return
    }

    sections.forEach(section => {
      section.hidden = section.id !== view
    })
  })

  // Chrome иногда не прокручивает до anchor-блока, если в адресной строке нажать enter
  const isChrome = /Chrome/.test(navigator.userAgent)
  const hash = window.location.hash
  if (isChrome && hash) {
    window.addEventListener('load', () => {
      document.querySelector(hash)?.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      })
    })
  }
}

init()
