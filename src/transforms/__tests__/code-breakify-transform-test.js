const { runTransform } = require('../../../test/helpers/transform')

const codeBreakifyTransform = require('../code-breakify-transform')
const { findBreaks } = codeBreakifyTransform

// Показывает места разрыва чертой: так ожидания читаются глазами
function marked(text) {
  const breaks = findBreaks(text)
  return [...text].map((ch, i) => (breaks.includes(i) ? '|' : '') + ch).join('')
}

describe('findBreaks', () => {
  it('не ставит разрыв у дефиса', () => {
    // после дефиса браузер разрывает сам, поэтому <wbr> у дефиса не нужен
    expect(marked('scrollbar-color')).toBe('scrollbar-color')
  })

  it('не отрывает пустые скобки от имени и не ставит разрыв в конце', () => {
    expect(marked('fetch()')).toBe('fetch()')
    expect(marked('.getAttribute()')).toBe('.get|Attribute()')
  })

  it('не ставит разрыв в начале кода', () => {
    expect(marked(':disabled')).toBe(':disabled')
    expect(marked('::before')).toBe('::before')
  })

  it('разрывает camelCase на каждом горбе', () => {
    expect(marked('getBoundingClientRect()')).toBe('get|Bounding|Client|Rect()')
    expect(marked('Object.getOwnPropertyDescriptors()')).toBe('Object|.get|Own|Property|Descriptors()')
    expect(marked('IntersectionObserver')).toBe('Intersection|Observer')
  })

  it('отделяет аббревиатуру от следующего слова', () => {
    expect(marked('HTMLElement')).toBe('HTML|Element')
  })

  it('оставляет запятую и закрывающую скобку в конце строки', () => {
    expect(marked('rgb(0,0,0)')).toBe('rgb|(0,|0,|0)')
    expect(marked('a[0]')).toBe('a|[0]')
  })

  it('не разрывает между соседними спецсимволами', () => {
    expect(marked('a::before')).toBe('a|::before')
    expect(marked('obj?.prop')).toBe('obj|?.prop')
  })

  it('не разрывает числа, единицы и hex', () => {
    for (const text of ['1.5rem', 'v1.2.3', '50%', '#FF00AA', '0xFF', 'translate3D']) {
      expect(marked(text)).toBe(text)
    }
    expect(marked('calc(100% - 10px)')).toBe('calc|(100% - 10px)')
  })

  it('не отрывает последний знак', () => {
    expect(marked('src/')).toBe('src/')
    expect(marked('a.')).toBe('a.')
  })
})

describe('code-breakify-transform', () => {
  const card = (inner) =>
    `<article class="featured-article"><h3 class="featured-article__title"><a>${inner}</a></h3></article>`

  it('расставляет <wbr> в тексте кода, не трогая сам текст', async () => {
    const window = await runTransform(
      codeBreakifyTransform,
      '<p><code class="code-fix">&lt;input type="date"&gt;</code></p>',
    )
    const code = window.document.querySelector('code')

    expect(code.textContent).toBe('<input type="date">')
    expect(code.innerHTML).toBe('&lt;input type<wbr>="date"&gt;')
  })

  it('не ставит <wbr> первым или последним в коде', async () => {
    const window = await runTransform(codeBreakifyTransform, '<p><code class="code-fix">fetch()</code>: запросы</p>')

    expect(window.document.querySelector('code').innerHTML).toBe('fetch()')
  })

  it('передаёт карточке длину неразрывного куска вместе с запятой после кода', async () => {
    const window = await runTransform(
      codeBreakifyTransform,
      card(
        '<code class="featured-article__code code-fix">:disabled</code>, <code class="featured-article__code code-fix">:enabled</code>',
      ),
    )
    const [first, second] = window.document.querySelectorAll('code')

    expect(first.getAttribute('style')).toBe('--code-segment: 10')
    expect(second.getAttribute('style')).toBe('--code-segment: 8')
  })

  it('считает соседний код без пробела одним куском', async () => {
    const window = await runTransform(
      codeBreakifyTransform,
      card(
        '<code class="featured-article__code code-fix">import</code>/<code class="featured-article__code code-fix">export</code>',
      ),
    )

    for (const code of window.document.querySelectorAll('code')) {
      expect(code.getAttribute('style')).toBe('--code-segment: 13')
    }
  })

  it('считает предлог, привязанный неразрывным пробелом, частью куска', async () => {
    const window = await runTransform(
      codeBreakifyTransform,
      card('Работа с\u00A0<code class="code-fix">fetch()</code>'),
    )

    expect(window.document.querySelector('code').getAttribute('style')).toBe('--code-segment: 9')
  })

  it('считает куски между <wbr>, а не весь код', async () => {
    const window = await runTransform(
      codeBreakifyTransform,
      card('<code class="featured-article__code code-fix">background-image</code>'),
    )

    // после дефиса строку разрывает браузер: самый длинный кусок background-
    expect(window.document.querySelector('code').getAttribute('style')).toBe('--code-segment: 11')
  })

  it('задаёт длину коду в заголовке статьи', async () => {
    const window = await runTransform(
      codeBreakifyTransform,
      '<h1 class="article__title"><code class="code-fix">role="associationlistitemvalue"</code></h1>',
    )

    // разрыв только перед «=», дальше неразрывный кусок ="associationlistitemvalue"
    expect(window.document.querySelector('code').getAttribute('style')).toBe('--code-segment: 27')
  })

  it('не задаёт длину коду за пределами карточек', async () => {
    const window = await runTransform(codeBreakifyTransform, '<p><code class="code-fix">background-image</code></p>')

    expect(window.document.querySelector('code').hasAttribute('style')).toBe(false)
  })
})
