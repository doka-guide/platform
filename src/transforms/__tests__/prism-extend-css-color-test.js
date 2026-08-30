'use strict'

const { parseHTML } = require('linkedom')
const Prism = require('prismjs')
const loadLanguages = require('prismjs/components/')
const extendCssColor = require('../prism-extend-css-color')

loadLanguages()
extendCssColor(Prism)

function highlightRule(declaration) {
  return Prism.highlight(`.a { ${declaration}; }`, Prism.languages.css, 'css')
}

// оборачиваем в валидный документ, чтобы забрать токены через DOM,
// а не регуляркой по вложенным <span> — inside-грамматика их дробит
function colorTokens(declaration) {
  const html = `<!DOCTYPE html><html><body><pre>${highlightRule(declaration)}</pre></body></html>`
  const { document } = parseHTML(html)

  return Array.from(document.querySelectorAll('.token.color')).map((node) => node.textContent)
}

describe('prism-extend-css-color', () => {
  it('находит современный синтаксис rgb() с пробелами и слэшем', () => {
    expect(colorTokens('color: rgb(255 0 0 / .5)')).toEqual(['rgb(255 0 0 / .5)'])
  })

  it('находит hwb(), lab(), lch(), oklab(), oklch()', () => {
    expect(colorTokens('color: hwb(120 30% 30%)')).toEqual(['hwb(120 30% 30%)'])
    expect(colorTokens('color: lab(52% 40 60)')).toEqual(['lab(52% 40 60)'])
    expect(colorTokens('color: lch(52% 72 50)')).toEqual(['lch(52% 72 50)'])
    expect(colorTokens('color: oklab(59% 0.1 0.1)')).toEqual(['oklab(59% 0.1 0.1)'])
    expect(colorTokens('color: oklch(60% 0.15 50)')).toEqual(['oklch(60% 0.15 50)'])
  })

  it('находит color() и color-mix()', () => {
    expect(colorTokens('color: color(display-p3 1 0 0)')).toEqual(['color(display-p3 1 0 0)'])
    expect(colorTokens('color: color-mix(in srgb, red 50%, blue)')).toEqual(['color-mix(in srgb, red 50%, blue)'])
  })

  it('находит relative color syntax с вложенным вызовом функции', () => {
    expect(colorTokens('color: rgb(from hwb(0 50% 50%) r g b)')).toEqual(['rgb(from hwb(0 50% 50%) r g b)'])
  })

  it('находит relative color syntax со ссылкой на именованный цвет', () => {
    expect(colorTokens('color: rgba(from green r g b / alpha)')).toEqual(['rgba(from green r g b / alpha)'])
  })

  it('не ломает устаревший синтаксис с запятыми', () => {
    expect(colorTokens('color: rgb(255, 0, 0)')).toEqual(['rgb(255, 0, 0)'])
    expect(colorTokens('color: hsla(0, 100%, 50%, .5)')).toEqual(['hsla(0, 100%, 50%, .5)'])
  })

  it('находит именованные цвета', () => {
    expect(colorTokens('color: red')).toEqual(['red'])
    expect(colorTokens('color: transparent')).toEqual(['transparent'])
  })

  it('не подсвечивает currentColor — значение зависит от контекста', () => {
    expect(colorTokens('color: currentColor')).toEqual([])
  })

  it('не трогает свойства без цвета', () => {
    expect(colorTokens('display: flex')).toEqual([])
  })

  it('не считает цветом запись формального синтаксиса', () => {
    expect(colorTokens('color-mix(<метод-интерполяции>, <цвет> [<процент>]?)')).toEqual([])
    expect(colorTokens('rgb(<число> <число> <число>)')).toEqual([])
  })

  it('переживает повторный вызов, не теряя именованные цвета', () => {
    extendCssColor(Prism)

    expect(colorTokens('color: red')).toEqual(['red'])
    expect(colorTokens('color: oklch(60% 0.15 50)')).toEqual(['oklch(60% 0.15 50)'])
  })
})
