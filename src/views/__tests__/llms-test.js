const llms = require('../llms.11tydata')
const llmsFull = require('../llms-full.11tydata')
const { baseUrl } = require('../../../config/constants')

function doc({ slug, category = 'css', title = slug, description = '', placeholder = false }) {
  return {
    fileSlug: slug,
    filePathStem: `/${category}/${slug}/index`,
    data: { title, description, tags: placeholder ? ['doka', 'placeholder'] : ['doka'] },
  }
}

function collections(docs) {
  return {
    articleIndexes: [
      { fileSlug: 'css', data: { name: 'CSS' } },
      { fileSlug: 'js', data: { name: 'JavaScript' } },
    ],
    docs,
  }
}

const renderIndex = (docs) => llms.eleventyComputed.llms({ collections: collections(docs) })
const renderFull = (docs) => llmsFull.eleventyComputed.llmsFull({ collections: collections(docs) })

describe('llms.txt: краткая справка для агентов', () => {
  it('считает материалы по разделам без заготовок', () => {
    const text = renderIndex([
      doc({ slug: 'display' }),
      doc({ slug: 'color' }),
      doc({ slug: 'filter', placeholder: true }),
      doc({ slug: 'array-map', category: 'js' }),
    ])

    expect(text).toContain(`[CSS](${baseUrl}/css/): 2 материалов`)
    expect(text).toContain(`[JavaScript](${baseUrl}/js/): 1 материалов`)
    expect(text).toContain('опубликовано 3 материалов')
  })

  it('объясняет, как получить markdown и где лежит полный список', () => {
    const text = renderIndex([doc({ slug: 'display' })])

    expect(text).toContain(`${baseUrl}/css/overflow-wrap/index.md`)
    expect(text).toContain(`${baseUrl}/llms-full.txt`)
    expect(text).toContain('baseline')
    expect(text).toContain('CC BY-NC-SA 4.0')
  })

  it('не падает, когда 11ty зондирует поле через Proxy', () => {
    expect(llms.eleventyComputed.llms({ collections: {} })).toBe('')
  })
})

describe('llms-full.txt: полный список материалов', () => {
  it('группирует материалы по разделам и ссылается на markdown', () => {
    const text = renderFull([
      doc({ slug: 'display', title: '`display`', description: 'Про отображение.' }),
      doc({ slug: 'array-map', category: 'js', title: '`.map()`' }),
    ])

    expect(text).toContain('## CSS')
    expect(text).toContain(`- [\`display\`](${baseUrl}/css/display/index.md): Про отображение.`)
    expect(text).toContain('## JavaScript')
    expect(text).toContain(`- [\`.map()\`](${baseUrl}/js/array-map/index.md)`)
  })

  it('не выводит заготовки: у них нет текста, цитировать нечего', () => {
    const text = renderFull([doc({ slug: 'display' }), doc({ slug: 'filter', placeholder: true })])

    expect(text).toContain('/css/display/index.md')
    expect(text).not.toContain('/css/filter/index.md')
  })

  it('сортирует материалы раздела по слагу', () => {
    const text = renderFull([doc({ slug: 'zoom' }), doc({ slug: 'accent-color' }), doc({ slug: 'margin' })])
    const order = ['accent-color', 'margin', 'zoom'].map((slug) => text.indexOf(`/css/${slug}/`))

    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('не падает, когда 11ty зондирует поле через Proxy', () => {
    expect(llmsFull.eleventyComputed.llmsFull({ collections: {} })).toBe('')
  })
})
