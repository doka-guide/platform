// Места разрыва в коде: перед точкой, слешем и открывающей скобкой, после запятой и закрывающей скобки.
// Тогда знак в начале строки показывает, что это продолжение кода, а не перенос слова по слогам.
// После дефиса браузер разрывает строку сам, и это совпадает с правилом русского языка:
// при переносе слова через дефис дефис остаётся в конце строки. Поэтому дефиса в списке нет
const BREAK_BEFORE = new Set(['.', '_', '~', '/', '\\', '?', '#', '%', '(', '[', ':', '='])
const BREAK_AFTER = new Set([',', ')', ']'])
const SYMBOLS = new Set([...BREAK_BEFORE, ...BREAK_AFTER, '-'])

const isUpper = (ch) => ch !== ch.toLowerCase()
const isLower = (ch) => ch !== ch.toUpperCase()

/**
 * Индексы символов, перед которыми можно разорвать строку кода.
 * Края кода не трогаем: разрыв там отрывает знак препинания после кода или ставит код на пустую строку.
 * @param {string} text
 * @returns {number[]}
 */
function findBreaks(text) {
  const breaks = []

  // последний знак тоже не отрываем: src/, a.
  for (let i = 1; i < text.length - 1; i++) {
    const prev = text[i - 1]
    const ch = text[i]
    const next = text[i + 1]

    if (/\s/.test(prev) || /\s/.test(ch)) {
      continue
    }

    // числа не разрываем: 1.5rem, 50%, #FF00AA, 0xFF
    const inNumber = /\d/.test(prev) || /^\d/.test(text.slice(0, i).match(/[\w]*$/)[0])
    const camelHump = !inNumber && isUpper(ch) && (isLower(prev) || (isUpper(prev) && next && isLower(next)))
    // пустые скобки остаются при имени: fetch(), а не fetch / ()
    const emptyParens = ch === '(' && next === ')'
    const beforeSymbol = BREAK_BEFORE.has(ch) && !(inNumber && /[.%]/.test(ch)) && !SYMBOLS.has(prev) && !emptyParens
    const afterSymbol = BREAK_AFTER.has(prev) && !SYMBOLS.has(ch)

    if (camelHump || beforeSymbol || afterSymbol) {
      breaks.push(i)
    }
  }

  return breaks
}

const TITLES = '.featured-article__title, .article__title'

/**
 * Неразрывные куски заголовка: строку можно разорвать только на обычном пробеле и на <wbr>,
 * а с splitHyphens — ещё и после дефиса в коде, там её разрывает сам браузер.
 * Неразрывный пробел, знаки препинания и соседний код без пробела остаются в одном куске.
 * @returns {Array<{length: number, codes: Set<Element>}>}
 */
function titleRuns(title, splitHyphens) {
  const runs = []
  let run = { length: 0, codes: new Set() }
  const cut = () => {
    if (run.length > 0) runs.push(run)
    run = { length: 0, codes: new Set() }
  }

  const walk = (node) => {
    for (const child of node.childNodes) {
      if (child.nodeName === 'WBR') {
        cut()
      } else if (child.nodeType === 1) {
        walk(child)
      } else if (child.nodeType === 3) {
        const code = child.parentElement.closest('code')
        for (const ch of child.data) {
          if (/[^\S\u00A0]/.test(ch)) {
            cut()
            continue
          }
          run.length++
          if (code) run.codes.add(code)
          if (splitHyphens && code && ch === '-') cut()
        }
      }
    }
  }

  walk(title)
  cut()
  return runs
}

function longestRun(runs, code) {
  return Math.max(0, ...runs.filter((run) => run.codes.has(code)).map((run) => run.length))
}

/**
 * расстановка <wbr> в элементах кода
 * @param {Window} window
 */
module.exports = function (window) {
  const document = window.document

  for (const codeElement of document.querySelectorAll('.code-fix')) {
    // код в заголовках простой, но работаем с текстовыми узлами, а не с innerHTML:
    // так в разрывы не попадут сущности вроде &lt;
    const textNodes = [...codeElement.childNodes].filter((node) => node.nodeType === 3)

    for (const node of textNodes) {
      const text = node.data
      const breaks = findBreaks(text)

      if (breaks.length === 0) {
        continue
      }

      const fragment = document.createDocumentFragment()
      let start = 0
      for (const i of breaks) {
        fragment.append(document.createTextNode(text.slice(start, i)), document.createElement('wbr'))
        start = i
      }
      fragment.append(document.createTextNode(text.slice(start)))
      node.replaceWith(fragment)
    }
  }

  // В узкой карточке и в заголовке на телефоне крупный код уменьшается:
  // короткий код с дефисом вроде text-align — чтобы встал в строку целиком,
  // длинный — чтобы целиком встал хотя бы кусок между разрывами
  for (const title of document.querySelectorAll(TITLES)) {
    const words = titleRuns(title, false)
    const segments = titleRuns(title, true)
    for (const code of title.querySelectorAll('code')) {
      code.setAttribute(
        'style',
        `--code-word: ${longestRun(words, code)}; --code-segment: ${longestRun(segments, code)}`,
      )
    }
  }
}

module.exports.findBreaks = findBreaks
