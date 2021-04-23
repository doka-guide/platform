require('dotenv').config({ path: '.env' })

module.exports = {
  mainSections: process.env.SECTIONS.split(', '),
  contentRepFolders: process.env.CONTENT_REP_GITHUB_URL_FOLDERS.split(', '),
  defaultPathToContent: process.env.PATH_TO_CONTENT,
  dokaOrgLink: process.env.DOKA_ORG,
  platformRepLink: process.env.PLATFORM_REP_GITHUB_URL,
  contentRepLink: process.env.CONTENT_REP_GITHUB_URL
}
