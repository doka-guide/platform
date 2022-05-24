function init() {
  const filterPanel = document.querySelector('.filter-panel')
  const button = document.querySelector('.filter-panel__button')

  if (!filterPanel && !button) {
    return
  }

  button.addEventListener('click', () => {
    filterPanel.classList.toggle('filter-panel--open')
  })
}

init()
