const path = require('path')
const fs = require('fs')
const { mkdir, rm, writeFile } = require('node:fs/promises')

const gulp = require('gulp')
const git = require('gulp-git')
const shell = require('gulp-shell')
// С версии 0.15 gulp-esbuild экспортирует именованные функции вместо самого
// себя, а entryPoints и outfile стали обязательными: раньше точка входа
// бралась из потока gulp. Без них поток молча повисает, и gulp сообщает
// только «Did you forget to signal async completion?».
const { gulpEsbuild } = require('gulp-esbuild')
// gulp-rev 12 и gulp-rev-rewrite 7 собраны как ESM: при require() приезжает
// пространство имён с __esModule, а сама функция лежит в default.
const rev = require('gulp-rev').default
const revRewrite = require('gulp-rev-rewrite').default

const { contentRepGithub, contentRepFolders } = require(path.join(__dirname, 'config/constants'))
const { styleEntries, bundleStyle } = require(path.join(__dirname, 'config/css'))
const { injectDemoFrame } = require('./src/libs/demo-frame/inject-demo-frame')

// Раньше здесь был пакет del. С 7-й версии он ESM-only и больше не callable
// (экспортирует deleteAsync/deleteSync), а обе площадки вызова передавали
// обычные пути без глобов — то есть ровно то, что умеет родной fs.rm.
const removePaths = (paths) => Promise.all(paths.map((target) => rm(target, { recursive: true, force: true })))

const cloneContent = () => git.clone(contentRepGithub)

const makeLinks = shell.task(`node make-links.js --default`, {
  env: {
    PATH_TO_CONTENT: path.join(__dirname, 'content'),
    PATH: process.env.PATH,
  },
})

// Styles

// lightningcss сам собирает @import, ставит префиксы и минифицирует, поэтому
// gulp-поток здесь не нужен: точки входа известны, файлы он читает с диска.
const styles = async () => {
  await mkdir('dist/styles', { recursive: true })

  await Promise.all(
    styleEntries.map((entry) =>
      writeFile(path.join('dist/styles', entry), bundleStyle(path.join('src/styles', entry))),
    ),
  )
}

// Scripts

const sw = () => {
  return gulp
    .src('src/sw.js')
    .pipe(
      gulpEsbuild({
        entryPoints: ['src/sw.js'],
        outfile: 'sw.js',
        target: 'es2015',
        minify: true,
        // Браузер переустанавливает воркер, только если байты sw.js поменялись. Без метки
        // сборки офлайн-страница оставалась бы от первой установки и ссылалась бы на стили,
        // которые следующий деплой удалил с сервера
        banner: { js: `// ${Date.now()}` },
      }),
    )
    .pipe(gulp.dest('dist/'))
}

const scripts = () => {
  return gulp
    .src('src/scripts/index.js')
    .pipe(
      gulpEsbuild({
        entryPoints: ['src/scripts/index.js'],
        outfile: 'index.js',
        target: 'es2015',
        bundle: true,
        minify: true,
        plugins: [
          {
            name: 'node-modules-resolution',
            setup(build) {
              build.onResolve({ filter: /^\// }, (args) => {
                const cwd = process.cwd()
                const newPath = args.path.includes(cwd) ? args.path : path.join(cwd, 'node_modules', args.path)

                return {
                  path: newPath,
                }
              })
            },
          },
        ],
      }),
    )
    .pipe(gulp.dest('dist/scripts'))
}

// Отдельная точка входа: скрипт рисует рамку демки и подключается только в демки.
// Бандл сайта ему не нужен.
const demoFrameScript = () => {
  return gulp
    .src('src/scripts/demo-frame.js')
    .pipe(
      gulpEsbuild({
        entryPoints: ['src/scripts/demo-frame.js'],
        outfile: 'demo-frame.js',
        target: 'es2015',
        bundle: true,
        minify: true,
      }),
    )
    .pipe(gulp.dest('dist/scripts'))
}

// Demo frame

const demoFrame = () => injectDemoFrame()

// Clean

const clean = () => {
  return removePaths(['dist/styles', 'dist/scripts', 'dist/sw.js'])
}

// Cache

const cacheHash = () => {
  return gulp
    .src('dist/**/*.{css,js}')
    .pipe(rev())
    .pipe(gulp.dest('dist'))
    .pipe(rev.manifest('rev-manifset.json'))
    .pipe(gulp.dest('dist'))
}

const cacheReplace = () => {
  return gulp
    .src('dist/**/*.{html,css,svg}')
    .pipe(
      revRewrite({
        manifest: fs.readFileSync('dist/rev-manifset.json'),
      }),
    )
    .pipe(gulp.dest('dist'))
}

const cache = gulp.series(cacheHash, cacheReplace)

exports.setupContent = gulp.series(cloneContent, makeLinks)

exports.dropContent = () => removePaths(['content', ...contentRepFolders.map((folder) => `src/${folder}`)])

// Default
exports.default = gulp.series(clean, styles, scripts, demoFrameScript, sw, demoFrame, cache)
