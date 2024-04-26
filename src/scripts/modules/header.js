import throttle from '../libs/throttle.js'
import debounce from '../libs/debounce.js'
import BaseComponent from '../core/base-component.js'

const headerActiveClass = 'header--open'
// const headerAnimationName = 'stickyHeaderAnimation'

class Header extends BaseComponent {
  constructor({ rootElement }) {
    super()

    /** @type {Object<string, HTMLElement>} */
    this.refs = {
      rootElement,
      input: rootElement.querySelector('.search__input'),
      toggleButtons: rootElement.querySelectorAll('.hamburger'),
    }

    this.state = {
      headerHeight: null,
      stickyHeaderHeight: null,
      lastScroll: 0,
      getScrollThreshold: window.innerHeight,
    }

    const scrollThresholdConditions = [
      {
        condition: () => !!document.querySelector('.article'),
        getter: () => this.state.headerHeight + document.querySelector('.article__header').offsetHeight,
      },
      {
        condition: () => !!document.querySelector('.index-block'),
        getter: () => {
          const additionalHeight = window.matchMedia('(width >= 1366px)')
            ? 0
            : document.querySelector('.index-block__header').offsetHeight
          return this.state.headerHeight + additionalHeight
        },
      },
      {
        condition: () => !!document.querySelector('.standalone-page'),
        getter: () => this.state.headerHeight + document.querySelector('.standalone-page__header').offsetHeight,
      },
      {
        condition: () => true,
        getter: () => window.innerHeight,
      },
    ]

    for (const { condition, getter } of scrollThresholdConditions) {
      if (condition()) {
        this.getScrollThreshold = getter
        break
      }
    }

    ;['openOnKeyUp', 'closeOnKeyUp', 'closeOnClickOutSide', 'openMenu', 'closeMenu', 'stickyHeader'].forEach(
      (method) => {
        this[method] = this[method].bind(this)
      },
    )

    const resizeCallback = () => {
      this.calculateHeaderHeight()
      this.calculateScrollThreshold()
    }

    const onResize = debounce(resizeCallback, 200)

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    resizeCallback()

    if (this) {
      this.refs.toggleButtons.forEach((button) => {
        button.addEventListener('click', () => {
          this.isMenuOpen ? this.closeMenu() : this.openMenu()
        })
      })

      // document.addEventListener('keyup', this.openOnKeyUp)

      window.addEventListener('scroll', throttle(this.checkSticky, 250, { leading: false }), { passive: true })
      this.checkSticky()
    }
  }

  // get isSticky() {
  //   return this.refs.rootElement.classList.contains('header--sticky')
  // }

  // get isMainPage() {
  //   return this.refs.rootElement.classList.contains('header--main')
  // }

  // get isClosableHeader() {
  //   const header = this.refs.rootElement

  //   return [!header.classList.contains('header--static'), !header.classList.contains('search-page__header')].every(
  //     Boolean
  //   )
  // }

  get isMenuOpen() {
    return this.refs.rootElement.classList.contains(headerActiveClass)
  }

  calculateHeaderHeight() {
    const header = this.refs.rootElement
    const state = this.state

    if (this.isSticky) {
      state.stickyHeaderHeight = header.offsetHeight
      state.headerHeight = header.offsetHeight
    } else {
      state.headerHeight = header.offsetHeight
      state.stickyHeaderHeight = header.offsetHeight
    }

    document.documentElement.style.setProperty('--sticky-header-height', state.stickyHeaderHeight)
    document.documentElement.style.setProperty('--not-sticky-header-height', state.headerHeight)
  }

  calculateScrollThreshold() {
    this.scrollThreshold = this.getScrollThreshold()
  }

  openOnKeyUp(event) {
    if (event.code === 'Slash') {
      this.openMenu()
    }
  }

  closeOnKeyUp(event) {
    if (event.code === 'Escape' && !this.isMainPage) {
      this.closeMenu()
    }
  }

  closeOnClickOutSide(event) {
    if (!event.target.closest('.header__controls') && !this.isMainPage) {
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

  // методы для плавного появления/скрытия шапки
  // showHeader() {
  //   const { rootElement: header } = this.refs
  //   const classes = ['header--animating', 'header--sticky-show']

  //   header.addEventListener(
  //     'animationend',
  //     (event) => {
  //       if (event.animationName !== headerAnimationName) {
  //         return
  //       }
  //       header.classList.remove(...classes)
  //     },
  //     { once: true }
  //   )

  //   this.stickyHeader(true)
  //   header.classList.add(...classes)
  //   this.emit('sticky')
  // }

  // hideHeader() {
  //   const { rootElement: header } = this.refs
  //   const classes = ['header--animating', 'header--sticky-hide']

  //   header.addEventListener(
  //     'animationend',
  //     (event) => {
  //       if (event.animationName !== headerAnimationName) {
  //         return
  //       }
  //       this.stickyHeader(false)
  //       header.classList.remove(...classes)
  //     },
  //     { once: true }
  //   )

  //   header.classList.add(...classes)
  //   this.emit('unsticky')
  // }

  stickyHeader(flag) {
    this.refs.rootElement.classList.toggle('header--sticky', flag)
    document.documentElement.style.setProperty('--is-header-sticky', Number(flag))
  }

  /** отслеживаем скролл страницы */
  checkSticky() {
    // const { lastScroll } = this.state
    const currentScroll = window.scrollY
    // const isScrollingDown = currentScroll > lastScroll
    const isHeaderOnTop = currentScroll === 0
    // const minimumScrollDistance = 180
    // this.state.lastScroll = currentScroll

    if (isHeaderOnTop) {
      if (this.isSticky) {
        this.stickyHeader(false)
        this.emit('unsticky')
      }
      return
    }

    if (currentScroll <= this.scrollThreshold) {
      if (this.isSticky) {
        this.hideHeader()
      }
      return
    }

    // if (isScrollingDown) {
    //   if (this.isSticky) {
    //     this.hideHeader()
    //   }
    // } else {
    //   if (!this.isSticky && !this.isMainPage && lastScroll - currentScroll >= minimumScrollDistance) {
    //     this.showHeader()
    //   }
    // }
  }
}

export default new Header({
  rootElement: document.querySelector('.header'),
})
