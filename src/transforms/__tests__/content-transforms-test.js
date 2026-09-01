const { runTransform, article } = require('../../../test/helpers/transform')

const headingsIdTransform = require('../headings-id-transform')
const calloutTransform = require('../callout-transform')
const codeBreakifyTransform = require('../code-breakify-transform')
const demoLinkTransform = require('../demo-link-transform')
const answersLinkTransform = require('../answers-link-transform')
const demoExternalLinkTransform = require('../demo-external-link-transform')

describe('headings-id-transform', () => {
  it('проставляет id, транслитерируя заголовок', async () => {
    const window = await runTransform(headingsIdTransform, article('<h2>Как это работает</h2>'))

    expect(window.document.querySelector('h2').getAttribute('id')).toBe('kak-eto-rabotaet')
  })

  it('разводит одинаковые заголовки постфиксами', async () => {
    const html = article('<h2>Пример</h2><h3>Пример</h3><h4>Пример</h4>')
    const window = await runTransform(headingsIdTransform, html)
    const ids = Array.from(window.document.querySelectorAll('h2, h3, h4')).map((h) => h.getAttribute('id'))

    expect(ids).toEqual(['primer', 'primer-1', 'primer-2'])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('не трогает h1', async () => {
    const window = await runTransform(headingsIdTransform, article('<h1>Заголовок статьи</h1>'))

    expect(window.document.querySelector('h1').getAttribute('id')).toBeNull()
  })
})

describe('callout-transform', () => {
  it('превращает безымянный aside в коллаут', async () => {
    const window = await runTransform(calloutTransform, article('<aside><p>Совет дня</p></aside>'))
    const callout = window.document.querySelector('.callout')

    expect(callout).not.toBeNull()
    expect(callout.tagName.toLowerCase()).toBe('aside')
    expect(callout.querySelector('.callout__content').textContent).toContain('Совет дня')
  })

  it('выносит ведущий эмодзи в иконку и убирает его из текста', async () => {
    const window = await runTransform(calloutTransform, article('<aside><p>🔥 Важное</p></aside>'))

    expect(window.document.querySelector('.callout__icon').textContent.trim()).toBe('🔥')
    expect(window.document.querySelector('.callout__content').textContent).not.toContain('🔥')
  })

  it('обходится без иконки, когда эмодзи нет', async () => {
    const window = await runTransform(calloutTransform, article('<aside><p>Просто текст</p></aside>'))

    expect(window.document.querySelector('.callout__icon')).toBeNull()
  })

  it('не трогает aside с классом', async () => {
    const window = await runTransform(calloutTransform, article('<aside class="practices"><p>Совет</p></aside>'))

    expect(window.document.querySelector('.callout')).toBeNull()
  })
})

describe('code-breakify-transform', () => {
  it('расставляет переносы по спецсимволам', async () => {
    const window = await runTransform(codeBreakifyTransform, '<code class="code-fix">border-radius</code>')

    expect(window.document.querySelector('.code-fix').innerHTML).toContain('<wbr>')
  })

  it('не ставит перенос перед первым спецсимволом слова', async () => {
    const window = await runTransform(codeBreakifyTransform, '<code class="code-fix">-webkit-box</code>')

    expect(window.document.querySelector('.code-fix').innerHTML.startsWith('<wbr>')).toBe(false)
  })

  it('не трогает код без класса code-fix', async () => {
    const window = await runTransform(codeBreakifyTransform, '<code>border-radius</code>')

    expect(window.document.querySelector('code').innerHTML).toBe('border-radius')
  })
})

describe('demo-link-transform', () => {
  it('чинит относительный путь в разделе «На практике»', async () => {
    const html = '<div id="practices"><iframe src="../demos/index.html"></iframe></div>'
    const window = await runTransform(demoLinkTransform, html)

    expect(window.document.querySelector('iframe').getAttribute('src')).toBe('./demos/index.html')
  })

  it('чинит пути и у картинок', async () => {
    const window = await runTransform(demoLinkTransform, '<div id="practices"><img src="../images/a.png"></div>')

    expect(window.document.querySelector('img').getAttribute('src')).toBe('./images/a.png')
  })

  it('не трогает медиа за пределами раздела', async () => {
    const window = await runTransform(demoLinkTransform, '<img src="../images/a.png">')

    expect(window.document.querySelector('img').getAttribute('src')).toBe('../images/a.png')
  })
})

describe('answers-link-transform', () => {
  it('разворачивает путь до картинки ответа в абсолютный', async () => {
    const html = `
      <div id="questions">
        <div class="question__answer" id="css-answers-solarrust">
          <img src="picture.png">
        </div>
      </div>
    `
    const window = await runTransform(answersLinkTransform, html)

    expect(window.document.querySelector('img').getAttribute('src')).toBe(
      '/interviews/css/answers/solarrust/picture.png',
    )
  })
})

describe('demo-external-link-transform', () => {
  it('оборачивает демку в figure со ссылкой на отдельную вкладку', async () => {
    const html = article('<iframe src="./demos/index.html"></iframe>')
    const window = await runTransform(demoExternalLinkTransform, html, {
      outputPath: 'dist/css/display/index.html',
    })
    const link = window.document.querySelector('.figure__caption a')

    expect(window.document.querySelector('figure.figure')).not.toBeNull()
    expect(link.getAttribute('href')).toBe('/css/display/demos/index.html')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('не трогает встроенные видео и прочие iframe', async () => {
    const html = article('<iframe src="https://www.youtube.com/embed/xyz"></iframe>')
    const window = await runTransform(demoExternalLinkTransform, html, {
      outputPath: 'dist/css/display/index.html',
    })

    expect(window.document.querySelector('figure.figure')).toBeNull()
  })
})
