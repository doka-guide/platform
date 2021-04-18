require('dotenv').config({ path: '.env' })

module.exports = {
  sectionsAll: process.env.SECTIONS.split(', '),
  contentRepFolders: process.env.CONTENT_REP_FOLDERS.split(', '),
  defaultPathToContent: process.env.PATH_TO_CONTENT
}
