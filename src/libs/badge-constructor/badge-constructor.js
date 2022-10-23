const collection = require('./collection.json')

const SHAPES = {
  'gamma-left': {
    height: 3,
    width: 2,
  },
  'gamma-right': {
    height: 3,
    width: 2,
  },
  theta: {
    height: 2,
    width: 3,
  },
  line: {
    height: 4,
    width: 1,
  },
  'short-line': {
    height: 2,
    width: 1,
  },
  square: {
    height: 2,
    width: 2,
  },
  'zeta-right': {
    height: 3,
    width: 2,
  },
  'zeta-left': {
    height: 3,
    width: 2,
  },
}

const COLORS = {
  blue: '#2E9AFF',
  green: '#41E847',
  orange: '#FF852E',
  pink: '#F498AD',
  purple: '#C56FFF',
  yellow: '#FFD829',
}

const ORIENTATION = {
  topBottom: 0,
  leftRight: 90,
  bottomTop: 180,
  rightLeft: 270,
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

function getRandValue(array) {
  const valueArray = Object.keys(array)
  const valueIndex = getRandomInt(valueArray.length)
  const value = valueArray[valueIndex]
  return array[value]
}

function getRandColor() {
  return getRandValue(COLORS)
}

function getRandRotationAngle() {
  return getRandValue(ORIENTATION)
}

function getBadge(assignedBadge) {
  let badge = {}
  if (typeof assignedBadge === 'object') {
    const type = Object.keys(assignedBadge)[0]
    const typicalBadge = collection[type]
    const badgeFields = new Set(Object.keys(typicalBadge))
    badgeFields.add(...Object.keys(assignedBadge[type]))
    badgeFields.forEach((field) => {
      if (assignedBadge[type][field]) {
        badge[field] = assignedBadge[type][field]
      } else {
        badge[field] = typicalBadge[field]
      }
    })
  } else {
    badge = collection[assignedBadge]
  }
  if (!badge['angle']) {
    badge['angle'] = getRandRotationAngle()
  }
  if (badge['angle'] === 90 || badge['angle'] === 270) {
    if (!badge['field']) {
      badge['field'] = {}
      badge['field']['height'] = SHAPES[badge.shape].width
      badge['field']['width'] = SHAPES[badge.shape].height
    } else {
      badge['field'] = SHAPES[badge.shape]
    }
  }
  if (!badge['src'] && !badge['color']) {
    badge['color'] = getRandColor()
  }
  return badge
}

module.exports = {
  getBadge,
}
