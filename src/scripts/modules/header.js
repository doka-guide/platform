import throttle from '../libs/throttle.js'
import debounce from '../libs/debounce.js'
import BaseComponent from '../core/base-component.js'

const headerActiveClass = 'header--open'

class Header extends BaseComponent {
  constructor({ rootElement }) {
    super()

    this.refs = {
      rootElement,
      input: rootElement.querySelector('.search__input'),
      headerContent: rootElement.querySelector('.header__controls'),
      toggleButton: rootElement.querySelector('.hamburger'),
    }

    this.state = {
      // stickyHeaderHeight: null,
      lastScroll: 0,
      getScrollThreshold: window.innerHeight,
    }

    const scrollThresholdConditions = [
      {
        condition: () => !!document.querySelector('.article'),
        getter: () => document.querySelector('.article__header'),
      },
      {
        condition: () => !!document.querySelector('.index-block'),
        getter: () => {
          const additionalHeight = window.matchMedia('(width >= 1366px)')
            ? 0
            : document.querySelector('.index-block__header')
          return additionalHeight
        },
      },
      {
        condition: () => !!document.querySelector('.standalone-page'),
        getter: () => document.querySelector('.standalone-page__header'),
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

    ;[
      'openOnKeyUp',
      'closeOnKeyUp',
      'closeOnClickOutside',
      'closeOnFocusout',
      'openMenu',
      'closeMenu',
      'stickyHeader',
      'checkSticky',
    ].forEach((method) => {
      this[method] = this[method].bind(this)
    })

    const resizeCallback = () => {
      // this.calculateHeaderHeight()
      this.calculateScrollThreshold()
    }

    const onResize = debounce(resizeCallback, 200)

    this.state.lastFocusedElement = document.activeElement

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    resizeCallback()

    if (this.isSticky) {
      this.refs.toggleButton.addEventListener('click', () => {
        this.isMenuOpen ? this.closeMenu() : this.openMenu()
      })

      document.addEventListener('keyup', this.openOnKeyUp)
      window.addEventListener('scroll', throttle(this.checkSticky, { leading: false }), { passive: true })

      this.checkSticky()
    }
  }

  get isSticky() {
    return this.refs.rootElement.classList.contains('header--sticky')
  }

  get isMenuOpen() {
    return this.refs.rootElement.classList.contains(headerActiveClass)
  }

  /* рассчитываем высоту хедера, чтобы добавить другим элементам правильный отступ сверху */

  // у нас высота хедера может быть только 54 и 56, нужно ли нам столько кода вместо того, чтобы задать фиксированное значение????

  // calculateHeaderHeight() {
  //   const header = this.refs.rootElement
  //   const state = this.state
  //   state.stickyHeaderHeight = header.offsetHeight

  //   document.documentElement.style.setProperty('--header-height', state.stickyHeaderHeight)
  // }

  calculateScrollThreshold() {
    this.scrollThreshold = this.getScrollThreshold()
  }

  /* события для закрытия/открытия дропдауна с разделами */
  // здесь фокус устанавливается в поле поиска, когда есть дропдаун
  // TODO: управлять фокусом для поля поиска в одном файле и не дублировать функции
  openOnKeyUp(event) {
    if (event.code === 'Slash' || event.code === 'NumpadDivide') {
      this.openMenu()
      this.refs.input.focus()
    }
  }

  closeOnKeyUp(event) {
    if (event.code === 'Escape') {
      this.closeMenu()
    }
  }

  closeOnFocusout(event) {
    if (event.relatedTarget && !this.refs.rootElement.contains(event.relatedTarget)) {
      this.closeMenu()
    }
  }

  closeOnClickOutside(event) {
    if (!this.refs.rootElement.contains(event.target)) {
      this.closeMenu()
    }
  }

  openMenu() {
    const { rootElement, toggleButton } = this.refs

    rootElement.classList.add(headerActiveClass)
    toggleButton.setAttribute('aria-expanded', 'true')

    document.removeEventListener('keyup', this.openOnKeyUp)
    document.addEventListener('keyup', this.closeOnKeyUp)
    rootElement.addEventListener('focusout', this.closeOnFocusout)
    document.addEventListener('click', this.closeOnClickOutside)
  }

  closeMenu() {
    const { rootElement, toggleButton } = this.refs

    rootElement.classList.remove(headerActiveClass)
    toggleButton.setAttribute('aria-expanded', 'false')

    document.removeEventListener('keyup', this.closeOnKeyUp)
    document.removeEventListener('focusout', this.closeOnFocusout)
    document.removeEventListener('click', this.closeOnClickOutside)
    document.addEventListener('keyup', this.openOnKeyUp)

    this.emit('menu.close')
  }

  /* отслеживаем скролл, устанавливаем флаг для хедера */
  stickyHeader(flag) {
    this.refs.headerContent.classList.toggle('header__controls--shrink', flag)
    document.documentElement.style.setProperty('--is-header-sticky', Number(flag))
  }

  checkSticky() {
    const { lastScroll } = this.state
    const currentScroll = window.scrollY
    const isScrollingDown = currentScroll > lastScroll
    const isHeaderOnTop = currentScroll === 0
    this.state.lastScroll = currentScroll

    if (isHeaderOnTop) {
      if (this.isSticky) {
        this.stickyHeader(false)
        this.emit('unsticky')
      }
      return
    }

    if (isScrollingDown || currentScroll <= this.scrollThreshold) {
      if (this.isSticky) {
        this.stickyHeader(true)
        this.emit('sticky')
      }
      return
    }
  }
}

export default new Header({
  rootElement: document.querySelector('.header'),
})
