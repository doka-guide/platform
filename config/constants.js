require('dotenv').config({ path: '.env' })

module.exports = {
  mainSections: process.env.SECTIONS.split(', '),
  contentRepFolders: process.env.CONTENT_REP_FOLDERS.split(', '),
  defaultPathToContent: process.env.PATH_TO_CONTENT,
  dokaCommunityLink: process.env.DOKA_COMMUNITY,
  platformRepLink: process.env.PLATFORM_REP,
  contentRepLink: process.env.CONTENT_REP
}
