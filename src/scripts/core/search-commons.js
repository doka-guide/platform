export const MIN_SEARCH_SYMBOLS = 3

export const SYMBOL_LIMIT = 150

export const DELIMITER = '…'

export const HIT_COUNT = 10

export const MAX_VALUES_PER_FACET = 20

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
  'lh',
  'mm',
  'ms',
  'pc',
  'pt',
  'px',
  's',
  'vh',
  'vw',
])

export function processHits(searchObject) {
  const hits = searchObject.hits
  const results = []
  hits.forEach((articleObject) => {
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
      tags: articleObject.tags,
    }
    results.push(articleSummary)
  })
  return results
}
