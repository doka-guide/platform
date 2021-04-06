const htmlmin = require('html-minifier')
const COMANDS = ['html', 'css', 'js', 'tools']

module.exports = function(config) {

  // Set to merge not only on the first level but deeply
  config.setDataDeepMerge(true);

  // Add meta from custom JSON
  config.addNunjucksShortcode('getInfo', (file) => {
    const json = require('./src/meta/' + file);
    return `<pre>${JSON.stringify(json)}</pre>`
  });

  // Add all Tags
  COMANDS.forEach((el) => {
    config.addCollection(el, function(collectionApi) {
      return collectionApi.getFilteredByGlob(`src/${el}/**`);
    });
  });

  ['articles', 'doka',].forEach((el) => {
    config.addCollection(el, function(collectionApi) {
      return collectionApi.getFilteredByGlob(`src/**/${el}`);
    });
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
