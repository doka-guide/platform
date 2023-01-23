const os = require('os')
const { Octokit } = require('@octokit/core')
const Cache = require('@11ty/eleventy-cache-assets')

Cache.concurrency = os.cpus().length

const { GITHUB_TOKEN } = process.env

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
})

const CACHE_KEY_STAT = 'GITHUB_AUTHORS_CONTRIBUTION'
const CACHE_KEY_EXISTS = 'GITHUB_AUTHORS_EXISTS'
const CACHE_KEY_ID = 'GITHUB_AUTHORS_ID'
const CACHE_KEY_ACTIONS = 'GITHUB_AUTHORS_ACTIONS'
const CACHE_DURATION = '1d'

const assetCache = {}
assetCache['stat'] = new Cache.AssetCache(CACHE_KEY_STAT)
assetCache['exists'] = new Cache.AssetCache(CACHE_KEY_EXISTS)
assetCache['id'] = new Cache.AssetCache(CACHE_KEY_ID)
assetCache['actions'] = new Cache.AssetCache(CACHE_KEY_ACTIONS)

const responsePromise = {}
responsePromise['stat'] = undefined
responsePromise['exists'] = undefined
responsePromise['id'] = undefined
responsePromise['actions'] = undefined

// graphql не поддерживает '-' в именах, поэтому применяем хак с заменой
const escapedOriginalSymbol = '-'
const escapedSymbol = '____'
function escape(data) {
  return data.replaceAll(escapedOriginalSymbol, escapedSymbol)
}

function getData(query) {
  return octokit.graphql(`
    query {
      ${query}
    }
  `)
}

// Запросы GraphQL к единичным сущностям

function searchContributions({ author, repo, type }) {
  const query = `repo:${repo} type:${type} author:${author}`
  return `
    search(query: "${query}", type: ISSUE) {
      count: issueCount
    }
  `
}

function userExists({ author }) {
  return `
    search(
      query: "user:${author}",
      type: USER
    ) {
      userCount
    }
  `
}

function userID({ author }) {
  return `
    user(login: "${author}") {
      id
    }
  `
}

function repoActions({ authorID, repo }) {
  const repoParts = repo.split('/')
  if (!authorID) {
    return ''
  }
  return `
    repository(
      owner: "${repoParts[0]}",
      name: "${repoParts[1]}"
    ) {
      people: defaultBranchRef {
        target {
          ... on Commit {
            history(
              author: { id: "${authorID}" },
              path: "people"
            ) {
              nodes {
                pushedDate
              }
            }
          }
        }
      }
    }
  `
}

// Построение единичных запросов к GraphQL по всем авторам

function buildQueryForAuthorContribution({ author, repo, type }) {
  return `
    ${escape(author)}: ${searchContributions({ author, repo, type })}
  `
}

function buildQueryForAuthorExists({ author }) {
  return `
    ${escape(author)}: ${userExists({ author })}
  `
}

function buildQueryForAuthorID({ author }) {
  const query = `
    ${escape(author)}: ${userID({ author })}
  `
  return query
}

function buildQueryForAuthorAction({ author, authorID, repo }) {
  return `
    ${escape(author)}: ${repoActions({ authorID, repo })}
  `
}

// Построение групповых запросов к GraphQL по всем авторам

function buildQueryForAuthorContributions({ authors, repo, type }) {
  return authors.map((author) => buildQueryForAuthorContribution({ author, repo, type })).join('')
}

function buildQueryForAuthorsExists({ authors }) {
  return authors.map((author) => buildQueryForAuthorExists({ author })).join('')
}

function buildQueryForAuthorIDs({ authors }) {
  return authors.map((author) => buildQueryForAuthorID({ author })).join('')
}

function buildQueryForAuthorActions({ authors, authorIDs, repo }) {
  return authors
    .map((author) => {
      if (authorIDs[author]) {
        return buildQueryForAuthorAction({ author, authorID: authorIDs[author].id, repo })
      } else {
        return ''
      }
    })
    .join('')
}

