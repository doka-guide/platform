/**
 * Функция изменяет значение в объекте по пути. Эта фнукция мутирует объект.
 * @param {Array} Путь к значению
 * @param {*} Значение
 * @returns {Object} Новый старый с измененным значением, если такого пути не было, то он появится.
 */

const setPath = (path, value, obj) => {
  if (obj === undefined || value === undefined) {
    return obj
  }

  let currentValue = obj

  path.forEach((element, index) => {
    if (index < path.length - 1) {
      if (!(element in currentValue)) {
        const nextElement = path[index + 1]
        if (typeof nextElement === 'number') {
          currentValue[element] = []
        } else {
          currentValue[element] = {}
        }
      }

      currentValue = currentValue[element]
    } else {
      if (value !== currentValue[element]) {
        currentValue[element] = value
      }
    }
  })

  return obj
}

module.exports = { setPath }
