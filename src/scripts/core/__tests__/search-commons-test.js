const { processHits } = require('../search-commons.js')

const hitsTemplate = [
  {
    title: '`&lt;<mark>html</mark>&gt;`',
    link: '/html/html/',
    category: 'html',
    tags: ['doka'],
    fragments: ['фрагмент'],
  },
  { title: '', link: '/css/', category: 'css', tags: [] },
  { title: '   ', link: '/html/', category: 'html', tags: [] },
  { title: 'Глобальные атрибуты', link: '/html/global-attrs/', category: 'html', tags: ['doka'] },
]

describe('processHits', () => {
  it('возвращает пустой массив, если ответа нет', () => {
    expect(processHits(undefined)).toEqual([])
  })

  it('выбрасывает результаты без заголовка — индексы разделов', () => {
    const result = processHits(hitsTemplate)

    expect(result).toHaveLength(2)
    expect(result.map((hit) => hit.url)).toEqual(['/html/html/', '/html/global-attrs/'])
  })

  it('раскладывает поля статьи', () => {
    const [hit] = processHits(hitsTemplate)

    expect(hit).toEqual({
      originalTitle: '`&lt;<mark>html</mark>&gt;`',
      title: '`&lt;<mark>html</mark>&gt;`',
      summary: ['фрагмент'],
      url: '/html/html/',
      category: 'html',
      tags: ['doka'],
    })
  })

  it('подставляет пустой список фрагментов, если их нет', () => {
    const [, hit] = processHits(hitsTemplate)

    expect(hit.summary).toEqual([])
  })
})
