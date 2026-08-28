const { runTransform, article } = require('../../../test/helpers/transform')

const linkTransform = require('../link-transform')
const tableTransform = require('../table-transform')
const detailsTransform = require('../details-transform')
const iframeAttrTransform = require('../iframe-attr-transform')
const articleInlineCodeTransform = require('../article-inline-code-transform')
const codeClassesTransform = require('../code-classes-transform')

describe('link-transform', () => {
  it('проставляет класс ссылкам внутри контента', async () => {
    const window = await runTransform(linkTransform, article('<p><a href="/css/">Раздел</a></p>'))
    const link = window.document.querySelector('a')

    expect(link.classList.contains('link')).toBe(true)
  })

  it('не трогает ссылки за пределами контента', async () => {
    const window = await runTransform(linkTransform, `<nav><a href="/">Главная</a></nav>${article('')}`)
    const link = window.document.querySelector('nav a')

    expect(link.classList.contains('link')).toBe(false)
  })

  it('не падает на странице без контента', async () => {
    await expect(runTransform(linkTransform, '<p>Просто страница</p>')).resolves.toBeDefined()
  })
})

describe('table-transform', () => {
  it('оборачивает таблицу в прокручиваемый контейнер', async () => {
    const window = await runTransform(tableTransform, article('<table><tr><td>Ячейка</td></tr></table>'))
    const wrapper = window.document.querySelector('.table-wrapper')

    expect(wrapper).not.toBeNull()
    expect(wrapper.getAttribute('tabindex')).toBe('0')
    expect(wrapper.querySelector('table')).not.toBeNull()
  })

  it('сохраняет содержимое таблицы', async () => {
    const window = await runTransform(tableTransform, article('<table><tr><td>Ячейка</td></tr></table>'))

    expect(window.document.querySelector('.table-wrapper table td').textContent).toBe('Ячейка')
  })

  it('оборачивает каждую таблицу отдельно', async () => {
    const html = article('<table><tr><td>1</td></tr></table><table><tr><td>2</td></tr></table>')
    const window = await runTransform(tableTransform, html)

    expect(window.document.querySelectorAll('.table-wrapper')).toHaveLength(2)
  })
})

describe('details-transform', () => {
  it('размечает details и оборачивает содержимое', async () => {
    const html = article('<details><summary>Заголовок</summary><p>Текст</p></details>')
    const window = await runTransform(detailsTransform, html)
    const details = window.document.querySelector('details')

    expect(details.classList.contains('details')).toBe(true)
    expect(details.querySelector('summary').classList.contains('details__summary')).toBe(true)
    expect(details.querySelector('.details__content.content')).not.toBeNull()
  })

  it('кладёт содержимое внутрь обёртки, а не рядом', async () => {
    const html = article('<details><summary>Заголовок</summary><p>Текст</p></details>')
    const window = await runTransform(detailsTransform, html)

    expect(window.document.querySelector('.details__content').textContent).toContain('Текст')
  })
})

describe('iframe-attr-transform', () => {
  it('добавляет ленивую загрузку', async () => {
    const window = await runTransform(iframeAttrTransform, article('<iframe src="/demo/"></iframe>'))

    expect(window.document.querySelector('iframe').getAttribute('loading')).toBe('lazy')
  })

  it('не перезаписывает уже заданное значение', async () => {
    const html = article('<iframe src="/demo/" loading="eager"></iframe>')
    const window = await runTransform(iframeAttrTransform, html)

    expect(window.document.querySelector('iframe').getAttribute('loading')).toBe('eager')
  })
})

describe('article-inline-code-transform', () => {
  it('размечает инлайновый код в абзацах и списках', async () => {
    const html = article('<p><code>display</code></p><ul><li><code>flex</code></li></ul>')
    const window = await runTransform(articleInlineCodeTransform, html)

    for (const code of window.document.querySelectorAll('code')) {
      expect(code.classList.contains('inline-code')).toBe(true)
      expect(code.classList.contains('font-theme--code')).toBe(true)
    }
  })

  it('не трогает код в блоках pre', async () => {
    const window = await runTransform(articleInlineCodeTransform, article('<pre><code>const a = 1</code></pre>'))

    expect(window.document.querySelector('pre code').classList.contains('inline-code')).toBe(false)
  })
})

describe('code-classes-transform', () => {
  it('размечает код внутри заголовка статьи', async () => {
    const window = await runTransform(codeClassesTransform, '<h1 class="article__title"><code>display</code></h1>')
    const code = window.document.querySelector('code')

    expect(code.classList.contains('article__title-code')).toBe(true)
    expect(code.classList.contains('code-fix')).toBe(true)
  })

  it('использует свой класс для каждого вида родителя', async () => {
    const html = '<a class="articles-group__link"><code>a</code></a><p class="figure__caption"><code>b</code></p>'
    const window = await runTransform(codeClassesTransform, html)
    const [groupCode, captionCode] = window.document.querySelectorAll('code')

    expect(groupCode.classList.contains('articles-group__code')).toBe(true)
    expect(captionCode.classList.contains('figure__caption-code')).toBe(true)
  })
})
