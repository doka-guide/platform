const path = require('path')
const fsp = require('fs/promises')
const { URL } = require('url')
const frontMatter = require('gray-matter')
const { baseUrl, mainSections } = require('../../config/constants')
const categoryColors = require('../../config/category-colors')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')
const {
  getAuthorsContributionWithCache,
  getAuthorsExistsWithCache,
  getAuthorsIDsWithCache,
  getActionsInRepoWithCache,
} = require('../libs/github-contribution-service/github-contribution-service')
const { contentRepLink } = require('../../config/constants')
const { setPath } = require('../libs/collection-helpers/set-path')

function isExternalURL(url) {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')
}

function articlePathsToObject(pathList, collections) {
  if (!Array.isArray(pathList)) {
    return {}
  }
  return pathList.reduce((acc, path) => {
    const [category, articleId] = path.split('/')
    const specialCategory = collections[category]
    if (!specialCategory) {
      console.warn(`No such category in collections: ${category}`)
      return acc
    }
    if (!acc[category]) acc[category] = []
    const article = specialCategory.find(({ filePathStem }) => filePathStem === `/${category}/${articleId}/index`)

    if (article) {
      acc[category].push(article)
    }
    return acc
  }, {})
}

module.exports = {
  articlePathsToObject,
  featuredArticlesMaxCount: 12,

  eleventyComputed: {
    documentTitle: function (data) {
      return titleFormatter([data.title, 'Дока'])
    },

    socialTitle: function (data) {
      const { documentTitle } = data
      return documentTitle
    },

    documentDescription: function (data) {
      const { documentDescription, description } = data
      return documentDescription || description
    },

    hasCategory: function (data) {
      return !!data.categoryName
    },

    baseUrl,

    pageUrl: function (data) {
      return data.page.url
    },

    fullPageUrl: function (data) {
      return data.baseUrl + data.pageUrl
    },

    defaultOpenGraphPath: function (data) {
      return data.fullPageUrl + 'images/covers/og.png'
    },

    defaultTwitterPath: function (data) {
      return data.fullPageUrl + 'images/covers/twitter.png'
    },

    featuredArticles: async function (data) {
      const { featuredArticlesMaxCount } = data
      const { docsById } = data.collections

      if (!(docsById && Object.keys(docsById).length > 0)) {
        return null
      }

      const pathToFeaturedSettingsFile = path.join('src', 'settings', 'featured.md')
      const fileContent = await fsp.readFile(pathToFeaturedSettingsFile, {
        encoding: 'utf-8',
      })
      const frontMatterInfo = frontMatter(fileContent)
      const featuredArticlesIds = frontMatterInfo?.data?.active

      if (!featuredArticlesIds) {
        return null
      }

      return featuredArticlesIds
        .slice(0, featuredArticlesMaxCount)
        .map((id) => docsById[id])
        .filter(Boolean)
        .map((article) => {
          const section = article.filePathStem.split('/')[1]

          return {
            title: article.data.title,
            cover: article.data.cover,
            get imageLink() {
              return `${this.link}${this.cover.mobile}`
            },
            description: article.data.description,
            link: `/${section}/${article.fileSlug}/`,
            linkTitle: article.data.title.replace(/`/g, ''),
            section,
          }
        })
    },

    themeColor: function (data) {
      const { category } = data
      return categoryColors[category || 'default']
    },

    /* создаёт структуру вида:
    {
      [personId]: {
        [categoryId]: [articles]
      }
    }
    */
    practicesByPerson: function (data) {
      const { collections } = data

      const practicesByPerson = {}
      collections.practice.forEach((practice) => {
        const personId = practice.fileSlug
        if (!practicesByPerson[personId]) {
          practicesByPerson[personId] = {}
        }
        const practiceObject = practice.filePathStem.split('/')
        const category = practiceObject[1]
        const articleId = practiceObject[2]
        if (!practicesByPerson[personId][category]) {
          practicesByPerson[personId][category] = []
        }
        practicesByPerson[personId][category].push(
          collections[category].find((article) => article.filePathStem === `/${category}/${articleId}/index`)
        )
      })
      return practicesByPerson
    },

    /* создаёт структуру вида:
    {
      [questionId]: {
        [personId]: {
          [categoryId]: [articles]
        }
      }
    }
    */
    answersByQuestion: function (data) {
      const { collections } = data
      const answersByQuestion = {}

      collections.answer.forEach((answer) => {
        const questionId = answer.filePathStem.split('/')[2]
        const personId = answer.fileSlug

        if (answer.data.included) {
          setPath([questionId, personId], articlePathsToObject(answer.data.included, collections), answersByQuestion)
        } else if (answer.data.excluded) {
          const articlePathList = collections.question.filter(({ fileSlug }) => {
            return fileSlug === questionId
          })[0].data.related

          articlePathList.filter((questionPath) => {
            return (
              answer.data.excluded.filter((answerPath) => {
                return answerPath === questionPath
              }).length > 0
            )
          })
          setPath([questionId, personId], articlePathsToObject(articlePathList, collections), answersByQuestion)
        } else {
          const related = articlePathsToObject(
            collections.question.filter((question) => {
              return question.fileSlug === questionId
            })[0].data.related,
            collections
          )

          if (related) {
            setPath([questionId, personId], related, answersByQuestion)
          }
        }
      })
      return answersByQuestion
    },

    /* создаёт структуру вида:
    {
      [personId]: {
        [categoryId]: [articles]
      }
    }
    */
    answersByPerson: function (data) {
      const { answersByQuestion, collections } = data
      const allAnswers = collections.answer
      const answersByPerson = {}
      for (const questionKey in answersByQuestion) {
        for (const personKey in answersByQuestion[questionKey]) {
          const answersOfPersonByQuestion = allAnswers.filter((a) =>
            a.filePathStem.startsWith(`/interviews/${questionKey}/answers/${personKey}`)
          )
          if (!answersByPerson[personKey]) {
            answersByPerson[personKey] = {}
          }
          for (const categoryKey in answersByQuestion[questionKey][personKey]) {
            if (!answersByPerson[personKey][categoryKey]) {
              answersByPerson[personKey][categoryKey] = []
            }

            answersByPerson[personKey][categoryKey].push(
              answersByQuestion[questionKey][personKey][categoryKey].filter((article) => {
                for (let i = 0; i < answersOfPersonByQuestion.length; i++) {
                  const a = answersOfPersonByQuestion[i]
                  const articleFilePath = article.filePathStem.replace(/^\//, '').replace(/\/index$/, '')
                  if (a.data.excluded?.includes(articleFilePath)) {
                    return false
                  }
                  if (a.data.included) {
                    for (let i = 0; i < a.data.included.length; i++) {
                      if (a.data.included[i] === articleFilePath) {
                        return true
                      }
                    }
                    return false
                  }
                  return true
                }
              })
            )
          }
        }
      }
      return answersByPerson
    },

    /* создаёт структуру вида:
    {
      [personId]: {
        [categoryId]: {
          author: [articles],
          contributor: [articles],
          editor: [articles],
        }
      }
    }
    */
    docsByPerson: function (data) {
      const { collections } = data

      const docsByPerson = {}
      const personFields = ['authors', 'contributors', 'editors', 'coverAuthors']
      const fieldNameMap = {
        authors: 'Автор',
        contributors: 'Контрибьютор',
        editors: 'Редактор',
        coverAuthors: 'Иллюстратор',
      }

      for (const categoryId of mainSections) {
        const docsByCategory = collections[categoryId]
        docsByCategory.reduce((accumulator, doc) => {
          for (const field of personFields) {
            const personsIds = field !== 'coverAuthors' ? doc?.data?.[field] : [doc?.data?.cover?.author]

            if (!personsIds) {
              continue
            }

            for (const personId of personsIds) {
              const authorData = docsByPerson[personId] || (docsByPerson[personId] = {})
              const authorCategoryData = authorData[categoryId] || (authorData[categoryId] = {})
              const roleFieldName = fieldNameMap[field]
              const authorRoleData = authorCategoryData[roleFieldName] || (authorCategoryData[roleFieldName] = [])
              authorRoleData.push(doc)
            }
          }

          return accumulator
        }, docsByPerson)
      }

      return docsByPerson
    },

    peopleData: async function (data) {
      const { collections, practicesByPerson, answersByPerson, docsByPerson } = data
      const { people } = collections

      if (!people || people.length === 0) {
        return null
      }

      const filteredAuthors = people.filter((person) => {
        const personId = person.fileSlug
        return !!docsByPerson[personId] || !!practicesByPerson[personId] || !!answersByPerson[personId]
      })

      const authorsNames = filteredAuthors.map((author) => author.fileSlug)
      const contributionStat = await getAuthorsContributionWithCache({
        authors: authorsNames,
        // 'https://github.com/doka-guide/content' -> 'doka-guide/content'
        repo: new URL(contentRepLink).pathname.replace(/^\//, ''),
      })
      const contributorExists = await getAuthorsExistsWithCache({
        authors: authorsNames,
      })
      const contributorIDs = await getAuthorsIDsWithCache({
        authors: authorsNames.filter((a) => (contributorExists[a] ? contributorExists[a].userCount > 0 : false)),
        // 'https://github.com/doka-guide/content' -> 'doka-guide/content'
        repo: new URL(contentRepLink).pathname.replace(/^\//, ''),
      })
      const contributionActions = await getActionsInRepoWithCache({
        authors: authorsNames,
        authorIDs: contributorIDs,
        // 'https://github.com/doka-guide/content' -> 'doka-guide/content'
        repo: new URL(contentRepLink).pathname.replace(/^\//, ''),
      })

      return filteredAuthors
        .map((person) => {
          const personId = person.fileSlug
          const personData = docsByPerson[personId]
          const personPractices = practicesByPerson[personId]
          const personAnswers = answersByPerson[personId]
          const { name, photo } = person.data

          const photoURL = photo ? (isExternalURL(photo) ? photo : `/people/${personId}/${photo}`) : null

          const pageLink = `/people/${personId}/`

          const statEntries = personData
            ? Object.entries(personData).map(([category, articlesByRole]) => [
                category,
                Object.values(articlesByRole).reduce((acc, articles) => {
                  acc += articles.length
                  return acc
                }, 0),
              ])
            : []

          const practiceEntries = personPractices
            ? Object.entries(personPractices).map(([category, practicesByCategory]) => [
                category,
                practicesByCategory.length,
              ])
            : []

          const answerEntries = personAnswers
            ? Object.entries(personAnswers).map(([category, answersByCategory]) => [category, answersByCategory.length])
            : []

          let mostContribution = null
          if (statEntries.length > 0) {
            mostContribution = statEntries.reduce((acc, currentItem) => {
              return currentItem[1] > acc[1] ? currentItem : acc
            })
          } else if (practiceEntries.length > 0) {
            mostContribution = practiceEntries.reduce((acc, currentItem) => {
              return currentItem[1] > acc[1] ? currentItem : acc
            })
          } else if (answerEntries.length > 0) {
            mostContribution = answerEntries.reduce((acc, currentItem) => {
              return currentItem[1] > acc[1] ? currentItem : acc
            })
          }

          let [mostContributedCategory, mostContributedCount] = mostContribution

          // если пользователь сделал вклад по одной статье в нескольких категориях, то оценить наибольший вклад сложно, поэтому присваиваем `null`, чтобы в UI можно было сделать альтернативное нейтральное отображение
          mostContributedCategory =
            mostContributedCount === 1 && statEntries.length > 1 ? null : mostContributedCategory

          const totalArticles = statEntries
            ? statEntries.reduce((acc, currentItem) => {
                acc += currentItem[1]
                return acc
              }, 0)
            : 0

          const totalPractices = practiceEntries
            ? practiceEntries.reduce((acc, currentItem) => {
                acc += currentItem[1]
                return acc
              }, 0)
            : 0

          const totalAnswers = answerEntries
            ? answerEntries.reduce((acc, currentItem) => {
                acc += currentItem[1]
                return acc
              }, 0)
            : 0

          const stat = Object.fromEntries(statEntries)
          const practices = Object.fromEntries(practiceEntries)
          const answers = Object.fromEntries(answerEntries)

          return {
            id: personId,
            name,
            photoURL,
            pageLink,
            stat,
            practices,
            answers,
            mostContributedCategory,
            totalArticles,
            totalPractices,
            totalAnswers,
            contributionStat: contributionStat[personId],
            contributionActions: contributionActions[personId],
          }
        })
        .sort((person1, person2) => person2.totalArticles - person1.totalArticles)
    },

    articleIndexesMap: function (data) {
      const { collections } = data
      const { articleIndexes } = collections
      return articleIndexes.reduce((map, section) => {
        map[section.fileSlug] = section
        return map
      }, {})
    },

    logoLetters: function (data) {
      const { pageUrl } = data

      switch (pageUrl) {
        case '/licenses/':
          return 'U<span class="logo__eye">©</span><span class="logo__nose">ᴥ</span><span class="logo__eye">©</span>U'
        default:
          return null
      }
    },
  },
}
