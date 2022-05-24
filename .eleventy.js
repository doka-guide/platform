const { slugify } = require('transliteration')
const htmlnano = require('htmlnano')
const markdownIt = require('markdown-it')
const { parseHTML } = require('linkedom')
const { isProdEnv } = require('./config/env')
const { mainSections } = require('./config/constants.js')
const demoLinkTransform = require('./src/transforms/demo-link-transform')
const imageTransform = require('./src/transforms/image-transform')
const headingsIdTransform = require('./src/transforms/headings-id-transform')
const headingsAnchorTransform = require('./src/transforms/headings-anchor-transform')
const articleCodeBlocksTransform = require('./src/transforms/article-code-blocks-transform')
const articleInlineCodeTransform = require('./src/transforms/article-inline-code-transform')
const codeClassesTransform = require('./src/transforms/code-classes-transform')
const codeBreakifyTransform = require('./src/transforms/code-breakify-transform')
const tocTransform = require('./src/transforms/toc-transform')
const linkTransform = require('./src/transforms/link-transform')
const iframeAttrTransform = require('./src/transforms/iframe-attr-transform')
const tableTransform = require('./src/transforms/table-transform')
const demoExternalLinkTransform = require('./src/transforms/demo-external-link-transform')
const imagePlaceTransform = require('./src/transforms/image-place-transform')
const detailsTransform = require('./src/transforms/details-transform')
const calloutTransform = require('./src/transforms/callout-transform')

function getAllDocs(collectionAPI) {
  const dokas = collectionAPI.getFilteredByTag('doka')
  const articles = collectionAPI.getFilteredByTag('article')
  return [].concat(dokas, articles)
}

function getAllDocsByCategory(collectionAPI, category) {
  return (
    collectionAPI
      .getFilteredByGlob(`src/${category}/*/**/index.md`)
      // По умолчанию eleventy использует сортировку по датам создания файлов и полным путям.
      // Необходимо сортировать по названиям статей, чтобы гарантировать одинаковый порядок вывода при пересборках.
      .sort((item1, item2) => {
        const [title1, title2] = [item1.data.title, item2.data.title]
          .map((title) => title.toLowerCase())
          // учитываем только буквы
          .map((title) => title.replace(/[^a-zа-яё]/gi, ''))

        switch (true) {
          case title1 > title2:
            return 1
          case title1 < title2:
            return -1
          default:
            return 0
        }
      })
  )
}

