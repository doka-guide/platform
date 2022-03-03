const { baseUrl } = require('../../config/constants')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')

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

      return allPractices.filter((practice) => {
        return practice.filePathStem.startsWith(`${docPath}/practice`)
      })
    },

    containsPractice: function (data) {
      const { practices } = data
      return practices.length > 0 ? 'true' : 'false'
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
        ?.map((articleData) => transformArticleData(articleData))
    },
  },
}
