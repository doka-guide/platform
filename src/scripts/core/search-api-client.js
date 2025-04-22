class SearchAPIClient {
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
    url.search = params
    this.abortController?.abort?.()
    this.abortController = new AbortController()
    return fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: this.abortController.signal,
    })
      .then((response) => response.json())
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }
        return Promise.reject(error)
      })
      .finally(() => {
        this.abortController = null
      })
  }
}

const searchClient = new SearchAPIClient('https://search.doka.guide')

export default searchClient
