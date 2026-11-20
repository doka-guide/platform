/**
 * @jest-environment jsdom
 */

import {
  HOST_TAG,
  init,
  measureContentBottom,
  mountFrame,
  readFrameData,
  renderTitle,
  reserveSpace,
  getSpacerBottom,
  canScrollPage,
} from '../demo-frame'

const data = {
  baseUrl: 'https://doka.guide/',
  articleUrl: 'https://doka.guide/css/animation-name/',
  title: '`animation-name`',
  authors: [
    { name: 'Алёна Батицкая', url: 'https://doka.guide/people/solarrust/' },
    { name: 'Игорь Коровченко', url: 'https://doka.guide/people/goingtogogo/' },
  ],
  accent: 'hsl(209 100% 59%)',
}

function createScript(overrides = {}) {
  const script = document.createElement('script')
  const values = { ...data, ...overrides }
  script.dataset.baseUrl = values.baseUrl
  script.dataset.articleUrl = values.articleUrl
  script.dataset.articleTitle = values.title
  script.dataset.authors = typeof values.authors === 'string' ? values.authors : JSON.stringify(values.authors)
  script.dataset.accent = values.accent
  return script
}

const getHost = () => document.querySelector(HOST_TAG)
const getBar = () => getHost().shadowRoot.querySelector('.bar')

beforeEach(() => {
  document.querySelectorAll(HOST_TAG).forEach((host) => host.remove())
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  document.documentElement.removeAttribute('style')
})

describe('readFrameData', () => {
  it('читает данные из data-атрибутов скрипта', () => {
    expect(readFrameData(createScript())).toEqual(data)
  })

  it('возвращает null без скрипта или без обязательных данных', () => {
    expect(readFrameData(null)).toBeNull()
    expect(readFrameData(createScript({ articleUrl: '' }))).toBeNull()
  })

  it('не падает на сломанном списке авторов', () => {
    expect(readFrameData(createScript({ authors: '{не json' })).authors).toEqual([])
  })
})

describe('renderTitle', () => {
  it('превращает части в обратных кавычках в <code>', () => {
    const nodes = renderTitle(document, 'Свойство `display` и `grid`')
    const wrapper = document.createElement('span')
    wrapper.append(...nodes)

    expect(wrapper.innerHTML).toBe('Свойство <code>display</code> и <code>grid</code>')
  })
})

describe('mountFrame', () => {
  it('рисует рамку в Shadow DOM: лого, статья и все авторы', () => {
    mountFrame(document, data)
    const bar = getBar()
    const links = [...bar.querySelectorAll('a')]

    expect(getHost().parentElement).toBe(document.documentElement)
    expect(document.body.contains(getHost())).toBe(false)
    expect(bar.tagName).toBe('ASIDE')
    expect(bar.getAttribute('aria-label')).toBe('Демка из Доки')
    expect(bar.getAttribute('lang')).toBe('ru')
    expect(links[1].title).toBe('animation-name')
    expect(bar.querySelector('.authors').title).toBe('Алёна Батицкая, Игорь Коровченко')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://doka.guide/',
      'https://doka.guide/css/animation-name/',
      'https://doka.guide/people/solarrust/',
      'https://doka.guide/people/goingtogogo/',
    ])
    expect(links[0].getAttribute('aria-label')).toBe('Дока — на главную')
    expect(links[1].innerHTML).toBe('<code>animation-name</code>')
    expect(bar.querySelector('.authors').textContent).toBe('Алёна Батицкая, Игорь Коровченко')
    expect(bar.style.getPropertyValue('--accent')).toBe('hsl(209 100% 59%)')
  })

  it('не добавляет в DOM демки ни footer, ни ссылки', () => {
    mountFrame(document, data)

    expect(document.querySelectorAll('footer, a')).toHaveLength(0)
  })

  it('вставляет данные как текст, а не как разметку', () => {
    mountFrame(document, {
      ...data,
      title: '<b>жирный</b>',
      authors: [{ name: 'Ann <img src=x onerror=alert(1)>', url: 'https://doka.guide/people/ann/' }],
    })
    const bar = getBar()

    expect(bar.querySelector('img, b')).toBeNull()
    expect(bar.querySelector('.authors').textContent).toBe('Ann <img src=x onerror=alert(1)>')
  })

  it('обходится без блока авторов, если их нет', () => {
    mountFrame(document, { ...data, authors: [] })

    expect(getBar().querySelector('.authors')).toBeNull()
  })
})

