import BaseComponent from '../core/base-component.js'

function getBox(element) {
  return element.getBoundingClientRect()
}

function clamp(min, value, max) {
  return Math.max(min, Math.min(value, max))
}

class QuickSearch extends BaseComponent {
  constructor({ rootElement }) {
    super()

    this.refs = {
      rootElement,
      input: rootElement.querySelector('.search__input'),
      suggestionContainer: rootElement.querySelector('.search__suggestion'),
      suggestionContent: rootElement.querySelector('.search__suggestion-content'),
      suggestionList: rootElement.querySelector('.suggestion-list'),
    }

    this.state = {
      highlightedIndex: -1,
    }
    ;[
      'enter',
      'exit',
      'openSuggestion',
      'closeSuggestion',
      'closeSuggestionOnKeyUp',
      'closeSuggestionOnOutSideClick',
      'onSearch',
      'onCursorChange',
    ].forEach((method) => (this[method] = this[method].bind(this)))

    document.addEventListener('click', this.closeSuggestionOnOutSideClick)
    this.refs.rootElement.addEventListener('keyup', this.closeSuggestionOnKeyUp)
    this.refs.rootElement.addEventListener('submit', (event) => {
      if (this.refs.input.value.trim() === '') {
        event.preventDefault()
      }

      if (this.state.highlightedIndex >= 0 && this.isSuggestionOpen) {
        event.preventDefault()
      }
    })
    this.refs.input.addEventListener('input', this.onSearch)

    document.addEventListener('keydown', (event) => {
      // Firefox при нажатии Slash открывает свой поиск по странице
      if (event.code === 'Slash' && document.activeElement !== this.refs.input) {
        event.preventDefault()
      }
    })

    document.addEventListener('keyup', (event) => {
      if (event.code === 'Slash') {
        setTimeout(() => {
          this.enter()
        })
      }
    })
  }

  enter() {
    this.refs.input?.focus()
  }

  exit() {
    const { input } = this.refs

    if (input) {
      input.value = ''
      input.blur()
    }

    this.state.highlightedIndex = -1
  }

  openSuggestion() {
    const { suggestionContainer } = this.refs

    suggestionContainer?.classList.remove('search__suggestion--hide')
    document.addEventListener('keydown', this.onCursorChange)
    document.addEventListener('keydown', this.preventEscape)
  }

  closeSuggestion() {
    const { suggestionContainer } = this.refs

    suggestionContainer?.classList.add('search__suggestion--hide')
    document.removeEventListener('keydown', this.onCursorChange)
    document.removeEventListener('keydown', this.preventEscape)
  }

  get isSuggestionOpen() {
    const { suggestionContainer } = this.refs
    return !suggestionContainer?.classList.contains('search__suggestion--hide')
  }

  preventEscape(event) {
    if (event.code === 'Escape') {
      event.preventDefault()
    }
  }

  closeSuggestionOnKeyUp(event) {
    if (event.code === 'Escape' && this.isSuggestionOpen) {
      event.stopPropagation()
      this.closeSuggestion()
    }
  }

  closeSuggestionOnOutSideClick(event) {
    const { rootElement } = this.refs
    if (!rootElement.contains(event.target)) {
      this.closeSuggestion()
    }
  }

  onSearch(event) {
    this.emit('search', event.target.value)
  }

  onCursorChange(event) {
    switch (event.code) {
      case 'ArrowDown': {
        this.moveCursor(1)
        event.preventDefault()
        break
      }

      case 'ArrowUp': {
        this.moveCursor(-1)
        event.preventDefault()
        break
      }

      case 'Enter': {
        this.selectHighlightedElement()
        break
      }
    }
  }

  selectHighlightedElement() {
    const { suggestionList } = this.refs
    const links = suggestionList.querySelectorAll('.suggestion-list__link')

    if (links.length === 0) {
      return
    }

    const index = this.state.highlightedIndex
    if (index < 0) {
      return
    }

    links[index].click()
  }

  moveCursor(direction) {
    const { suggestionList, suggestionContent } = this.refs
    const links = suggestionList.querySelectorAll('.suggestion-list__link')

    if (links.length === 0) {
      return
    }

    suggestionList
      .querySelector('.suggestion-list__link--highlighted')
      ?.classList.remove('suggestion-list__link--highlighted')

    const oldIndex = this.state.highlightedIndex
    const newIndex = clamp(0, oldIndex + direction, links.length - 1)
    this.state.highlightedIndex = newIndex

    links[newIndex].classList.add('suggestion-list__link--highlighted')

    const contentBox = getBox(suggestionContent)
    const elementBox = getBox(links[newIndex])
    const paddingBlock = parseFloat(window.getComputedStyle(suggestionContent).paddingTop) || 0

    if (elementBox.top < contentBox.top) {
      suggestionContent.scrollTop += elementBox.top - contentBox.top - paddingBlock
    }

    if (elementBox.bottom > contentBox.bottom) {
      suggestionContent.scrollTop += elementBox.bottom - contentBox.bottom + paddingBlock
    }
  }

  clearOutput() {
    const { suggestionList } = this.refs
    suggestionList.innerHTML = ''

    this.state.highlightedIndex = -1
  }

  renderResults(hitObjectList) {
    const { suggestionList } = this.refs

    const itemsMarkup =
      !hitObjectList || hitObjectList.length === 0
        ? `Ничего не найдено`
        : hitObjectList
            .map((hitObject) => {
              const title = hitObject.originalTitle.replace(
                /`(.*?)`/g,
                '<code class="suggestion-list__code font-theme font-theme--code">$1</code>'
              )
              return `
                <li class="suggestion-list__item" style="--accent-color: var(--color-${hitObject.category});">
                  <a class="suggestion-list__link link" href="${hitObject.url}">${title}</a>
                </li>
              `
            })
            .join('')

    suggestionList.innerHTML = itemsMarkup
  }
}

export default new QuickSearch({
  rootElement: document.querySelector('.search'),
})
