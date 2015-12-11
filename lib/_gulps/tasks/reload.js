var gulp = require('gulp')
var config = require('../config')
var browserSync = require('./browserSync')

gulp.task('reload', ['cleanDev'], function () {
	browserSync.init({
		server: config.dev
	})
	browserSync.__started__ = true

	gulp.start('watch')
})
