const path = require('path')
const util = require('util')
const { execFile } = require('child_process')
const { compose } = require('stream')

const gulp = require('gulp')

const { defaultPathToContent, mainSections } = require('../../config/constants')

async function executeProgram(program, args, options) {
  const { stdout } = await util.promisify(execFile)(program, args.split(' '), options)
  return stdout
}

// function getLastCommitDate(filePath, options) {
//   return executeProgram('git', `--no-pager log -n 1 --format="%ci" -- ${filePath}`, options)
// }

// function getFirstCommitDate(filePath, options) {
//   return executeProgram('git', `--no-pager log --reverse --format="%ci" -- ${filePath}`, options)
//     // `git log` с опцией `reverse -n1` выводит последний коммит, а не первый
//     // поэтому выводим списком и парсим
//     .then(output => output.split('\n')[0])
// }

function getCommitDates(filePath, options) {
  return executeProgram('git', `--no-pager log --format="%ci" -- ${filePath}`, options)
    .then(output => {
      const dates = output.split('\n')
      dates.pop() // удаляем последний пустой элемент
      return {
        createdAt: dates.pop(),
        updatedAt: dates.shift()
      }
    })
}

async function getDatesData() {
  const pathToContent = path.resolve(process.cwd(), defaultPathToContent)
  const articlesData = {}

  const stream = compose(
    gulp.src(`{${mainSections.join(',')}}/*/index.md`, {
      cwd: pathToContent
    }),
    async function* (stream) {
      for await (const file of stream) {
        const articleId = path.relative(pathToContent, file.dirname)
        const { createdAt, updatedAt } = await getCommitDates(articleId, {
          cwd: pathToContent
        })
        yield {
          articleId,
          createdAt,
          updatedAt
        }
      }
    }
  )

  for await (const chunk of stream) {
    const { articleId, createdAt, updatedAt } = chunk

    articlesData[articleId] = {
      createdAt,
      updatedAt
    }
  }

  return articlesData
}

// вычисление дат через запуск процесса git занимает продолжительное время, поэтому делаем кеширование
async function memo(func, key) {
  if (!global[key]) {
    global[key] = await func()
  }

  return global[key]
}


const getCachedDatesData = memo(getDatesData, '__articles-dates-data__')

module.exports = getCachedDatesData
