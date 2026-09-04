const fs = require('fs')
const { baseUrl } = require('../../config/constants')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')
const roleCollection = require('../libs/role-constructor/collection.json')
const transformArticleData = require('../scripts/modules/transform-article-data.js')

function getPersons(personGetter) {
  return function (data) {
    const { doc } = data
    const persons = typeof personGetter === 'function' ? personGetter(doc) : doc.data[personGetter]

    return (Array.isArray(persons) ? persons : [persons]).filter(Boolean)
  }
}

function getPopulatedPersons(personKey) {
  return function (data) {
    const { peopleById } = data.collections
    const personsIds = data[personKey] || []

    return personsIds.map((personId) =>
      peopleById[personId]
        ? peopleById[personId]
        : {
            data: {
              name: personId,
            },
          },
    )
  }
}

function hasTag(tags, tag) {
  return (tags || []).includes(tag)
}

function assignGreaterValue(map, list_, key) {
  const list = Array.isArray(list_) ? list_ : [list_]
  list.forEach((item) => {
    if (item.versions[key] === null) {
      map.versions[key] = null
      map.date = null
    } else if (
      map.versions[key] !== null &&
      !Number.isNaN(item.versions[key]) &&
      Number(item.versions[key]) > map.versions[key]
    ) {
      map.versions[key] = Number(item.versions[key])
      map.date = item.date
    }
  })
  return map
}

const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate))
  return arr.filter((_v, index) => results[index])
}

