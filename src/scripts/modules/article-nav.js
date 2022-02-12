function init() {
  const nav = document.querySelector('.article-nav')

  if (!nav) {
    return
  }

  const button = nav.querySelector('.article-nav__button')
  const content = nav.querySelector('.article-nav__content')

  button.addEventListener('click', () => {
    nav.classList.toggle('article-nav--open')
  })

  content.addEventListener('click', (event) => {
    const link = event.target.closest('a')

    if (link) {
      nav.classList.remove('article-nav--open')
    }
  })
}

init()
