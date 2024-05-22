function init() {
  const nav = document.querySelector('.article-nav')

  if (!nav) {
    return
  }

  const button = nav.querySelector('.toggle-button')

  button.addEventListener('click', () => {
    nav.classList.toggle('article-nav--open')

    let isExpanded = button.getAttribute('aria-expanded')
    isExpanded = isExpanded === 'true' ? 'false' : 'true'
    button.setAttribute('aria-expanded', isExpanded)
  })
}

init()
