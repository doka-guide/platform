const { isProdEnv } = require('../../../config/env')

// Файла `.issues.json` в репозитории нет: его готовит отдельный репозиторий
// doka-guide/cache. В боевой сборке он обязателен — без него страницы
// участников соберутся с пустой статистикой и уедут такими на сайт. А для
// разработки статистика вкладов не нужна: раньше её отсутствие роняло
// `npm start` на первом же запуске, ещё до рендера, у любого, кто не сходил
// за файлом в третий репозиторий.
function readIssues() {
  try {
    return require('../../../.issues.json')
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      throw error
    }
    if (isProdEnv) {
      throw new Error(
        'Не найден .issues.json — без него боевая сборка соберёт страницы участников без статистики. ' +
          'Как его получить, написано в docs/how-to-run.md.',
        { cause: error },
      )
    }
    console.warn('Не найден .issues.json — статистика вкладов будет пустой. Подробности в docs/how-to-run.md.')
    return []
  }
}

const stats = readIssues().reduce((result, issue) => {
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
