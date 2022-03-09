import debounce from '../libs/debounce.js'
import searchClient from '../core/search-api-client.js'
import BaseComponent from '../core/base-component.js'
import { MIN_SEARCH_SYMBOLS, SYMBOL_LIMIT, SEARCHABLE_SHORT_WORDS, processHits } from '../core/search-commons.js'
import logo from '../modules/logo.js'

class Filter extends BaseComponent {
  constructor({ form }) {
    super()

    this.refs = { form }

    Array.from(form.elements)
      .filter((element) => !!element.name)
      .forEach((element) => {
        element.addEventListener('input', this)
      })

    form.addEventListener('reset', () => {
      // событие reset срабатывает перед тем, как поля очистятся
      setTimeout(() => {
        this.emit('reset', this.state)
      })
    })

    queueMicrotask(() => {
      this.emit('change.query', this.state)
    })
  }

  get state() {
    const newFormData = new FormData()
    const originalFormData = new FormData(this.refs.form)

    for (const [name, value] of originalFormData) {
      if (value) {
        newFormData.append(name, value)
      }
    }

    return newFormData
  }

  set state(newState) {
    const { form } = this.refs

    for (const [name, value] of newState.entries()) {
      switch (name) {
        case 'query': {
          form.elements[name].value = value
          break
        }

        case 'tag':
        case 'category': {
          const elements = Array.from(form.elements[name])
          const element = elements.find((element) => element.value === value)
          element.checked = true
          break
        }
      }
    }
  }

  handleEvent(event) {
    const { name } = event.target

    switch (name) {
      case 'query': {
        this.emit('change.query', this.state)
        break
      }

      default: {
        this.emit('change.filter', this.state)
      }
    }

    this.emit('change', this.state)
  }
}

class SearchResultOutput extends BaseComponent {
  static get matchedItems() {
    return 3
  }

  static isPlaceholder(hitObject) {
    return hitObject.tags.includes('placeholder')
  }

  static replaceBackticks(text, replaceTemplate) {
    return text.replace(/`(.*?)`/g, replaceTemplate)
  }

  static get templates() {
    return {
      summaryItem: (item) => `<p class="search-hit__summary-item">${item}</p>`,

      titleCode: `<code class="search-hit__link-code code-fix font-theme font-theme--code">$1</code>`,

      textCode: `<code class="search-hit__text-code code-fix font-theme font-theme--code">$1</code>`,

      placeholderIcon: `<span class="search-hit__edit font-theme font-theme--code" aria-hidden="true"></span>`,

      hit: (hitObject) => {
        const editIcon = SearchResultOutput.isPlaceholder(hitObject) ? SearchResultOutput.templates.placeholderIcon : ''
        const title = SearchResultOutput.replaceBackticks(hitObject.title, SearchResultOutput.templates.titleCode)
        const summary = hitObject.summary
          .slice(0, SearchResultOutput.matchedItems)
          .map((item) => SearchResultOutput.templates.summaryItem(item))
          .join('')

        return `
          <article class="search-hit" style="--accent-color: var(--color-base-${hitObject.category})">
            <h3 class="search-hit__title">
              <a class="search-hit__link link" href="${hitObject.url}">
                ${editIcon}${title}
              </a>
            </h3>
            <div class="search-hit__summary">
              ${summary}
            </div>
          </article>
        `
      },

      hits: (list) => `
        <ol class="search-result-list base-list">
          ${list
            .map(
              (hitObject) => `
              <li class="search-result-list__item">
                ${SearchResultOutput.templates.hit(hitObject)}
              </li>
            `
            )
            .join('')}
        </ol>
      `,

      emptyResults: () => `
        <div class="search-page__empty">Ничего не найдено</div>
      `,
    }
  }

  constructor({ element }) {
    super()
    this.refs = {
      element,
    }
  }