module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.docs',
    size: 1,
    alias: 'doc',
  },

  permalink: '/{{doc.filePathStem}}.html',

  pageType: 'Article',

  allRoles: roleCollection,

  eleventyComputed: {
    title: function (data) {
      const { doc } = data
      return doc.data.title
    },

    cover: function (data) {
      const { doc } = data
      return doc.data.cover
    },

    description: function (data) {
      const { doc } = data
      return doc.data.description
    },

    authors: getPersons('authors'),

    populatedAuthors: getPopulatedPersons('authors'),

    contributors: getPersons('contributors'),

    populatedContributors: getPopulatedPersons('contributors'),

    editors: getPersons('editors'),

    populatedEditors: getPopulatedPersons('editors'),

    coverAuthors: getPersons((doc) => doc.data?.cover?.author),

    populatedCoverAuthors: getPopulatedPersons('coverAuthors'),

    docPath: function (data) {
      const { doc } = data
      // Удаляем `/index` с конца пути (цель - из строки `/js/index-of/index` получить `/js/index-of`)
      return doc.filePathStem.replace(/\/index$/, '')
    },

    defaultOpenGraphPath: function (data) {
      const { doc, docPath } = data
      if (doc.data?.cover?.og) {
        return baseUrl + docPath + '/' + doc.data.cover.og
      } else {
        return data.fullPageUrl + 'images/covers/og.png'
      }
    },

    defaultTwitterPath: function (data) {
      const { doc, docPath } = data
      if (doc.data?.cover?.twitter) {
        return baseUrl + docPath + '/' + doc.data.cover.twitter
      } else {
        return data.fullPageUrl + 'images/covers/twitter.png'
      }
    },

    category: function (data) {
      const { doc } = data
      return doc.filePathStem.split('/')[1]
    },

    categoryName: function (data) {
      const { category, collections } = data
      return collections.articleIndexes.find((section) => section.fileSlug === category)?.data.name
    },

    docId: function (data) {
      const { category, doc } = data
      const { fileSlug } = doc
      return `${category}/${fileSlug}`
    },

    type: function (data) {
      const { doc } = data
      return hasTag(doc.data.tags, 'article') ? 'article' : 'doka'
    },

    baseUrl,

    practices: async function (data) {
      const allPractices = data.collections.practice
      const { docPath } = data

      const filteredPractices = allPractices?.filter((p) => {
        return p.filePathStem.startsWith(`${docPath}/practice`)
      })

      const formattedPractices = await Promise.all(
        filteredPractices.map(async (p) => {
          const practice = p.rawInput ?? ''

          p['isLong'] = practice.split('\n').filter((s) => s.length && s !== '\r').length > 2
          return p
        }),
      )

      return formattedPractices
    },

    containsPractice: function (data) {
      const { practices } = data
      return practices.length > 0 ? 'true' : 'false'
    },

    questions: function (data) {
      const allQuestions = data.collections.question
      const { docPath } = data

      return allQuestions
        ?.filter((question) => {
          return question.data.related.find((path) => {
            return docPath === `/${path}`
          })
        })
        .map((q) => {
          const answerDirExists = fs.existsSync(q.inputPath.replace('index.md', 'answers/'))
          q['addAnswer'] =
            `https://github.com/doka-guide/content/tree/main${q.inputPath
              .replace('./src', '')
              .replace('index.md', '')}/` + (answerDirExists ? 'answers/' : '')
          return q
        })
    },

    containsQuestions: function (data) {
      const { questions } = data
      return questions.length > 0 ? 'true' : 'false'
    },

    answers: function (data) {
      const allAnswers = data.collections.answer
      const { questions, docId } = data
      const questionList = Array.isArray(questions)
        ? questions.map((q) => {
            return q.fileSlug
          })
        : []

      const filteredAnswersByQuestion = {}
      questionList.forEach(async (q) => {
        const filteredAnswersForQuestion = allAnswers.filter((a) => {
          return a.filePathStem.startsWith(`/interviews/${q}`)
        })
        filteredAnswersByQuestion[q] = []

        const filteredInterviews = await asyncFilter(filteredAnswersForQuestion, async (a) => {
          const cache = a.data
          if (cache.excluded?.includes(docId)) {
            return false
          }
          if (cache.included) {
            for (let i = 0; i < cache.included.length; i++) {
              if (cache.included[i] === docId) {
                return true
              }
            }
            return false
          }
          return true
        })

        const formattedInterviews = await Promise.all(
          filteredInterviews.map(async (a) => {
            const article = a.rawInput ?? ''
            a['isLong'] = article.split('\n').length > 2
            return a
          }),
        )

        filteredAnswersByQuestion[q].push(...formattedInterviews)
      })

      return filteredAnswersByQuestion
    },

    createdAt: function (data) {
      const { doc } = data
      return doc.data.createdAt ? new Date(doc.data.createdAt) : null
    },

    updatedAt: function (data) {
      const { doc } = data
      return doc.data.updatedAt ? new Date(doc.data.updatedAt) : null
    },

    isPlaceholder: function (data) {
      const { doc } = data
      return hasTag(doc.data.tags, 'placeholder')
    },

    hasBaseline: function (data) {
      const { doc } = data
      return Object.keys(doc.data).includes('baseline')
    },

    baseline: function (data) {
      const { doc, collections, hasBaseline } = data
      const { webFeatures } = collections
      if (hasBaseline) {
        const browsersKeys = ['chrome', 'edge', 'firefox', 'safari']
        const baselineTypes = ['high', 'low', false, undefined]
        const types = ['widely', 'newly', 'limited', 'unknown', 'depricated']
        const groups = doc.data.baseline
          .filter((g) => webFeatures[g.group])
          .map((g) => {
            let wfKey = g.group
            const item = webFeatures[wfKey]
            const groupInfo = { index: 0, status: types[0], name: '', id: g.group }

            let { kind, status, discouraged, name } = item
            if (kind !== 'feature') {
              if (kind === 'move') {
                wfKey = item.redirect_target
              } else if (kind === 'split') {
                wfKey = item.redirect_targets.find((target) => webFeatures[target].status)
              }
              status = webFeatures[wfKey].status
              discouraged = webFeatures[wfKey].discouraged
              name = webFeatures[wfKey].name
            }

            const compatData = status.by_compat_key
            const baselineType = status.baseline
            let bTypeIndex = baselineTypes.findIndex((t) => t === baselineType)

            if (bTypeIndex === 2 && discouraged !== undefined) {
              bTypeIndex = 4
            }

            if (bTypeIndex > groupInfo.index) {
              groupInfo.index = bTypeIndex
              groupInfo.status = types[bTypeIndex]
            }

            groupInfo.name = name

            const supportedFeatKeys = Object.keys(compatData)
            const featKeys = Object.values(g.features) ?? []
            groupInfo.supports = featKeys
              .filter((featKey) => supportedFeatKeys.includes(featKey))
              .map((featKey) => {
                const featData = compatData[featKey]
                const featSupport = featData.support
                const date = featData.baseline_high_date ?? featData.baseline_low_date

                const featBrowsersKeys = Object.keys(featSupport)
                return browsersKeys.reduce(
                  (acc, browsersKey) => {
                    if (featBrowsersKeys.includes(browsersKey)) {
                      acc.versions[browsersKey] = featSupport[browsersKey]
                    }
                    return acc
                  },
                  {
                    versions: { chrome: null, edge: null, firefox: null, safari: null },
                    date,
                  },
                )
              })

            return groupInfo
          })

        const { status, date, versions } = groups.reduce(
          (map, groupInfo) => {
            if (groupInfo.index > map.index) {
              map.index = groupInfo.index
              map.status = groupInfo.status
            }

            for (const browserKey of browsersKeys) {
              assignGreaterValue(map, groupInfo.supports, browserKey)
            }

            return map
          },
          {
            index: 0,
            status: types[0],
            date: null,
            versions: { chrome: 0, edge: 0, firefox: 0, safari: 0 },
          },
        )

        const versionsStrValue = Object.keys(versions).reduce((map, browserKey) => {
          if (versions[browserKey]) {
            map[browserKey] = `${versions[browserKey]}`
          }
          return map
        }, {})

        return {
          groups,
          status,
          date,
          versions: JSON.stringify(versionsStrValue),
        }
      }
      return {}
    },

    documentTitle: function (data) {
      // удаляем символы обратных кавычек html-тегов из markdown
      const title = data.title.replace(/`/g, '')
      return titleFormatter([title, data.categoryName, 'Дока'])
    },

    socialTitle: function (data) {
      const { documentTitle } = data
      // Удаляем символы угловых скобок HTML-тегов из markdown, так как соцсети их некорректно отображают
      return documentTitle.replace(/</g, '').replace(/>/g, '')
    },

    documentDescription: function (data) {
      const { description } = data
      return description?.replace(/`/g, '')?.replace(/</g, '')?.replace(/>/g, '')
    },

    articleTag: function (data) {
      const { doc } = data
      return doc.data.tags[0]
    },

    nextArticle: function (data) {
      const { collections, docId } = data
      const { docsById, articleIndexes } = collections
      const { linkedArticles } = articleIndexes

      const articleId = linkedArticles?.[docId]?.next?.id
      const articleData = docsById[articleId]
      return articleData && transformArticleData(articleData)
    },

    previousArticle: function (data) {
      const { collections, docId } = data
      const { docsById, articleIndexes } = collections
      const { linkedArticles } = articleIndexes

      const articleId = linkedArticles?.[docId]?.previous?.id
      const articleData = docsById[articleId]
      return articleData && transformArticleData(articleData)
    },

    relatedArticles: function (data) {
      const { collections, doc } = data
      const { docsById } = collections
      const { related } = doc.data

      return related
        ?.slice(0, 3)
        ?.map((articleId) => docsById[articleId])
        ?.filter(Boolean)
        ?.map((articleData) => transformArticleData(articleData))
    },
  },
}
