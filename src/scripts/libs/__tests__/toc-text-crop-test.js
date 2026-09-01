/**
 * @jest-environment jsdom
 */

const { MAX_LENGTH, clipContent } = require('../../modules/toc-text-crop.js')
const headersTemplate = [
  'Фильдеперсовый Константинопольский шпалоукладчик звукоизвлекает сложносочинённые турбопропизоляционные ноктюрны',
  'Это самое обычное предложение, полная длина которого составляет завораживающее значение 90',
  'Сколько солнечных дней в году в Москве? Лучше не знать!',
  ' Рыжий кот не смог перепрыгнуть забор из-за избыточного веса                                   ',
]

document.body.innerHTML = headersTemplate.map((header) => `<a class="toc__link">${header}</a>`).join('\n')

test('обрезка длины заголовка секции в боковой навигации', () => {
  const tocLinks = document.querySelectorAll('.toc__link')

  clipContent(tocLinks, MAX_LENGTH)

  tocLinks.forEach((link) => {
    const linkText = link.textContent.trim().replace(/\s+/g, ' ')

    expect(linkText.length).toBeLessThanOrEqual(90)
  })
})
