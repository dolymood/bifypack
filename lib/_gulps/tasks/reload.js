var gulp = require('gulp')
var config = require('../config')
var browserSync = require('./browserSync')

gulp.task('reload', ['cleanDev', 'watch'], function () {
	browserSync.init({
		server: config.dev
	})
})
