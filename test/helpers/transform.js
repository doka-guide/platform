// Помощник для тестов трансформаций.
//
// Трансформации не умеют работать с голым фрагментом разметки: они ищут
// контейнер вроде `.content` или `.article__content-inner` и правят DOM внутри
// него. Поэтому helper собирает документ так же, как это делает .eleventy.js —
// через linkedom, — и передаёт трансформации ровно те три аргумента, которые
// она получает в сборке.

'use strict'

const { parseHTML } = require('linkedom')

const DEFAULT_OUTPUT_PATH = 'dist/css/example/index.html'

/**
 * Прогоняет трансформацию через документ, собранный вокруг разметки.
 *
 * @param {Function} transform трансформация из src/transforms
 * @param {string} html разметка, которая попадёт внутрь body
 * @param {object} [options]
 * @param {string} [options.outputPath] путь к странице, как его видит сборка
 * @returns {Promise<Window>} окно после применения трансформации
 */
async function runTransform(transform, html, options = {}) {
  const { outputPath = DEFAULT_OUTPUT_PATH } = options
  const content = `<!DOCTYPE html><html lang="ru"><head><title>Тест</title></head><body>${html}</body></html>`
  const window = parseHTML(content)

  await transform(window, content, outputPath)

  return window
}

/**
 * Разметка статьи: трансформации ищут именно эти контейнеры.
 * `.content` лежит внутри `.article__content-inner` — так же, как в шаблоне.
 */
function article(inner) {
  return `
    <div class="article__content-inner">
      <div class="article__content content">${inner}</div>
    </div>
  `
}

module.exports = { runTransform, article, DEFAULT_OUTPUT_PATH }
