import headerComponent from './header.js'

function init() {
  const articleAside =  document.querySelector('.article__aside')

if (!(articleAside && headerComponent)) {

  const activeClass = 'article__aside--offset'

  headerComponent.on('fixed', () => {
    articleAside.classList.add(activeClass)
  })

  headerComponent.on('unfixed', () => {
    articleAside.classList.remove(activeClass)
  })
}

init()
