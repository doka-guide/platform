const htmlmin = require('html-minifier')
const fs = require("fs")
const { mainSections } = require("./config/constants.js")

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

  // 404 for local build
  config.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {

        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync('dist/404/index.html');
          // Add 404 http status code in request header.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
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
