const { runTransform, article } = require('../../../test/helpers/transform')

const typographyTransform = require('../typography-transform')

const NBSP = '\u00A0'
const show = (s) => s.replaceAll(NBSP, '~').replaceAll('&#160;', '~')

async function textOf(html, selector = 'p', options) {
  const window = await runTransform(typographyTransform, article(html), options)
  return show(window.document.querySelector(selector).textContent)
}

describe('typography-transform', () => {
  it('привязывает короткий предлог или союз к следующему слову', async () => {
    expect(await textOf('<p>который не удастся конвертировать в число, а потом</p>')).toBe(
      'который не~удастся конвертировать в~число, а~потом',
    )
  })

  it('привязывает цепочку коротких слов целиком', async () => {
    expect(await textOf('<p>какие действия и в какой момент, а во что</p>')).toBe(
      'какие действия и~в~какой момент, а~во~что',
    )
  })

  it('привязывает трёхбуквенные предлоги из списка', async () => {
    expect(await textOf('<p>работает без ошибок для всех</p>')).toBe('работает без~ошибок для~всех')
  })

  it('не трогает трёхбуквенные слова не из списка', async () => {
    expect(await textOf('<p>это код</p>')).toBe('это код')
  })

  it('привязывает тире к предыдущему слову', async () => {
    expect(await textOf('<p>Данные — это число</p>')).toBe('Данные~— это число')
  })

  it('привязывает частицы к предыдущему слову', async () => {
    expect(await textOf('<p>Было бы лучше, так ли это</p>')).toBe('Было~бы лучше, так~ли это')
  })

  it('привязывает предлог к коду в соседнем элементе', async () => {
    const window = await runTransform(typographyTransform, article('<p>Работа с <code>fetch()</code></p>'))

    expect(show(window.document.querySelector('p').innerHTML)).toBe('Работа с~<code>fetch()</code>')
  })

  it('не трогает код, блоки кода и скрипты', async () => {
    const html = '<p><code>a и b</code></p><pre>в коде</pre><script>const s = "в цикле"</script>'
    const window = await runTransform(typographyTransform, article(html))

    expect(window.document.querySelector('code').textContent).toBe('a и b')
    expect(window.document.querySelector('pre').textContent).toBe('в коде')
    expect(window.document.querySelector('script').textContent).toBe('const s = "в цикле"')
  })

  it('не трогает латиницу', async () => {
    expect(await textOf('<p>a b and c</p>')).toBe('a b and c')
  })

  it('работает во всей странице, а не только в статье', async () => {
    const window = await runTransform(typographyTransform, '<h3>Работа с формами</h3>')

    expect(show(window.document.querySelector('h3').textContent)).toBe('Работа с~формами')
  })

  it('не трогает демки', async () => {
    expect(await textOf('<p>в доме</p>', 'p', { outputPath: 'dist/css/example/demos/basic/index.html' })).toBe('в доме')
  })

  it('привязывает тире к коду перед ним', async () => {
    const window = await runTransform(typographyTransform, article('<p>а <code>button</code> — нет</p>'))

    expect(show(window.document.querySelector('p').innerHTML)).toBe('а~<code>button</code>~— нет')
  })

  it('не трогает тире в начале строки после <br>', async () => {
    const window = await runTransform(typographyTransform, article('<p>клавиатуре;<br>\n— с помощью ядра</p>'))

    expect(show(window.document.querySelector('p').innerHTML)).toBe('клавиатуре;<br>\n— с~помощью ядра')
  })

  it('привязывает предлог в конце выделения к слову после него', async () => {
    const window = await runTransform(
      typographyTransform,
      article('<p>значение <strong>попадает в</strong> диапазон</p><p>в</p>\n<p>новом абзаце</p>'),
    )

    expect(show(window.document.querySelector('p').innerHTML)).toBe('значение <strong>попадает в</strong>~диапазон')
    // между блоками пробел не трогаем: неразрывный пробел там стал бы пустой строкой
    expect(show(window.document.querySelector('.article__content').innerHTML)).toContain('<p>в</p>\n<p>')
  })

  it('не ставит неразрывный пробел перед закрывающим тегом', async () => {
    expect(show(await textOf('<h3> а </h3>', 'h3'))).toBe(' а ')
  })
})
