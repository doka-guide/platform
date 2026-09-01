const { getRole } = require('../role-constructor/role-constructor')
const collection = require('../role-constructor/collection.json')

const KNOWN_ROLE = 'doka-core-team'

describe('getRole', () => {
  it('разворачивает строку в описание роли из коллекции', () => {
    expect(getRole(KNOWN_ROLE)).toEqual(collection[KNOWN_ROLE])
  })

  it('позволяет переопределить отдельные поля', () => {
    const role = getRole({ [KNOWN_ROLE]: { title: 'Своё название' } })

    expect(role.title).toBe('Своё название')
    // Остальные поля берутся из коллекции
    expect(role.color).toBe(collection[KNOWN_ROLE].color)
    expect(role.url).toBe(collection[KNOWN_ROLE].url)
  })

  it('возвращает пустой объект для неизвестного типа роли', () => {
    expect(getRole({ 'нет-такой-роли': { title: 'Что-то' } })).toEqual({})
  })

  it('возвращает undefined для неизвестной строки', () => {
    expect(getRole('нет-такой-роли')).toBeUndefined()
  })

  it('не падает на пустом объекте', () => {
    expect(getRole({})).toEqual({})
  })
})
