/**
 * @jest-environment jsdom
 */

const { JSDOM } = require('jsdom')
const { MAX_LENGTH, clipContent } = require('../../modules/toc-text-crop.js')

const headersTemplate = [
  'Фильдеперсовый Константинопольский шпалоукладчик звукоизвлекает сложносочинённые турбопропизоляционные ноктюрны',
  '         Рыжий кот не смог перепрыгнуть забор из-за избыточного веса                                   ',
  'Это самое обычное предложение, полная длина которого составляет завораживающее значение 90',
  'Сколько солнечных дней в году в Москве? Лучше не знать!',
  'Я бежал по полю, увидел яму и каааак прыг,                           а вот тут приземлился. Неплохо!',
]

const dom = new JSDOM(
  `
  <!DOCTYPE html>
  <a class="toc__link">${headersTemplate[0]}</a>
  <a class="toc__link">${headersTemplate[1]}</a>
  <a class="toc__link">${headersTemplate[2]}</a>
  <a class="toc__link">${headersTemplate[3]}</a>
  <a class="toc__link">${headersTemplate[4]}</a>
  `
)

test('обрезка длины заголовка секции в боковой навигации', () => {
  const tocLinks = dom.window.document.querySelectorAll('.toc__link')

  clipContent(tocLinks, MAX_LENGTH)

  tocLinks.forEach((link) => {
    const linkText = link.textContent.trim().replace(/\s+/g, ' ')

    expect(linkText.length).toBeLessThanOrEqual(90)
  })
})
