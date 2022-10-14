const collection = require('./collection.json')

function getTag(assignedTag) {
  let tag = {}
  if (typeof assignedTag === 'object') {
    const type = Object.keys(assignedTag)[0]
    const typicalTag = collection[type]
    const tagFields = new Set(Object.keys(typicalTag))
    tagFields.add(...Object.keys(assignedTag[type]))
    tagFields.forEach((field) => {
      if (assignedTag[type][field]) {
        tag[field] = assignedTag[type][field]
      } else {
        tag[field] = typicalTag[field]
      }
    })
  } else {
    tag = collection[assignedTag]
  }
}

module.exports = {
  getTag,
}
