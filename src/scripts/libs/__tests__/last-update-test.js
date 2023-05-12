/**
 * @jest-environment jsdom
 */

import { init } from '../../modules/last-update'

const createPastDate = (passedSeconds) => {
  // Создаёт дату на момент «N-секунд назад» и возвращает её для последующих проверок
  const date = new Date()

  if (passedSeconds >= 3600) {
    date.setHours(date.getHours() - passedSeconds / 3600)
  } else if (passedSeconds >= 60) {
    date.setMinutes(date.getMinutes() - passedSeconds / 60)
  } else {
    date.setSeconds(date.getSeconds() - passedSeconds)
  }

  const time = document.createElement('time')
  time.setAttribute('data-relative-time', null)
  time.setAttribute('datetime', date.toISOString())

  if (document.body.hasChildNodes()) {
    document.body.firstChild.remove()
  }

  document.body.append(time)

  return time
}

describe('last-update', () => {
  it('должен создавать языковую запись времени в секундах', () => {
    const date = createPastDate(30)
    init()
    expect(date.textContent).toMatch('30 секунд назад')
  })

  it('должен создавать языковую запись времени в минутах', () => {
    const date = createPastDate(600)
    init()
    expect(date.textContent).toMatch('10 минут назад')
  })

  it('должен создавать языковую запись времени в часах и округлять значение в большую сторону', () => {
    const date = createPastDate(7000)
    init()
    expect(date.textContent).toMatch('2 часа назад')
  })

  it('должен проигнорировать создание языковой записи времени', () => {
    const date = createPastDate(86400)
    init()
    expect(date.textContent).toMatch('')
  })
})
