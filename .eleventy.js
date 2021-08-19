const path = require('path')
const fs = require('fs')
const os = require('os')
const htmlnano = require('htmlnano')
const markdownIt = require('markdown-it')
const { slugify } = require('transliteration')
const { parseHTML } = require('linkedom')
const Image = require('@11ty/eleventy-img')
// const Prism = require('prismjs')
// const prismLoadLanguages = require('prismjs/components/')
const HeadingHierarchy = require('./src/libs/heading-hierarchy/heading-hierarchy')
const {
  mainSections,
  dokaOrgLink,
  platformRepLink,
  contentRepLink,
  feedbackFormName
} = require('./config/constants.js')

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
        './dist',
        './src'
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
    linkify: true
  })
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

  config.addTransform('html-transforms', (content, outputPath) => {
    if (outputPath && outputPath.endsWith('.html')) {
      const DOM = parseHTML(content)

      const transforms = [
        () => {
          // Правит пути к демкам и картинкам, которые вставлены в раздел «В работе».
          // Чтобы сослаться на демку из раздела «В работе» используется относительный путь '../demos/index.html'.
          // При сборке сайта, раздел вклеивается в основную статью и относительная ссылка ломается.
          // Эта трансформация заменяет '../demos/index.html' на './demos/index.html'
          const practicesSection = DOM.document.getElementById('practices')
          if (practicesSection) {
            const mediaElements = practicesSection.querySelectorAll('img, iframe')
            for (const element of mediaElements) {
              const oldLink = element.getAttribute('src');
              const newLink = oldLink.replace('../', './');
              element.setAttribute('src', newLink);
            }
          }
        },
        isProdEnv && (() => {
          // замена img на picture внутри статьи
          const articleContainer = DOM.document.querySelector('.article__content')
          if (articleContainer) {
            // задаём базовый путь до исходных картинок, используя outputPath
            // например, из пути `dist/css/active/index.html` нужно получить `/css/active/`
            const baseSourcePath = outputPath
              .replace('dist/', '')
              .replace('/index.html', '')
            const imagesSourcePath = path.join('src', baseSourcePath)
            const imagesOutputPath = path.join('dist', baseSourcePath, 'images')

            const extWhiteList = ['.gif', '.svg']

            Image.concurrency = os.cpus().length

            const images = articleContainer.querySelectorAll('img')

            for (const image of images) {
              const originalLink = path.join(imagesSourcePath, image.src)
              if (!fs.existsSync(originalLink)) {
                console.warn(`Изображение ${originalLink} не существует`)
                continue
              }

              const ext = path.extname(originalLink)
              if (extWhiteList.includes(ext)) {
                continue
              }

              const options = {
                urlPath: 'images/',
                outputDir: imagesOutputPath,
                widths: [300, 600, 1200, 2400],
                formats: [ext.replace('.', ''), 'webp'],
                filenameFormat: function (id, src, width, format) {
                  const extension = path.extname(src);
                  const name = path.basename(src, extension);
                  return `${name}-${width}w.${format}`;
                }
              }

              const imageAttributes = Object.fromEntries(
                [...image.attributes].map(attr => [attr.name, attr.value])
              )
              imageAttributes.sizes = imageAttributes.sizes || '(min-width: 1200px) 1200px, calc(100vw - 40px)'

              Image(originalLink, options)
              const metadata = Image.statsSync(originalLink, options)

              const imageHTML = Image.generateHTML(metadata, imageAttributes)
              const tempElement = DOM.document.createElement('div')
              tempElement.innerHTML = imageHTML
              image.replaceWith(tempElement.firstElementChild)
            }
          }
        }),
        () => {
          // генерация id для заголовков и ссылок на них
          const articleContent = DOM.document.querySelector('.article__content')

          if (articleContent) {
            let headings = articleContent.querySelectorAll('h2, h3, h4, h5, h6')

            for (const heading of headings) {
              const clonedHeading = heading.cloneNode(true)
              const headingText = heading.textContent.trim()
              const id = slugify(headingText)
              clonedHeading.setAttribute('id', slugify(headingText))
              clonedHeading.setAttribute('tabindex', -1)
              clonedHeading.classList.add('article-heading__title')

              const headingWrapper = DOM.document.createElement('div')
              headingWrapper.classList.add('article-heading')
              headingWrapper.innerHTML = `
                ${clonedHeading.outerHTML}
                <a class="article-heading__link" href="#${id}">
                  <svg class="article-heading__icon" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  <span class="visually-hidden">Секция статьи "${headingText}"</span>
                </a>
              `

              heading.replaceWith(headingWrapper)
            }

            // генерация оглавления
            const articleNavContent = DOM.document.querySelector('.article-nav__content')
            // обновлённые заголовки
            headings = articleContent.querySelectorAll('h2, h3, h4, h5, h6')

            const hierarchy = HeadingHierarchy.createHierarchy(Array.from(headings))
            articleNavContent.innerHTML = HeadingHierarchy.render(hierarchy)
          }
        },
        () => {
          // расстановка классов и атрибутов для элементов кода внутри тела статьи,
          // подсветка синтаксиса,
          // расстановка номеров строк
          DOM.document.querySelector('.article__content')
            ?.querySelectorAll('pre > code[class*="language-"]')
            ?.forEach(codeBlock => {
              // const lang = codeBlock.getAttribute('class')
              //   .split(' ')
              //   .map(cls => cls.trim())
              //   .find(cls => cls.includes('language-'))
              //   ?.split('-')[1] || 'unknown'

              // prismLoadLanguages([lang])

              // const lines = Prism.highlight(codeBlock.textContent, Prism.languages[lang], lang)
              //   .split(os.EOL)
              //   .filter((line, index, linesArray) => (index === 0 || index === linesArray.length -1) && line.trim() === '' ? false : true)
              //   .map((line) => `
              //     <span class="code-block__line"><span class="code-block__line-number"></span>
              //   <span class="code-block__line-content">${line}</span></span>
              //   `)

              codeBlock.parentNode.classList.add('code-block font-theme font-theme--code')
              codeBlock.parentNode.setAttribute('tabindex', 0)
              codeBlock.classList.add('code-block__content')
            })
        }
      ]

      transforms.filter(Boolean).forEach(transform => transform())

      return DOM.document.toString()
    }

    return content
  })

  if (isProdEnv) {
    config.addTransform('htmlmin', (content, outputPath) => {
      if (outputPath) {
        let isHtml = outputPath.endsWith('.html')
        let notDemo = !outputPath.includes('demos')
        if (isHtml && notDemo) {
          return htmlnano.process(content, {
            collapseAttributeWhitespace: true,
            collapseWhitespace: 'conservative',
            deduplicateAttributeValues: true,
            minifyCss: false,
            minifyJs: false,
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

  config.addPassthroughCopy('src/favicon.ico')
  config.addPassthroughCopy('src/manifest.json')
  config.addPassthroughCopy('src/robots.txt')
  config.addPassthroughCopy('src/fonts')
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
