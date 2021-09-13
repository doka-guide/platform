import throttle from '../libs/throttle.js'
import debounce from '../libs/debounce.js'

function init() {
  let header
  let headerHeight

  header = document.querySelector('.header')
  if (!header) {
    return
  }

  function calculateHeaderHeight() {
    headerHeight = header.offsetHeight
    document.documentElement.style.setProperty('--header-height', headerHeight)
  }

  calculateHeaderHeight()
  window.addEventListener('resize', debounce(calculateHeaderHeight, 200))
  window.addEventListener('orientationchange', debounce(calculateHeaderHeight, 200))

  const collapsableHeader = document.querySelector('.header:not(.header--static,.search-page__header)')

  if (!collapsableHeader) {
    return
  }

  header = collapsableHeader

  const articleAside = document.querySelector('.article__aside')
  const toggleButtons = header.querySelectorAll('.menu-toggle')

  const headerActiveClass = 'header--open'

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      header.classList.toggle(headerActiveClass)
    })
  })

  function checkFixed() {
    if (window.scrollY > window.innerHeight) {
      if (header.classList.contains('header--fixed')) return

      header.addEventListener('animationend', event => {
        if (event.animationName !== 'fixedHeaderAnimation') return
        header.classList.remove('header--animating', 'header--fixed-show')
      }, { once: true })

      header.classList.add('header--fixed', 'header--animating', 'header--fixed-show')
      articleAside?.classList.add('article__aside--offset')

    } else {
      if (!header.classList.contains('header--fixed')) return

      // если скроллить очень быстро, то не нужно показывать анимацию скрытия
      // 4 - "магическое число"
      if (window.scrollY <= headerHeight * 4) {
        articleAside?.classList.remove('article__aside--offset')
        header.classList.remove('header--fixed')
        return
      }

      header.addEventListener('animationend', event => {
        if (event.animationName !== 'fixedHeaderAnimation') return
        header.classList.remove('header--fixed', 'header--animating', 'header--fixed-hide')
      }, { once: true })

      header.classList.add('header--animating', 'header--fixed-hide')
      articleAside?.classList.remove('article__aside--offset')
    }
  }

  checkFixed()
  window.addEventListener('scroll', throttle(checkFixed, 200), { passive: true })
}

init()
