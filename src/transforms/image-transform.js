const os = require('os')
const path = require('path')
const fs = require('fs')
const Image = require('@11ty/eleventy-img')

Image.concurrency = os.cpus().length

const config = {
  extBlackList: ['.gif', '.svg'],
  widths: [300, 600, 1200, 2200],
  sizes: [
    '(min-width: 1576px) 1087px',
    '(min-width: 1366px) calc(100vw - 435px - 2 * 20px)',
    'calc(100vw - 2 * 10px)'
  ].join(', '),
  formats: (originalExtension) => ['webp', originalExtension],
  filenameFormat: (id, src, width, format) => {
    const extension = path.extname(src)
    const name = path.basename(src, extension)
    return `${name}-${width}w.${format}`
  }
}

// замена img на picture внутри статьи
/**
 * @param {Window} window
 */
 module.exports = function(window, content, outputPath) {
   // замена img на picture внутри статьи
   const articleContainer = window.document.querySelector('.article__content')
   if (articleContainer) {
     // задаём базовый путь до исходных картинок, используя outputPath
     // например, из пути `dist/css/active/index.html` нужно получить `/css/active/`
     const baseSourcePath = outputPath
       .replace('dist/', '')
       .replace('/index.html', '')
     const imagesSourcePath = path.join('src', baseSourcePath)
     const imagesOutputPath = path.join('dist', baseSourcePath, 'images')

     const images = articleContainer.querySelectorAll('img')

     for (const image of images) {
       const originalLink = path.join(imagesSourcePath, image.src)
       if (!fs.existsSync(originalLink)) {
         console.warn(`Изображение ${originalLink} не существует`)
         continue
       }

       const ext = path.extname(originalLink)
       if (config.extBlackList.includes(ext)) {
         continue
       }

       const options = {
         urlPath: 'images/',
         outputDir: imagesOutputPath,
         widths: config.widths,
         formats: config.formats(ext.replace('.', '')),
         filenameFormat: config.filenameFormat
       }

       const imageAttributes = Object.fromEntries(
         [...image.attributes].map(attr => [attr.name, attr.value])
       )
       imageAttributes.sizes = imageAttributes.sizes || config.sizes

       Image(originalLink, options)
       const metadata = Image.statsSync(originalLink, options)

       const imageHTML = Image.generateHTML(metadata, imageAttributes)
       const tempElement = window.document.createElement('div')
       tempElement.innerHTML = imageHTML
       image.replaceWith(tempElement.firstElementChild)
     }
   }
 }