describe('init', () => {
  it('ничего не рисует внутри iframe', () => {
    const fakeWindow = { self: {}, top: {}, document }

    expect(init(createScript(), fakeWindow)).toBe(false)
    expect(getHost()).toBeNull()
  })

  it('рисует рамку в отдельной вкладке и только один раз', () => {
    const script = createScript()

    expect(init(script, window)).toBe(true)
    init(script, window)

    expect(document.querySelectorAll(HOST_TAG)).toHaveLength(1)
  })

  it('ждёт DOMContentLoaded, если скрипт выполняется до body', () => {
    const body = document.body
    Object.defineProperty(document, 'body', { configurable: true, get: () => null })

    expect(init(createScript(), window)).toBe(true)
    expect(getHost()).toBeNull()

    delete document.body
    expect(document.body).toBe(body)
    document.dispatchEvent(new Event('DOMContentLoaded'))

    expect(getHost()).not.toBeNull()
  })

  it('ничего не рисует без данных', () => {
    expect(init(null, window)).toBe(false)
    expect(getHost()).toBeNull()
  })
})

describe('getSpacerBottom', () => {
  it('ставит низ распорки под содержимым на высоту рамки и зазор', () => {
    expect(getSpacerBottom({ contentBottom: 871, barHeight: 35.8 })).toBe(915)
    expect(getSpacerBottom({ contentBottom: 0, barHeight: 36 })).toBe(44)
  })
})

describe('measureContentBottom и reserveSpace', () => {
  const rects = new Map()
  let originalRect

  beforeAll(() => {
    originalRect = Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = function () {
      const { bottom = 0, height = 20 } = rects.get(this) ?? {}
      return {
        top: bottom ? bottom - height : 0,
        bottom,
        width: bottom ? 100 : 0,
        height: bottom ? height : 0,
        left: 0,
        right: 100,
      }
    }
  })

  afterAll(() => {
    Element.prototype.getBoundingClientRect = originalRect
  })

  beforeEach(() => {
    rects.clear()
    document.body.removeAttribute('style')
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 1000 })
  })

  function setup(contentBottom) {
    document.body.innerHTML = [
      '<div class="wrapper"><p>Текст</p></div>',
      '<div class="fixed">Фикс</div>',
      '<div class="toast"><span>Тост</span></div>',
    ].join('')
    rects.set(document.querySelector('.wrapper'), { bottom: 1000, height: 1000 })
    rects.set(document.querySelector('p'), { bottom: contentBottom })
    const fixed = document.querySelector('.fixed')
    fixed.style.position = 'fixed'
    rects.set(fixed, { bottom: 1000 })
    const toast = document.querySelector('.toast')
    toast.style.position = 'fixed'
    rects.set(toast.querySelector('span'), { bottom: 1000 })

    const host = mountFrame(document, data)
    rects.set(host.shadowRoot.querySelector('.bar'), { bottom: 1000, height: 36 })
    return host
  }

  it('считает только содержимое: обёртки без текста и fixed-элементы не в счёт', () => {
    setup(640)

    expect(measureContentBottom(document)).toBe(640)
  })

  it('ставит распорку так, чтобы рамка не закрывала конец содержимого', () => {
    const host = setup(990)
    reserveSpace(document, host)
    const spacer = host.shadowRoot.querySelector('.spacer')

    // Мок отдаёт распорке top = 0, значит её низ — это top + 1px.
    expect(spacer.style.top).toBe(`${990 + 36 + 8 - 1}px`)
    expect(spacer.getAttribute('aria-hidden')).toBe('true')
  })

  it('не считает скрытое, например содержимое закрытого <details>', () => {
    setup(640)
    const hidden = document.createElement('p')
    hidden.textContent = 'Скрыто'
    document.body.append(hidden)
    rects.set(hidden, { bottom: 900 })
    Element.prototype.checkVisibility = function () {
      return this !== hidden
    }

    try {
      expect(measureContentBottom(document)).toBe(640)
    } finally {
      delete Element.prototype.checkVisibility
    }
  })

  it('обрезает содержимое прокручиваемого блока по его краю', () => {
    setup(640)
    const scroller = document.createElement('div')
    scroller.style.overflowY = 'auto'
    scroller.innerHTML = '<p>Длинный текст внутри</p>'
    document.body.append(scroller)
    rects.set(scroller, { bottom: 700, height: 300 })
    rects.set(scroller.querySelector('p'), { bottom: 1800 })

    expect(measureContentBottom(document)).toBe(700)
  })

  it('не продлевает страницу, если демка запретила прокрутку', () => {
    const host = setup(990)
    document.body.style.overflowY = 'hidden'
    reserveSpace(document, host)

    expect(canScrollPage(document)).toBe(false)
    expect(host.shadowRoot.querySelector('.spacer').style.top).toBe('0px')
  })

  it('не трогает стили html демки', () => {
    const host = setup(640)
    reserveSpace(document, host)

    expect(document.documentElement.getAttribute('style')).toBeNull()
  })
})