module.exports = function (config) {
  config.setDataDeepMerge(true)

  config.setBrowserSyncConfig({
    server: {
      baseDir: ['./src', './dist', './node_modules'],
    },
    files: ['src/styles/**/*.*', 'src/scripts/**/*.*'],
    ghostMode: false,
  })

  // Add all Tags
  mainSections.forEach((section) => {
    config.addCollection(section, (collectionApi) => getAllDocsByCategory(collectionApi, section))
  })

  config.addCollection('docs', (collectionApi) => {
    return getAllDocs(collectionApi)
  })

  config.addCollection('docsById', (collectionApi) => {
    const docs = getAllDocs(collectionApi)
    return docs.reduce((map, doc) => {
      const category = doc.filePathStem.split('/')[1]
      const id = category + '/' + doc.fileSlug
      map[id] = doc
      return map
    }, {})
  })

  config.addCollection('people', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/people/*/index.md')
  })

  config.addCollection('peopleById', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/people/*/index.md').reduce((hashMap, person) => {
      hashMap[person.fileSlug] = person
      return hashMap
    }, {})
  })

  config.addCollection('practice', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/**/practice/*.md')
  })

  config.addCollection('pages', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/pages/**/index.md')
  })

  config.addCollection('specials', (collectionApi) => {
    return collectionApi.getFilteredByGlob('src/specials/**/index.md')
  })

  config.addCollection('articleIndexes', (collectionApi) => {
    const articleIndexes = collectionApi.getFilteredByGlob(`src/{${mainSections.join(',')}}/index.md`)
    const existIds = articleIndexes.map((section) => section.fileSlug)
    const visualOrder = mainSections.filter((sectionId) => existIds.includes(sectionId))

    const indexesMap = articleIndexes.reduce((map, section) => {
      map[section.fileSlug] = section
      return map
    }, {})

    const orderedArticleIndexes = visualOrder.map((sectionId) => indexesMap[sectionId])

    // добавляем как дополнительное свойство к коллекции, чтобы не создавать новую и не дублировать логику получения данных
    Object.defineProperty(orderedArticleIndexes, 'allGroupsByCategory', {
      value: {},
      enumerable: false,
    })

    const groupsByArticle = visualOrder
      .map((category) => {
        const groups = indexesMap[category].data.groups ?? []
        return groups.map(({ name, items }) => {
          return items.map((item) => ({ name, item }))
        })
      })
      .flat(2)
      .reduce((map, { name, item }) => {
        if (!(item in map)) {
          map[item] = []
        }
        map[item].push(name)
        return map
      }, {})

    // к каким подкатегориям принадлежит статья
    Object.defineProperty(orderedArticleIndexes, 'groupsByArticle', {
      value: groupsByArticle,
      enumerable: false,
    })

    const linkedArticles = visualOrder
      .flatMap((category) => {
        const groups = indexesMap[category].data.groups
        const categoryArticles = getAllDocsByCategory(collectionApi, category)

        const allArticlesIds = categoryArticles.map?.((article) => article.fileSlug)
        const indexArticlesIds = groups.flatMap?.((group) => group.items)
        // статьи для блока "остальное" (не попали в индекс)
        const restArticles = allArticlesIds?.filter((articleId) => !indexArticlesIds.includes(articleId))

        const allGroups = [
          ...groups,
          {
            name: 'Остальные',
            items: restArticles,
          },
        ].filter((group) => group.items.length > 0)

        orderedArticleIndexes.allGroupsByCategory[category] = allGroups

        return allGroups
          .flatMap((group) => group.items)
          .map((articleSlug) => ({
            id: category + '/' + articleSlug,
          }))
      })
      .reduce((accumulator, articleObject, index, array) => {
        Object.assign(articleObject, {
          previous: array.at((index - 1) % array.length),
          next: array.at((index + 1) % array.length),
        })

        accumulator[articleObject.id] = articleObject

        return accumulator
      }, {})

    Object.defineProperty(orderedArticleIndexes, 'linkedArticles', {
      value: linkedArticles,
      enumerable: false,
    })

    return orderedArticleIndexes
  })

  // Настраивает markdown-it
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    highlight: function (str, lang) {
      const content = markdownLibrary.utils.escapeHtml(str)
      return lang ? `<pre data-lang='${lang}'><code>${content}</code></pre>` : `<pre>${content}</pre>`
    },
  })

  config.setLibrary('md', markdownLibrary)

  config.addNunjucksShortcode('readingTime', (text) => {
    let textLength = text.split(' ').length
    const wordsPerMinute = 150
    const value = Math.ceil(textLength / wordsPerMinute)
    if (value > 15) {
      return `больше 15 мин`
    } else if (value < 5) {
      return `меньше 5 мин`
    } else {
      return `${value} мин`
    }
  })

  config.addFilter('ruDate', (value) => {
    let v = typeof value === 'string' ? new Date(value) : value
    return v
      .toLocaleString('ru', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      .replace(' г.', '')
  })

  config.addFilter('shortDate', (value) => {
    return value
      .toLocaleString('ru', {
        month: 'short',
        day: 'numeric',
      })
      .replace('.', '')
  })

  config.addFilter('isoDate', (value) => {
    let v = typeof value === 'string' ? new Date(value) : value
    return v.toISOString()
  })

  config.addFilter('fullDateString', (value) => {
    return value.toISOString().split('T')[0]
  })

  // Фильтрует теги
  config.addFilter('hasTag', (tags, tag) => {
    return (tags || []).includes(tag)
  })

  config.addFilter('slugify', (content) => {
    return slugify(content)
  })

  config.addFilter('declension', (content, one, two, five) => {
    let n = Math.abs(content)
    n %= 100
    if (n >= 5 && n <= 20) {
      return five
    }
    n %= 10
    if (n === 1) {
      return one
    }
    if (n >= 2 && n <= 4) {
      return two
    }
    return five
  })

  config.addFilter('pluralize', (content, one, many) => {
    const number = parseInt(content)
    return number === 1 ? one : many
  })

  {
    const descriptionMarkdown = markdownIt({
      html: false,
      linkify: false,
      typographer: false,
    })

    config.addFilter('descriptionMarkdown', (content) => {
      return descriptionMarkdown.renderInline(content)
    })
  }

  {
    const transforms = [
      demoLinkTransform,
      isProdEnv && imageTransform,
      imagePlaceTransform,
      headingsIdTransform,
      tocTransform,
      headingsAnchorTransform,
      linkTransform,
      articleCodeBlocksTransform,
      articleInlineCodeTransform,
      codeClassesTransform,
      codeBreakifyTransform,
      iframeAttrTransform,
      tableTransform,
      demoExternalLinkTransform,
      detailsTransform,
      calloutTransform,
    ].filter(Boolean)

    config.addTransform('html-transforms', async (content, outputPath) => {
      if (outputPath && outputPath.endsWith('.html')) {
        const window = parseHTML(content)

        for (const transform of transforms) {
          await transform(window, content, outputPath)
        }

        return window.document.toString()
      }

      return content
    })
  }

  if (isProdEnv) {
    config.addTransform('html-min', (content, outputPath) => {
      if (outputPath) {
        let isHtml = outputPath.endsWith('.html')
        let notDemo = !outputPath.includes('demos')
        if (isHtml && notDemo) {
          return htmlnano
            .process(content, {
              collapseAttributeWhitespace: true,
              collapseWhitespace: 'conservative',
              deduplicateAttributeValues: false,
              minifyCss: false,
              minifyJs: true,
              minifyJson: false,
              minifySvg: false,
              removeComments: 'safe',
              removeEmptyAttributes: false,
              removeAttributeQuotes: false,
              removeRedundantAttributes: true,
              sortAttributesWithLists: false,
              removeOptionalTags: false,
              collapseBooleanAttributes: true,
              mergeStyles: false,
              mergeScripts: false,
              minifyUrls: false,
            })
            .then((result) => result.html)
        }
      }

      return content
    })
  }

  config.addPassthroughCopy('src/favicon.ico')
  config.addPassthroughCopy('src/manifest.json')
  config.addPassthroughCopy('src/robots.txt')
  config.addPassthroughCopy('src/fonts')
  config.addPassthroughCopy('src/images')
  config.addPassthroughCopy('src/(css|html|js|tools|recipes|people)/**/!(*11tydata*)*.!(md)')

  return {
    dir: {
      input: 'src',
      output: 'dist',
      includes: 'includes',
      layouts: 'layouts',
      data: 'data',
    },
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: false,
    htmlTemplateEngine: 'njk',
    passthroughFileCopy: true,
    templateFormats: ['md', 'njk'],
  }
}
