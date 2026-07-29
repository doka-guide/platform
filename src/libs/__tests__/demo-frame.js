const fs = require('fs')
const os = require('os')
const path = require('path')
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

  it('finds demos/{name}/index.html one level under demos', () => {
    writeFile(path.join(root, 'css/display/demos/example/index.html'), '<html></html>')

    expect(findDemoEntryFiles(root)).toEqual([path.join(root, 'css/display/demos/example/index.html')])
  })

  it('ignores html files nested deeper than demos/{name}/', () => {
    writeFile(path.join(root, 'js/window-history/demos/history-operations/index.html'), '<html></html>')
    writeFile(path.join(root, 'js/window-history/demos/history-operations/about.html'), '<html></html>')
    writeFile(path.join(root, 'css/view-transition/demos/mpa/articles/view-transition.html'), '<html></html>')

    const found = findDemoEntryFiles(root)

    expect(found).toEqual([path.join(root, 'js/window-history/demos/history-operations/index.html')])
  })

  it('ignores demo directories without an index.html', () => {
    writeFile(path.join(root, 'css/clamp/demos/dynamic-width/code.html'), '<html></html>')

    expect(findDemoEntryFiles(root)).toEqual([])
  })
})

describe('resolveDemoData', () => {
  let root
  let distDir
  let srcDir

  beforeEach(() => {
    root = makeTempDir()
    distDir = path.join(root, 'dist')
    srcDir = path.join(root, 'src')
  })

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  it('resolves section, slug, author and accent from the owning article', () => {
    writeFile(path.join(srcDir, 'css/display/index.md'), '---\ntitle: "display"\nauthors:\n  - solarrust\n---\n')
    writeFile(path.join(srcDir, 'people/solarrust/index.md'), "---\nname: 'Алёна Батицкая'\n---\n")

    const demoEntryPath = path.join(distDir, 'css/display/demos/example/index.html')

    expect(resolveDemoData(demoEntryPath, { distDir, srcDir })).toEqual({
      section: 'css',
      slug: 'display',
      authorUsername: 'solarrust',
      authorName: 'Алёна Батицкая',
      accent: 'hsl(209 100% 59%)',
    })
  })

  it('uses a different accent for a different section', () => {
    writeFile(path.join(srcDir, 'html/details/index.md'), '---\ntitle: "details"\nauthors:\n  - solarrust\n---\n')
    writeFile(path.join(srcDir, 'people/solarrust/index.md'), "---\nname: 'Алёна Батицкая'\n---\n")

    const demoEntryPath = path.join(distDir, 'html/details/demos/example/index.html')

    expect(resolveDemoData(demoEntryPath, { distDir, srcDir }).accent).toBe('hsl(25 100% 59%)')
  })

  it('falls back to the username when the author profile is missing', () => {
    writeFile(path.join(srcDir, 'css/display/index.md'), '---\ntitle: "display"\nauthors:\n  - unknown-author\n---\n')

    const demoEntryPath = path.join(distDir, 'css/display/demos/example/index.html')

    expect(resolveDemoData(demoEntryPath, { distDir, srcDir }).authorName).toBe('unknown-author')
  })

  it('returns null when the owning article cannot be resolved', () => {
    const demoEntryPath = path.join(distDir, 'css/nonexistent/demos/example/index.html')

    expect(resolveDemoData(demoEntryPath, { distDir, srcDir })).toBeNull()
  })

  it('returns null when the article has no authors', () => {
    writeFile(path.join(srcDir, 'css/display/index.md'), '---\ntitle: "display"\n---\n')

    const demoEntryPath = path.join(distDir, 'css/display/demos/example/index.html')

    expect(resolveDemoData(demoEntryPath, { distDir, srcDir })).toBeNull()
  })
})

describe('transformDemoHtml', () => {
  const baseHtml = '<!DOCTYPE html><html lang="ru"><head><title>Демо</title></head><body><p>Привет</p></body></html>'
  const data = {
    section: 'css',
    slug: 'display',
    authorUsername: 'solarrust',
    authorName: 'Алёна Батицкая',
    accent: 'hsl(209 100% 59%)',
  }

  it('injects the shared stylesheet, script, logo and footer', () => {
    const result = transformDemoHtml(baseHtml, data)

    expect(result).toContain('href="/styles/demo-frame.css"')
    expect(result).toContain('rel="stylesheet"')
    expect(result).toContain('src="/scripts/demo-frame.js"')
    expect(result).toContain('--demo-frame-accent: hsl(209 100% 59%)')
    expect(result).toContain('class="demo-frame-logo"')
    expect(result).toContain('class="demo-frame-footer"')
    expect(result).toContain('href="https://doka.guide/css/display/"')
    expect(result).toContain('href="https://doka.guide/people/solarrust/"')
    expect(result).toContain('Алёна Батицкая')
  })

  it('is idempotent when run twice', () => {
    const once = transformDemoHtml(baseHtml, data)
    const twice = transformDemoHtml(once, data)

    expect(twice).toBe(once)
  })

  it('preserves an existing inline body style', () => {
    const htmlWithStyle = baseHtml.replace('<body>', '<body style="color: red">')
    const result = transformDemoHtml(htmlWithStyle, data)

    expect(result).toContain('color: red')
    expect(result).toContain('--demo-frame-accent: hsl(209 100% 59%)')
  })
})
