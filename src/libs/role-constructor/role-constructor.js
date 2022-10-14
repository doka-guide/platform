const collection = require('./collection.json')

function getRole(assignedRole) {
  let role = {}
  if (typeof assignedRole === 'object') {
    const type = Object.keys(assignedRole)[0]
    const typicalRole = collection[type]
    const roleFields = new Set(Object.keys(typicalRole))
    roleFields.add(...Object.keys(assignedRole[type]))
    roleFields.forEach((field) => {
      if (assignedRole[type][field]) {
        role[field] = assignedRole[type][field]
      } else {
        role[field] = typicalRole[field]
      }
    })
  } else if (typeof assignedRole === 'string') {
    role = collection[assignedRole]
  }
  return role
}

module.exports = {
  getRole,
}
