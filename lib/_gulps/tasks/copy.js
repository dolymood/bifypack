var gulp = require('gulp')
var config = require('../config')
var utils = require('../utils')
var browserSync = require('./browserSync')

gulp.task('copy', function () {
	return gulp.src(utils.getSrc(config.copy), {
			base: config.src
		})
		.pipe(gulp.dest(config.dev))
		.pipe(browserSync.stream({once: true}))
})
