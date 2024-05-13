// TODO: переписать условие так, чтобы скрипт не срабатывал на главной и странице с расширенным поиском. Там меню всегда раскрыто. Из-за этого сейчас при нажатии на / фокус не переносится на поле поиска на этих страницах

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
      stickyHeaderHeight: null,
      lastScroll: 0,
      getScrollThreshold: window.innerHeight,
    }

    const scrollThresholdConditions = [
      {
        condition: () => !!document.querySelector('.article'),
        getter: () => this.state.stickyHeaderHeight + document.querySelector('.article__header').offsetHeight,
      },
      {
        condition: () => !!document.querySelector('.index-block'),
        getter: () => {
          const additionalHeight = window.matchMedia('(width >= 1366px)')
            ? 0
            : document.querySelector('.index-block__header').offsetHeight
          return this.state.stickyHeaderHeight + additionalHeight
        },
      },
      {
        condition: () => !!document.querySelector('.standalone-page'),
        getter: () => this.state.stickyHeaderHeight + document.querySelector('.standalone-page__header').offsetHeight,
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

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    resizeCallback()

    const { toggleButton } = this.refs

    if (this) {
      toggleButton.addEventListener('click', () => {
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

  /* TODO: у нас высота хедера может быть только 54 и 56, нужно ли нам столько кода вместо того, чтобы задать фиксированное знаечение???? */

  // calculateHeaderHeight() {
  //   const header = this.refs.rootElement
  //   const state = this.state
  //   state.stickyHeaderHeight = header.offsetHeight

  //   document.documentElement.style.setProperty('--sticky-header-height', state.stickyHeaderHeight)
  // }

  calculateScrollThreshold() {
    this.scrollThreshold = this.getScrollThreshold()
  }

  /* события для закрытия/открытия дропдауна с разделами */
  openOnKeyUp(event) {
    if (event.code === 'Slash' || event.code === 'NumpadDivide') {
      this.openMenu()
    }
  }

  closeOnKeyUp(event) {
    if (event.code === 'Escape') {
      this.closeMenu()
    }
  }

  closeOnClickOutside(event) {
    if (!event.target.closest('.header__controls')) {
      this.closeMenu()
    }
  }

  openMenu() {
    const { rootElement, toggleButton } = this.refs

    rootElement.classList.add(headerActiveClass)
    toggleButton.setAttribute('aria-expanded', 'true')

    document.removeEventListener('keyup', this.openOnKeyUp)
    document.addEventListener('keyup', this.closeOnKeyUp)
    document.addEventListener('click', this.closeOnClickOutside)
  }

  closeMenu() {
    const { rootElement, toggleButton } = this.refs

    rootElement.classList.remove(headerActiveClass)
    toggleButton.setAttribute('aria-expanded', 'false')

    document.removeEventListener('keyup', this.closeOnKeyUp)
    document.removeEventListener('click', this.closeOnClickOutside)
    document.addEventListener('keyup', this.openOnKeyUp)

    this.emit('menu.close')
  }

  stickyHeader(flag) {
    this.refs.headerContent.classList.toggle('header__controls--shrink', flag)
    document.documentElement.style.setProperty('--is-header-sticky', Number(flag))
  }

  /* отслеживаем скролл, устанавливаем флаг для хедера */
  checkSticky() {
    const { lastScroll } = this.state
    const currentScroll = window.scrollY
    const isScrollingDown = currentScroll > lastScroll
    const isHeaderOnTop = currentScroll === 0
    this.state.lastScroll = currentScroll

    if (isHeaderOnTop || currentScroll <= this.scrollThreshold) {
      if (this.isSticky) {
        this.stickyHeader(false)
        this.emit('unsticky')
      }
      return
    }

    if (isScrollingDown) {
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
