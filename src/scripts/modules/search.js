import algoliasearch from '/algoliasearch/dist/algoliasearch-lite.esm.browser.js'
import { escape } from '/html-escaper/esm/index.js'
import debounce from '../libs/debounce.js'

const APP_ID = 'ZGJEP79XK2'
const API_KEY = '8c308ac7e0a1271a2bb0d7836f3703d4'
const INDEX_NAME = 'doka_dev'

const client = algoliasearch(APP_ID, API_KEY)
export const searchIndex = client.initIndex(INDEX_NAME)

const SEARCH_FIELD_SELECTOR = '.search__input'
const SEARCH_HITS_SELECTOR = '.search__output'
const SEARCH_TAG_SELECTOR = '.search-tag'
const SEARCH_CATEGORY_SELECTOR = '.search-category'
const SUGGESTION_CONTAINER_SELECTOR = '.search__suggestion'
const SUGGESTION_LIST_SELECTOR = '.suggestion-list'

const HIT_COUNT = 10
const MIN_SEARCH_SYMBOLS = 3
const SYMBOL_LIMIT = 150
const MAX_VALUES_PER_FACET = 20
const DELIMITER = '…'

const UNKNOWN_CATEGORY = 'UNKNOWN_CATEGORY'
const HIT_ORDER = [
  'html',
  'css',
  'js',
  'tools',
  UNKNOWN_CATEGORY
]
const HIT_CATEGORY_TITLES = {
  html: 'HTML',
  css: 'CSS',
  js: 'JavaScript',
  tools: 'Инструменты'
}

let facetTagList = []
let facetCategoryList = []
let facetFilterList = []
let page = 0
let query = ''

function adjustQueryParams() {
  return {
    getRankingInfo: true,
    analytics: true,
    enableABTest: false,
    hitsPerPage: HIT_COUNT,
    attributesToRetrieve: "*",
    attributesToSnippet: "*:20",
    snippetEllipsisText: DELIMITER,
    responseFields: "*",
    explain: "*",
    page: page,
    maxValuesPerFacet: MAX_VALUES_PER_FACET,
    facets: [
      "*",
      "category",
      "tags"
    ],
    facetFilters: facetFilterList
  }
}

const isSearchPage = window.location.pathname.indexOf('/search/') > -1

const searchForm = document.forms['search-form']
const searchField = document.querySelector(SEARCH_FIELD_SELECTOR)
const suggestionContainer = document.querySelector(SUGGESTION_CONTAINER_SELECTOR)
const suggestionList = suggestionContainer?.querySelector(SUGGESTION_LIST_SELECTOR)
const searchHits = isSearchPage ? document.querySelector(SEARCH_HITS_SELECTOR) : suggestionList

function search(q) {
  query = q
  return searchIndex.search(q, adjustQueryParams())
}

const render = isSearchPage
  ? (processedHits, queryText) => renderHits(processedHits, queryText, SYMBOL_LIMIT)
  : (processedHits, queryText) => renderSuggestions(processedHits, queryText)

const startEffect = isSearchPage
  ? () => {}
  : () => {
    // closeSuggestion()
    openSuggestion()
  }

function openSuggestion() {
  suggestionContainer?.classList.remove('search__suggestion--hide')
}

function closeSuggestion() {
  suggestionContainer?.classList.add('search__suggestion--hide')
}

function isSuggestionOpen() {
  return !suggestionContainer?.classList.contains('search__suggestion--hide')
}

function closeSuggestionOnKeyUp(event) {
  if (event.code === 'Escape' && isSuggestionOpen()) {
    event.stopPropagation()
    closeSuggestion()
  }
}

function closeSuggestionOnOutSideClick(event) {
  if (!event.target.closest(SUGGESTION_CONTAINER_SELECTOR)) {
    closeSuggestion()
  }
}

if (!isSearchPage) {
  searchForm?.addEventListener('keyup', closeSuggestionOnKeyUp)
  document.addEventListener('click', closeSuggestionOnOutSideClick)

  searchForm.addEventListener('submit', event => {
    if (searchField.value.trim() === '') {
      event.preventDefault()
    }
  })
}

