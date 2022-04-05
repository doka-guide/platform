require('dotenv').config({ path: '.env' })

const DEFAULT_ENVS = {
  BASE_URL: 'https://doka.guide',
  SECTIONS: 'html, css, js, tools, recipes',
  CONTENT_REP_GITHUB: 'https://github.com/doka-guide/content.git',
  CONTENT_HOT_BACKLOG: 'https://github.com/doka-guide/content/milestone/22',
  CONTENT_REP_FOLDERS: 'html, css, js, tools, recipes, people, pages, settings',
  PATH_TO_CONTENT: '../content',
  DOKA_ORG: 'DOKA_ORG',
  PLATFORM_REP_GITHUB_URL: 'https://github.com/doka-guide/platform',
  CONTENT_REP_GITHUB_URL: 'https://github.com/doka-guide/content',
}

function getEnv(envKey) {
  return process.env[envKey] || DEFAULT_ENVS[envKey]
}

module.exports = {
  baseUrl: getEnv('BASE_URL'),
  mainSections: getEnv('SECTIONS').split(', '),
  contentRepGithub: getEnv('CONTENT_REP_GITHUB'),
  contentRepFolders: getEnv('CONTENT_REP_FOLDERS').split(', '),
  defaultPathToContent: getEnv('PATH_TO_CONTENT'),
  dokaOrgLink: getEnv('DOKA_ORG'),
  platformRepLink: getEnv('PLATFORM_REP_GITHUB_URL'),
  contentRepLink: getEnv('CONTENT_REP_GITHUB_URL'),
  contentHotBacklogLink: getEnv('CONTENT_HOT_BACKLOG'),
}
