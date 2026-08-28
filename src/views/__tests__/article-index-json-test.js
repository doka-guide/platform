const articleIndexJson = require('../article-index-json.11tydata')

// Элемент коллекции 11ty в том виде, в каком его видят вычисляемые поля:
// разобранный фронтматтер в data, исходный текст без фронтматтера в rawInput.
function article({ slug, title, tags = ['doka'], related = [], body = '' }) {
  return {
    fileSlug: slug,
    data: { title, tags, related },
    rawInput: body,
  }
}

function computeJson(categoryArticles, category = 'css') {
  return articleIndexJson.eleventyComputed.json({ category, categoryArticles })
}

describe('article-index-json: сборка индекса раздела', () => {
  it('включает все статьи раздела, а не только первую', () => {
    // Регрессия: filter и reduce вызывались с async-колбэками. Промис всегда
    // истинный, поэтому filter не фильтровал, а аккумулятор reduce после первой
    // итерации становился промисом — в файл попадала ровно одна статья.
    const json = computeJson([
      article({ slug: 'accent-color', title: '`accent-color`' }),
      article({ slug: 'align-items', title: '`align-items`' }),
      article({ slug: 'backdrop-filter', title: '`backdrop-filter`' }),
    ])

    expect(Object.keys(json)).toHaveLength(3)
    expect(Object.keys(json)).toEqual(['`accent-color`', '`align-items`', '`backdrop-filter`'])
  })

  it('отсеивает материалы без тега doka', () => {
    const json = computeJson([
      article({ slug: 'display', title: '`display`' }),
      article({ slug: 'practice', title: 'Практика', tags: ['article'] }),
    ])

    expect(Object.keys(json)).toEqual(['`display`'])
  })

  it('складывает путь из раздела и слага', () => {
    const json = computeJson([article({ slug: 'display', title: '`display`' })], 'css')

    expect(json['`display`'].path).toBe('/css/display/')
  })

  it('переносит связанные материалы как есть', () => {
    const json = computeJson([article({ slug: 'display', title: '`display`', related: ['js/array'] })])

    expect(json['`display`'].related).toEqual(['js/array'])
  })

  it('берёт в краткое описание текст до второго заголовка', () => {
    const body = ['## Кратко', '', 'Первое предложение.', '', '## Подробно', '', 'Много текста.'].join('\n')
    const json = computeJson([article({ slug: 'display', title: '`display`', body })])

    expect(json['`display`'].summary).toEqual(['Первое предложение.'])
  })

  it('не падает, когда 11ty зондирует поле через Proxy', () => {
    // Вычисляемые поля вызываются дважды: сначала на прокси, чтобы построить
    // граф зависимостей данных, и только потом на настоящих коллекциях.
    expect(computeJson(undefined)).toEqual({})
    expect(computeJson({ then: () => {} })).toEqual({})
  })

  it('возвращает пустой индекс для раздела без статей', () => {
    expect(computeJson([])).toEqual({})
  })
})
