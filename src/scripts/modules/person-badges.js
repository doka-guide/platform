const MAP_WIDTH = 7

function setValue(shape, value, x, y) {
  switch (shape) {
    case 'gamma-left':
      return x === 1 && (y === 1 || y === 2) ? -1 : value
    case 'gamma-right':
      return x === 2 && (y === 1 || y === 2) ? -1 : value
    case 'zeta-right':
      return (x === 1 && y === 0) || (x === 0 && y === 2) ? -1 : value
    case 'zeta-left':
      return (x === 0 && y === 0) || (x === 1 && y === 2) ? -1 : value
    case 'theta':
      return (x === 0 && y === 1) || (x === 2 && y === 1) ? -1 : value
    default:
      return value
  }
}

function getShapeMatrix(shape, height, width, index) {
  const matrix = []
  for (let i = 0; i < height; i++) {
    const row = []
    for (let j = 0; j < width; j++) {
      row.push(setValue(shape, index, j, i))
    }
    matrix.push(row)
  }
  return matrix
}

function rotateClockwise(matrix) {
  const n = matrix.length
  for (let i = 0; i < n / 2; i++) {
    for (let j = i; j < n - i - 1; j++) {
      const tmp = matrix[i][j]
      matrix[i][j] = matrix[n - j - 1][i]
      matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1]
      matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1]
      matrix[j][n - i - 1] = tmp
    }
  }
  return matrix
}

function rotateShape(matrix, angle) {
  let newMatrix = matrix
  switch (angle) {
    case 270:
      newMatrix = rotateClockwise(newMatrix)
    // eslint-disable-next-line no-fallthrough
    case 180:
      newMatrix = rotateClockwise(newMatrix)
    // eslint-disable-next-line no-fallthrough
    case 90:
      newMatrix = rotateClockwise(newMatrix)
    // eslint-disable-next-line no-fallthrough
    case 0:
      return newMatrix
  }
}

function extractShape(shapeElement, index) {
  let angle = 0
  let shape = ''
  let height = 0
  let width = 0
  shapeElement.classList.forEach((c) => {
    if (c.includes('person-badges__shape--angle-')) {
      angle = Number.parseInt(c.replace('person-badges__shape--angle-', ''))
    } else if (c.includes('person-badges__shape--height-')) {
      height = Number.parseInt(c.replace('person-badges__shape--height-', ''))
    } else if (c.includes('person-badges__shape--width-')) {
      width = Number.parseInt(c.replace('person-badges__shape--width-', ''))
    } else if (c.includes('person-badges__shape--')) {
      shape = c.replace('person-badges__shape--', '')
    }
  })
  return rotateShape(getShapeMatrix(shape, height, width, index), angle)
}

function initMap(maxWidth) {
  const map = [[]]
  for (let i = 0; i < maxWidth; i++) {
    map[0].push(-1)
  }
  return map
}

function addMapRows(map, count = 1) {
  for (let j = 0; j < count; j++) {
    const row = []
    for (let i = 0; i < map[0].length; i++) {
      row.push(-1)
    }
    map.push(row)
  }
}

function addBadgeToMap(badge, map, x, y) {
  if (x + badge[0].length <= map[0].length) {
    for (let i = 0; i < badge.length; i++) {
      const badgeRow = badge[i]
      for (let j = 0; j < badgeRow.length; j++) {
        if (map[i + y][j + x] < 0) {
          map[i + y][j + x] = badgeRow[j]
        }
      }
    }
  }
}

function testNextBadgePlace(badge, map, x, y) {
  let isValidPlace = true
  for (let i = 0; i < badge.length; i++) {
    const badgeRow = badge[i]
    for (let j = 0; j < badgeRow.length; j++) {
      const badgeCell = badgeRow[j]
      if (badgeCell >= 0 && map[i + y][j + x] >= 0) {
        isValidPlace = false
        break
      }
    }
    if (!isValidPlace) {
      break
    }
  }
  return isValidPlace
}

function getNextBadgeCoordinate(badge, map) {
  const mapWidth = map[0].length
  const badgeWidth = badge[0].length
  for (let i = map.length - 1; i >= 0; i--) {
    for (let j = 0; j < mapWidth - badgeWidth; j++) {
      if (i + badge.length > map.length) {
        map.reverse()
        addMapRows(map, i + badge.length - map.length + 1)
        map.reverse()
      }
      if (testNextBadgePlace(badge, map, j, i)) {
        return { x: j, y: i }
      }
    }
  }
  return { x: 0, y: 0 }
}

function removeFreeLines(map) {
  return map.filter((mapRow) => {
    for (let i = 0; i < mapRow.length; i++) {
      if (mapRow[i] >= 0) {
        return true
      }
    }
    return false
  })
}

function arrangeBadges(badges) {
  let map = initMap(MAP_WIDTH)
  badges.forEach((b) => {
    const nextCoordinate = getNextBadgeCoordinate(b, map)
    addBadgeToMap(b, map, nextCoordinate.x, nextCoordinate.y)
  })
  map = removeFreeLines(map)
  const badgeCoordinates = {}
  map.forEach((mapRow, rowIndex) => {
    for (let colIndex = 0; colIndex < mapRow.length; colIndex++) {
      const value = mapRow[colIndex]
      if (value >= 0) {
        let emptyValueCounter = 0
        if (badges[value][0][0] === -1) {
          badges[value][0].forEach((v) => {
            if (v === -1) {
              emptyValueCounter++
            }
          })
        }
        if (!badgeCoordinates[value]) {
          badgeCoordinates[value] = { x: colIndex - emptyValueCounter, y: rowIndex }
        }
      }
    }
  })
  return badgeCoordinates
}

function arrangeShapes(badges, coords) {
  badges.forEach((b, i) => {
    b.parentElement.style = `--start-col: ${coords[i].x + 1}; --start-row: ${coords[i].y + 1};`
  })
}

window.addEventListener('load', () => {
  const badgeGrid = document.querySelector('.person-badges')

  if (!badgeGrid) {
    return
  }

  const badgeMatrices = []
  const badgeShapes = []
  badgeGrid.querySelectorAll('.person-badges__shape').forEach((el, i) => {
    badgeMatrices.push(extractShape(el, i))
    badgeShapes.push(el)
  })

  const arrangement = arrangeBadges(badgeMatrices)
  arrangeShapes(badgeShapes, arrangement)
})
