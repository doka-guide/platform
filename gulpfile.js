const gulp = require('gulp')
const postcss = require('gulp-postcss')
const csso = require('postcss-csso')
const pimport = require('postcss-import')
const autoprefixer = require('autoprefixer')
const esbuild = require('gulp-esbuild')
const replace = require('gulp-replace')
const del = require('del')

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
      /(<link rel="stylesheet" href=")styles\/(index.css">)/, '$1$2'
    ))
    .pipe(replace(
      /(<script) type="module"( src=")scripts\/(index.js">)/, '$1$2$3'
    ))
    .pipe(gulp.dest('dist'))
}

// Clean

clean = () => {
  return del([
      'dist/styles',
      'dist/scripts',
  ])
}

// Default

exports.default = gulp.series(
  styles,
  scripts,
  paths,
  clean,
)
