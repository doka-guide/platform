const path = require('path')
const fs = require('fs')

const gulp = require('gulp')
const git = require('gulp-git')
const shell = require('gulp-shell')
const postcss = require('gulp-postcss')
const csso = require('postcss-csso')
const pimport = require('postcss-import')
const autoprefixer = require('autoprefixer')
const esbuild = require('gulp-esbuild')
const del = require('del')
const rev = require('gulp-rev')
const revRewrite = require('gulp-rev-rewrite')
const puppeteer = require('puppeteer')
const tap = require('gulp-tap')

const { contentRepGithub, contentRepFolders } = require(path.join(__dirname, 'config/constants'))

const cloneContent = () => git.clone(contentRepGithub)

const makeLinks = shell.task(`node make-links.js --default`, {
  env: {
    PATH_TO_CONTENT: path.join(__dirname, 'content'),
    PATH: process.env.PATH
  }
})

// Styles

const styles = () => {
  return gulp.src('src/styles/{index.css,index.sc.css,dark-theme.css}')
    .pipe(postcss([
      pimport,
      autoprefixer,
      csso({
        restructure: false
      }),
    ]))
    .pipe(gulp.dest('dist/styles'))
}

// Scripts

const scripts = () => {
  return gulp.src('src/scripts/index.js')
    .pipe(esbuild({
      target: 'es2015',
      bundle: true,
      minify: true,
      plugins: [{
        name: 'node-modules-resolution',
        setup(build) {
          build.onResolve({ filter: /^\// }, args => {
            const cwd = process.cwd()
            const newPath = args.path.includes(cwd)
              ? args.path
              : path.join(cwd, 'node_modules', args.path)

            return {
              path: newPath
            }
          })
        }
      }]
    }))
    .pipe(gulp.dest('dist/scripts'))
}

// Clean

const clean = () => {
  return del([
    'dist/styles',
    'dist/scripts',
  ])
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
    .pipe(revRewrite({
      manifest: fs.readFileSync('dist/rev-manifset.json')
    }))
    .pipe(gulp.dest('dist'));
}

const cache = gulp.series(cacheHash, cacheReplace)

exports.setupContent = gulp.series(
  cloneContent,
  makeLinks,
)

exports.dropContent = () => del([
  'content',
  ...contentRepFolders.map(folder => `src/${folder}`),
])

// Social cards

const socialCards = () => {
  const files = []
  return gulp.src('dist/{css,html,js,tools}/**/index.sc.html')
    .pipe(
      tap((file) => {
        files.push(file)
      })
    )
    .on('end', async () => {
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()

      for (let i = 0, len = files.length; i < len; i++) {
        const file = files[i]
        const imagePath = file.path.replace('index.sc.html', 'images/covers/')

        if (!fs.existsSync(imagePath.replace('covers/', ''))){
          fs.mkdirSync(imagePath.replace('covers/', ''))
          if (!fs.existsSync(imagePath)){
            fs.mkdirSync(imagePath)
          }
        } else {
          if (!fs.existsSync(imagePath)){
            fs.mkdirSync(imagePath)
          }
        }

        await page.goto('file://' + file.path)

        await page.setViewport({
          width: 1200,
          height: 630,
          deviceScaleFactor: 1,
        })

        await page.screenshot({
          path: path.join(
            imagePath,
            'og.png'
          ),
          type: 'png',
          clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 630
          }
        })
        console.log(`Картина ${imagePath}og.png создана`)

        await page.setViewport({
          width: 1024,
          height: 1024,
          deviceScaleFactor: 1,
        })

        await page.screenshot({
          path: path.join(
            imagePath,
            'twitter.png'
          ),
          type: 'png',
          clip: {
            x: 0,
            y: 0,
            width: 1024,
            height: 1024
          }
        })
        console.log(`Картина ${imagePath}twitter.png создана`)
      }

      await browser.close()
    })
}

// Build social cards

exports.socialCards = socialCards

// Default
exports.default = gulp.series(
  clean,
  styles,
  scripts,
  cache
)
