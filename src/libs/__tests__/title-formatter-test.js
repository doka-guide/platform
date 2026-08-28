const { titleFormatter } = require('../title-formatter/title-formatter')

describe('titleFormatter', () => {
  it('склеивает части длинным тире', () => {
    expect(titleFormatter(['display', 'CSS', 'Дока'])).toBe('display — CSS — Дока')
  })

  it('выбрасывает пустые части', () => {
    expect(titleFormatter(['display', undefined, 'Дока'])).toBe('display — Дока')
    expect(titleFormatter(['display', '', null, 'Дока'])).toBe('display — Дока')
  })

  it('возвращает единственную часть без разделителя', () => {
    expect(titleFormatter(['Дока'])).toBe('Дока')
  })

  it('возвращает пустую строку, когда частей нет', () => {
    expect(titleFormatter([])).toBe('')
    expect(titleFormatter([null, undefined, ''])).toBe('')
  })
})
