const createMarkdown = require('../markdown-it')

describe('markdown-it', () => {
  const md = createMarkdown()

  it('рендерит код и курсив в заголовке summary', () => {
    const html = md.render(
      [
        '<details>',
        '  <summary>',
        '    Подробнее об использовании `await` в модулях (_top-level await_)',
        '  </summary>',
        '',
        '  Текст',
        '',
        '</details>',
      ].join('\n'),
    )

    expect(html).toContain(
      '<summary>Подробнее об использовании <code>await</code> в модулях (<em>top-level await</em>)</summary>',
    )
  })

  it('сохраняет атрибуты и html внутри summary', () => {
    const html = md.render('<details>\n<summary class="x">Про <b>тег</b> и `код`</summary>\n\nТекст\n\n</details>')

    expect(html).toContain('<summary class="x">Про <b>тег</b> и <code>код</code></summary>')
  })
})
