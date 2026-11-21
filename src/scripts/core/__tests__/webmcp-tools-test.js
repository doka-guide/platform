import {
  cleanSearchText,
  createTools,
  formatSearchHits,
  formatSectionIndex,
  normalizeArticlePath,
} from '../webmcp-tools.js'

function response(body, { status = 200 } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => body,
  }
}

// fetch по таблице «адрес → ответ»; неизвестный адрес — 404
function fakeFetch(routes) {
  const calls = []
  const fetch = jest.fn(async (url, init) => {
    calls.push({ url: String(url), init })
    const route = routes[String(url)]
    return route === undefined ? response('', { status: 404 }) : response(route)
  })
  fetch.calls = calls
  return fetch
}

function setup({ routes = {}, pathname = '/css/overflow/', confirmAnswer = true } = {}) {
  const fetch = fakeFetch(routes)
  const confirm = jest.fn(() => confirmAnswer)
  const tools = createTools({ fetch, confirm, location: { pathname } })
  const byName = Object.fromEntries(tools.map((tool) => [tool.name, tool]))
  return { fetch, confirm, tools: byName }
}

function textOf(result) {
  return result.content[0].text
}

describe('normalizeArticlePath', () => {
  test.each([
    ['css/overflow', '/css/overflow/'],
    ['/js/array-map/', '/js/array-map/'],
    ['https://doka.guide/html/doctype/#пример', '/html/doctype/'],
    ['https://doka.guide/css/flexbox-guide/demos/baseline/', '/css/flexbox-guide/'],
  ])('%s → %s', (input, expected) => {
    expect(normalizeArticlePath(input)).toBe(expected)
  })

  test.each([[''], ['/'], ['/css/'], ['/people/solarrust/'], [undefined]])('не статья: %s', (input) => {
    expect(normalizeArticlePath(input)).toBeNull()
  })
})

test('cleanSearchText убирает подсветку и сущности', () => {
  expect(cleanSearchText('`&lt;<mark>html</mark>&gt;`')).toBe('`<html>`')
})

test('formatSearchHits пропускает индексы разделов и режет по лимиту', () => {
  const hits = [
    { title: '', link: '/css/', category: 'css' },
    { title: '`<mark>flex</mark>`', link: '/css/flex/', category: 'css', fragments: ['...про <mark>flex</mark>...'] },
    { title: '`flex-wrap`', link: '/css/flex-wrap/', category: 'css' },
  ]
  const result = formatSearchHits(hits, 'flex', 1)
  expect(result).toContain('Нашлось в Доке (1)')
  expect(result).toContain('- `flex` — CSS\n  путь: /css/flex/\n  про flex')
  expect(result).not.toContain('flex-wrap')
})

test('formatSearchHits сообщает, что ничего не нашлось', () => {
  expect(formatSearchHits([], 'zzz', 8)).toBe('В Доке ничего не нашлось по запросу «zzz».')
})

test('formatSectionIndex сортирует материалы и убирает обратные кавычки', () => {
  const result = formatSectionIndex(
    { '`gap`': { path: '/css/gap/' }, '`align-items`': { path: '/css/align-items/' } },
    'css',
  )
  expect(result).toBe('Раздел «CSS», материалов: 2.\n\n- align-items — /css/align-items/\n- gap — /css/gap/')
})

describe('search_doka', () => {
  test('передаёт запрос и раздел в поиск Доки', async () => {
    const url = 'https://search.doka.guide/?search=flex+wrap&category=css'
    const { tools, fetch } = setup({ routes: { [url]: [{ title: '`flex-wrap`', link: '/css/flex-wrap/' }] } })
    const result = await tools.search_doka.execute({ query: 'flex wrap', section: 'css' })
    expect(fetch.calls[0].url).toBe(url)
    expect(textOf(result)).toContain('/css/flex-wrap/')
  })

  test('падение поиска отдаёт ошибку агенту', async () => {
    const { tools } = setup()
    await expect(tools.search_doka.execute({ query: 'flex' })).rejects.toThrow('404')
  })
})

describe('read_doka', () => {
  test('без path читает статью текущей страницы', async () => {
    const { tools } = setup({ routes: { '/css/overflow/index.md': '# `overflow`' } })
    expect(textOf(await tools.read_doka.execute({}))).toBe('# `overflow`')
  })

  test('читает статью по пути', async () => {
    const { tools } = setup({ routes: { '/js/array-map/index.md': '# map' } })
    expect(textOf(await tools.read_doka.execute({ path: 'js/array-map' }))).toBe('# map')
  })

  test('на странице без статьи просит path', async () => {
    const { tools, fetch } = setup({ pathname: '/' })
    expect(textOf(await tools.read_doka.execute({}))).toContain('Укажите path')
    expect(fetch).not.toHaveBeenCalled()
  })

  test('несуществующая статья — понятный ответ, а не ошибка', async () => {
    const { tools } = setup()
    expect(textOf(await tools.read_doka.execute({ path: 'css/nope' }))).toContain('Материала /css/nope/ в Доке нет')
  })
})

