const docMd = require('../doc-md.11tydata')
const { baseUrl } = require('../../../config/constants')

// Элемент коллекции 11ty в том виде, в каком его видят вычисляемые поля:
// разобранный фронтматтер в data, исходный текст без фронтматтера в rawInput.
function doc({ slug = 'overflow-wrap', category = 'css', data = {}, body = '' }) {
  return {
    fileSlug: slug,
    filePathStem: `/${category}/${slug}/index`,
    data: { title: '`overflow-wrap`', tags: ['doka'], ...data },
    rawInput: body,
  }
}

function collections({ practice = [], peopleById = {} } = {}) {
  return {
    articleIndexes: [{ fileSlug: 'css', data: { name: 'CSS' } }],
    practice,
    peopleById,
  }
}

function render(docData, collectionsData = collections()) {
  return docMd.eleventyComputed.markdown({ doc: docData, collections: collectionsData })
}

function frontMatter(markdown) {
  const [, head] = markdown.split('---\n', 2)
  return head
}

describe('doc-md: markdown-версия материала', () => {
  it('складывает шапку с адресом, разделом и лицензией', () => {
    const head = frontMatter(render(doc({ data: { description: 'Про переносы.' } })))

    expect(head).toContain(`url: "${baseUrl}/css/overflow-wrap/"`)
    expect(head).toContain('section: "CSS"')
    expect(head).toContain('description: "Про переносы."')
    expect(head).toContain('license: "CC BY-NC-SA 4.0"')
    expect(head).toContain('source: "https://github.com/doka-guide/content/blob/main/css/overflow-wrap/index.md"')
  })

  it('не ломает YAML заголовком с бэктиками и кавычками', () => {
    const head = frontMatter(render(doc({ data: { title: '`"ужас"`' } })))

    // JSON — подмножество YAML, поэтому значения экранируются через JSON.stringify
    expect(head).toContain('title: "`\\"ужас\\"`"')
  })

  it('не выводит пустые поля шапки', () => {
    const head = frontMatter(render(doc({})))

    expect(head).not.toContain('description:')
    expect(head).not.toContain('baseline:')
    expect(head).not.toContain('updatedAt:')
  })

  it('помечает заготовку, чтобы её не цитировали как материал', () => {
    const head = frontMatter(render(doc({ data: { tags: ['doka', 'placeholder'] } })))

    expect(head).toContain('isPlaceholder: true')
  })

  it('оставляет только дату без времени', () => {
    const head = frontMatter(render(doc({ data: { updatedAt: '2023-05-11T10:20:30Z' } })))

    expect(head).toContain('updatedAt: "2023-05-11"')
  })

  it('ставит заголовок первого уровня: на странице его рисует платформа', () => {
    const markdown = render(doc({ body: '## Кратко\n\nТекст.' }))

    expect(markdown).toContain('# `overflow-wrap`')
    expect(markdown).toContain('## Кратко')
  })

  it('делает относительные ссылки на картинки и демки абсолютными', () => {
    const body = ['![Схема](images/1.png)', '<iframe src="demos/playground/" title="Демо"></iframe>'].join('\n\n')
    const markdown = render(doc({ body }))

    expect(markdown).toContain(`![Схема](${baseUrl}/css/overflow-wrap/images/1.png)`)
    expect(markdown).toContain(`src="${baseUrl}/css/overflow-wrap/demos/playground/"`)
  })

  it('не трогает ссылки, которые уже абсолютные или внешние', () => {
    const body = ['[Доки](/css/word-wrap/)', '[Спека](https://drafts.csswg.org/css-text/)'].join('\n\n')
    const markdown = render(doc({ body }))

    expect(markdown).toContain('[Доки](/css/word-wrap/)')
    expect(markdown).toContain('[Спека](https://drafts.csswg.org/css-text/)')
  })

  it('дописывает советы «На практике» с именем автора', () => {
    const practice = [
      {
        fileSlug: 'solarrust',
        filePathStem: '/css/overflow-wrap/practice/solarrust',
        rawInput: '🛠 Совет про перенос.',
      },
    ]
    const markdown = render(
      doc({}),
      collections({ practice, peopleById: { solarrust: { data: { name: 'Алёна Батицкая' } } } }),
    )

    expect(markdown).toContain('## На практике: Алёна Батицкая')
    expect(markdown).toContain('🛠 Совет про перенос.')
  })

  it('берёт ник вместо имени, когда профиля нет', () => {
    const practice = [{ fileSlug: 'ghost', filePathStem: '/css/overflow-wrap/practice/ghost', rawInput: 'Совет.' }]

    expect(render(doc({}), collections({ practice }))).toContain('## На практике: ghost')
  })

  it('не берёт советы из чужого материала', () => {
    const practice = [
      { fileSlug: 'solarrust', filePathStem: '/css/word-wrap/practice/solarrust', rawInput: 'Чужой совет.' },
    ]

    expect(render(doc({}), collections({ practice }))).not.toContain('Чужой совет.')
  })

  it('не падает, когда 11ty зондирует поле через Proxy', () => {
    // Вычисляемые поля вызываются дважды: сначала на прокси, чтобы построить
    // граф зависимостей данных, и только потом на настоящих коллекциях.
    expect(render(doc({}), { articleIndexes: { then: () => {} }, practice: { then: () => {} } })).toContain(
      'section: "css"',
    )
    expect(docMd.eleventyComputed.markdown({ doc: undefined, collections: {} })).toBe('')
  })
})