  renderHits(hitObjectList, queryText, SYMBOL_LIMIT) {
    const { element } = this.refs

    const result =
      !hitObjectList || hitObjectList.length === 0
        ? SearchResultOutput.templates.emptyResults()
        : SearchResultOutput.templates.hits(hitObjectList, queryText, SYMBOL_LIMIT)

    element.innerHTML = result
  }

  clear() {
    const { element } = this.refs
    element.innerHTML = ''
  }
}

function init() {
  const SEARCH_FORM_SELECTOR = '.search'
  const SEARCH_FIELD_SELECTOR = '.search__input'
  const SEARCH_HITS_SELECTOR = '.search__output'

  const searchForm = document.querySelector(SEARCH_FORM_SELECTOR)
  const searchField = document.querySelector(SEARCH_FIELD_SELECTOR)
  const searchHits = document.querySelector(SEARCH_HITS_SELECTOR)

  const filter = new Filter({
    form: searchForm,
  })
  filter.state = new URLSearchParams(location.search)

  const searchResultOutput = new SearchResultOutput({
    element: searchHits,
  })

  // преобразует состояние фильтров в понятный для Algolia формат
  function prepareFilters(filtersState) {
    const result = [
      [...filtersState.getAll('category')].map((value) => `category:${value}`),
      [...filtersState.getAll('tag')].map((value) => `tags:${value}`),
    ]

    return result
  }

  // сериализует состояние фильтров в формат Search Params
  function filtersToSearchParams(filtersState, fallbackPath) {
    let searchString = new URLSearchParams(filtersState).toString()
    searchString = searchString ? '?' + searchString : fallbackPath
    return searchString
  }

  function makeSearchEffect(queryText, filters) {
    if (queryText.length >= MIN_SEARCH_SYMBOLS || SEARCHABLE_SHORT_WORDS.has(queryText)) {
      logo.startAnimation()

      searchClient
        .search(queryText, {
          facetFilters: filters,
          attributesToSnippet: [
            'title:100', // делаем большое количество слов, чтобы весь заголовок поместился в сниппет
            'content:20',
          ],
          highlightPreTag: '<mark class="search-hit__marked">',
          highlightPostTag: '</mark>',
        })
        .then(function (searchObject) {
          const processedHits = processHits(searchObject)
          searchResultOutput.renderHits(processedHits, queryText, SYMBOL_LIMIT)
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          logo.endAnimation()
        })
    } else {
      searchResultOutput.clear()
    }
  }

  function onFilterChange(event) {
    const state = event.detail
    const queryText = state.get('query') || ''
    const filters = prepareFilters(state)

    makeSearchEffect(queryText, filters)
  }

  function transformFiltersToSearchParamsOnChange(event) {
    const state = event.detail
    const searchParams = filtersToSearchParams(state, location.pathname)
    history.replaceState(null, null, searchParams)
  }

  const debouncedOnFilterChange = debounce(onFilterChange, 150)

  function assignSearchField() {
    searchField.focus()

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault()
    })

    document.addEventListener('keydown', (event) => {
      // Блокировка показа встроенного поиска в Firefox
      if (event.code === 'Slash' && document.activeElement !== searchField) {
        event.preventDefault()
      }
    })

    document.addEventListener('keyup', (event) => {
      if (event.code === 'Escape') {
        searchForm.reset()
      }

      if (event.code === 'Slash' && document.activeElement !== searchField) {
        setTimeout(() => {
          searchField.focus()
        })
      }
    })
  }

  assignSearchField()

  filter.on('change', transformFiltersToSearchParamsOnChange)
  filter.on('reset', transformFiltersToSearchParamsOnChange)
  filter.on('reset', () => {
    searchResultOutput.clear()
  })
  filter.on('change.filter', onFilterChange)
  filter.on('change.query', debouncedOnFilterChange)
}

const isSearchPage = window.location.pathname.indexOf('/search/') > -1

if (isSearchPage) {
  init()
}
