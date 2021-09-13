const { slugify } = require('transliteration')
const htmlnano = require('htmlnano')
const markdownIt = require('markdown-it')
const markdownItContainer = require('markdown-it-container')
const { parseHTML } = require('linkedom')
const {
  mainSections,
  dokaOrgLink,
  platformRepLink,
  contentRepLink,
  feedbackFormName
} = require('./config/constants.js')
const demoLinkTransform = require('./src/transforms/demo-link-transform');
const imageTransform = require('./src/transforms/image-transform');
const headingsTransform = require('./src/transforms/headings-transform');
const codeTransform = require('./src/transforms/code-transform');
const tocTransform = require('./src/transforms/toc-transform');
const linkTransform = require('./src/transforms/link-transform');
const documentTitleTransform = require('./src/transforms/document-title-transform');

const ENVS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
}
const env = process.env.NODE_ENV || ENVS.PRODUCTION
const isProdEnv = env === ENVS.PRODUCTION

module.exports = function(config) {

  config.setBrowserSyncConfig({
    server: {
      baseDir: [
        './src',
        './dist',
        './node_modules'
      ]
    },
    files: [
      'src/styles/**/*.*',
      'src/scripts/**/*.*'
    ],
  })

  // Add all Tags
  mainSections.forEach((section) => {
    config.addCollection(section, (collectionApi) =>
      collectionApi.getFilteredByGlob(`src/${section}/*/**/index.md`)
    )
  })

  config.addCollection('docs', (collectionApi) => {
    const dokas = collectionApi.getFilteredByTag('doka')
    const articles = collectionApi.getFilteredByTag('article')
    return [].concat(dokas, articles)
  })

  config.addCollection('people', collectionApi => {
    return collectionApi.getFilteredByGlob('src/people/*/index.md')
  })

  config.addCollection('peopleById', collectionApi => {
    return collectionApi.getFilteredByGlob('src/people/*/index.md')
      .reduce((hashMap, person) => {
        hashMap[person.fileSlug] = person
        return hashMap
      }, {})
  })

  config.addCollection('practice', collectionApi => {
    return collectionApi.getFilteredByGlob('src/**/practice/*.md')
  })

  config.addCollection('pages', collectionApi => {
    return collectionApi.getFilteredByGlob('src/pages/**/index.md')
  })

  config.addCollection('articleIndexes', collectionApi => {
    const articleIndexes = collectionApi.getFilteredByGlob(`src/{${mainSections.join(',')}}/index.md`)
    const existIds = articleIndexes.map(section => section.fileSlug)
    const visualOrder = mainSections.filter(sectionId => existIds.includes(sectionId))

    const indexesMap = articleIndexes.reduce((map, section) => {
      map[section.fileSlug] = section
      return map
    }, {})

    return visualOrder.map(sectionId => indexesMap[sectionId])
  })

  // Настраивает markdown-it
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    highlight: function(str, lang) {
      const content = markdownLibrary.utils.escapeHtml(str)
      return lang
        ? `<pre data-lang="${lang}"><code class="language-${lang}">${content}</code></pre>`
        : `<pre>${content}</pre>`
    }
  })

  {
    const calloutElementRegexp = /^callout\s+(.*)$/

    markdownLibrary.use(markdownItContainer, 'callout', {
      validate(params) {
        return params.trim().match(calloutElementRegexp);
      },

      render(tokens, idx) {
        const { info, nesting } = tokens[idx]
        const matches = info.trim().match(calloutElementRegexp)

        if (nesting === 1) {
          const icon = markdownLibrary.utils.escapeHtml(matches[1])
          return `<aside class="callout">
              ${icon ? `<span class="callout__icon">${icon}</span>` : ''}
              <span class="callout__content content">`
        }

        return `</span></aside>`
      },
    })
  }

  config.setLibrary('md', markdownLibrary)

  // Add all shortcodes
  config.addShortcode('dokaOrgLink', function() {
    return dokaOrgLink;
  });

  config.addShortcode('platformRepLink', function() {
    return platformRepLink;
  });

  config.addShortcode('contentRepLink', function() {
    return contentRepLink;
  })

  config.addShortcode('feedbackFormName', function() {
    return feedbackFormName;
  })

  config.addNunjucksShortcode('readingTime', (text) => {
    let textLength = text.split(' ').length
    const wordsPerMinute = 150
    const value = Math.ceil(textLength / wordsPerMinute)
    if(value > 15){
      return `больше 15 мин`
    } else if (value < 5) {
      return `меньше 5 мин`
    } else {
      return `${value} мин`
    }
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

  // Фильтрует теги
  config.addFilter('hasTag', (tags, tag) => {
    return (tags || []).includes(tag);
  });

  config.addFilter('slugify', (content) => {
    return slugify(content)
  })

  {
    const titleMarkdown = markdownIt({
      html: false,
      linkify: false,
      typographer: false
    })

    config.addFilter('titleMarkdown', (content) => {
      return titleMarkdown.renderInline(content)
    })
  }

  config.addTransform('html-transforms', (content, outputPath) => {
    if (outputPath && outputPath.endsWith('.html')) {
      const window = parseHTML(content)

      const transforms = [
        demoLinkTransform,
        isProdEnv && imageTransform,
        headingsTransform,
        tocTransform,
        linkTransform,
        documentTitleTransform,
      ]

      transforms
        .filter(Boolean)
        .forEach(transform => transform(window, content, outputPath))

      return window.document.toString()
    }

    return content
  })

  if (isProdEnv) {
    config.addTransform('html-min', (content, outputPath) => {
      if (outputPath) {
        let isHtml = outputPath.endsWith('.html')
        let notDemo = !outputPath.includes('demos')
        if (isHtml && notDemo) {
          return htmlnano.process(content, {
            collapseAttributeWhitespace: true,
            collapseWhitespace: 'conservative',
            deduplicateAttributeValues: true,
            minifyCss: false,
            minifyJs: true,
            minifyJson: false,
            minifySvg: false,
            removeComments: 'safe',
            removeEmptyAttributes: false,
            removeAttributeQuotes: false,
            removeRedundantAttributes: true,
            removeOptionalTags: false,
            collapseBooleanAttributes: true,
            mergeStyles: false,
            mergeScripts: false,
            minifyUrls: false
          }).then(result => result.html)
        }
      }

      return content
    })
  }

  config.addTransform('html-code-transform', (content, outputPath) => {
    if (outputPath?.endsWith?.('.html')) {
      const window = parseHTML(content)
      codeTransform(window)
      return window.document.toString()
    }

    return content
  })

  config.addPassthroughCopy('src/favicon.ico')
  config.addPassthroughCopy('src/manifest.json')
  config.addPassthroughCopy('src/robots.txt')
  config.addPassthroughCopy('src/fonts')
  config.addPassthroughCopy('src/**/*.(html|gif|jpg|png|svg|mp4|webm|zip)')
  config.addPassthroughCopy('src/(css|html|js|tools)/**/demos/**/*')

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
