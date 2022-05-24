const path = require('path')
const fsp = require('fs/promises')
const { URL } = require('url')
const frontMatter = require('gray-matter')
const { baseUrl, mainSections } = require('../../config/constants')
const categoryColors = require('../../config/category-colors')
const { titleFormatter } = require('../libs/title-formatter/title-formatter')
const { getAuthorsContributionWithCache } = require('../libs/github-contribution-service/github-contribution-service')
const { contentRepLink } = require('../../config/constants')

function isExternalURL(url) {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')
}

module.exports = {
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
      const { collections, docsByPerson } = data
      const { people } = collections

      if (!people || people.length === 0) {
        return null
      }

      const filteredAuthors = people.filter((person) => {
        const personId = person.fileSlug
        return !!docsByPerson[personId]
      })

      const authorsNames = filteredAuthors.map((author) => author.fileSlug)
      const contributionStat = await getAuthorsContributionWithCache({
        authors: authorsNames,
        // 'https://github.com/doka-guide/content' -> 'doka-guide/content'
        repo: new URL(contentRepLink).pathname.replace(/^\//, ''),
      })

      return filteredAuthors
        .map((person) => {
          const personId = person.fileSlug
          const personData = docsByPerson[personId]
          const { name, photo } = person.data

          const photoURL = photo ? (isExternalURL(photo) ? photo : `/people/${personId}/${photo}`) : null

          const pageLink = `/people/${personId}/`

          const statEntries = Object.entries(personData).map(([category, articlesByRole]) => [
            category,
            Object.values(articlesByRole).reduce((acc, articles) => {
              acc += articles.length
              return acc
            }, 0),
          ])

          const mostContribution = statEntries.reduce((acc, currentItem) => {
            return currentItem[1] > acc[1] ? currentItem : acc
          })

          let [mostContributedCategory, mostContributedCount] = mostContribution

          // если пользователь сделал вклад по одной статье в нескольких категориях, то оценить наибольший вклад сложно, поэтому присваиваем `null`, чтобы в UI можно было сделать альтернативное нейтральное отображение
          mostContributedCategory =
            mostContributedCount === 1 && statEntries.length > 1 ? null : mostContributedCategory

          const totalArticles = statEntries.reduce((acc, currentItem) => {
            acc += currentItem[1]
            return acc
          }, 0)

          const stat = Object.fromEntries(statEntries)

          return {
            id: personId,
            name,
            photoURL,
            pageLink,
            stat,
            mostContributedCategory,
            totalArticles,
            contributionStat: contributionStat[personId],
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
          return 'U©ᴥ©U'
        default:
          return null
      }
    },
  },
}
