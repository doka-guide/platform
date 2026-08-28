const { parseHTML } = require('linkedom')
const HeadingHierarchy = require('../heading-hierarchy/heading-hierarchy')

// Оглавление строится из живых элементов, поэтому заголовки собираем из
// разобранного документа — так же, как это делает toc-transform.
function headingsFrom(html) {
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${html}</body></html>`)
  return Array.from(document.querySelectorAll('h2, h3, h4, h5, h6, p'))
}

describe('createHierarchy', () => {
  it('складывает заголовки одного уровня в соседей', () => {
    const root = HeadingHierarchy.createHierarchy(headingsFrom('<h2 id="a">А</h2><h2 id="b">Б</h2>'))

    expect(root.children).toHaveLength(2)
    expect(root.children.map((item) => item.id)).toEqual(['a', 'b'])
  })

  it('вкладывает заголовок меньшего уровня в предыдущий', () => {
    const root = HeadingHierarchy.createHierarchy(headingsFrom('<h2 id="a">А</h2><h3 id="b">Б</h3>'))

    expect(root.children).toHaveLength(1)
    expect(root.children[0].children.map((item) => item.id)).toEqual(['b'])
  })

  it('поднимается на нужный уровень после вложенных заголовков', () => {
    const html = '<h2 id="a">А</h2><h3 id="b">Б</h3><h4 id="v">В</h4><h2 id="g">Г</h2>'
    const root = HeadingHierarchy.createHierarchy(headingsFrom(html))

    expect(root.children.map((item) => item.id)).toEqual(['a', 'g'])
    expect(root.children[0].children[0].children.map((item) => item.id)).toEqual(['v'])
  })

  it('считает абзац заголовком третьего уровня', () => {
    // Так размечены вопросы в рубрике «На собеседовании»
    const root = HeadingHierarchy.createHierarchy(headingsFrom('<h2 id="a">А</h2><p id="q">Вопрос</p>'))

    expect(root.children[0].children.map((item) => item.id)).toEqual(['q'])
  })

  it('не падает на пустом списке', () => {
    const root = HeadingHierarchy.createHierarchy([])

    expect(root.children).toHaveLength(0)
  })
})

describe('render', () => {
  it('делает список ссылок с якорями', () => {
    const root = HeadingHierarchy.createHierarchy(headingsFrom('<h2 id="kak-eto">Как это</h2>'))
    const html = HeadingHierarchy.render(root)

    expect(html).toContain('class="toc"')
    expect(html).toContain('href="#kak-eto"')
    expect(html).toContain('Как это')
  })

  it('экранирует разметку в тексте заголовка', () => {
    const root = HeadingHierarchy.createHierarchy(headingsFrom('<h2 id="a">Тег &lt;script&gt;</h2>'))
    const html = HeadingHierarchy.render(root)

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('вкладывает дочерние пункты в отдельный список', () => {
    const root = HeadingHierarchy.createHierarchy(headingsFrom('<h2 id="a">А</h2><h3 id="b">Б</h3>'))
    const html = HeadingHierarchy.render(root)

    expect(html.match(/<ol class="toc__list/g)).toHaveLength(2)
  })
})
