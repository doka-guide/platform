import { escape } from '/html-escaper/esm/index.js'
import debounce from '../libs/debounce.js'
import searchClient from '../core/search-api-client.js'
import { MIN_SEARCH_SYMBOLS, SEARCHABLE_SHORT_WORDS, processHits } from '../core/search-commons.js'
import headerComponent from './header.js'
import logo from '../modules/logo.js'

async function getQuickSearchInstance() {
  const moduleExports = await import('./quick-search.js')
  return moduleExports.default
}

async function init() {
  const isSearchPage = window.location.pathname.indexOf('/search/') > -1

  if (isSearchPage) {
    return
  }

  const quickSearch = await getQuickSearchInstance()

  if (!quickSearch) {
    return
  }

  const DEBOUNCE_TIME = 150

  function onSearch(event) {
    const queryText = event.detail

    if (!(queryText.length >= MIN_SEARCH_SYMBOLS || SEARCHABLE_SHORT_WORDS.has(queryText))) {
      quickSearch.clearOutput()
      return
    }

    quickSearch.openSuggestion()
    logo.startAnimation()

    searchClient
      .search(queryText)
      .then((searchObject) => {
        const processedHits = processHits(searchObject).map((hitObject) => ({
          ...hitObject,
          title: escape(hitObject.title),
        }))
        quickSearch.renderResults(processedHits)
      })
      .catch(console.error)
      .finally(() => {
        logo.endAnimation()
      })
  }

  headerComponent.on('menu.close', () => {
    quickSearch.exit()
  })

  quickSearch.on('search', debounce(onSearch, DEBOUNCE_TIME))
}

init()