describe('list_section', () => {
  test('отдаёт оглавление раздела', async () => {
    const { tools } = setup({ routes: { '/html/index.json': { '`<p>`': { path: '/html/p/' } } } })
    expect(textOf(await tools.list_section.execute({ section: 'html' }))).toContain('- <p> — /html/p/')
  })

  test('неизвестный раздел не ходит в сеть', async () => {
    const { tools, fetch } = setup()
    expect(textOf(await tools.list_section.execute({ section: 'php' }))).toContain('Такого раздела нет')
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('get_related', () => {
  test('собирает связанные, предыдущий и следующий с заголовками', async () => {
    const { tools } = setup({
      routes: {
        '/css/overflow/index.json': {
          links: {
            relatedArticles: ['/css/display/'],
            previousArticle: '/css/will-change/',
            nextArticle: '/css/float/',
          },
        },
        '/css/display/index.json': { name: '`display`' },
        '/css/float/index.json': { name: '`float`' },
      },
    })
    const result = textOf(await tools.get_related.execute({}))
    expect(result).toBe(
      'Связанные:\n- display — /css/display/\n\n' +
        'Предыдущий в разделе:\n- /css/will-change/\n\n' +
        'Следующий в разделе:\n- float — /css/float/',
    )
  })
})

describe('send_feedback', () => {
  const routes = { '/api.json': { token: 'secret' }, 'https://api.doka.guide/form': {} }

  test('после подтверждения отправляет ответ так же, как форма', async () => {
    const { tools, fetch, confirm } = setup({ routes })
    const result = await tools.send_feedback.execute({ answer: 'Статья устарела' })
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('«Статья устарела»'))
    const sent = fetch.calls.find((call) => call.url === 'https://api.doka.guide/form')
    expect(sent.init.headers.Authorization).toBe('secret')
    expect(JSON.parse(sent.init.body)).toEqual({
      type: 'feedback',
      data: JSON.stringify({ answer: 'Статья устарела', article_id: '/css/overflow/' }),
      author_id: 1,
    })
    expect(textOf(result)).toContain('Отзыв отправлен')
  })

  test('своя причина важнее готового ответа', async () => {
    const { tools, fetch } = setup({ routes })
    await tools.send_feedback.execute({ answer: 'Понравилось', comment: '  Нет примера с grid  ' })
    const sent = fetch.calls.find((call) => call.url === 'https://api.doka.guide/form')
    expect(JSON.parse(JSON.parse(sent.init.body).data).answer).toBe('Нет примера с grid')
  })

  test('без подтверждения ничего не отправляет', async () => {
    const { tools, fetch } = setup({ routes, confirmAnswer: false })
    expect(textOf(await tools.send_feedback.execute({ answer: 'Понравилось' }))).toContain('отказался')
    expect(fetch).not.toHaveBeenCalled()
  })

  test('пустой отзыв не доходит до подтверждения', async () => {
    const { tools, confirm } = setup({ routes })
    expect(textOf(await tools.send_feedback.execute({ comment: 'ok' }))).toContain('Нужен answer')
    expect(confirm).not.toHaveBeenCalled()
  })

  test('ошибка сервера отдаётся агенту', async () => {
    const { tools } = setup({ routes: { '/api.json': { token: 't' } } })
    await expect(tools.send_feedback.execute({ answer: 'Понравилось' })).rejects.toThrow('404 — /form')
  })
})

describe('subscribe', () => {
  const routes = { '/api.json': { token: 'secret' }, 'https://api.doka.guide/subscription': {} }

  test('после подтверждения подписывает так же, как попап', async () => {
    const { tools, fetch } = setup({ routes })
    const result = await tools.subscribe.execute({ email: ' reader@example.com ' })
    const sent = fetch.calls.find((call) => call.url === 'https://api.doka.guide/subscription')
    expect(JSON.parse(sent.init.body)).toEqual({
      email: 'reader@example.com',
      data: JSON.stringify({ active: false }),
      author_id: 1,
    })
    expect(textOf(result)).toContain('придёт письмо')
  })

  test('неверный адрес не доходит до подтверждения', async () => {
    const { tools, confirm } = setup({ routes })
    expect(textOf(await tools.subscribe.execute({ email: 'reader@' }))).toContain('не похож на адрес')
    expect(confirm).not.toHaveBeenCalled()
  })

  test('без подтверждения не подписывает', async () => {
    const { tools, fetch } = setup({ routes, confirmAnswer: false })
    await tools.subscribe.execute({ email: 'reader@example.com' })
    expect(fetch).not.toHaveBeenCalled()
  })
})

test('у всех инструментов допустимые имена и схема объекта', () => {
  const { tools } = setup()
  for (const tool of Object.values(tools)) {
    expect(tool.name).toMatch(/^[A-Za-z0-9_.-]{1,128}$/)
    expect(tool.description.length).toBeGreaterThan(20)
    expect(tool.inputSchema.type).toBe('object')
  }
})
