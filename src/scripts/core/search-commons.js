export const MIN_SEARCH_SYMBOLS = 3

export const SYMBOL_LIMIT = 150

export const SEARCHABLE_SHORT_WORDS = new Set([
  // HTML
  'a',
  'b',
  'br',
  'dd',
  'dl',
  'dt',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'q',
  'rb',
  'rp',
  'rt',
  's',
  'td',
  'th',
  'tr',
  'tt',
  'u',
  'ul',
  // CSS
  'ch',
  'cm',
  'em',
  'ex',
  'ic',
  'in',
  'is',
  'lh',
  'mm',
  'ms',
  'pc',
  'pt',
  'px',
  's',
  'vh',
  'vw',
  // JS
  'if',
  'of',
])

export function processHits(searchObject) {
  if (searchObject) {
    return searchObject.map((articleObject) => {
      return {
        originalTitle: articleObject.title,
        title: articleObject.title,
        summary: articleObject.fragments ? articleObject.fragments : [],
        url: `${articleObject.link}`,
        category: articleObject.category,
        tags: articleObject.tags,
      }
    })
  } else {
    return []
  }
}
