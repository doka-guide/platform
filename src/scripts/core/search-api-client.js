class SearchAPIClient {
  static get defaultSearchSettings() {
    return {
      getRankingInfo: true,
      analytics: true,
      enableABTest: false,
      attributesToRetrieve: '*',
      attributesToSnippet: '*:20',
      responseFields: '*',
      explain: '*',
      facets: ['*', 'category', 'tags'],
    }
  }

  constructor(url) {
    this.url = url
  }

  // формирование корректного для системы поискового запроса
  search(query, filters = []) {
    let url = new URL(this.url)
    let params = new URLSearchParams(url.search)
    params.append('search', query.replaceAll('+', '%2B').replaceAll('-', '%2D'))
    filters.forEach((f) => {
      params.append(f.key, f.val)
    })
    return fetch(url.toString() + '?' + params.toString(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Origin: 'https://doka.guide',
      },
    }).then((response) => response.json())
  }
}

const searchClient = new SearchAPIClient('https://search.doka.guide')

export default searchClient
