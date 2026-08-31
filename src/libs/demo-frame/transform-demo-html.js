const { parseHTML } = require('linkedom')

/**
 * Внедряет в HTML демки автоматическую шапку (ссылка на doka.guide) и подвал
 * (ссылка на статью и на автора). Видимость управляется исключительно через
 * src/scripts/demo-frame.js (класс .demo-frame--visible на <html>), без
 * query-параметров — демка не должна ничего знать про embed.
 *
 * Идемпотентна: повторный вызов на уже обработанном файле возвращает его
 * без изменений (gulp может пересобирать dist без предварительной чистки).
 *
 * @param {string} html — исходный HTML демки
 * @param {{ section: string, slug: string, authorUsername: string, authorName: string, accent: string }} data
 * @returns {string} обновлённый HTML
 */
function transformDemoHtml(html, data) {
  const { document } = parseHTML(html)

  if (document.querySelector('.demo-frame-footer')) {
    return document.toString()
  }

  const styleLink = document.createElement('link')
  styleLink.setAttribute('rel', 'stylesheet')
  styleLink.setAttribute('href', '/styles/demo-frame.css')
  document.head.appendChild(styleLink)

  // Без defer/async: класс должен выставиться до первой отрисовки,
  // иначе в отдельной вкладке будет видна вспышка шапки/футера.
  const script = document.createElement('script')
  script.setAttribute('src', '/scripts/demo-frame.js')
  document.head.insertBefore(script, document.head.firstChild)

  const existingStyle = document.body.getAttribute('style') || ''
  const separator = existingStyle && !existingStyle.trim().endsWith(';') ? ';' : ''
  document.body.setAttribute('style', `${existingStyle}${separator}--demo-frame-accent: ${data.accent}`)

  const logo = document.createElement('a')
  logo.setAttribute('class', 'demo-frame-logo')
  logo.setAttribute('href', 'https://doka.guide/')
  logo.textContent = 'U•ᴥ•U Дока'
  document.body.appendChild(logo)

  const footer = document.createElement('footer')
  footer.setAttribute('class', 'demo-frame-footer')
  footer.innerHTML = `
    <a href="https://doka.guide/${data.section}/${data.slug}/">${data.slug} — Дока</a>
    <a href="https://doka.guide/people/${data.authorUsername}/">${data.authorName}</a>
  `
  document.body.appendChild(footer)

  return document.toString()
}

module.exports = { transformDemoHtml }
