const path = require('path')

const gulp = require('gulp')
const git = require('gulp-git')
const shell = require('gulp-shell')
const postcss = require('gulp-postcss')
const csso = require('postcss-csso')
const pimport = require('postcss-import')
const autoprefixer = require('autoprefixer')
const esbuild = require('gulp-esbuild')
const replace = require('gulp-replace')
const del = require('del')

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
  return gulp.src('src/styles/index.css')
    .pipe(postcss([
      pimport,
      autoprefixer,
      csso,
    ]))
    .pipe(replace(/\.\.\//g, ''))
    .pipe(gulp.dest('dist'))
}

// Scripts

const scripts = () => {
  return gulp.src('src/scripts/index.js')
    .pipe(esbuild({
      target: 'es2015',
      bundle: true,
      minify: true,
    }))
    .pipe(gulp.dest('dist'))
}

// Paths

const paths = () => {
  return gulp.src('dist/**/*.html')
    .pipe(replace(
      /(<link rel="stylesheet" href="\/)styles\/(index.css">)/, '$1$2'
    ))
    .pipe(replace(
      /(<script) type="module"( src="\/)scripts\/(index.js">)/, '$1$2$3'
    ))
    .pipe(gulp.dest('dist'))
}

// Clean

const clean = () => {
  return del([
    'dist/styles',
    'dist/scripts',
  ])
}

exports.setupContent = gulp.series(
  cloneContent,
  makeLinks,
)

exports.dropContent = () => del([
  'content',
  ...contentRepFolders.map(folder => `src/${folder}`),
])

// Default
exports.default = gulp.series(
  styles,
  scripts,
  paths,
  clean,
)
