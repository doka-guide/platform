import algoliasearch from '/algoliasearch/dist/algoliasearch-lite.esm.browser.js'
import { DELIMITER, HIT_COUNT, MAX_VALUES_PER_FACET } from './search-commons.js'

class SearchAPIClient {
  static get defaultSearchSettings() {
    return {
      getRankingInfo: true,
      analytics: true,
      enableABTest: false,
      hitsPerPage: HIT_COUNT,
      attributesToRetrieve: '*',
      attributesToSnippet: '*:20',
      snippetEllipsisText: DELIMITER,
      responseFields: '*',
      explain: '*',
      maxValuesPerFacet: MAX_VALUES_PER_FACET,
      facets: ['*', 'category', 'tags'],
    }
  }

  constructor({ APP_ID, API_KEY, INDEX_NAME }) {
    this.client = algoliasearch(APP_ID, API_KEY)
    this.index = this.client.initIndex(INDEX_NAME)
  }

  search(query, options = {}) {
    const params = Object.assign({}, this.constructor.defaultSearchSettings, options)
    return this.index.search(query, params)
  }
}

const searchClient = new SearchAPIClient({
  APP_ID: 'ZGJEP79XK2',
  API_KEY: '8c308ac7e0a1271a2bb0d7836f3703d4',
  INDEX_NAME: 'doka_dev',
})

export default searchClient
