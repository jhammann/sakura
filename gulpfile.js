const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');

const license = require('./scripts/header.js');

const paths = {
  styles: {
    src: './src/*.scss',
    dest: './dist/',
  },
  scripts: {
    src: './src/*.js',
    dest: './dist/',
  },
};

function js() {
  return gulp
    .src(paths.scripts.src)
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(header(license))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(header(license))
    .pipe(gulp.dest(paths.scripts.dest));
}

function lint() {
  return gulp
    .src(paths.scripts.src)
    .pipe(eslint())
    .pipe(eslint.format());
}

function css() {
  return gulp
    .src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      }),
    )
    .pipe(header(license))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(cleanCSS())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(gulp.dest(paths.styles.dest));
}

function watchFiles() {
  gulp.watch(paths.scripts.src, gulp.parallel(lint, js));
  gulp.watch(paths.styles.src, css);
}

const watch = gulp.series(gulp.parallel(lint, js, css), watchFiles);
const build = gulp.parallel(js, css);

exports.lint = lint;
exports.watch = watch;
exports.default = build;
