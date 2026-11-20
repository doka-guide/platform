const fs = require('fs')
const os = require('os')
const path = require('path')
const { parseHTML } = require('linkedom')
const { findDemoEntryFiles, resolveDemoData } = require('../demo-frame/inject-demo-frame')
const { transformDemoHtml } = require('../demo-frame/transform-demo-html')

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'demo-frame-test-'))
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, contents)
}

describe('findDemoEntryFiles', () => {
  let root

  beforeEach(() => {
    root = makeTempDir()
  })

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  it('находит demos/{имя}/index.html на один уровень ниже demos', () => {
    writeFile(path.join(root, 'css/display/demos/example/index.html'), '<html></html>')

    expect(findDemoEntryFiles(root)).toEqual([path.join(root, 'css/display/demos/example/index.html')])
  })

  it('пропускает HTML-файлы глубже demos/{имя}/', () => {
    writeFile(path.join(root, 'js/window-history/demos/history-operations/index.html'), '<html></html>')
    writeFile(path.join(root, 'js/window-history/demos/history-operations/about.html'), '<html></html>')
    writeFile(path.join(root, 'css/view-transition/demos/mpa/articles/view-transition.html'), '<html></html>')

    expect(findDemoEntryFiles(root)).toEqual([path.join(root, 'js/window-history/demos/history-operations/index.html')])
  })

  it('пропускает папки демок без index.html', () => {
    writeFile(path.join(root, 'css/clamp/demos/dynamic-width/code.html'), '<html></html>')

    expect(findDemoEntryFiles(root)).toEqual([])
  })
})

describe('resolveDemoData', () => {
  let root
  let distDir
  let srcDir

  const resolve = (demoPath, baseUrl = 'https://doka.guide') =>
    resolveDemoData(path.join(distDir, demoPath), { distDir, srcDir, baseUrl })

  beforeEach(() => {
    root = makeTempDir()
    distDir = path.join(root, 'dist')
    srcDir = path.join(root, 'src')
    writeFile(path.join(srcDir, 'people/solarrust/index.md'), "---\nname: 'Алёна Батицкая'\n---\n")
    writeFile(path.join(srcDir, 'people/goingtogogo/index.md'), "---\nname: 'Игорь Коровченко'\n---\n")
  })

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  it('собирает заголовок, ссылку на статью, всех авторов и цвет раздела', () => {
    writeFile(
      path.join(srcDir, 'css/animation-name/index.md'),
      '---\ntitle: "`animation-name`"\nauthors:\n  - solarrust\n  - goingtogogo\n---\n',
    )

    expect(resolve('css/animation-name/demos/example/index.html')).toEqual({
      baseUrl: 'https://doka.guide/',
      articleUrl: 'https://doka.guide/css/animation-name/',
      title: '`animation-name`',
      authors: [
        { name: 'Алёна Батицкая', url: 'https://doka.guide/people/solarrust/' },
        { name: 'Игорь Коровченко', url: 'https://doka.guide/people/goingtogogo/' },
      ],
      accent: 'hsl(209 100% 59%)',
    })
  })

  it('берёт адрес сайта из настроек, чтобы превью вели на себя', () => {
    writeFile(path.join(srcDir, 'html/details/index.md'), '---\ntitle: "`<details>`"\nauthors:\n  - solarrust\n---\n')

    const data = resolve('html/details/demos/example/index.html', 'https://platform-1355.dev.doka.guide/')

    expect(data.baseUrl).toBe('https://platform-1355.dev.doka.guide/')
    expect(data.articleUrl).toBe('https://platform-1355.dev.doka.guide/html/details/')
    expect(data.authors[0].url).toBe('https://platform-1355.dev.doka.guide/people/solarrust/')
    expect(data.accent).toBe('hsl(25 100% 59%)')
  })

  it('подставляет логин, если у автора нет профиля', () => {
    writeFile(path.join(srcDir, 'css/display/index.md'), '---\ntitle: "`display`"\nauthors:\n  - unknown-author\n---\n')

    expect(resolve('css/display/demos/example/index.html').authors).toEqual([
      { name: 'unknown-author', url: 'https://doka.guide/people/unknown-author/' },
    ])
  })

  it('оставляет рамку без авторов, если в статье их нет', () => {
    writeFile(path.join(srcDir, 'css/display/index.md'), '---\ntitle: "`display`"\n---\n')

    expect(resolve('css/display/demos/example/index.html').authors).toEqual([])
  })

  it('берёт слаг, если у статьи нет заголовка', () => {
    writeFile(path.join(srcDir, 'css/display/index.md'), '---\nauthors:\n  - solarrust\n---\n')

    expect(resolve('css/display/demos/example/index.html').title).toBe('display')
  })

  it('возвращает null, если статьи нет', () => {
    expect(resolve('css/nonexistent/demos/example/index.html')).toBeNull()
  })
})

