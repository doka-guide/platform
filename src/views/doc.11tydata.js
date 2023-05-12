const fs = require('fs')
const { baseUrl } = require('../../config/constants')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')
const roleCollection = require('../libs/role-constructor/collection.json')

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
          }
    )
  }
}

function hasTag(tags, tag) {
  return (tags || []).includes(tag)
}

function assignGreaterValue(map, item, key) {
  if (!Number.isNaN(item[key]) && Number(item[key]) > map[key]) {
    map[key] = Number(item[key])
  }
  return map
}

// TODO: вынести эту функцию в отдельный файл и переиспользовать в `views.11tydata.js`
function transformArticleData(article) {
  const section = article.filePathStem.split('/')[1]

  return {
    title: article.data.title,
    cover: article.data.cover,
    get imageLink() {
      return `${this.link}/${this.cover.mobile}`
    },
    description: article.data.description,
    link: `/${section}/${article.fileSlug}/`,
    linkTitle: article.data.title.replace(/`/g, ''),
    section,
  }
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

    practices: function (data) {
      const allPractices = data.collections.practice
      const { docPath } = data

      return allPractices
        ?.filter((practice) => {
          return practice.filePathStem.startsWith(`${docPath}/practice`)
        })
        ?.map((practice) => {
          practice['isLong'] = practice.template.inputContent.split('\n').length > 2
          return practice
        })
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
      questionList.forEach((q) => {
        const filteredAnswersForQuestion = allAnswers.filter((a) => {
          return a.filePathStem.startsWith(`/interviews/${q}`)
        })
        filteredAnswersByQuestion[q] = []
        filteredAnswersByQuestion[q].push(
          ...filteredAnswersForQuestion
            .filter((a) => {
              if (a.data.excluded?.includes(docId)) {
                return false
              }
              if (a.data.included) {
                for (let i = 0; i < a.data.included.length; i++) {
                  if (a.data.included[i] === docId) {
                    return true
                  }
                }
                return false
              }
              return true
            })
            .map((a) => {
              a['isLong'] = a.template.inputContent.split('\n').length > 2
              return a
            })
        )
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
        const keys = ['chrome', 'edge', 'firefox', 'safari']
        const names = { chrome: 'Chrome', edge: 'Edge', firefox: 'Firefox', safari: 'Safari' }
        const versions = doc.data.baseline
          .filter((g) => Object.keys(webFeatures[g.group]).includes('status'))
          .map((g) => {
            return webFeatures[g.group].status.support
          })
          .reduce(
            (map, item) => {
              for (const key of keys) {
                assignGreaterValue(map, item, key)
              }
              return map
            },
            { chrome: 0, edge: 0, firefox: 0, safari: 0 }
          )
        const supported = doc.data.baseline
          .filter((g) => webFeatures[g.group].is_baseline)
          .reduce(
            (map, item) => {
              for (const key of keys) {
                if (!item[key]) {
                  map[key] = false
                }
              }
              return map
            },
            { chrome: true, edge: true, firefox: true, safari: true }
          )
        const flagged = { chrome: false, edge: false, firefox: false, safari: false }
        const preview = { chrome: false, edge: false, firefox: false, safari: false }
        return {
          keys,
          names,
          versions,
          flagged,
          supported,
          preview,
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
