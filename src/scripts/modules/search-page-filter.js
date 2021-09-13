function init() {
  const filterPanel = document.querySelector('.search-page__aside')
  const button = document.querySelector('.search-page__aside-button')

  if (!filterPanel && !button) {
    return
  }

  button.addEventListener('click', () => {
    filterPanel.classList.toggle('search-page__aside--open')
  })
}

init()
