const os = require('os')
const path = require('path')
const fs = require('fs')
const Image = require('@11ty/eleventy-img')

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
       const tempElement = window.document.createElement('div')
       tempElement.innerHTML = imageHTML
       image.replaceWith(tempElement.firstElementChild)
     }
   }
 }
