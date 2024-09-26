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
  line: {
    height: 1,
    width: 4,
  },
  'short-line': {
    height: 1,
    width: 2,
  },
  square: {
    height: 2,
    width: 2,
  },
  theta: {
    height: 2,
    width: 3,
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
  const values = Object.values(array)
  return values[getRandomInt(values.length)]
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
    let predefinedBadge = collection[type]
    if (!predefinedBadge) {
      badge = assignedBadge[type]
    } else {
      const badgeFields = new Set(Object.keys(predefinedBadge))
      badgeFields.add(...Object.keys(assignedBadge[type]))
      badgeFields.forEach((field) => {
        if (assignedBadge[type][field]) {
          badge[field] = assignedBadge[type][field]
        } else {
          badge[field] = predefinedBadge[field]
        }
      })
    }
  } else {
    badge = collection[assignedBadge]
  }
  if (!badge.angle && badge.angle !== 0) {
    badge.angle = getRandRotationAngle()
  }
  if (!badge.field) {
    badge.field = {}
  }
  if (badge.angle === 90 || badge.angle === 270) {
    badge.field['height'] = SHAPES[badge.shape].width
    badge.field['width'] = SHAPES[badge.shape].height
  } else {
    badge.field = SHAPES[badge.shape]
  }
  if (!badge.color) {
    badge.color = getRandColor()
  }
  return badge
}

module.exports = {
  getBadge,
}
