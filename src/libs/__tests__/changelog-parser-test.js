const { parseChangelog, buildPostContent } = require('../changelog-parser/changelog-parser')

const CHANGELOG = [
  '# Новые материалы',
  '',
  '<!-- yaspeller ignore:start -->',
  '',
  '## Июль 2026',
  '',
  '- 18 июля, [`WebSocket`](https://doka.guide/js/websocket/), Игорь Теплостанский',
  '- 7 июля, [Контрастность цветов в интерфейсе](https://doka.guide/a11y/color-contrast/), Аэлита Файзуллина',
  '',
  '## Декабрь 2025',
  '',
  '- 31 декабря, [`gap`](https://doka.guide/css/gap/), Алёна Батицкая',
].join('\n')

describe('parseChangelog', () => {
  it('разбирает строку материала на дату, заголовок и ссылку', () => {
    const [post] = parseChangelog(CHANGELOG)

    expect(post).toEqual({
      date: '2026-07-18T00:00:00.000Z',
      title: 'WebSocket',
      url: 'https://doka.guide/js/websocket/',
    })
  })

  it('берёт год из ближайшего заголовка выше', () => {
    const posts = parseChangelog(CHANGELOG)

    expect(posts.map((post) => post.date)).toEqual([
      '2026-07-18T00:00:00.000Z',
      '2026-07-07T00:00:00.000Z',
      '2025-12-31T00:00:00.000Z',
    ])
  })

  it('строит дату в UTC независимо от зоны машины', () => {
    // Регрессия: дата склеивалась в строку без ведущих нулей — '2026-7-7' —
    // и Date.parse разбирал такой формат как локальное время. В Токио материал
    // уезжал на день назад, и фид, собранный на машине разработчика,
    // не совпадал с собранным на сервере.
    const previousTimezone = process.env.TZ

    try {
      process.env.TZ = 'Asia/Tokyo'
      expect(parseChangelog(CHANGELOG)[1].date).toBe('2026-07-07T00:00:00.000Z')

      process.env.TZ = 'America/New_York'
      expect(parseChangelog(CHANGELOG)[1].date).toBe('2026-07-07T00:00:00.000Z')
    } finally {
      if (previousTimezone === undefined) {
        delete process.env.TZ
      } else {
        process.env.TZ = previousTimezone
      }
    }
  })

  it('убирает разметку из заголовка', () => {
    const posts = parseChangelog(CHANGELOG)

    expect(posts[0].title).toBe('WebSocket')
    expect(posts[1].title).toBe('Контрастность цветов в интерфейсе')
  })

  it('не путает запятую в заголовке с концом ссылки', () => {
    const posts = parseChangelog(
      [
        '## Июль 2026',
        '- 18 июля, [`:user-valid`, `:user-invalid`](https://doka.guide/css/invalid-valid/), DrakesWeb',
      ].join('\n'),
    )

    expect(posts).toEqual([
      {
        date: '2026-07-18T00:00:00.000Z',
        title: ':user-valid, :user-invalid',
        url: 'https://doka.guide/css/invalid-valid/',
      },
    ])
  })

  it('пропускает заголовки, комментарии и пустые строки', () => {
    expect(parseChangelog(CHANGELOG)).toHaveLength(3)
  })

  it('пропускает строки с неизвестным месяцем', () => {
    const posts = parseChangelog(
      ['## Июль 2026', '- 18 месяца, [`gap`](https://doka.guide/css/gap/), Автор'].join('\n'),
    )

    expect(posts).toEqual([])
  })

  it('пропускает материалы до первого заголовка с годом', () => {
    const posts = parseChangelog('- 18 июля, [`gap`](https://doka.guide/css/gap/), Автор')

    expect(posts).toEqual([])
  })
})

describe('buildPostContent', () => {
  const post = { title: 'WebSocket', url: 'https://doka.guide/js/websocket/' }

  it('ставит обложку материала первой картинкой', () => {
    const content = buildPostContent(post, { description: 'Двусторонняя связь с сервером.' })

    expect(content).toBe(
      '<p><img src="https://doka.guide/js/websocket/images/covers/og.png" ' +
        'alt="Обложка материала «WebSocket»"></p><p>Двусторонняя связь с сервером.</p>',
    )
  })

  it('берёт обложку из фронтматтера, если она задана', () => {
    const content = buildPostContent(post, { cover: { og: 'cover.png', alt: 'Кот в проводах' } })

    expect(content).toContain('<img src="https://doka.guide/js/websocket/cover.png" alt="Кот в проводах">')
  })

  it('обходится без описания, когда материала нет в сборке', () => {
    const content = buildPostContent(post, undefined)

    expect(content).toBe(
      '<p><img src="https://doka.guide/js/websocket/images/covers/og.png" alt="Обложка материала «WebSocket»"></p>',
    )
  })

  it('превращает код из описания в <code>, не теряя угловых скобок', () => {
    // Регрессия: обратные кавычки и скобки вырезались вместе с содержимым,
    // и «стилизация `<details>`» превращалась в «стилизация details».
    const content = buildPostContent(post, { description: 'Стилизация содержимого `<details>`.' })

    expect(content).toContain('<p>Стилизация содержимого <code>&lt;details&gt;</code>.</p>')
  })

  it('экранирует спецсимволы в описании', () => {
    const content = buildPostContent(post, { description: 'Кавычки «ёлочки» & амперсанд.' })

    expect(content).toContain('<p>Кавычки «ёлочки» &amp; амперсанд.</p>')
  })

  it('экранирует кавычки в альтернативном тексте', () => {
    const content = buildPostContent(post, { cover: { alt: 'Собака в "очках"' } })

    expect(content).toContain('alt="Собака в &quot;очках&quot;"')
  })
})
