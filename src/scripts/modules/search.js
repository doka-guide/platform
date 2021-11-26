import { escape } from '/html-escaper/esm/index.js'
import debounce from '../libs/debounce.js'
import searchClient from '../core/search-api-client.js'
import { MIN_SEARCH_SYMBOLS, SYMBOL_LIMIT, DELIMITER, SEARCHABLE_SHORT_WORDS, processHits } from '../core/search-commons.js'

function init() {
  const SEARCH_FORM_SELECTOR = '.search'
  const SEARCH_FIELD_SELECTOR = '.search__input'
  const SEARCH_HITS_SELECTOR = '.search__output'
  const SEARCH_TAG_SELECTOR = '.search-tag'
  const SEARCH_CATEGORY_SELECTOR = '.search-category'

  let facetTagList = []
  let facetCategoryList = []
  let facetFilterList = []

  const searchForm = document.querySelector(SEARCH_FORM_SELECTOR)
  const searchField = document.querySelector(SEARCH_FIELD_SELECTOR)
  const searchHits = document.querySelector(SEARCH_HITS_SELECTOR)

  function markQuery(text, query) {
    const searchRegEx = new RegExp(query, 'gi')
    return text.replace(searchRegEx, match => templates.mark(match))
  }

  function adjustTextMatch(text, index, query, limit) {
    if ((index - query.length / 2 > limit / 2) && (text.length - index + query.length / 2 <= limit / 2)) {
      return `${DELIMITER}${text.substring(index - limit / 2 - query.length / 2, text.length).trim()}`
    } else if ((index - query.length / 2 <= limit / 2) && (text.length - index + query.length / 2 > limit / 2)) {
      return `${text.substring(0, index + query.length / 2 + limit / 2).trim()}${DELIMITER}`
    } else {
      return `${DELIMITER}${text.substring(index - limit / 2 - query.length / 2, index + limit / 2 + query.length / 2).trim()}${DELIMITER}`
    }
  }

  function adjustTextSize(text, query, limit) {
    if (text.length <= limit) {
      return text
    } else {
      const searchRegEx = new RegExp(query, 'gi')
      const result = text.matchAll(searchRegEx)
      if (result && result.length === 1) {
          return adjustTextMatch(text, result.index, result[0], limit)
      } else if (result && result.length > 1) {
        let output = adjustTextMatch(text, result[0].index, result[0], limit)
        for (let i = 1; i < result.length; i++) {
          const t = text.substring(result[i - 1].index, result[i - 1].index + limit + result[i].length)
          output += `${DELIMITER}${adjustTextMatch(t, result[i].index, result[i], limit)}`
        }
        return output
      } else {
        return `${text.substring(0, limit).trim()}${DELIMITER}`
      }
    }
  }

  function renderHits(hitObjectList, query, limit) {
    if (!hitObjectList || hitObjectList.length === 0) {
      return templates.emptyResults()
    }

    return templates.hits(hitObjectList, query, limit)
  }

  function updateFacet() {
    facetFilterList = [facetTagList, facetCategoryList]
  }

  function makeSearchEffect(queryText) {
    if (queryText.length >= MIN_SEARCH_SYMBOLS || SEARCHABLE_SHORT_WORDS.has(queryText)) {
      searchClient.search(queryText, { facetFilters: facetFilterList })
        .then(function(searchObject) {
          const processedHits = processHits(searchObject)
          searchHits.innerHTML = renderHits(processedHits, queryText, SYMBOL_LIMIT)
        })
        .catch(error => {
          console.error(error)
        })
    } else {
      searchHits.innerHTML = ''
    }
  }

  function assignSearchField() {
    if (!searchField && !searchHits && !searchForm) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    const queryText = params.get('q')
    if (queryText) {
      searchField.value = queryText
      makeSearchEffect(queryText)
    }

    searchField.addEventListener('input', debounce(function (event) {
      makeSearchEffect(event.target.value)
    }, 150))

    searchForm.addEventListener('reset', () => {
      searchHits.innerHTML = ''
      facetFilterList = []
    })

    searchField.focus()

    searchForm.addEventListener('submit', event => {
      event.preventDefault()
    })

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Slash' && document.activeElement !== searchField) {
        event.preventDefault()
      }
    })

    document.addEventListener('keyup', (event) => {
      if (event.code === 'Escape') {
        event.preventDefault()
        searchForm.reset()
      }

      if (event.code === 'Slash' && document.activeElement !== searchField) {
        setTimeout(() => {
          searchField.focus()
        })
      }
    })
  }

  function facetListenerBuilder(type) {
    return function(event) {
      const newFacetValue = event.target.value

      switch (type) {
        case 'category':
          facetCategoryList = newFacetValue !== '' ? [newFacetValue] : []
          break
        case 'tag':
          facetTagList = newFacetValue !== '' ? [newFacetValue]: []
          break
        default:
          return
      }

      updateFacet()
      makeSearchEffect(searchField.value.trim())
    }
  }

  function assignFacetFields(categorySelector, tagSelector, outputSelector) {
    const searchCategory = document.querySelector(categorySelector)
    const searchTag = document.querySelector(tagSelector)
    const searchHits = document.querySelector(outputSelector)

    if (searchCategory && searchTag) {
      searchCategory.addEventListener('change', facetListenerBuilder('category', searchHits))
      searchTag.addEventListener('change', facetListenerBuilder('tag', searchHits))
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    assignSearchField(SEARCH_FIELD_SELECTOR, SEARCH_HITS_SELECTOR)
    assignFacetFields(SEARCH_CATEGORY_SELECTOR, SEARCH_TAG_SELECTOR, SEARCH_HITS_SELECTOR)
  })

  function isPlaceholder(hitObject) {
    return hitObject.tags.includes('placeholder')
  }

  function replaceBackticksByCode(text, replaceTemplate) {
    return text.replace(/`(.*?)`/g, replaceTemplate)
  }

  const templates = {
    mark: (match) => `<mark class="search-hit__marked">${match}</mark>`,

    hit: (hitObject, query, limit) => {
      const editIcon = isPlaceholder(hitObject)
        ? '<span class="search-hit__edit font-theme font-theme--code" aria-hidden="true"></span>'
        : ''
      const title =
        replaceBackticksByCode(
          markQuery(
            escape(hitObject.title),
            query
          ),
          '<code class="search-hit__link-code font-theme font-theme--code">$1</code>'
        )
      const summary =
        replaceBackticksByCode(
          markQuery(
            escape(adjustTextSize(hitObject.summary, query, limit)),
            query
          ),
          '<code class="search-hit__text-code font-theme font-theme--code">$1</code>'
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
        ${
          list.map(hitObject => `
            <li class="search-result-list__item">
              ${templates.hit(hitObject, query, limit)}
            </li>
          `)
          .join('')
        }
      </ol>
    `,

    emptyResults: () => `
      <div class="search-page__empty">Ничего не найдено</div>
    `,
  }
}

const isSearchPage = window.location.pathname.indexOf('/search/') > -1

if (isSearchPage) {
  init()
}
