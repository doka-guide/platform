import algoliasearch from 'algoliasearch/lite'

const APP_ID = 'ZGJEP79XK2'
const API_KEY = '8c308ac7e0a1271a2bb0d7836f3703d4'
const INDEX_NAME = 'doka_dev'

const client = algoliasearch(APP_ID, API_KEY)
export const searchIndex = client.initIndex(INDEX_NAME)

const SEARCH_FIELD_SELECTOR = '.search__input'
const SEARCH_HITS_SELECTOR = '.search__output'
const SEARCH_TAG_SELECTOR = '.search__tag'
const SEARCH_CATEGORY_SELECTOR = '.search__category'

const HIT_COUNT = 10
const MIN_SEARCH_SYMBOLS = 3
const SYMBOL_LIMIT = 150
const MAX_VALUES_PER_FACET = 20
const DELIMITER = '…'
const HIT_ORDER = [
  'html',
  'css',
  'js',
  'tools'
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

function search(q) {
  query = q
  return searchIndex.search(q, adjustQueryParams())
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
  return text.replace(searchRegEx, match => `<span class="search-hit__marked">${match}</span>`)
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
  let output = ''
  let categoryIndex = -1
  hitObjectList.sort((a, b) => {
    HIT_ORDER[a.category] - HIT_ORDER[b.category]
  })
  hitObjectList.forEach(hitObject => {
    if (categoryIndex != HIT_ORDER[hitObject.category]) {
      categoryIndex = HIT_ORDER[hitObject.category]
      if (categoryIndex > 0) {
        output += `</div>`
      }
      output += `<div class="search__hit search-hit__category">
        <h2>${HIT_CATEGORY_TITLES[hitObject.category]}</h2>`
    }
    output += `<div class="search__hit search-hit search__hit--${hitObject.category}">
      <a href="${hitObject.url}"><h3 class="search-hit__title">${markQuery(hitObject.title, query)}</h3></a>
      <p class="search-hit__summary">${markQuery(adjustTextSize(hitObject.summary, query, limit), query)}</p>
    </div>`
  })
  output += `</div>`
  return output
}

function updateFacet() {
  facetFilterList = [facetTagList, facetCategoryList]
}

function assignSearchField(inputSelector, outputSelector) {
  const searchField = document.querySelector(inputSelector)
  const searchHits = document.querySelector(outputSelector)
  if (searchField) {
    searchField.addEventListener('keyup', function () {
      const q = this.value
      if (q.length > MIN_SEARCH_SYMBOLS - 1) {
        search(q)
          .then(function (searchObject) {
            searchHits.innerHTML = renderHits(processHits(searchObject), q, SYMBOL_LIMIT)
          })
      } else {
        searchHits.innerHTML = ''
      }
    })
  }
}

function facetListenerBuilder(type, hits) {
  return function (event) {
    const newFacetValue = event.target?.value
    if (!newFacetValue) {
      return
    }
    switch (type) {
      case 'category':
        if (newFacetValue !== '') {
          facetCategoryList = [ newFacetValue ]
        } else {
          facetCategoryList = []
        }
        break;
      case 'tag':
        if (newFacetValue !== '') {
          facetTagList = [ newFacetValue ]
        } else {
          facetTagList = []
        }
        break;
      default:
        return
    }
    updateFacet()
    if (query.length > MIN_SEARCH_SYMBOLS - 1) {
      search(query)
        .then(function (searchObject) {
          hits.innerHTML = renderHits(processHits(searchObject), query, SYMBOL_LIMIT)
        })
    }
  }
}

function assignFacetFields(categorySelector, tagSelector, outputSelector) {
  const searchCategory = document.querySelector(categorySelector)
  const searchTag = document.querySelector(tagSelector)
  const searchHits = document.querySelector(outputSelector)
  if (searchCategory && searchTag) {
    searchCategory.addEventListener('click', facetListenerBuilder('category', searchHits))
    searchTag.addEventListener('click', facetListenerBuilder('tag', searchHits))
  }
}

document.addEventListener('DOMContentLoaded', function () {
  assignSearchField(SEARCH_FIELD_SELECTOR, SEARCH_HITS_SELECTOR)
  assignFacetFields(SEARCH_CATEGORY_SELECTOR, SEARCH_TAG_SELECTOR, SEARCH_HITS_SELECTOR)
})
