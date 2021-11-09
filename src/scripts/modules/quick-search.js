import BaseComponent from '../core/base-component.js'

class QuickSearch extends BaseComponent {
  constructor({ rootElement }) {
    super()

    this.refs = {
      rootElement,
      input: rootElement.querySelector('.search__input'),
      suggestionContainer: rootElement.querySelector('.search__suggestion'),
      suggestionList: rootElement.querySelector('.suggestion-list'),
    };

    [
      'enter',
      'exit',
      'openSuggestion',
      'closeSuggestion',
      'closeSuggestionOnKeyUp',
      'closeSuggestionOnOutSideClick',
      'onSearch'
    ].forEach(method => this[method] = this[method].bind(this))

    document.addEventListener('click', this.closeSuggestionOnOutSideClick)
    this.refs.rootElement.addEventListener('keyup', this.closeSuggestionOnKeyUp)
    this.refs.rootElement.addEventListener('submit', event => {
      if (this.refs.input.value.trim() === '') {
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
  }

  openSuggestion() {
    const { suggestionContainer } = this.refs
    suggestionContainer?.classList.remove('search__suggestion--hide')
  }

  closeSuggestion() {
    const { suggestionContainer } = this.refs
    suggestionContainer?.classList.add('search__suggestion--hide')
  }

  get isSuggestionOpen() {
    const { suggestionContainer } = this.refs
    return !suggestionContainer?.classList.contains('search__suggestion--hide')
  }

  closeSuggestionOnKeyUp(event) {
    if (event.code === 'Escape' && this.isSuggestionOpen) {
      event.stopPropagation()
      this.closeSuggestion()
    }
  }

  closeSuggestionOnOutSideClick(event) {
    const { suggestionContainer } = this.refs
    if (!suggestionContainer.contains(event.target)) {
      this.closeSuggestion()
    }
  }

  onSearch(event) {
    this.emit('search', event.target.value)
  }

  clearOutput() {
    const { suggestionList } = this.refs
    suggestionList.innerHTML = ''
  }

  renderResults(hitObjectList) {
    const { suggestionList } = this.refs

    const itemsMarkup = !hitObjectList || hitObjectList.length === 0
      ? `Ничего не найдено`
      : hitObjectList.map((hitObject) => {
          const title = hitObject.title.replace(/`(.*?)`/g, '<code class="suggestion-list__code font-theme font-theme--code">$1</code>')
          return `
            <li class="suggestion-list__item" style="--accent-color: var(--color-${hitObject.category});">
              <a class="suggestion-list__link link" href="${hitObject.url}">${title}</a>
            </li>
          `
        }).join('')

    suggestionList.innerHTML = itemsMarkup
  }
}

export default new QuickSearch({
  rootElement: document.querySelector('.search')
})