function processHits(searchObject) {
  const hits = searchObject.hits
  const results = []
  hits.forEach(articleObject => {
    let paragraph = ''
    if (articleObject.content.paragraphs.length > 1) {
      if (articleObject.content.paragraphs[0].length > 20) {
        paragraph = articleObject.content.paragraphs[0]
      } else {
        paragraph = articleObject.content.paragraphs[1]
      }
    }
    const articleSummary = {
      title: articleObject.title,
      summary: paragraph,
      url: `/${articleObject.objectID}`,
      category: articleObject.category,
      tags: articleObject.tags
    }
    results.push(articleSummary)
  })
  return results
}

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

  const hitObjectMap = hitObjectList.reduce((map, hitObject) => {
    map[hitObject.category] = map[hitObject.category || UNKNOWN_CATEGORY] || []
    map[hitObject.category].push(hitObject)
    return map
  }, {})

  return HIT_ORDER
    .filter(category => category in hitObjectMap)
    .map(category => templates.section(category, hitObjectMap[category], query, limit))
    .join('')
}

function renderSuggestions(hitObjectList) {
  if (!hitObjectList || hitObjectList.length === 0) {
    return templates.emptyResults()
  }

  return templates.suggestionList(hitObjectList)
}

function updateFacet() {
  facetFilterList = [facetTagList, facetCategoryList]
}

function makeSearchEffect(queryText) {
  if (queryText.length >= MIN_SEARCH_SYMBOLS) {
    startEffect()
    search(queryText)
      .then(function(searchObject) {
        const processedHits = processHits(searchObject)
        searchHits.innerHTML = render(processedHits, queryText)
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

  if (isSearchPage) {
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
        searchForm.reset()
      }

      if (event.code === 'Slash' && document.activeElement !== searchField) {
        setTimeout(() => {
          searchField.focus()
        })
      }
    })
  }
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
    makeSearchEffect(query)
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

function escapeText(text, replaceTemplate) {
  return escape(text).replace(/`(.*?)`/g, replaceTemplate)
}

const templates = {
  mark: (match) => `<mark class="search-hit__marked">${match}</mark>`,

  hit: (hitObject, query, limit) => {
    const editIcon = isPlaceholder(hitObject) ? '<span class="search-hit__edit font-theme font-theme--code" aria-hidden="true"></span>' : ''
    const title = escapeText(hitObject.title, '<code class="search-hit__link-code font-theme font-theme--code">$1</code>')

    return `<article class="search-hit">
      <h3 class="search-hit__title">
        <a class="search-hit__link link" href="${hitObject.url}">
          ${editIcon}${markQuery(title, query)}
        </a>
      </h3>
      <div class="search-hit__summary">
        ${markQuery(adjustTextSize(escapeText(hitObject.summary, '<code class="search-hit__text-code font-theme font-theme--code">$1</code>'), query, limit), query)}
      </div>
    </article>
  `
    },

  categoryTitle: (category) => `
    <h2 class="search-section__title" style="--accent-color: var(--color-${category})">
      <a class="search-section__title-link" href="/${category}/">
        ${HIT_CATEGORY_TITLES[category]}
      </a>
    </h2>
  `,

  section: (category, list, query, limit) => `
    <section class="search-section" style="--accent-color: var(--color-base-${category})">
      ${category !== UNKNOWN_CATEGORY ? templates.categoryTitle(category) : ''}
      <ul class="search-section__list base-list">
        ${
          list.map(hitObject => `
            <li class="search-section__list-item">
              ${templates.hit(hitObject, query, limit)}
            </li>
          `)
          .join('')
        }
      </ul>
    </section>
  `,

  emptyResults: () => `
    <div class="search-page__empty">Ничего не найдено</div>
  `,

  suggestionList: (hitObjectList) => {
    const itemsMarkup = hitObjectList.map((hitObject) => {
      const title = escapeText(hitObject.title, '<code class="suggestion-list__code font-theme font-theme--code">$1</code>')
      return `
        <li class="suggestion-list__item" style="--accent-color: var(--color-${hitObject.category});">
          <a class="suggestion-list__link link" href="${hitObject.url}">${title}</a>
        </li>
      `
    }).join('')

    return itemsMarkup
  }
}
