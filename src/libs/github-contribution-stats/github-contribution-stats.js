const issues = require('../../../.issues.json')

const stats = issues.reduce((result, issue) => {
  const user = issue['user']['login'].toLowerCase()
  const isPullRequest = 'pull_request' in issue
  const pullRequestIncrement = isPullRequest ? 1 : 0
  const issueIncrement = !isPullRequest ? 1 : 0
  const pullRequestDate = isPullRequest && issue['closed_at'] ? new Date(Date.parse(issue['closed_at'])) : new Date()

  if (result && user in result) {
    result[user]['issues'] += issueIncrement
    result[user]['pr'] += pullRequestIncrement
    if (result[user]['first'] > pullRequestDate) {
      result[user]['first'] = pullRequestDate
    }
    return result
  } else {
    return {
      ...result,
      [user]: {
        issues: issueIncrement,
        pr: pullRequestIncrement,
        first: pullRequestDate,
      },
    }
  }
}, {})

function getAuthorContributionStats() {
  return stats
}

module.exports = {
  getAuthorContributionStats,
}
