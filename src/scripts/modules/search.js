import { escape } from '/html-escaper/esm/index.js'
import debounce from '../libs/debounce.js'
import searchClient from '../core/search-api-client.js'
import BaseComponent from '../core/base-component.js'
import {
  MIN_SEARCH_SYMBOLS,
  SYMBOL_LIMIT,
  DELIMITER,
  SEARCHABLE_SHORT_WORDS,
  processHits,
} from '../core/search-commons.js'

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
  static isPlaceholder(hitObject) {
    return hitObject.tags.includes('placeholder')
  }

  static replaceBackticks(text, replaceTemplate) {
    return text.replace(/`(.*?)`/g, replaceTemplate)
  }

  static markQuery(text, query) {
    const searchRegEx = new RegExp(query, 'gi')
    return text.replace(searchRegEx, (match) => SearchResultOutput.templates.mark(match))
  }

  static adjustTextMatch(text, index, query, limit) {
    if (index - query.length / 2 > limit / 2 && text.length - index + query.length / 2 <= limit / 2) {
      return `${DELIMITER}${text.substring(index - limit / 2 - query.length / 2, text.length).trim()}`
    } else if (index - query.length / 2 <= limit / 2 && text.length - index + query.length / 2 > limit / 2) {
      return `${text.substring(0, index + query.length / 2 + limit / 2).trim()}${DELIMITER}`
    } else {
      return `${DELIMITER}${text
        .substring(index - limit / 2 - query.length / 2, index + limit / 2 + query.length / 2)
        .trim()}${DELIMITER}`
    }
  }

  static adjustTextSize(text, query, limit) {
    if (text.length <= limit) {
      return text
    } else {
      const searchRegEx = new RegExp(query, 'gi')
      const result = text.matchAll(searchRegEx)
      if (result && result.length === 1) {
        return SearchResultOutput.adjustTextMatch(text, result.index, result[0], limit)
      } else if (result && result.length > 1) {
        let output = SearchResultOutput.adjustTextMatch(text, result[0].index, result[0], limit)
        for (let i = 1; i < result.length; i++) {
          const t = text.substring(result[i - 1].index, result[i - 1].index + limit + result[i].length)
          output += `${DELIMITER}${SearchResultOutput.adjustTextMatch(t, result[i].index, result[i], limit)}`
        }
        return output
      } else {
        return `${text.substring(0, limit).trim()}${DELIMITER}`
      }
    }
  }

  static get templates() {
    return {
      mark: (match) => `<mark class="search-hit__marked">${match}</mark>`,

      hit: (hitObject, query, limit) => {
        const editIcon = SearchResultOutput.isPlaceholder(hitObject)
          ? '<span class="search-hit__edit font-theme font-theme--code" aria-hidden="true"></span>'
          : ''
        const title = SearchResultOutput.replaceBackticks(
          SearchResultOutput.markQuery(escape(hitObject.title), query),
          '<code class="search-hit__link-code code-fix font-theme font-theme--code">$1</code>'
        )
        const summary = SearchResultOutput.replaceBackticks(
          SearchResultOutput.markQuery(
            escape(SearchResultOutput.adjustTextSize(hitObject.summary, query, limit)),
            query
          ),
          '<code class="search-hit__text-code code-fix font-theme font-theme--code">$1</code>'
        )

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

      hits: (list, query, limit) => `
        <ol class="search-result-list base-list">
          ${list
            .map(
              (hitObject) => `
              <li class="search-result-list__item">
                ${SearchResultOutput.templates.hit(hitObject, query, limit)}
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
      searchClient
        .search(queryText, {
          facetFilters: filters,
        })
        .then(function (searchObject) {
          const processedHits = processHits(searchObject)
          searchResultOutput.renderHits(processedHits, queryText, SYMBOL_LIMIT)
        })
        .catch((error) => {
          console.error(error)
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
