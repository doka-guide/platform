function init() {
  const filterPanel = document.querySelector('.search-page__aside')
  const button = document.querySelector('.search-page__aside-button')
  const buttonName = document.querySelector('.search-page__aside-button-name')
  let expanded = false

  if (!filterPanel && !button) {
    return
  }

  button.addEventListener('click', () => {
    filterPanel.classList.toggle('search-page__aside--open')

    if (expanded) {
      button.setAttribute('aria-expanded', 'false')
      buttonName.innerHTML = 'Показать фильтр'
      expanded = false
    } else {
      button.setAttribute('aria-expanded', 'true')
      buttonName.innerHTML = 'Скрыть фильтр'
      expanded = true
    }
  })
}

init()
