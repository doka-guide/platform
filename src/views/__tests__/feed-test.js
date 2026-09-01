const {
  eleventyComputed: { posts, updated },
} = require('../feed.11tydata')

function post(date, title) {
  return { date, title, url: `https://doka.guide/css/${title}/`, content: '' }
}

// Записи приходят из CHANGELOG в порядке файла: свежие сверху, но внутри
// месяца порядок ручной и на даты не опирается.
const collections = {
  posts: [post('2026-07-07T00:00:00.000Z', 'gap'), post('2026-07-18T00:00:00.000Z', 'websocket')],
}

describe('feed: подготовка записей', () => {
  it('сортирует записи от свежих к старым', () => {
    // Регрессия: сортировка вычитала ISO-строки, получала NaN и не делала
    // ничего — порядок записей был случайным следствием порядка в CHANGELOG.
    expect(posts({ collections }).map((item) => item.title)).toEqual(['websocket', 'gap'])
  })

  it('не трогает исходную коллекцию', () => {
    posts({ collections })

    expect(collections.posts.map((item) => item.title)).toEqual(['gap', 'websocket'])
  })

  it('отдаёт только последние 50 записей', () => {
    const many = Array.from({ length: 60 }, (_, index) =>
      post(new Date(Date.UTC(2026, 0, index + 1)).toISOString(), `article-${index}`),
    )

    const feedPosts = posts({ collections: { posts: many } })

    expect(feedPosts).toHaveLength(50)
    expect(feedPosts[0].title).toBe('article-59')
    expect(feedPosts[49].title).toBe('article-10')
  })

  it('берёт дату обновления фида у самой свежей записи', () => {
    expect(updated({ posts: posts({ collections }) })).toBe('2026-07-18T00:00:00.000Z')
  })

  it('не падает на пустой коллекции', () => {
    expect(posts({ collections: { posts: [] } })).toEqual([])
    expect(() => new Date(updated({ posts: [] })).toISOString()).not.toThrow()
  })
})
