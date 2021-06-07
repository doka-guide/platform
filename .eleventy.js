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
const Image = require("@11ty/eleventy-img")

module.exports = function(config) {

  // Add all Tags
  mainSections.forEach((section) => {
    let subSectionArticles = section + 'Articles'
    let subSectionDoka = section + 'Doka'

    config.addCollection(section, (collectionApi) =>
      collectionApi.getFilteredByGlob(`src/${section}/**/index.md`)
    )

    config.addCollection(subSectionArticles, (collectionApi) =>
      collectionApi.getFilteredByGlob(`src/${section}/articles/**/index.md`)
    )

    config.addCollection(subSectionDoka, (collectionApi) =>
      collectionApi.getFilteredByGlob(`src/${section}/doka/**/index.md`)
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

  // Добавляет работу плагина Image для обработки картинок
  config.addShortcode("image", async function (src, alt, sizes = "100vw") {
    if(alt === undefined) {
      throw new Error(`Отсутствует \`alt\` для изображения с адресом: ${src}`)
    }

    let metadata = await Image(src, {
      // TODO: Надо описать размеры в соответствии с дизайном
      width: [300, 600],
      formats: ['webp', 'jpeg', 'png']
    })

    let lowsrc = metadata.jpeg[0]

    return `<picture>${Object.values(metadata).map(imageFormat => {
      return `<source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`
    }).join("\n")}<img src="${lowsrc.url}" width="${lowsrc.width}" height="${lowsrc.heigh}" alt="${alt}" loading="lazy" decoding="async"></picture>`
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
