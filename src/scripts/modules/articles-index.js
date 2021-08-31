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
}

init()
