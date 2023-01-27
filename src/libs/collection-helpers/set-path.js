/**
 * Функция изменяет значение в объекте по пути. Эта фнукция мутирует объект.
 * @param {Array} Путь – последовательность ключей в объекте
 * @param {*} Новое значение
 * @returns {Object} Cтарый объект с изменённым значением по пути, если пути ещё не было, то в объект добавятся
 * новые ключи.
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
