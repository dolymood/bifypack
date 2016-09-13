var gulp = require('gulp')
var utils = require('../utils')
var config = require('../config')
var browserSync = require('./browserSync')

gulp.task('reload', ['cleanDev', 'watch'], function () {
	var options = {
		server: config.dev
	}
	if (config.browserSync && config.browserSync === Object(config.browserSync)) {
		utils.eachObj(config.browserSync, function (v, k) {
			options[k] = v
		})
	}
	browserSync.init(options)
})
