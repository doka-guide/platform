const path = require('path')
const fsp = require('fs/promises')

const baseConfig = {
  widths: [300, 600, 1200, 2200],
  sizes: ['(min-width: 1680px) 1087px', '(min-width: 1366px) calc(75vw - 2 * 20px)', 'calc(100vw - 2 * 10px)'].join(
    ', '
  ),
  formats: ['webp'],
  filenameFormat: (src, width, format) => {
    const extension = path.extname(src)
    const name = path.basename(src, extension)
    return `${name}-${width}w.${format}`
  },
}

// замена img на picture внутри статьи
/**
 * @param {Window} window
 */
module.exports = function (window, content, outputPath) {
  // замена img на picture внутри статьи
  const articleContainer = window.document.querySelector('.article__content-inner')
  if (!articleContainer) {
    return
  }

  // задаём базовый путь до исходных картинок, используя outputPath
  // например, из пути `dist/css/active/index.html` нужно получить `/css/active/`
  const baseSourcePath = outputPath.replace('dist/', '').replace('/index.html', '')
  const imagesSourcePath = path.join('src', baseSourcePath)

  const images = Array.from(articleContainer.querySelectorAll('img'))
    // игнорируем изображения, которые находятся внутри figure, picture
    .filter((image) => !image.matches('figure > img, picture > img'))
    // игнорируем внешние изображения
    .filter((image) => !image.src.startsWith('https://') && !image.src.startsWith('http://'))

  return Promise.all(images.map((image) => buildImage(image, imagesSourcePath, window)))
}

async function buildImage(image, imagesSourcePath, window) {
  // Исключение interviews для картинок из рубрики «На собеседовании»
  const originalLink = image.src.match('/interviews/')
    ? path.join('src', image.src)
    : path.join(imagesSourcePath, image.src)

  try {
    await fsp.stat(originalLink)
  } catch (error) {
    console.warn(`Изображение ${originalLink} не существует`)
    return
  }

  const ext = path.extname(originalLink).replace('.', '')

  const options = {
    widths: [...baseConfig.widths],
    formats: [...baseConfig.formats, ext],
    filenameFormat: baseConfig.filenameFormat,
  }

  const picElement = window.document.createElement('picture')

  for (let i = 0; i < options.formats.length; i++) {
    const format = options.formats[i]
    const formats = []

    for (let i = 0; i < options.widths.length; i++) {
      const width = options.formats[i]
      formats.push(options.filenameFormat(image.src, width, format))
    }

    const srcElement = window.document.createElement('source')
    srcElement.setAttribute('type', `image/${format}`)
    srcElement.setAttribute('srcset', formats.join(', '))
    srcElement.setAttribute('sizes', options.sizes)

    picElement.appendChild(srcElement)
  }

  const imgElement = window.document.createElement('img')
  imgElement.setAttribute('src', image.src)
  imgElement.setAttribute('alt', image.alt)
  picElement.appendChild(imgElement)

  image.replaceWith(picElement)
}
