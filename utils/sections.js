require('dotenv').config({ path: '../.env' })

module.exports = {
  sectionsAll: process.env.SECTIONS_ALL.split(', ')
}
