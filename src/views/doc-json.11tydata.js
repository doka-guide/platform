const { titleFormatter } = require('../libs/title-formatter/title-formatter')

function getPersons(personGetter) {
  return function (data) {
    const { doc } = data
    const persons = typeof personGetter === 'function' ? personGetter(doc) : doc.data[personGetter]

    return (Array.isArray(persons) ? persons : [persons]).filter(Boolean).map((p) => `/people/${p}/`)
  }
}

function hasTag(tags, tag) {
  return (tags || []).includes(tag)
}

// TODO: вынести эту функцию в отдельный файл и переиспользовать в `views.11tydata.js`
function transformArticleData(article) {
  const section = article.filePathStem.split('/')[1]

  return `/${section}/${article.fileSlug}/`
}

module.exports = {
  pagination: {
    data: 'collections.docs',
    size: 1,
    alias: 'doc',
  },

  permalink: '/{{doc.filePathStem}}.json',

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

    contributors: getPersons('contributors'),

    editors: getPersons('editors'),

    coverAuthors: getPersons((doc) => doc.data?.cover?.author),

    docPath: function (data) {
      const { doc } = data
      // Удаляем `/index` с конца пути (цель - из строки `/js/index-of/index` получить `/js/index-of`)
      return doc.filePathStem.replace(/\/index$/, '/')
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

    linksAndImages: function (data) {
      const { doc } = data
      const pattern = /(!|)\[.+\]\([A-Za-zА-Яа-я0-9_/.:#?&-]+\)/g
      const sources = doc.template.inputContent
        .split('\n')
        .filter((string) => pattern.test(string))
        .map((string) => {
          return string
            .match(pattern)[0]
            .split(/\).+\[/)
            .join('),[')
            .split(',')
        })
        .flat()
      const links = sources.filter((l) => /^\[/.test(l)).map((l) => l.replace(/\[.+\]\(/, '').replace(/\)$/, ''))
      const images = sources.filter((i) => /^!\[/.test(i)).map((i) => i.replace(/!\[.+\]\(/, '').replace(/\)$/, ''))
      return {
        links: {
          inside: links.filter((l) => l.match(/^\//)),
          outside: links.filter((l) => l.match(/^http/)),
        },
        images: images,
      }
    },

    docJson: function (data) {
      return {
        name: data.title,
        url: data.docPath,
        title: data.documentTitle,
        description: data.description,
        type: data.type,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isPlaceholder: data.isPlaceholder,
        cover: data.cover,
        category: {
          path: `/${data.category}/`,
          name: data.categoryName,
        },
        people: {
          authors: data.authors,
          contributors: data.contributors,
          editors: data.editors,
          coverAuthors: data.coverAuthors,
        },
        images: data.linksAndImages.images,
        links: {
          inArticle: data.linksAndImages.links,
          nextArticle: data.nextArticle,
          previousArticle: data.previousArticle,
          relatedArticles: data.relatedArticles,
        },
      }
    },
  },
}
