import throttle from '../libs/throttle.js'
import debounce from '../libs/debounce.js'

function init() {
  const header = document.querySelector('.header')
  let headerHeight

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

  if (!header.matches('.header:not(.header--static,.search-page__header)')) {
    return
  }

  const articleAside = document.querySelector('.article__aside')
  const toggleButtons = header.querySelectorAll('.menu-toggle')

  const headerActiveClass = 'header--open'

  function openOnKeyUp(event) {
    if (event.code === 'Slash') {
      openHeader()
    }
  }

  function closeOnKeyUp(event) {
    if (event.code === 'Escape') {
      closeHeader()
    }
  }

  function closeOnClickOutSide(event) {
    if (!event.target.closest('.header__inner')) {
      closeHeader()
    }
  }

  function openHeader() {
    header.classList.add(headerActiveClass)
    document.addEventListener('keyup', closeOnKeyUp)
    document.addEventListener('click', closeOnClickOutSide)
    document.removeEventListener('keyup', openOnKeyUp)

    header.querySelector('.search__input')?.focus();
  }

  function closeHeader() {
    header.classList.remove(headerActiveClass)
    document.removeEventListener('keyup', closeOnKeyUp)
    document.removeEventListener('click', closeOnClickOutSide)
    document.addEventListener('keyup', openOnKeyUp)
  }

  function isHeaderOpen() {
    return header.classList.contains(headerActiveClass)
  }

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      isHeaderOpen() ? closeHeader() : openHeader()
    })
  })

  document.addEventListener('keyup', openOnKeyUp)

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Slash') {
      event.preventDefault()
    }
  })

  const scrollThreshold = 1.5;

  function checkFixed() {
    if (window.scrollY > scrollThreshold * window.innerHeight) {
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
