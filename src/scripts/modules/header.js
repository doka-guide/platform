import throttle from '../libs/throttle.js'
import debounce from '../libs/debounce.js'
import BaseComponent from '../core/base-component.js'

const headerActiveClass = 'header--open'
const scrollThreshold = 1.5

class Header extends BaseComponent {
  constructor({ rootElement }) {
    if (!rootElement) {
      return null
    }

    super()

    /** @type {Object<string, HTMLElement>} */
    this.refs = {
      rootElement,
      input: rootElement.querySelector('.search__input'),
      toggleButtons: rootElement.querySelectorAll('.menu-toggle'),
    }

    this.state = {
      headerHeight: null,
      fixedHeaderHeight: null
    };

    [
      'calculateHeaderHeight',
      'openOnKeyUp',
      'closeOnKeyUp',
      'closeOnClickOutSide',
      'openMenu',
      'closeMenu',
      'fixHeader',
      'checkFixed'
    ].forEach(method => {
      this[method] = this[method].bind(this)
    })

    window.addEventListener('resize', debounce(this.calculateHeaderHeight, 200))
    window.addEventListener('orientationchange', debounce(this.calculateHeaderHeight, 200))
    this.calculateHeaderHeight()

    if (this.isClosableHeader) {
      this.refs.toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.isMenuOpen ? this.closeMenu() : this.openMenu()
        })
      })

      document.addEventListener('keyup', this.openOnKeyUp)

      window.addEventListener('scroll', throttle(this.checkFixed, 200), { passive: true })
      this.checkFixed()
    }
  }

  get isFixed() {
    return this.refs.rootElement.classList.contains('header--fixed')
  }

  get isClosableHeader() {
    const header = this.refs.rootElement

    return [
      !header.classList.contains('header--static'),
      !header.classList.contains('search-page__header')
    ].every(Boolean)
  }

  get isMenuOpen() {
    return this.refs.rootElement.classList.contains(headerActiveClass)
  }

  calculateHeaderHeight() {
    const header = this.refs.rootElement
    const state = this.state

    if (this.isFixed) {
      state.fixedHeaderHeight = header.offsetHeight
      header.classList.remove('header--fixed')
      state.headerHeight = header.offsetHeight
      header.classList.add('header--fixed')
    } else {
      state.headerHeight = header.offsetHeight
      header.classList.add('header--fixed')
      state.fixedHeaderHeight = header.offsetHeight
      header.classList.remove('header--fixed')
    }

    document.documentElement.style.setProperty('--fixed-header-height', state.fixedHeaderHeight)
    document.documentElement.style.setProperty('--not-fixed-header-height', state.headerHeight)
  }

  openOnKeyUp(event) {
    if (event.code === 'Slash') {
      this.openMenu()
    }
  }

  closeOnKeyUp(event) {
    if (event.code === 'Escape') {
      this.closeMenu()
    }
  }

  closeOnClickOutSide(event) {
    if (!event.target.closest('.header__inner')) {
      this.closeMenu()
    }
  }

  openMenu() {
    this.refs.rootElement.classList.add(headerActiveClass)
    document.removeEventListener('keyup', this.openOnKeyUp)
    document.addEventListener('keyup', this.closeOnKeyUp)
    document.addEventListener('click', this.closeOnClickOutSide)
  }

  closeMenu() {
    const { rootElement } = this.refs

    rootElement.classList.remove(headerActiveClass)
    document.removeEventListener('keyup', this.closeOnKeyUp)
    document.removeEventListener('click', this.closeOnClickOutSide)
    document.addEventListener('keyup', this.openOnKeyUp)

    this.emit('menu.close')

  }

  fixHeader(flag) {
    this.refs.rootElement.classList.toggle('header--fixed', flag)
    document.documentElement.style.setProperty('--is-header-fixed', Number(flag))
  }

  checkFixed() {
    const { rootElement: header } = this.refs

    if (window.scrollY > scrollThreshold * window.innerHeight) {
      if (this.isFixed) return

      header.addEventListener('animationend', event => {
        if (event.animationName !== 'fixedHeaderAnimation') return
        header.classList.remove('header--animating', 'header--fixed-show')
      }, { once: true })

      this.fixHeader(true)
      header.classList.add('header--animating', 'header--fixed-show')
      this.emit('fixed')

    } else {
      if (!this.isFixed) return

      // если скроллить очень быстро, то не нужно показывать анимацию скрытия
      // 4 - "магическое число"
      if (window.scrollY <= this.state.headerHeight * 4) {
        this.emit('unfixed')
        this.fixHeader(false)
        return
      }

      header.addEventListener('animationend', event => {
        if (event.animationName !== 'fixedHeaderAnimation') return
        this.fixHeader(false)
        header.classList.remove('header--animating', 'header--fixed-hide')
      }, { once: true })

      header.classList.add('header--animating', 'header--fixed-hide')
      this.emit('unfixed')
    }
  }
}

export default new Header({
  rootElement: document.querySelector('.header')
})
