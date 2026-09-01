// Дымовой тест конфигурации 11ty.
//
// Не проверяет логику сборки — только то, что конфиг вообще загружается и
// регистрирует всё, что должен. Этого хватает, чтобы поймать типовые поломки
// при обновлении: пакет переехал на ESM и require() отдаёт пространство имён
// вместо функции, зависимость вымылась из дерева, метод конфига удалён.
//
// Ровно так ломался переезд на Eleventy 3: rss-плагин, vite-плагин и
// eleventy-img стали ESM, а node-fetch исчез вместе с обновлением
// eleventy-fetch, хотя .eleventy.js его требовал. Ни один тест этого не увидел.

const path = require('path')
const { execFileSync } = require('child_process')

const INSPECTOR = path.join(__dirname, '..', '..', 'test', 'helpers', 'inspect-eleventy-config.js')

// Конфиг грузится отдельным процессом: пакеты 11ty поставляются как ESM,
// а jest грузит node_modules как CommonJS и падает на `import`.
let loaded

beforeAll(() => {
  const output = execFileSync(process.execPath, [INSPECTOR], {
    encoding: 'utf8',
    cwd: path.join(__dirname, '..', '..'),
  })
  // dotenv пишет в stdout свою строку, поэтому берём то, что после маркера.
  loaded = JSON.parse(output.split('===ELEVENTY-CONFIG===')[1])
})

describe('конфигурация 11ty', () => {
  it('загружается и возвращает настройки каталогов', () => {
    expect(loaded.result.dir).toEqual({
      input: 'src',
      output: 'dist',
      includes: 'includes',
      layouts: 'layouts',
      data: 'data',
    })
    expect(loaded.result.templateFormats).toContain('md')
    expect(loaded.result.templateFormats).toContain('njk')
  })

  it('передаёт в addPlugin функции, а не пространства имён модулей', () => {
    // При переходе плагина на ESM require() возвращает объект с default,
    // и 11ty падает с «Invalid EleventyConfig.addPlugin signature».
    expect(loaded.calls.plugins.length).toBeGreaterThan(0)
    for (const plugin of loaded.calls.plugins) {
      expect(plugin.type).toBe('function')
    }
  })

  it('регистрирует коллекции разделов', () => {
    const names = loaded.calls.collections.map((collection) => collection.name)

    for (const section of ['html', 'css', 'js', 'a11y', 'tools', 'recipes']) {
      expect(names).toContain(section)
    }
    expect(names).toContain('docs')
    expect(names).toContain('people')
    expect(names).toContain('posts')
  })

  it('все коллекции заданы функциями', () => {
    expect(loaded.calls.collections.length).toBeGreaterThan(0)
    for (const collection of loaded.calls.collections) {
      expect(collection.isFunction).toBe(true)
    }
  })

  it('фильтры и шорткоды заданы функциями', () => {
    expect(loaded.calls.filters.length).toBeGreaterThan(0)
    for (const filter of loaded.calls.filters) {
      expect(filter.isFunction).toBe(true)
    }
    for (const shortcode of loaded.calls.shortcodes) {
      expect(shortcode.isFunction).toBe(true)
    }
  })

  it('подключает трансформации разметки', () => {
    const names = loaded.calls.transforms.map((transform) => transform.name)

    expect(names).toContain('html-transforms')
    for (const transform of loaded.calls.transforms) {
      expect(transform.isFunction).toBe(true)
    }
  })

  it('копирует статику и файлы разделов', () => {
    expect(loaded.calls.passthroughCopies).toContain('src/fonts')
    expect(loaded.calls.passthroughCopies).toContain('src/images')
    expect(loaded.calls.passthroughCopies.some((target) => target.includes('11tydata'))).toBe(true)
  })

  it('задаёт разметку markdown-it', () => {
    const markdown = loaded.calls.libraries.find((library) => library.name === 'md')

    expect(markdown).toBeDefined()
    expect(markdown.hasRender).toBe(true)
  })
})
