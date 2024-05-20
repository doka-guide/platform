function init() {
  const nav = document.querySelector('.article-nav')

  if (!nav) {
    return
  }

  const button = nav.querySelector('.toggle-button')

  button.addEventListener('click', () => {
    nav.classList.toggle('article-nav--open')
  })
}

init()
