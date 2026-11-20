const browserslist = require('browserslist')
const { bundle, browserslistToTargets } = require('lightningcss')

const { browserslist: browsers } = require('../package.json')

// Единственный источник правды по браузерам — поле browserslist в package.json.
// По нему lightningcss решает и какие вендорные префиксы ставить, и какой
// синтаксис компилировать: раньше первым занимался autoprefixer, вторым —
// postcss-media-minmax, и каждый жил по своим правилам.
const cssTargets = browserslistToTargets(browserslist(browsers))

// Точки входа: всё остальное подключается к ним через @import, их же
// lightningcss и собирает в один файл.
const styleEntries = ['index.css', 'index.sc.css', 'dark-theme.css']

const bundleStyle = (filename) => bundle({ filename, minify: true, targets: cssTargets }).code

module.exports = {
  cssTargets,
  styleEntries,
  bundleStyle,
}
