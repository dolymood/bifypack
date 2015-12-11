var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')
var browserSync = require('./browserSync')

var minifyCss = require('gulp-minify-css')
var sourcemaps = require('gulp-sourcemaps')

gulp.task('style', function () {
	return gulp.src(utils.getSrc(config.style.src), {
			base: config.src
		})
		.pipe(sourcemaps.init())
		.pipe(minifyCss())
		.pipe(sourcemaps.write('./', {
			includeContent: true
		}))
		.pipe(gulp.dest(config.dev))
		.pipe(browserSync.stream({once: true}))
})
