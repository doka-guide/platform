import throttle from '../libs/throttle.js'
import debounce from '../libs/debounce.js'

function init() {
  const header = document.querySelector('.header')
  let headerHeight

  if (!header) {
    return
  }

  const input = header.querySelector('.search__input')

  function calculateHeaderHeight() {
    headerHeight = header.offsetHeight
    document.documentElement.style.setProperty('--header-height', headerHeight)
  }

  calculateHeaderHeight()
  window.addEventListener('resize', debounce(calculateHeaderHeight, 200))
  window.addEventListener('orientationchange', debounce(calculateHeaderHeight, 200))

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Slash' && document.activeElement !== input) {
      event.preventDefault()
    }
  })

  document.addEventListener('keyup', (event) => {
    if (event.code === 'Slash') {
      setTimeout(() => {
        input?.focus()
      })
    }
  })

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
  }

  function closeHeader() {
    header.classList.remove(headerActiveClass)
    document.removeEventListener('keyup', closeOnKeyUp)
    document.removeEventListener('click', closeOnClickOutSide)
    document.addEventListener('keyup', openOnKeyUp)

    if (input) {
      input.value = '';
      input.blur();
    }
  }

  function isHeaderOpen() {
    return header.classList.contains(headerActiveClass)
  }

  function fixHeader(flag) {
    header.classList.toggle('header--fixed', flag)
    document.documentElement.style.setProperty('--is-header-fixed', Number(flag))
    calculateHeaderHeight()
  }

  function isHeaderFixed() {
    return header.classList.contains('header--fixed')
  }

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      isHeaderOpen() ? closeHeader() : openHeader()
    })
  })

  document.addEventListener('keyup', openOnKeyUp)

  const scrollThreshold = 1.5;

  function checkFixed() {
    if (window.scrollY > scrollThreshold * window.innerHeight) {
      if (isHeaderFixed()) return

      header.addEventListener('animationend', event => {
        if (event.animationName !== 'fixedHeaderAnimation') return
        header.classList.remove('header--animating', 'header--fixed-show')
      }, { once: true })

      fixHeader(true)
      header.classList.add('header--animating', 'header--fixed-show')
      articleAside?.classList.add('article__aside--offset')

    } else {
      if (!isHeaderFixed()) return

      // если скроллить очень быстро, то не нужно показывать анимацию скрытия
      // 4 - "магическое число"
      if (window.scrollY <= headerHeight * 4) {
        articleAside?.classList.remove('article__aside--offset')
        fixHeader(false)
        return
      }

      header.addEventListener('animationend', event => {
        if (event.animationName !== 'fixedHeaderAnimation') return
        fixHeader(false)
        header.classList.remove('header--animating', 'header--fixed-hide')
      }, { once: true })

      header.classList.add('header--animating', 'header--fixed-hide')
      articleAside?.classList.remove('article__aside--offset')
    }
  }

  checkFixed()
  window.addEventListener('scroll', throttle(checkFixed, 200), { passive: true })
}

init()