// Отправка запросов к GraphQL

async function getAuthorsContribution({ authors, repo }) {
  if (GITHUB_TOKEN === '') {
    return []
  }
  const [issueResponse, prResponse] = await Promise.all([
    getData(buildQueryForAuthorContributions({ authors, repo, type: 'issue' })),
    getData(buildQueryForAuthorContributions({ authors, repo, type: 'pr' })),
  ])

  return authors.reduce((usersData, author) => {
    const escapedName = escape(author)
    usersData[author] = {
      issues: issueResponse[escapedName]?.count ?? 0,
      pr: prResponse[escapedName]?.count ?? 0,
    }
    return usersData
  }, {})
}

async function getAuthorsExists({ authors }) {
  if (GITHUB_TOKEN === '') {
    return []
  }

  const [authorExists] = await Promise.all([getData(buildQueryForAuthorsExists({ authors }))])

  return authors.reduce((usersData, author) => {
    const escapedName = escape(author)
    usersData[author] = authorExists[escapedName]
    return usersData
  }, {})
}

async function getAuthorsIDs({ authors }) {
  if (GITHUB_TOKEN === '') {
    return []
  }

  const [authorIDs] = await Promise.all([getData(buildQueryForAuthorIDs({ authors }))])

  return authors.reduce((usersData, author) => {
    const escapedName = escape(author)
    usersData[author] = authorIDs[escapedName]
    return usersData
  }, {})
}

async function getActionsInRepo({ authors, authorIDs, repo }) {
  if (GITHUB_TOKEN === '') {
    return []
  }

  let authorActions = {}

  const chunkSize = 10
  for (let i = 0; i < authors.length; i += chunkSize) {
    const chunk = authors.slice(i, i + chunkSize)
    const [chunkAuthorActions] = await Promise.all([
      getData(buildQueryForAuthorActions({ authors: chunk, authorIDs, repo })),
    ])
    authorActions = {
      ...authorActions,
      ...chunkAuthorActions,
    }
  }

  return authors.reduce((usersData, author) => {
    const escapedName = escape(author)
    usersData[author] = authorActions[escapedName]
    return usersData
  }, {})
}

// Использование локального кеша

async function getAuthorsContributionWithCache({ authors, repo }) {
  if (assetCache['stat'].isCacheValid(CACHE_DURATION)) {
    return assetCache['stat'].getCachedValue()
  }

  responsePromise['stat'] = responsePromise['stat'] || getAuthorsContribution({ authors, repo })
  const response = await responsePromise['stat']
  await assetCache['stat'].save(response, 'json')

  return response
}

async function getAuthorsIDsWithCache({ authors, repo }) {
  if (assetCache['id'].isCacheValid(CACHE_DURATION)) {
    return assetCache['id'].getCachedValue()
  }

  responsePromise['id'] = responsePromise['id'] || getAuthorsIDs({ authors, repo })
  const response = await responsePromise['id']
  await assetCache['id'].save(response, 'json')

  return response
}

async function getAuthorsExistsWithCache({ authors }) {
  if (assetCache['exists'].isCacheValid(CACHE_DURATION)) {
    return assetCache['exists'].getCachedValue()
  }

  responsePromise['exists'] = responsePromise['exists'] || getAuthorsExists({ authors })
  const response = await responsePromise['exists']
  await assetCache['exists'].save(response, 'json')

  return response
}

async function getActionsInRepoWithCache({ authors, authorIDs, repo }) {
  if (assetCache['actions'].isCacheValid(CACHE_DURATION)) {
    return assetCache['actions'].getCachedValue()
  }

  responsePromise['actions'] = responsePromise['actions'] || getActionsInRepo({ authors, authorIDs, repo })
  const response = await responsePromise['actions']
  await assetCache['actions'].save(response, 'json')

  return response
}

module.exports = {
  getAuthorsContributionWithCache,
  getAuthorsExistsWithCache,
  getAuthorsIDsWithCache,
  getActionsInRepoWithCache,
}
