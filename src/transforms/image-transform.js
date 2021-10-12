const os = require('os')
const path = require('path')
const fs = require('fs')
const Image = require('@11ty/eleventy-img')
const sharp = require('sharp')

Image.concurrency = os.cpus().length

const baseConfig = {
  extBlackList: ['.gif', '.svg'],
  widths: [300, 600, 1200, 2200],
  sizes: [
    '(min-width: 1680px) 1087px',
    '(min-width: 1366px) calc(75vw - 2 * 20px)',
    'calc(100vw - 2 * 10px)'
  ].join(', '),
  formats: ['webp'],
  filenameFormat: (id, src, width, format) => {
    const extension = path.extname(src)
    const name = path.basename(src, extension)
    return `${name}-${width}w.${format}`
  },
  sharpWebpOptions: {
    lossless: true
  }
}

// замена img на picture внутри статьи
/**
 * @param {Window} window
 */
module.exports = function(window, content, outputPath) {
  // замена img на picture внутри статьи
  const articleContainer = window.document.querySelector('.article__content-inner')
  if (!articleContainer) {
    return
  }

  // задаём базовый путь до исходных картинок, используя outputPath
  // например, из пути `dist/css/active/index.html` нужно получить `/css/active/`
  const baseSourcePath = outputPath
    .replace('dist/', '')
    .replace('/index.html', '')
  const imagesSourcePath = path.join('src', baseSourcePath)
  const imagesOutputPath = path.join('dist', baseSourcePath, 'images')

  const images = articleContainer.querySelectorAll('img')

  return Promise.all(
    Array.from(images)
      .map(image => buildImage(image, imagesSourcePath, imagesOutputPath, window))
  )
}

async function buildImage(image, imagesSourcePath, imagesOutputPath, window) {
  const originalLink = path.join(imagesSourcePath, image.src)
  if (!fs.existsSync(originalLink)) {
    console.warn(`Изображение ${originalLink} не существует`)
    return
  }

  const ext = path.extname(originalLink)
  if (baseConfig.extBlackList.includes(ext)) {
    return
  }

  const { width: originalWidth } = await sharp(originalLink).metadata()

  const options = {
    urlPath: 'images/',
    outputDir: imagesOutputPath,
    widths: [...baseConfig.widths, originalWidth],
    formats: [...baseConfig.formats, ext.replace('.', '')],
    filenameFormat: baseConfig.filenameFormat,
    sharpWebpOptions: baseConfig.sharpWebpOptions
  }

  const imageAttributes = Object.fromEntries(
    [...image.attributes].map(attr => [attr.name, attr.value])
  )
  imageAttributes.sizes = imageAttributes.sizes || baseConfig.sizes

  const metadata = Image.statsSync(originalLink, options)

  const imageHTML = Image.generateHTML(metadata, imageAttributes)
  const tempElement = window.document.createElement('div')
  tempElement.innerHTML = imageHTML
  image.replaceWith(tempElement.firstElementChild)

  Image(originalLink, options)
}
