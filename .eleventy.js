const htmlmin = require('html-minifier')
const {
  mainSections,
  dokaOrgLink,
  platformRepLink,
  contentRepLink,
  feedbackFormName
} = require("./config/constants.js")
const markdownIt = require("markdown-it")
const markdownItAnchor = require("markdown-it-anchor")
const { slugify } = require("transliteration")

module.exports = function(config) {

  // Add all Tags
  mainSections.forEach((section) => {
    config.addCollection(section, (collectionApi) =>
      collectionApi.getFilteredByGlob(`src/${section}/**/index.md`)
    )
  })

  // Настраивает markdown-it
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAnchor, {
    permalink: true,
    permalinkClass: "direct-link",
    permalinkSymbol: "#",
    permalinkAttrs: () => ({
      'aria-label': 'Этот заголовок',
    }),
    slugify
  })
  config.setLibrary("md", markdownLibrary)

  // Add all shortcodes
  config.addShortcode("dokaOrgLink", function() {
    return dokaOrgLink;
  });

  config.addShortcode("platformRepLink", function() {
    return platformRepLink;
  });

  config.addShortcode("contentRepLink", function() {
    return contentRepLink;
  })

  config.addShortcode("feedbackFormName", function() {
    return feedbackFormName;
  })

  // Добавляет переменную для обозначения последнего редактирования статьи
  // {% lastModified page.date %}
  config.addShortcode("lastModified", function (date) {
    let counter = new Date().getTime()/1000-(new Date(date).getTime()/1000)
    let piece;

    const rtf = new Intl.RelativeTimeFormat("ru", {
      localeMatcher: "best fit",
      numeric: "always",
      style: "long",
    });

    if (counter >= 86400) {
      counter = Math.round(counter/86400)
      piece = 'day'
    } else if (counter >= 3600) {
      counter = Math.round(counter/3600)
      piece = 'hour'
    } else if (counter >= 60) {
      counter = Math.round(counter/60)
      piece = 'minute'
    } else {
      counter = Math.round(counter)
      piece = 'second'
    }

    let rtfDate = rtf.format(-counter, piece)

    return `Отредактировано: ` + rtfDate
  })

  config.addFilter('ruDate', (value) => {
    return value.toLocaleString('ru', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).replace(' г.', '')
  })

  config.addFilter('shortDate', (value) => {
    return value.toLocaleString('ru', {
      month: 'short',
      day: 'numeric',
    }).replace('.', '')
  })

  config.addFilter('isoDate', (value) => {
    return value.toISOString()
  })

  config.addFilter('fullDateString', (value) => {
    return value.toISOString().split('T')[0]
  })

  config.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath) {
      let isHtml = outputPath.endsWith('.html')
      let notDemo = !outputPath.includes('demos')
      if (isHtml && notDemo) {
        return htmlmin.minify(
          content, {
            removeComments: true,
            collapseWhitespace: true,
          }
        )
      }
    }

    return content
  })

  // Правит пути к демкам, которые вставлены в раздел «В работе».
  // Чтобы сослаться на демку из раздела «В работе» используется относительный путь "../demos/index.html".
  // При сборке сайта, раздел вклеивается в основную статью и относительная ссылка ломается. Эта трансформация заменяет "../demos/index.html" на "./demos/index.html"
  config.addTransform('fixDemos', (content, outputPath) => {
    if(outputPath && outputPath.endsWith('.html')) {
      let iframePath = /src="\.\.\/demos\//ig
      content = content.replace(iframePath, 'src="./demos/')
    }
    return content
  })

  config.addFilter('keepRelatedTo', (array, page) => {
    return array.filter(
      practice => (
        practice.filePathStem.includes(page.url)
      )
    )
  })

  config.addPassthroughCopy('src/favicon.ico')
  config.addPassthroughCopy('src/manifest.json')
  config.addPassthroughCopy('src/robots.txt')
  config.addPassthroughCopy('src/fonts')
  config.addPassthroughCopy('src/styles')
  config.addPassthroughCopy('src/scripts')
  config.addPassthroughCopy('src/**/*.(html|gif|jpg|png|svg|mp4|webm|zip)')

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
    templateFormats: [
      'md',
      'njk',
    ],
  }
}
