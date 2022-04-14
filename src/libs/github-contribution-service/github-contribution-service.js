const os = require('os')
const { Octokit } = require('@octokit/core')
const Cache = require('@11ty/eleventy-cache-assets')

Cache.concurrency = os.cpus().length

const { GITHUB_TOKEN } = process.env

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
})

const CACHE_KEY = 'GITHUB_AUTHORS_CONTRIBUTION'
const CACHE_DURATION = '1d'
const assetCache = new Cache.AssetCache(CACHE_KEY)
let responsePromise

// graphql не поддерживает '-' в именах, поэтому применяем хак с заменой
const escapedOriginalSymbol = '-'
const escapedSymbol = '____'
function escape(data) {
  return data.replaceAll(escapedOriginalSymbol, escapedSymbol)
}

function search({ repo, author, type }) {
  const query = `repo:${repo} type:${type} author:${author}`
  return `
    search(query: "${query}", type: ISSUE) {
      count: issueCount
    }
  `
}

function buildQueryForAuthor({ author, repo, type }) {
  return `
    ${escape(author)}: ${search({ repo, author, type })}
  `
}

function buildQueryForAuthors({ authors, repo, type }) {
  return authors.map((author) => buildQueryForAuthor({ author, repo, type })).join('')
}

function getData(query) {
  return octokit.graphql(`
    query {
      ${query}
    }
  `)
}

async function getAuthorsContribution({ authors, repo }) {
  if (GITHUB_TOKEN === '') {
    return []
  }
  const [issueResponse, prResponse] = await Promise.all([
    getData(buildQueryForAuthors({ authors, repo, type: 'issue' })),
    getData(buildQueryForAuthors({ authors, repo, type: 'pr' })),
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

async function getAuthorsContributionWithCache({ authors, repo }) {
  if (assetCache.isCacheValid(CACHE_DURATION)) {
    return assetCache.getCachedValue()
  }

  responsePromise = responsePromise || getAuthorsContribution({ authors, repo })
  const response = await responsePromise
  await assetCache.save(response, 'json')

  return response
}

module.exports = {
  getAuthorsContributionWithCache,
}