describe('transformDemoHtml', () => {
  const baseHtml = [
    '<!DOCTYPE html>',
    '<html lang="ru">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <title>Демо</title>',
    '</head>',
    '<body>',
    '  <p>Привет</p>',
    '</body>',
    '</html>',
  ].join('\n')

  const data = {
    baseUrl: 'https://doka.guide/',
    articleUrl: 'https://doka.guide/css/display/',
    title: '`display`',
    authors: [{ name: 'Алёна Батицкая', url: 'https://doka.guide/people/solarrust/' }],
    accent: 'hsl(209 100% 59%)',
  }

  const findScript = (html) => parseHTML(html).document.querySelector('script[data-demo-frame]')
  const removeInjected = (html) => html.replace(/<script [^>]*data-demo-frame[^>]*><\/script>\n/, '')

  it('добавляет скрипт рамки с данными перед </head>', () => {
    const result = transformDemoHtml(baseHtml, data)
    const script = findScript(result)

    expect(script.getAttribute('src')).toBe('/scripts/demo-frame.js')
    expect(script.dataset.baseUrl).toBe('https://doka.guide/')
    expect(script.dataset.articleUrl).toBe('https://doka.guide/css/display/')
    expect(script.dataset.articleTitle).toBe('`display`')
    expect(JSON.parse(script.dataset.authors)).toEqual(data.authors)
    expect(script.dataset.accent).toBe('hsl(209 100% 59%)')
    expect(result.indexOf('data-demo-frame')).toBeLessThan(result.indexOf('</head>'))
    expect(result.indexOf('data-demo-frame')).toBeGreaterThan(result.indexOf('<meta charset'))
  })

  it('не меняет остальной HTML демки', () => {
    expect(removeInjected(transformDemoHtml(baseHtml, data))).toBe(baseHtml)
  })

  it('оставляет вложенный доктайп SVG на месте', () => {
    const withSvg = baseHtml.replace(
      '<p>Привет</p>',
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg></svg>',
    )
    const result = transformDemoHtml(withSvg, data)

    expect(result.startsWith('<!DOCTYPE html>')).toBe(true)
    expect(removeInjected(result)).toBe(withSvg)
  })

  it('экранирует данные, чтобы они не стали разметкой', () => {
    const hostile = {
      ...data,
      title: 'Кавычки " и <b>теги</b>',
      authors: [{ name: 'Ann <img src=x onerror=alert(1)>', url: 'https://doka.guide/people/ann/' }],
    }
    const result = transformDemoHtml(baseHtml, hostile)
    const { document } = parseHTML(result)

    expect(document.querySelector('img')).toBeNull()
    expect(document.querySelector('b')).toBeNull()
    expect(findScript(result).dataset.articleTitle).toBe(hostile.title)
    expect(JSON.parse(findScript(result).dataset.authors)).toEqual(hostile.authors)
  })

  it('не трогает уже обработанную демку', () => {
    const once = transformDemoHtml(baseHtml, data)

    expect(transformDemoHtml(once, data)).toBe(once)
  })

  it.each(['demo-logo', 'demo-meta', 'page demo-meta'])(
    'пропускает демку с ручной разметкой class="%s"',
    (className) => {
      const handMade = baseHtml.replace('<p>Привет</p>', `<footer class="${className}"></footer>`)

      expect(transformDemoHtml(handMade, data)).toBe(handMade)
    },
  )

  it('ставит скрипт перед <body>, если в демке нет </head>', () => {
    const withoutHead = '<!DOCTYPE html>\n<body>\n<p>Привет</p>\n</body>'
    const result = transformDemoHtml(withoutHead, data)

    expect(result.indexOf('data-demo-frame')).toBeLessThan(result.indexOf('<body>'))
    expect(removeInjected(result)).toBe(withoutHead)
  })

  it('дописывает скрипт в конец, если нет ни head, ни body', () => {
    const fragment = '<p>Привет</p>'
    const result = transformDemoHtml(fragment, data)

    expect(result.startsWith(fragment)).toBe(true)
    expect(findScript(result)).not.toBeNull()
  })
})
