const fs = require('fs')
const os = require('os')
const path = require('path')

const { cssTargets, styleEntries, bundleStyle } = require('../css.js')

const bundleSource = (css) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'doka-css-'))
  const filename = path.join(dir, 'index.css')
  fs.writeFileSync(filename, css)

  try {
    return bundleStyle(filename).toString()
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

describe('сборка стилей', () => {
  it('собирает @import в один файл', () => {
    const result = bundleStyle(path.join('src/styles', styleEntries[0])).toString()

    expect(result).not.toContain('@import')
    expect(result.length).toBeGreaterThan(0)
  })

  // Ради этого и уезжали с csso: его css-tree не знал современного синтаксиса
  // и ронял всю сборку, а Vite гонит через ту же цепочку стили демок.
  it.each([
    ['@container', '@container (width > 400px) { .a { color: red } }'],
    ['@scope', '@scope (.a) to (.b) { .c { color: red } }'],
    ['вложенные слои', '@layer framework.base { .a { color: red } }'],
    ['вложенность', '.a { color: red; &.b { color: blue } }'],
  ])('не падает на %s', (_, css) => {
    expect(() => bundleSource(css)).not.toThrow()
  })

  it('оставляет @container в выдаче', () => {
    expect(bundleSource('@container (width > 400px) { .a { color: red } }')).toContain('@container')
  })

  // Префиксы ставит lightningcss по targets, отдельного autoprefixer больше нет.
  it('ставит вендорные префиксы по targets', () => {
    expect(bundleSource('.a { user-select: none }')).toContain('-webkit-user-select')
  })

  it('вычисляет targets из browserslist проекта', () => {
    expect(Object.keys(cssTargets).length).toBeGreaterThan(0)
  })
})
