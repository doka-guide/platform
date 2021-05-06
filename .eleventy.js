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

  // Customize Markdown library and settings:
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
  slugify: () => 'section',
  });
  config.setLibrary("md", markdownLibrary);

  // Add all shortcodes
  config.addShortcode("dokaOrgLink", function() {
    return dokaOrgLink;
  });

  config.addShortcode("platformRepLink", function() {
    return platformRepLink;
  });

  config.addShortcode("contentRepLink", function() {
    return contentRepLink;
  });

  config.addShortcode("feedbackFormName", function() {
    return feedbackFormName;
  });

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
