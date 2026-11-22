// Неразрывные пробелы по правилам русской вёрстки: короткие предлоги, союзы и частицы
// не остаются висеть в конце строки, а тире не начинает строку.
// Работает по текстовым узлам всей страницы, код и скрипты не трогает.
const NBSP = '\u00A0'
const SKIP = 'code, pre, kbd, samp, script, style, textarea, svg, math'

// Слова из одной-двух букв (в, и, на, не) почти всегда служебные. Из трёхбуквенных — только предлоги.
// Частицы исключены: они привязываются к предыдущему слову, а не к следующему
const PARTICLE = 'ли|ль|же|ж|бы|б'
const SHORT_WORD = `(?!(?:${PARTICLE})(?:\\s|$))(?:[а-яё]{1,2}|без|для|под|над|при|про|или)`
// граница слева — просмотр назад: так цепочка «и в доме» привязывается за один проход
const AFTER_SHORT_WORD = new RegExp(`(?<=^|[\\s(«„"—])(${SHORT_WORD})\\s+(?=\\S)`, 'giu')
const BEFORE_PARTICLE = new RegExp(`(\\S)\\s+(${PARTICLE})(?=[\\s.,!?;:…)»]|$)`, 'giu')
const BEFORE_DASH = /(\S)\s+(?=[—–](\s|$))/gu
// пробел перед тире в начале узла: слева от него элемент, например код
const LEADING_DASH = /^\s+(?=[—–](\s|$))/u
// предлог в конце узла привязываем, только если за ним что-то есть: иначе пробел перед закрывающим тегом станет видимым
const TRAILING_SHORT_WORD = new RegExp(`(?<=^|[\\s(«„"—])(${SHORT_WORD})\\s+$`, 'iu')
const ENDS_WITH_SHORT_WORD = new RegExp(`(?:^|[\\s(«„"—])${SHORT_WORD}$`, 'iu')
const INLINE = new Set('A ABBR B DEL EM I INS MARK Q S SMALL SPAN STRONG SUB SUP U'.split(' '))

// Текст сразу после узла, если между ними только закрывающие строчные теги: «попадает в</strong> диапазон».
// Из блока не выходим: неразрывный пробел между абзацами стал бы пустой строкой
function textAfter(node) {
  let current = node
  while (!current.nextSibling && current.parentElement && INLINE.has(current.parentElement.nodeName)) {
    current = current.parentElement
  }
  const next = current.nextSibling
  return next && next.nodeType === 3 ? next : null
}

function typograph(text) {
  return text
    .replace(AFTER_SHORT_WORD, `$1${NBSP}`)
    .replace(BEFORE_PARTICLE, `$1${NBSP}$2`)
    .replace(BEFORE_DASH, `$1${NBSP}`)
}

/**
 * @param {Window} window
 * @param {string} content
 * @param {string} outputPath
 */
module.exports = function (window, content, outputPath) {
  // демки — самостоятельные страницы со своей вёрсткой
  if (outputPath && outputPath.includes('/demos/')) {
    return
  }

  const document = window.document
  const walker = document.createTreeWalker(document.body, 4)
  const nodes = []

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.parentElement && !node.parentElement.closest(SKIP)) {
      nodes.push(node)
    }
  }

  for (const node of nodes) {
    let text = typograph(node.data)
    if (node.nextSibling) {
      text = text.replace(TRAILING_SHORT_WORD, `$1${NBSP}`)
    }
    // после <br> тире законно начинает строку, а неразрывный пробел стал бы видимым отступом
    if (node.previousSibling && node.previousSibling.nodeName !== 'BR') {
      text = text.replace(LEADING_DASH, NBSP)
    }
    if (text !== node.data) {
      node.data = text
    }

    const next = ENDS_WITH_SHORT_WORD.test(text) && textAfter(node)
    if (next && !next.parentElement.closest(SKIP)) {
      next.data = next.data.replace(/^\s+(?=\S)/u, NBSP)
    }
  }
}
