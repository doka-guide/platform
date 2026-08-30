'use strict'

const { runTransform, article } = require('../../../test/helpers/transform')

const articleCodeBlocksTransform = require('../article-code-blocks-transform')
const colorPickerTransform = require('../color-picker-transform')

async function highlightAndPick(css) {
  const html = article(`<pre data-lang="css"><code>${css}</code></pre>`)
  const window = await runTransform(articleCodeBlocksTransform, html)

  await colorPickerTransform(window)

  return window
}

describe('color-picker-transform', () => {
  it('не падает, когда цвет — первый токен в блоке кода', async () => {
    await expect(highlightAndPick('color-mix(in oklab, blue 50%, red);')).resolves.toBeDefined()
  })

  it('проставляет превью цвету, который стоит первым в блоке кода', async () => {
    const window = await highlightAndPick('color-mix(in oklab, blue 50%, red);')
    const swatch = window.document.querySelector('.token.color')

    expect(swatch.classList.contains('color-picker__inline')).toBe(true)
    expect(swatch.style.getPropertyValue('--color-picker').trim()).toBe('color-mix(in oklab, blue 50%, red)')
  })

  it('добавляет отступ скобке перед сгруппированным цветом', async () => {
    const window = await highlightAndPick('.a { background: linear-gradient(red, blue); }')
    const [firstColor] = window.document.querySelectorAll('.token.color')

    expect(firstColor.previousElementSibling.classList.contains('color-picker__grouped')).toBe(true)
  })

  it('выключает превью для transparent', async () => {
    const window = await highlightAndPick('.a { color: transparent; }')
    const swatch = window.document.querySelector('.color-transparent')

    expect(swatch.classList.contains('color-transparent')).toBe(true)
    expect(swatch.classList.contains('color-picker__inline')).toBe(false)
  })

  it('оставляет превью цвету, внутри которого упомянут transparent', async () => {
    const window = await highlightAndPick('.a { color: color-mix(in srgb, transparent 50%, red); }')
    const swatch = window.document.querySelector('.token.color')

    expect(window.document.querySelector('.color-transparent')).toBeNull()
    expect(swatch.style.getPropertyValue('--color-picker').trim()).toBe('color-mix(in srgb, transparent 50%, red)')
  })
})
